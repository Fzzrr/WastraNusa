import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export const addressRepository = {
  findAllByUser: async (userId: string) => {
    return prisma.customerAddress.findMany({
      where: { userId, archivedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  },

  findById: async (id: string, userId?: string) => {
    return prisma.customerAddress.findFirst({
      where: {
        id,
        archivedAt: null,
        ...(userId ? { userId } : {}),
      },
    });
  },

  findDefaultByUser: async (userId: string) => {
    return prisma.customerAddress.findFirst({
      where: { userId, isDefault: true, archivedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  create: async (data: Prisma.CustomerAddressUncheckedCreateInput) => {
    return prisma.customerAddress.create({ data });
  },

  update: async (
    id: string,
    data: Prisma.CustomerAddressUpdateInput,
    userId?: string,
  ) => {
    if (!userId) {
      return prisma.customerAddress.update({ where: { id }, data });
    }

    await prisma.customerAddress.updateMany({
      where: { id, userId },
      data,
    });

    return prisma.customerAddress.findFirst({
      where: { id, userId },
    });
  },

  delete: async (id: string, userId?: string) => {
    if (userId) {
      const address = await prisma.customerAddress.findFirst({
        where: { id, userId },
      });
      if (!address) return null;

      return prisma.customerAddress.delete({ where: { id: address.id } });
    }

    return prisma.customerAddress.delete({ where: { id } });
  },

  clearDefaultsByUser: async (userId: string) => {
    return prisma.customerAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  },

  /**
   * Sets one address as the default and clears isDefault on all other addresses for the user.
   */
  setDefault: async (id: string, userId: string) => {
    return prisma.$transaction([
      prisma.customerAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.customerAddress.updateMany({
        where: { id, userId, archivedAt: null },
        data: { isDefault: true },
      }),
      prisma.customerAddress.findFirst({
        where: { id, userId, archivedAt: null },
      }),
    ]);
  },

  countByUser: async (userId: string) => {
    return prisma.customerAddress.count({
      where: { userId, archivedAt: null },
    });
  },

  isUsedByOrder: async (id: string) => {
    const order = await prisma.order.findFirst({
      where: { shippingAddressId: id },
      select: { id: true },
    });
    return order !== null;
  },

  archive: async (id: string) => {
    return prisma.customerAddress.update({
      where: { id },
      data: { archivedAt: new Date(), isDefault: false },
    });
  },

  /**
   * Edits an address that orders already point at: the old row is archived
   * (so those orders keep the address they shipped to) and a new row with the
   * changes takes its place.
   */
  replace: async (
    existing: Prisma.CustomerAddressUncheckedCreateInput,
    data: Prisma.CustomerAddressUpdateInput,
  ) => {
    const [, created] = await prisma.$transaction([
      prisma.customerAddress.update({
        where: { id: existing.id },
        data: { archivedAt: new Date(), isDefault: false },
      }),
      prisma.customerAddress.create({
        data: {
          ...existing,
          // Fields left out of a partial update keep their old value.
          ...(Object.fromEntries(
            Object.entries(data).filter(([, value]) => value !== undefined),
          ) as Prisma.CustomerAddressUncheckedCreateInput),
          id: crypto.randomUUID(),
          createdAt: undefined,
          updatedAt: undefined,
          archivedAt: null,
        },
      }),
    ]);
    return created;
  },
};
