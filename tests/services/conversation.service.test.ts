import eventBus, { SSE_EVENTS, getUserEvent } from '@/lib/chat/event-bus';
import { conversationRepository } from '@/repositories/conversation.repository';
import { messageRepository } from '@/repositories/message.repository';
import { conversationService } from '@/services/conversation.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/conversation.repository', () => ({
  conversationRepository: {
    participantExists: vi.fn(),
    findBetween: vi.fn(),
    create: vi.fn(),
    findByIdForUser: vi.fn(),
    listForUser: vi.fn(),
    touchLastMessageAt: vi.fn(),
    unreadCountsFor: vi.fn(),
  },
}));

vi.mock('@/repositories/message.repository', () => ({
  messageRepository: {
    create: vi.fn(),
    listByConversation: vi.fn(),
    markReadForOther: vi.fn(),
  },
}));

vi.mock('@/lib/chat/event-bus', () => ({
  default: { emit: vi.fn() },
  SSE_EVENTS: {
    NEW_MESSAGE: 'NEW_MESSAGE',
    CONVERSATION_UPDATED: 'CONVERSATION_UPDATED',
    MESSAGE_STATUSES_UPDATED: 'MESSAGE_STATUSES_UPDATED',
  },
  getUserEvent: (event: string, userId: string) => `${event}:${userId}`,
}));

const mockConversationRepo = vi.mocked(conversationRepository);
const mockMessageRepo = vi.mocked(messageRepository);
const mockEmit = vi.mocked(eventBus.emit);

const USER_A = 'user-a';
const USER_B = 'user-b';
const CONVERSATION_ID = 'conv-1';

