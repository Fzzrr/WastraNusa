import { hasSellerAccess } from '@/lib/auth/seller-access';
import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/sellerApplication.repository', () => ({
  sellerApplicationRepository: { findUserRole: vi.fn() },
}));

const mockRepo = vi.mocked(sellerApplicationRepository);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hasSellerAccess', { tags: ['backend'] }, () => {
  it('allows a user whose DB role is seller', async () => {
    mockRepo.findUserRole.mockResolvedValue('seller');
    expect(await hasSellerAccess({ id: 'u' })).toBe(true);
    expect(mockRepo.findUserRole).toHaveBeenCalledWith('u');
  });

  it.each(['user', 'admin', null])('denies DB role %s', async (role) => {
    mockRepo.findUserRole.mockResolvedValue(role);
    expect(await hasSellerAccess({ id: 'u' })).toBe(false);
  });
});
