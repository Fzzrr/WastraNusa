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
  it('always allows sellers without touching the DB', async () => {
    expect(await hasSellerAccess({ id: 'u', role: 'seller' })).toBe(true);
    expect(mockRepo.hasApprovedApplication).not.toHaveBeenCalled();
  });

  it('allows anyone with an approved application (DB is the source of truth)', async () => {
    mockRepo.hasApprovedApplication.mockResolvedValue(true);

    // Freshly promoted seller whose session cookie still caches the old role.
    expect(await hasSellerAccess({ id: 'u', role: 'user' })).toBe(true);
    expect(await hasSellerAccess({ id: 'u', role: null })).toBe(true);
    // Admins keep their admin role; the approved shop grants access.
    expect(await hasSellerAccess({ id: 'a', role: 'admin' })).toBe(true);
  });

  it('denies users without an approved application', async () => {
    mockRepo.hasApprovedApplication.mockResolvedValue(false);

    expect(await hasSellerAccess({ id: 'u', role: 'user' })).toBe(false);
    expect(await hasSellerAccess({ id: 'u', role: null })).toBe(false);
    expect(await hasSellerAccess({ id: 'a', role: 'admin' })).toBe(false);
  });
});
