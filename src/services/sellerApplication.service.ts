import { SellerApplicationStatus } from '@/generated/prisma/enums';
import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { sellerApplicationRepository } from '@/repositories/sellerApplication.repository';
import {
  type CreateSellerApplicationInput,
  type ReviewSellerApplicationInput,
} from '@/schemas/seller-application.schema';

export const sellerApplicationService = {
  /**
   * The current user's own application (or null if they never applied).
   */
  getMyApplication: async (userId: string) => {
    return sellerApplicationRepository.findByUser(userId);
  },

  /**
   * Submit a seller application. A user may only have one; a previously
   * rejected application can be re-submitted (reset to pending).
   */
  createApplication: async (
    userId: string,
    data: CreateSellerApplicationInput,
  ) => {
    const existing = await sellerApplicationRepository.findByUser(userId);

    if (existing) {
      if (existing.status === SellerApplicationStatus.pending) {
        throw new ApiError('Pengajuan Anda sedang ditinjau', 400);
      }
      if (existing.status === SellerApplicationStatus.approved) {
        throw new ApiError('Anda sudah menjadi seller', 400);
      }

      // Rejected → allow the user to re-apply by resetting the record.
      const reapplied = await sellerApplicationRepository.update(existing.id, {
        ...data,
        status: SellerApplicationStatus.pending,
        rejectionReason: null,
        reviewedById: null,
        reviewedAt: null,
      });
      logger.info('Seller application re-submitted', {
        applicationId: existing.id,
        userId,
      });
      return reapplied;
    }

    const id = crypto.randomUUID();
    const application = await sellerApplicationRepository.create({
      ...data,
      id,
      userId,
    });
    logger.info('Seller application created', { applicationId: id, userId });
    return application;
  },

  /**
   * Admin: list applications, optionally filtered by status.
   */
  getApplications: async (status?: SellerApplicationStatus) => {
    return sellerApplicationRepository.findAll(status);
  },

  countPending: async () => {
    return sellerApplicationRepository.countByStatus(
      SellerApplicationStatus.pending,
    );
  },

  /**
   * Admin: approve or reject a pending application. Approval promotes the
   * applicant to the `seller` role.
   */
  reviewApplication: async (
    id: string,
    reviewerId: string,
    data: ReviewSellerApplicationInput,
  ) => {
    const application = await sellerApplicationRepository.findById(id);
    if (!application) {
      throw new ApiError('Seller application not found', 404);
    }
    if (application.status !== SellerApplicationStatus.pending) {
      throw new ApiError('Pengajuan ini sudah ditinjau', 400);
    }

    if (data.status === 'approved') {
      const approved = await sellerApplicationRepository.approveAndPromote(
        id,
        application.userId,
        reviewerId,
      );
      logger.info('Seller application approved', {
        applicationId: id,
        userId: application.userId,
        reviewerId,
      });
      return approved;
    }

    const rejected = await sellerApplicationRepository.update(id, {
      status: SellerApplicationStatus.rejected,
      rejectionReason: data.rejectionReason,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    });
    logger.info('Seller application rejected', {
      applicationId: id,
      userId: application.userId,
      reviewerId,
    });
    return rejected;
  },
};
