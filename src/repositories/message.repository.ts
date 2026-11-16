import prisma from '@/lib/prisma';

const attachmentInclude = {
  product: {
    select: { id: true, slug: true, name: true, imageURL: true, price: true },
  },
  variant: { select: { id: true, name: true, imageURL: true, price: true } },
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
    variantId,
  }: {
    conversationId: string;
    senderId: string;
    content: string;
    productId?: string;
    variantId?: string;
  }) => {
    return prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        senderId,
        content,
        productId,
        variantId,
      },
      include: attachmentInclude,
    });
  },

  /** Oldest-first message history for a conversation (capped). */
  /** The latest 100 messages, oldest first. */
  listByConversation: async (conversationId: string) => {
    const latest = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: attachmentInclude,
    });
    return latest.reverse();
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
