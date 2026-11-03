import prisma from '@/lib/prisma';

const productSelect = {
  select: { id: true, slug: true, name: true, imageURL: true, price: true },
} as const;

/**
 * Data access for chat messages. All DB access for the message entity lives
 * here; the service layer never touches Prisma directly.
 */
export const messageRepository = {
  create: async ({
    conversationId,
    senderId,
    content,
    productId,
  }: {
    conversationId: string;
    senderId: string;
    content: string;
    productId?: string;
  }) => {
    return prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        senderId,
        content,
        productId,
      },
      include: { product: productSelect },
    });
  },

  /** Oldest-first message history for a conversation (capped). */
  listByConversation: async (conversationId: string) => {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { product: productSelect },
    });
  },

  /**
   * Mark every unread message in the conversation that was NOT sent by the
   * reader as read. Returns the number of messages updated.
   */
  markReadForOther: async (conversationId: string, readerId: string) => {
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: readerId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return result.count;
  },
};
