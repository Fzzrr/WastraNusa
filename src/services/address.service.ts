import { ApiError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { addressRepository } from '@/repositories/address.repository';
import {
  type CreateAddressInput,
  type UpdateAddressInput,
} from '@/schemas/address.schema';

export const addressService = {
  getAddresses: async (userId: string) => {
    return addressRepository.findAllByUser(userId);
  },

  createAddress: async (userId: string, data: CreateAddressInput) => {
    const id = crypto.randomUUID();
    const count = await addressRepository.countByUser(userId);

    const shouldBeDefault = count === 0 ? true : (data.isDefault ?? false);

    // Clear any existing default before creating, so the new one can take over
    if (shouldBeDefault && count > 0) {
      await addressRepository.clearDefaultsByUser(userId);
    }

    const address = await addressRepository.create({
      ...data,
      id,
      userId,
      isDefault: shouldBeDefault,
    });

    logger.info('Address created', { addressId: id, userId });
    return address;
  },

  updateAddress: async (
    id: string,
    userId: string,
    data: UpdateAddressInput,
  ) => {
    const existing = await addressRepository.findById(id, userId);
    if (!existing) {
      throw new ApiError('Alamat tidak ditemukan', 404);
    }

    if (data.isDefault === true) {
      await addressRepository.clearDefaultsByUser(userId);
    }

    const address = await addressRepository.update(id, data, userId);
    if (!address) {
      throw new ApiError('Alamat tidak ditemukan', 404);
    }
    logger.info('Address updated', { addressId: id, userId });
    return address;
  },

  deleteAddress: async (id: string, userId: string) => {
    const existing = await addressRepository.findById(id, userId);
    if (!existing) {
      throw new ApiError('Alamat tidak ditemukan', 404);
    }
    if (existing.isDefault) {
      throw new ApiError('Alamat utama tidak dapat dihapus', 400);
    }

    const address = await addressRepository.delete(id, userId);
    if (!address) {
      throw new ApiError('Alamat tidak ditemukan', 404);
    }
    logger.info('Address deleted', { addressId: id, userId });
    return address;
  },

  setDefaultAddress: async (id: string, userId: string) => {
    const existing = await addressRepository.findById(id, userId);
    if (!existing) {
      throw new ApiError('Alamat tidak ditemukan', 404);
    }

    const [, , updated] = await addressRepository.setDefault(id, userId);
    if (!updated) {
      throw new ApiError('Alamat tidak ditemukan', 404);
    }
    logger.info('Default address set', { addressId: id, userId });
    return updated;
  },
};
