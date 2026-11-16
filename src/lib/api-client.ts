import type { JSendResponse } from '@/lib/jsend';

/**
 * Client-side helpers for calling our JSend API routes. Every hook goes
 * through these, so error handling stays the same everywhere.
 */

/** Unwraps a JSend body, throwing its message on `fail` or `error`. */
export async function parseJSend<T>(
  response: Response,
  fallbackMessage = 'Permintaan gagal',
): Promise<T> {
  let body: JSendResponse<T>;
  try {
    body = (await response.json()) as JSendResponse<T>;
  } catch {
    // Not JSON at all (e.g. a proxy error page).
    throw new Error(fallbackMessage);
  }

  if (body.status === 'success') {
    return body.data as T;
  }

  if (body.status === 'fail') {
    const data = body.data as { message?: unknown } | null;
    throw new Error(
      data && typeof data === 'object' && 'message' in data
        ? String(data.message)
        : fallbackMessage,
    );
  }

  throw new Error(body.message);
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function fetchApi<T>(path: string): Promise<T> {
  return parseJSend<T>(await fetch(path, { headers: JSON_HEADERS }));
}

export async function mutateApi<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  return parseJSend<T>(
    await fetch(path, {
      method,
      headers: JSON_HEADERS,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}
