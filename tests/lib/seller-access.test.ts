import { hasSellerAccess } from '@/lib/auth/seller-access';
import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/sellerApplication.repository', () => ({
  sellerApplicationRepository: { hasApprovedApplication: vi.fn() },
}));

const mockRepo = vi.mocked(sellerApplicationRepository);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hasSellerAccess', { tags: ['backend'] }, () => {
  it('always allows sellers', async () => {
    expect(await hasSellerAccess({ id: 'u', role: 'seller' })).toBe(true);
    expect(mockRepo.hasApprovedApplication).not.toHaveBeenCalled();
  });

  it('allows admins only with an approved shop', async () => {
    mockRepo.hasApprovedApplication.mockResolvedValueOnce(true);
    expect(await hasSellerAccess({ id: 'a', role: 'admin' })).toBe(true);

    mockRepo.hasApprovedApplication.mockResolvedValueOnce(false);
    expect(await hasSellerAccess({ id: 'a', role: 'admin' })).toBe(false);
  });

  it('denies regular users even with an approved application', async () => {
    mockRepo.hasApprovedApplication.mockResolvedValue(true);
    expect(await hasSellerAccess({ id: 'u', role: 'user' })).toBe(false);
    expect(await hasSellerAccess({ id: 'u', role: null })).toBe(false);
  });
});
