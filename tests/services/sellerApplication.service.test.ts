import { SellerApplicationStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';
import { sellerApplicationService } from '@/services/sellerApplication.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/sellerApplication.repository', () => ({
  sellerApplicationRepository: {
    findByUser: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    countByStatus: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    approveAndPromote: vi.fn(),
  },
}));

const mockRepo = vi.mocked(sellerApplicationRepository);

const USER_ID = 'user-1';
const REVIEWER_ID = 'admin-1';
const APP_ID = 'app-1';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sellerApplicationService', { tags: ['backend'] }, () => {
  describe('createApplication', () => {
    it('creates a fresh application when the user has none', async () => {
      mockRepo.findByUser.mockResolvedValue(null as never);
      mockRepo.create.mockResolvedValue({ id: APP_ID } as never);

      await sellerApplicationService.createApplication(USER_ID, {
        shopName: 'Toko Baru',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: USER_ID, shopName: 'Toko Baru' }),
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('blocks a user whose application is pending', async () => {
      mockRepo.findByUser.mockResolvedValue({
        id: APP_ID,
        status: SellerApplicationStatus.pending,
      } as never);

      await expect(
        sellerApplicationService.createApplication(USER_ID, {
          shopName: 'Toko',
        }),
      ).rejects.toMatchObject({ status: 400 });
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('blocks a user who is already approved', async () => {
      mockRepo.findByUser.mockResolvedValue({
        id: APP_ID,
        status: SellerApplicationStatus.approved,
      } as never);

      await expect(
        sellerApplicationService.createApplication(USER_ID, {
          shopName: 'Toko',
        }),
      ).rejects.toBeInstanceOf(ApiError);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('resets a rejected application back to pending on re-apply', async () => {
      mockRepo.findByUser.mockResolvedValue({
        id: APP_ID,
        status: SellerApplicationStatus.rejected,
      } as never);
      mockRepo.update.mockResolvedValue({ id: APP_ID } as never);

      await sellerApplicationService.createApplication(USER_ID, {
        shopName: 'Toko Lagi',
      });

      expect(mockRepo.update).toHaveBeenCalledWith(
        APP_ID,
        expect.objectContaining({
          status: SellerApplicationStatus.pending,
          rejectionReason: null,
          reviewedById: null,
          reviewedAt: null,
        }),
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('reviewApplication', () => {
    it('promotes the applicant when approved', async () => {
      mockRepo.findById.mockResolvedValue({
        id: APP_ID,
        userId: USER_ID,
        status: SellerApplicationStatus.pending,
      } as never);
      mockRepo.approveAndPromote.mockResolvedValue({ id: APP_ID } as never);

      await sellerApplicationService.reviewApplication(APP_ID, REVIEWER_ID, {
        status: 'approved',
      });

      expect(mockRepo.approveAndPromote).toHaveBeenCalledWith(
        APP_ID,
        USER_ID,
        REVIEWER_ID,
      );
    });

    it('records the reason when rejected and does not promote', async () => {
      mockRepo.findById.mockResolvedValue({
        id: APP_ID,
        userId: USER_ID,
        status: SellerApplicationStatus.pending,
      } as never);
      mockRepo.update.mockResolvedValue({ id: APP_ID } as never);

      await sellerApplicationService.reviewApplication(APP_ID, REVIEWER_ID, {
        status: 'rejected',
        rejectionReason: 'Dokumen tidak lengkap',
      });

      expect(mockRepo.approveAndPromote).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(
        APP_ID,
        expect.objectContaining({
          status: SellerApplicationStatus.rejected,
          rejectionReason: 'Dokumen tidak lengkap',
          reviewedById: REVIEWER_ID,
        }),
      );
    });

    it('404s when the application does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null as never);

      await expect(
        sellerApplicationService.reviewApplication(APP_ID, REVIEWER_ID, {
          status: 'approved',
        }),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('rejects reviewing an application that is no longer pending', async () => {
      mockRepo.findById.mockResolvedValue({
        id: APP_ID,
        userId: USER_ID,
        status: SellerApplicationStatus.approved,
      } as never);

      await expect(
        sellerApplicationService.reviewApplication(APP_ID, REVIEWER_ID, {
          status: 'approved',
        }),
      ).rejects.toMatchObject({ status: 400 });
      expect(mockRepo.approveAndPromote).not.toHaveBeenCalled();
    });
  });
});
