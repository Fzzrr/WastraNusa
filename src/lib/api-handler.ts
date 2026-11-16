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

/**
 * Higher-order function to wrap API routes with authentication and standardized error handling.
 * @param handler The actual route logic
 * @returns A Next.js API route handler
 */
export function withApiAuth<T = unknown>(handler: ApiHandler<T>) {
  return async (req: Request, { params }: { params: Promise<T> }) => {
    try {
      const user = await AuthHelper.requireUser();
      const resolvedParams = await params;

      return await handler({ userId: user.id, params: resolvedParams, req });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}

/**
 * Higher-order function to wrap API routes with admin authentication and standardized error handling.
 * @param handler The actual route logic
 * @returns A Next.js API route handler
 */
export function withApiAdmin<T = unknown>(handler: ApiHandler<T>) {
  return async (req: Request, { params }: { params: Promise<T> }) => {
    try {
      const user = await AuthHelper.requireAdmin();
      const resolvedParams = await params;

      return await handler({ userId: user.id, params: resolvedParams, req });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}

/**
 * Higher-order function to wrap API routes with seller authentication and standardized error handling.
 * The seller's own user id is passed as `userId` so handlers can scope queries by `sellerId`.
 * @param handler The actual route logic
 * @returns A Next.js API route handler
 */
export function withApiSeller<T = unknown>(handler: ApiHandler<T>) {
  return async (req: Request, { params }: { params: Promise<T> }) => {
    try {
      const user = await AuthHelper.requireSeller();
      const resolvedParams = await params;

      return await handler({ userId: user.id, params: resolvedParams, req });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}

/**
 * Higher-order function to wrap public API routes with standardized error handling and async params.
 * @param handler The actual route logic
 * @returns A Next.js API route handler
 */
export function withApiPublic<T = unknown>(handler: PublicApiHandler<T>) {
  return async (req: Request, { params }: { params: Promise<T> }) => {
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
