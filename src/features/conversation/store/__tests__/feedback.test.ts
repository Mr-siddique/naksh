import type { AiMessage, Message } from '../../conversation.types';
import { useConversationStore } from '../useConversationStore';

jest.mock('../../../../services/chatApi');

const at = '2026-10-01T09:00:00.000Z';
const AI: AiMessage = {
  id: 'a1',
  type: 'ai',
  text: 'Saturn is strong.',
  createdAt: at,
  recommendations: [{ id: '1', type: 'tarot', title: 'Career Tarot Reading' }],
};
const OTHER: Message = { id: 'u1', type: 'user', text: 'Hi', createdAt: at };

const state = () => useConversationStore.getState();
const ai = () => state().messages.find(m => m.id === 'a1') as AiMessage;

beforeEach(() => {
  state().reset();
  useConversationStore.setState({ loadState: 'ready', messages: [OTHER, AI] });
});

describe('conversation store: feedback', () => {
  it('R5.2, R5.7: stores the rating on the message', () => {
    state().rate('a1', 'like');
    expect(ai().feedback).toEqual({ rating: 'like', reasons: [] });
    state().rate('a1', 'like');
    expect(ai().feedback).toBeUndefined();
  });

  it('R5.4, R5.7: stores selected reasons on a disliked message', () => {
    state().rate('a1', 'dislike');
    state().toggleReason('a1', 'too_long');
    state().toggleReason('a1', 'inaccurate');
    expect(ai().feedback).toEqual({
      rating: 'dislike',
      reasons: ['too_long', 'inaccurate'],
    });
  });

  it('R5.5: switching to 👍 clears the reasons', () => {
    state().rate('a1', 'dislike');
    state().toggleReason('a1', 'too_long');
    state().rate('a1', 'like');
    expect(ai().feedback).toEqual({ rating: 'like', reasons: [] });
  });

  it('NFR1: only the rated message changes, and its cards keep their reference', () => {
    const before = state().messages;
    state().rate('a1', 'like');
    expect(state().messages[0]).toBe(before[0]);
    expect(ai()).not.toBe(AI);
    expect(ai().recommendations).toBe(AI.recommendations);
  });

  it('R5.4, NFR1: a chip tap on a message that is not disliked changes nothing', () => {
    const before = state().messages;
    state().toggleReason('a1', 'too_long');
    expect(state().messages).toBe(before);
  });

  it('R5.1, NFR1: ignores ratings for non-AI messages', () => {
    const before = state().messages;
    state().rate('u1', 'like');
    expect(state().messages).toBe(before);
  });
});
