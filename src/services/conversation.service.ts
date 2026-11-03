import eventBus, { SSE_EVENTS, getUserEvent } from '@/lib/chat/event-bus';
import { ApiError } from '@/lib/error';
import { conversationRepository } from '@/repositories/conversation.repository';
import { messageRepository } from '@/repositories/message.repository';
import {
  type ChatParticipant,
  type ConversationDetail,
  type ConversationMessage,
  type ConversationSummary,
} from '@/types/chat';

type MessageRow = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: Date | null;
  createdAt: Date;
};

type ParticipantRow = {
  id: string;
  name: string;
  image: string | null;
};

type ConversationRow = {
  id: string;
  participantOneId: string;
  participantTwoId: string;
  participantOne: ParticipantRow;
  participantTwo: ParticipantRow;
  lastMessageAt: Date | null;
  updatedAt: Date;
};

/** Map a persisted message row to the wire shape (dates → ISO strings). */
const mapMessage = (message: MessageRow): ConversationMessage => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.content,
  readAt: message.readAt ? message.readAt.toISOString() : null,
  createdAt: message.createdAt.toISOString(),
});

/** Pick the participant that is NOT the current user. */
const pickOtherParticipant = (
  conversation: ConversationRow,
  userId: string,
): ChatParticipant => {
  const other =
    conversation.participantOneId === userId
      ? conversation.participantTwo
      : conversation.participantOne;
  return { id: other.id, name: other.name, image: other.image };
};

/**
 * Business logic for 1-on-1 live chat. `userId` is the authenticated user's id
 * (from `withApiAuth`); every read and write is scoped to a conversation the
 * user actually participates in. Side-effects (SSE fan-out) are emitted here.
 */
export const conversationService = {
  startConversation: async (
    userId: string,
    otherUserId: string,
  ): Promise<ConversationSummary> => {
    if (otherUserId === userId) {
      throw new ApiError(
        'Tidak bisa memulai percakapan dengan diri sendiri',
        400,
      );
    }

    const otherExists =
      await conversationRepository.participantExists(otherUserId);
    if (!otherExists) {
      throw new ApiError('Pengguna tidak ditemukan', 404);
    }

    const existing = await conversationRepository.findBetween(
      userId,
      otherUserId,
    );
    const conversation =
      existing ?? (await conversationRepository.create(userId, otherUserId));

    return {
      id: conversation.id,
      otherParticipant: pickOtherParticipant(conversation, userId),
      lastMessage: null,
      lastMessageAt: conversation.lastMessageAt
        ? conversation.lastMessageAt.toISOString()
        : null,
      unreadCount: 0,
      updatedAt: conversation.updatedAt.toISOString(),
    };
  },

  getMyConversations: async (
    userId: string,
  ): Promise<ConversationSummary[]> => {
    const conversations = await conversationRepository.listForUser(userId);
    if (conversations.length === 0) return [];

    const ids = conversations.map((c) => c.id);
    const unreadCounts = await conversationRepository.unreadCountsFor(
      userId,
      ids,
    );
    const unreadByConversation = new Map(
      unreadCounts.map((row) => [row.conversationId, row._count]),
    );

    return conversations.map((conversation) => {
      const latest = conversation.messages[0] as MessageRow | undefined;
      return {
        id: conversation.id,
        otherParticipant: pickOtherParticipant(conversation, userId),
        lastMessage: latest
          ? {
              content: latest.content,
              createdAt: latest.createdAt.toISOString(),
              senderId: latest.senderId,
            }
          : null,
        lastMessageAt: conversation.lastMessageAt
          ? conversation.lastMessageAt.toISOString()
          : null,
        unreadCount: unreadByConversation.get(conversation.id) ?? 0,
        updatedAt: conversation.updatedAt.toISOString(),
      };
    });
  },

  getConversation: async (
    userId: string,
    conversationId: string,
  ): Promise<ConversationDetail> => {
    const conversation = await conversationRepository.findByIdForUser(
      conversationId,
      userId,
    );
    if (!conversation) {
      throw new ApiError('Percakapan tidak ditemukan', 404);
    }

    const messages = await messageRepository.listByConversation(conversationId);

    // Opening a conversation marks the other side's messages as read.
    const markedCount = await messageRepository.markReadForOther(
      conversationId,
      userId,
    );

    const readAt = new Date();
    if (markedCount > 0) {
      // Tell the other participant their messages were read, and refresh this
      // user's own conversation list (unread badge cleared).
      eventBus.emit(
        getUserEvent(
          SSE_EVENTS.MESSAGE_STATUSES_UPDATED,
          pickOtherParticipant(conversation, userId).id,
        ),
        {
          conversationId,
          readerId: userId,
          readAt: readAt.toISOString(),
        },
      );
      eventBus.emit(getUserEvent(SSE_EVENTS.CONVERSATION_UPDATED, userId), {
        conversationId,
      });
    }

    // Reflect the just-applied read status in the returned messages.
    const mapped = messages.map((message) => {
      if (message.senderId !== userId && message.readAt === null) {
        return mapMessage({ ...message, readAt });
      }
      return mapMessage(message);
    });

    return {
      id: conversation.id,
      otherParticipant: pickOtherParticipant(conversation, userId),
      messages: mapped,
    };
  },

  sendMessage: async (
    userId: string,
    conversationId: string,
    content: string,
  ): Promise<ConversationMessage> => {
    const conversation = await conversationRepository.findByIdForUser(
      conversationId,
      userId,
    );
    if (!conversation) {
      throw new ApiError('Percakapan tidak ditemukan', 404);
    }

    const created = await messageRepository.create({
      conversationId,
      senderId: userId,
      content,
    });

    await conversationRepository.touchLastMessageAt(
      conversationId,
      created.createdAt,
    );

    const message = mapMessage(created);
    const participantIds = [
      conversation.participantOneId,
      conversation.participantTwoId,
    ];

    for (const participantId of participantIds) {
      eventBus.emit(getUserEvent(SSE_EVENTS.NEW_MESSAGE, participantId), {
        conversationId,
        message,
      });
      eventBus.emit(
        getUserEvent(SSE_EVENTS.CONVERSATION_UPDATED, participantId),
        { conversationId },
      );
    }

    return message;
  },

  markRead: async (
    userId: string,
    conversationId: string,
  ): Promise<{ readAt: string }> => {
    const conversation = await conversationRepository.findByIdForUser(
      conversationId,
      userId,
    );
    if (!conversation) {
      throw new ApiError('Percakapan tidak ditemukan', 404);
    }

    const markedCount = await messageRepository.markReadForOther(
      conversationId,
      userId,
    );
    const readAt = new Date();

    if (markedCount > 0) {
      eventBus.emit(
        getUserEvent(
          SSE_EVENTS.MESSAGE_STATUSES_UPDATED,
          pickOtherParticipant(conversation, userId).id,
        ),
        {
          conversationId,
          readerId: userId,
          readAt: readAt.toISOString(),
        },
      );
    }

    return { readAt: readAt.toISOString() };
  },
};
