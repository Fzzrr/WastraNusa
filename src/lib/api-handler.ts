import { Prisma } from '@/generated/prisma/client';
import { logError, logger } from '@/lib/logger';
import { ZodError } from 'zod';

import { AuthHelper } from './auth/auth-api-helper';
import { ApiError } from './error';
import { jsend } from './jsend';

type ApiHandlerContext<T = unknown> = {
  userId: string;
  params: T;
  req: Request;
};

type ApiHandler<T = unknown> = (
  context: ApiHandlerContext<T>,
) => Promise<Response>;

type PublicApiHandlerContext<T = unknown> = {
  params: T;
  req: Request;
  userId?: string;
  userRole?: string | null;
};

type PublicApiHandler<T = unknown> = (
  context: PublicApiHandlerContext<T>,
) => Promise<Response>;

// Largest page any list endpoint returns; stops `?limit=1000000` scans.
const MAX_PAGE_LIMIT = 50;

function isForeignKeyError(err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === 'P2003';
  }
  return (
    err instanceof Error &&
    err.name === 'DriverAdapterError' &&
    err.message.includes('foreign key constraint')
  );
}

function handleApiError(err: unknown, req: Request) {
  const action = req.method + ' ' + new URL(req.url).pathname;
  const isClientError =
    (err instanceof ApiError && err.status < 500) ||
    err instanceof ZodError ||
    err instanceof SyntaxError;
  // Expected 4xx (validation, not found, forbidden) aren't server faults;
  // keep them out of the error level so real failures stand out.
  if (isClientError) {
    logger.warn((err as Error).message.slice(0, 200), { action });
  } else {
    logError(err, { action });
  }

  if (err instanceof ApiError) {
    return jsend.fail({ message: err.message }, err.status);
  }

  // Thrown by req.json() when the request body isn't valid JSON.
  if (err instanceof SyntaxError) {
    return jsend.fail({ message: 'Format JSON tidak valid' }, 400);
  }

  if (err instanceof ZodError) {
    const { fieldErrors, formErrors } = err.flatten();
    const flatErrors: Record<string, string> = {};
    for (const [key, errors] of Object.entries(fieldErrors)) {
      flatErrors[key] = (errors as string[])?.[0] || 'Nilai tidak valid';
    }
    // Errors on the whole body (e.g. an unknown field on a strict schema)
    // have no field key; without this the client gets an empty `data`.
    if (Object.keys(flatErrors).length === 0) {
      const unknown = err.issues.find(
        (issue) => issue.code === 'unrecognized_keys',
      );
      flatErrors.message = unknown
        ? `Field tidak dikenal: ${unknown.keys.join(', ')}`
        : formErrors[0] || 'Data tidak valid';
    }

    return jsend.fail(flatErrors, 400);
  }

  // Prisma Error Handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const code = err.code;

    if (code === 'P2002') {
      return jsend.fail({ message: 'Data sudah ada' }, 400);
    }
    if (code === 'P2025') {
      return jsend.fail({ message: 'Data tidak ditemukan' }, 404);
    }
    if (code === 'P2000') {
      return jsend.fail({ message: 'Data terlalu panjang' }, 400);
    }
  }

  if (isForeignKeyError(err)) {
    return jsend.fail(
      { message: 'Data masih digunakan sehingga tidak dapat dihapus' },
      409,
    );
  }

  // The real error is already in the logs; never send it to the client.
  return jsend.error('Terjadi kesalahan pada server', 500);
}

/** Reads `?page=&limit=`; junk or out-of-range values fall back to safe ones. */
export function getPagination(req: Request, defaultLimit = 10) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.trunc(Number(searchParams.get('page'))) || 1);
  const limit = Math.min(
    MAX_PAGE_LIMIT,
    Math.max(1, Math.trunc(Number(searchParams.get('limit'))) || defaultLimit),
  );
  return { page, limit };
}

type RouteContext<T> = { params: Promise<T> };

/** Wraps a route with an auth guard, awaited params, and shared error handling. */
function withGuard<T, U extends { id: string }>(
  requireUser: () => Promise<U>,
  handler: ApiHandler<T>,
) {
  return async (req: Request, { params }: RouteContext<T>) => {
    try {
      const user = await requireUser();
      return await handler({ userId: user.id, params: await params, req });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}

/** Signed-in users only; `userId` is the caller. */
export const withApiAuth = <T = unknown>(handler: ApiHandler<T>) =>
  withGuard(() => AuthHelper.requireUser(), handler);

/** Admins only. */
export const withApiAdmin = <T = unknown>(handler: ApiHandler<T>) =>
  withGuard(() => AuthHelper.requireAdmin(), handler);

/** Sellers only; `userId` is the seller, so handlers can scope by `sellerId`. */
export const withApiSeller = <T = unknown>(handler: ApiHandler<T>) =>
  withGuard(() => AuthHelper.requireSeller(), handler);

/** No auth required; `userId`/`userRole` are set when the caller is signed in. */
export function withApiPublic<T = unknown>(handler: PublicApiHandler<T>) {
  return async (req: Request, { params }: RouteContext<T>) => {
    try {
      const resolvedParams = await params;
      const user = await AuthHelper.getUser();

      return await handler({
        params: resolvedParams,
        req,
        userRole: user?.role,
        userId: user?.id,
      });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}
