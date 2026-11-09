import { ApiError } from '@/lib/error';
import { addressRepository } from '@/repositories/address.repository';
import { addressService } from '@/services/address.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/address.service');

const mockRepo = vi.mocked(addressRepository);

const MOCK_ADDRESS = {
  id: 'addr-1',
  userId: 'user-1',
  label: 'Home',
  recipientName: 'Budi',
  phone: '081234567890',
  province: 'DKI Jakarta',
  city: 'Jakarta Pusat',
  district: 'Gambir',
  subdistrict: null,
  postalCode: '10110',
  fullAddress: 'Jl. Gambir No. 1',
  notes: null,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('addressService', { tags: ['backend'] }, () => {
  describe('createAddress', () => {
    const input = {
      label: 'Home',
      recipientName: 'Budi',
      phone: '081234567890',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Gambir',
      postalCode: '10110',
      fullAddress: 'Jl. Gambir No. 1',
    };

    it('should force isDefault: true for the first address', async () => {
      mockRepo.countByUser.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(MOCK_ADDRESS as never);

      await addressService.createAddress('user-1', {
        ...input,
        isDefault: false,
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: true }),
      );
    });

    it('should clear other defaults if the new address is set as default', async () => {
      mockRepo.countByUser.mockResolvedValue(2);
      mockRepo.create.mockResolvedValue(MOCK_ADDRESS as never);

      await addressService.createAddress('user-1', {
        ...input,
        isDefault: true,
      });

      expect(mockRepo.clearDefaultsByUser).toHaveBeenCalledWith('user-1');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: true }),
      );
    });

    it('should not clear defaults if the new address is not default', async () => {
      mockRepo.countByUser.mockResolvedValue(2);
      mockRepo.create.mockResolvedValue({
        ...MOCK_ADDRESS,
        isDefault: false,
      } as never);

      await addressService.createAddress('user-1', {
        ...input,
        isDefault: false,
      });

      expect(mockRepo.clearDefaultsByUser).not.toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: false }),
      );
    });
  });

  describe('updateAddress', () => {
    it('should clear other defaults when updating an address to be default', async () => {
      mockRepo.findById.mockResolvedValue(MOCK_ADDRESS as never);
      mockRepo.update.mockResolvedValue(MOCK_ADDRESS as never);

      await addressService.updateAddress('addr-1', 'user-1', {
        isDefault: true,
      });

      expect(mockRepo.clearDefaultsByUser).toHaveBeenCalledWith('user-1');
      expect(mockRepo.findById).toHaveBeenCalledWith('addr-1', 'user-1');
      expect(mockRepo.update).toHaveBeenCalledWith(
        'addr-1',
        {
          isDefault: true,
        },
        'user-1',
      );
    });

    it('should throw 404 if address not found or not owned by user', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        addressService.updateAddress('addr-1', 'user-1', {}),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('deleteAddress', () => {
    it('should throw error when trying to delete default address', async () => {
      mockRepo.findById.mockResolvedValue({
        ...MOCK_ADDRESS,
        isDefault: true,
      } as never);

      await expect(
        addressService.deleteAddress('addr-1', 'user-1'),
      ).rejects.toThrow('Alamat utama tidak dapat dihapus');
    });

    it('should delete non-default address', async () => {
      mockRepo.findById.mockResolvedValue({
        ...MOCK_ADDRESS,
        isDefault: false,
      } as never);
      mockRepo.delete.mockResolvedValue(MOCK_ADDRESS as never);

      await addressService.deleteAddress('addr-1', 'user-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('addr-1', 'user-1');
      expect(mockRepo.delete).toHaveBeenCalledWith('addr-1', 'user-1');
    });

    it('archives instead of deleting an address an order points at', async () => {
      mockRepo.findById.mockResolvedValue({
        ...MOCK_ADDRESS,
        isDefault: false,
      } as never);
      mockRepo.isUsedByOrder.mockResolvedValueOnce(true);
      mockRepo.archive.mockResolvedValue(MOCK_ADDRESS as never);

      await addressService.deleteAddress('addr-1', 'user-1');

      expect(mockRepo.archive).toHaveBeenCalledWith('addr-1');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateAddress on an address used by an order', () => {
    it('replaces the row so the order keeps its old address', async () => {
      mockRepo.findById.mockResolvedValue(MOCK_ADDRESS as never);
      mockRepo.isUsedByOrder.mockResolvedValueOnce(true);
      mockRepo.replace.mockResolvedValue(MOCK_ADDRESS as never);

      await addressService.updateAddress('addr-1', 'user-1', {
        city: 'Bandung',
      });

      expect(mockRepo.replace).toHaveBeenCalledWith(MOCK_ADDRESS, {
        city: 'Bandung',
      });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('setDefaultAddress', () => {
    it('should call repository setDefault', async () => {
      mockRepo.findById.mockResolvedValue(MOCK_ADDRESS as never);
      mockRepo.setDefault.mockResolvedValue([{}, {}, MOCK_ADDRESS] as never);

      await addressService.setDefaultAddress('addr-1', 'user-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('addr-1', 'user-1');
      expect(mockRepo.setDefault).toHaveBeenCalledWith('addr-1', 'user-1');
    });
  });
});
