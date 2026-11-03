import prisma from '@/lib/prisma';

const participantSelect = {
  id: true,
  name: true,
  image: true,
} as const;

const conversationWithParticipants = {
  participantOne: { select: participantSelect },
  participantTwo: { select: participantSelect },
} as const;

/**
 * Normalize a participant pair so the smaller id is always `participantOneId`.
 * This mirrors the schema's normalized `@@unique([participantOneId,
 * participantTwoId])` so a conversation is looked up / created consistently
 * regardless of who initiated it.
 */
const normalizePair = (a: string, b: string): [string, string] =>
  a <= b ? [a, b] : [b, a];

/**
 * Data access for conversations. All DB access for the conversation entity
 * lives here; the service layer never touches Prisma directly.
 */
export const conversationRepository = {
  /** Whether a user exists (used to validate the counterpart before starting). */
  participantExists: async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return Boolean(user);
  },

  /** Find the single normalized conversation between two users, if any. */
  findBetween: async (a: string, b: string) => {
    const [participantOneId, participantTwoId] = normalizePair(a, b);
    return prisma.conversation.findUnique({
      where: {
        participantOneId_participantTwoId: {
          participantOneId,
          participantTwoId,
        },
      },
      include: conversationWithParticipants,
    });
  },

  /** Create a normalized conversation between two users. */
  create: async (a: string, b: string) => {
    const [participantOneId, participantTwoId] = normalizePair(a, b);
    return prisma.conversation.create({
      data: {
        id: crypto.randomUUID(),
        participantOneId,
        participantTwoId,
      },
      include: conversationWithParticipants,
    });
  },

  /**
   * Load a conversation by id only if `userId` is one of its participants;
   * returns null otherwise (so the service can 404 without leaking existence).
   */
  findByIdForUser: async (id: string, userId: string) => {
    return prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
      include: conversationWithParticipants,
    });
  },

  /**
   * List every conversation the user participates in, newest activity first,
   * each with both participants and its single most recent message.
   */
  listForUser: async (userId: string) => {
    return prisma.conversation.findMany({
      where: {
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
      include: {
        ...conversationWithParticipants,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  },

  /** Mirror the latest message time onto the conversation for list sorting. */
  touchLastMessageAt: async (id: string, date: Date) => {
    return prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: date },
    });
  },

  /**
   * Unread counts (messages addressed to `userId`, i.e. not sent by them, with
   * no `readAt`) grouped by conversation, for the given conversation ids.
   */
  unreadCountsFor: async (userId: string, conversationIds: string[]) => {
    if (conversationIds.length === 0) {
      return [] as { conversationId: string; _count: number }[];
    }
    const grouped = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        readAt: null,
      },
      _count: true,
    });
    return grouped as unknown as {
      conversationId: string;
      _count: number;
    }[];
  },
};
