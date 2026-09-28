import { Prisma } from '@/generated/prisma/client';
import { withApiAdmin, withApiAuth, withApiPublic } from '@/lib/api-handler';
import { AuthHelper } from '@/lib/auth/auth-api-helper';
import { ApiError } from '@/lib/error';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

vi.unmock('@/lib/api-handler');
vi.unmock('@/lib/error');
vi.unmock('@/lib/jsend');

const mockAuth = vi.mocked(AuthHelper);

function createRequest(
  url = 'http://localhost/api/test',
  options: RequestInit = {},
): Request {
  return new Request(url, options);
}

const mockParams = Promise.resolve({ id: 'test-id' });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('withApiAuth', { tags: ['backend'] }, () => {
  it('should call handler with userId and params on valid session', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);

    const handler = vi.fn().mockResolvedValue(new Response('ok'));
    const wrapped = withApiAuth(handler);

    await wrapped(createRequest(), { params: mockParams });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        params: { id: 'test-id' },
      }),
    );
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.requireUser.mockRejectedValue(
      new ApiError('Silakan login terlebih dahulu', 401),
    );

    const handler = vi.fn();
    const wrapped = withApiAuth(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.status).toBe('fail');
    expect(body.data.message).toBe('Silakan login terlebih dahulu');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('withApiAdmin', { tags: ['backend'] }, () => {
  it('should call handler with userId when user is admin', async () => {
    mockAuth.requireAdmin.mockResolvedValue({
      id: 'admin-1',
      role: 'admin',
    } as never);

    const handler = vi.fn().mockResolvedValue(new Response('ok'));
    const wrapped = withApiAdmin(handler);

    await wrapped(createRequest(), { params: mockParams });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'admin-1' }),
    );
  });

  it('should return 403 when user is not admin', async () => {
    mockAuth.requireAdmin.mockRejectedValue(
      new ApiError('Akses khusus admin', 403),
    );

    const handler = vi.fn();
    const wrapped = withApiAdmin(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.status).toBe('fail');
    expect(body.data.message).toBe('Akses khusus admin');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not authenticated at all', async () => {
    mockAuth.requireAdmin.mockRejectedValue(
      new ApiError('Silakan login terlebih dahulu', 401),
    );

    const handler = vi.fn();
    const wrapped = withApiAdmin(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.status).toBe('fail');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('withApiPublic', { tags: ['backend'] }, () => {
  it('should call handler with undefined userId when session is absent', async () => {
    mockAuth.getUser.mockResolvedValue(null);

    const handler = vi.fn().mockResolvedValue(new Response('ok'));
    const wrapped = withApiPublic(handler);

    await wrapped(createRequest(), { params: mockParams });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { id: 'test-id' },
        userId: undefined,
      }),
    );
  });

  it('should pass userId when a session exists', async () => {
    mockAuth.getUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);

    const handler = vi.fn().mockResolvedValue(new Response('ok'));
    const wrapped = withApiPublic(handler);

    await wrapped(createRequest(), { params: mockParams });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { id: 'test-id' },
        userId: 'user-1',
      }),
    );
  });
});

describe('handleApiError (via wrappers)', { tags: ['backend'] }, () => {
  it('should return 500 with JSend error format on unexpected error', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);

    const handler = vi.fn().mockRejectedValue(new Error('Something broke'));
    const wrapped = withApiAuth(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.status).toBe('error');
    expect(body.message).toBe('Something broke');
  });

  it('should return 500 with generic message on non-Error throw', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);

    const handler = vi.fn().mockRejectedValue('string error');
    const wrapped = withApiAuth(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.status).toBe('error');
    expect(body.message).toBe('Terjadi kesalahan pada server');
  });

  it('should return 400 with field errors on ZodError', async () => {
    const zodError = new ZodError([
      {
        code: 'too_small',
        minimum: 1,
        origin: 'string',
        inclusive: true,
        exact: false,
        message: 'Title is required',
        path: ['title'],
      },
    ]);

    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);

    const handler = vi.fn().mockRejectedValue(zodError);
    const wrapped = withApiAuth(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe('fail');
    expect(body.data.title).toBe('Title is required');
  });

  it('should return 400 on ApiError with custom status', async () => {
    mockAuth.requireUser.mockResolvedValue({
      id: 'user-1',
      role: 'user',
    } as never);

    const handler = vi.fn().mockRejectedValue(new ApiError('Bad input', 400));
    const wrapped = withApiAuth(handler);
    const res = await wrapped(createRequest(), { params: mockParams });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.status).toBe('fail');
    expect(body.data.message).toBe('Bad input');
  });

  describe('Prisma errors', () => {
    it('should return 400 on P2002 (Unique constraint failed)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'test' },
      );

      mockAuth.requireUser.mockResolvedValue({
        id: 'user-1',
        role: 'user',
      } as never);

      const handler = vi.fn().mockRejectedValue(prismaError);
      const wrapped = withApiAuth(handler);
      const res = await wrapped(createRequest(), { params: mockParams });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.data.message).toBe('Data sudah ada');
    });

    it('should return 404 on P2025 (Record not found)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: 'test' },
      );

      mockAuth.requireUser.mockResolvedValue({
        id: 'user-1',
        role: 'user',
      } as never);

      const handler = vi.fn().mockRejectedValue(prismaError);
      const wrapped = withApiAuth(handler);
      const res = await wrapped(createRequest(), { params: mockParams });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.status).toBe('fail');
      expect(body.data.message).toBe('Data tidak ditemukan');
    });
  });
});
