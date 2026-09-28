import { Prisma } from '@/generated/prisma/client';
import { logError } from '@/lib/logger';
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
};

type PublicApiHandler<T = unknown> = (
  context: PublicApiHandlerContext<T>,
) => Promise<Response>;

function handleApiError(err: unknown, req: Request) {
  const action = req.method + ' ' + new URL(req.url).pathname;
  logError(err, { action });

  if (err instanceof ApiError) {
    return jsend.fail({ message: err.message }, err.status);
  }

  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors;
    const flatErrors: Record<string, string> = {};
    for (const [key, errors] of Object.entries(fieldErrors)) {
      flatErrors[key] = (errors as string[])?.[0] || 'Nilai tidak valid';
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
  }

  return jsend.error(
    err instanceof Error ? err.message : 'Terjadi kesalahan pada server',
    500,
  );
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
        userId: user?.id,
      });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}