// A normalized conversation row (participantOneId <= participantTwoId).
const conversationRow = {
  id: CONVERSATION_ID,
  participantOneId: USER_A,
  participantTwoId: USER_B,
  participantOne: { id: USER_A, name: 'Alice', image: null },
  participantTwo: { id: USER_B, name: 'Bob', image: null },
  lastMessageAt: null,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('conversationService', { tags: ['backend'] }, () => {
  describe('startConversation', () => {
    it('rejects starting a conversation with yourself (400)', async () => {
      await expect(
        conversationService.startConversation(USER_A, USER_A),
      ).rejects.toMatchObject({ status: 400 });
      expect(mockConversationRepo.create).not.toHaveBeenCalled();
    });

    it('404s when the other user does not exist', async () => {
      mockConversationRepo.participantExists.mockResolvedValue(false);

      await expect(
        conversationService.startConversation(USER_A, 'ghost'),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockConversationRepo.create).not.toHaveBeenCalled();
    });

    it('returns the existing conversation instead of creating a new one', async () => {
      mockConversationRepo.participantExists.mockResolvedValue(true);
      mockConversationRepo.findBetween.mockResolvedValue(
        conversationRow as never,
      );

      const summary = await conversationService.startConversation(
        USER_A,
        USER_B,
      );

      expect(mockConversationRepo.create).not.toHaveBeenCalled();
      expect(summary.id).toBe(CONVERSATION_ID);
      expect(summary.otherParticipant.id).toBe(USER_B);
      expect(summary.unreadCount).toBe(0);
    });
  });

  describe('sendMessage', () => {
    it('404s when the sender is not a participant', async () => {
      mockConversationRepo.findByIdForUser.mockResolvedValue(null as never);

      await expect(
        conversationService.sendMessage(USER_A, CONVERSATION_ID, 'hi'),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockMessageRepo.create).not.toHaveBeenCalled();
    });

    it('persists the message and emits NEW_MESSAGE to both participants', async () => {
      mockConversationRepo.findByIdForUser.mockResolvedValue(
        conversationRow as never,
      );
      mockMessageRepo.create.mockResolvedValue({
        id: 'msg-1',
        conversationId: CONVERSATION_ID,
        senderId: USER_A,
        content: 'hello',
        readAt: null,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      } as never);
      mockConversationRepo.touchLastMessageAt.mockResolvedValue({} as never);

      const message = await conversationService.sendMessage(
        USER_A,
        CONVERSATION_ID,
        'hello',
      );

      expect(mockMessageRepo.create).toHaveBeenCalledWith({
        conversationId: CONVERSATION_ID,
        senderId: USER_A,
        content: 'hello',
      });
      expect(mockConversationRepo.touchLastMessageAt).toHaveBeenCalled();
      expect(message.content).toBe('hello');
      expect(message.createdAt).toBe('2026-01-02T00:00:00.000Z');

      // NEW_MESSAGE emitted to both participants' channels.
      expect(mockEmit).toHaveBeenCalledWith(
        getUserEvent(SSE_EVENTS.NEW_MESSAGE, USER_A),
        expect.objectContaining({ conversationId: CONVERSATION_ID }),
      );
      expect(mockEmit).toHaveBeenCalledWith(
        getUserEvent(SSE_EVENTS.NEW_MESSAGE, USER_B),
        expect.objectContaining({ conversationId: CONVERSATION_ID }),
      );
      // CONVERSATION_UPDATED emitted to both participants' channels.
      expect(mockEmit).toHaveBeenCalledWith(
        getUserEvent(SSE_EVENTS.CONVERSATION_UPDATED, USER_A),
        { conversationId: CONVERSATION_ID },
      );
      expect(mockEmit).toHaveBeenCalledWith(
        getUserEvent(SSE_EVENTS.CONVERSATION_UPDATED, USER_B),
        { conversationId: CONVERSATION_ID },
      );
    });
  });

  describe('getConversation', () => {
    it('404s when the user is not a participant', async () => {
      mockConversationRepo.findByIdForUser.mockResolvedValue(null as never);

      await expect(
        conversationService.getConversation(USER_A, CONVERSATION_ID),
      ).rejects.toMatchObject({ status: 404 });
      expect(mockMessageRepo.markReadForOther).not.toHaveBeenCalled();
    });

    it('marks the other side read and emits when unread messages existed', async () => {
      mockConversationRepo.findByIdForUser.mockResolvedValue(
        conversationRow as never,
      );
      mockMessageRepo.listByConversation.mockResolvedValue([
        {
          id: 'msg-1',
          conversationId: CONVERSATION_ID,
          senderId: USER_B,
          content: 'hey',
          readAt: null,
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ] as never);
      mockMessageRepo.markReadForOther.mockResolvedValue(1);

      const detail = await conversationService.getConversation(
        USER_A,
        CONVERSATION_ID,
      );

      expect(mockMessageRepo.markReadForOther).toHaveBeenCalledWith(
        CONVERSATION_ID,
        USER_A,
      );
      // The returned message reflects the just-applied read status.
      expect(detail.messages[0].readAt).not.toBeNull();

      // MESSAGE_STATUSES_UPDATED to the other participant (USER_B).
      expect(mockEmit).toHaveBeenCalledWith(
        getUserEvent(SSE_EVENTS.MESSAGE_STATUSES_UPDATED, USER_B),
        expect.objectContaining({
          conversationId: CONVERSATION_ID,
          readerId: USER_A,
        }),
      );
      // CONVERSATION_UPDATED to the reader (USER_A).
      expect(mockEmit).toHaveBeenCalledWith(
        getUserEvent(SSE_EVENTS.CONVERSATION_UPDATED, USER_A),
        { conversationId: CONVERSATION_ID },
      );
    });

    it('does not emit read events when nothing was unread', async () => {
      mockConversationRepo.findByIdForUser.mockResolvedValue(
        conversationRow as never,
      );
      mockMessageRepo.listByConversation.mockResolvedValue([] as never);
      mockMessageRepo.markReadForOther.mockResolvedValue(0);

      await conversationService.getConversation(USER_A, CONVERSATION_ID);

      expect(mockEmit).not.toHaveBeenCalled();
    });
  });
});
