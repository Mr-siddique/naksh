import { sendMessage as sendToApi } from '../../../../services/chatApi';
import type { Message, UserMessage } from '../../conversation.types';
import { useConversationStore } from '../useConversationStore';

jest.mock('../../../../services/chatApi');

const at = '2026-10-01T09:00:00.000Z';
const MESSAGES: Message[] = [
  { id: 'u1', type: 'user', text: 'Hi', createdAt: at },
  { id: 'a1', type: 'ai', text: 'Saturn is strong this year.', createdAt: at },
];

const state = () => useConversationStore.getState();
const lastUserMessage = () =>
  state()
    .messages.filter((m): m is UserMessage => m.type === 'user')
    .at(-1);

beforeEach(() => {
  jest.mocked(sendToApi).mockReset();
  jest.mocked(sendToApi).mockReturnValue(new Promise(() => {}));
  state().reset();
  useConversationStore.setState({ loadState: 'ready', messages: MESSAGES });
});

describe('conversation store: reply', () => {
  it('R4.7: replying stores a snapshot of the AI message and closes the sheet', () => {
    state().openActions('a1');
    state().setReplyTo('a1');

    expect(state().replyTo).toEqual({
      messageId: 'a1',
      text: 'Saturn is strong this year.',
    });
    expect(state().actionMessageId).toBeNull();
  });

  it('R4.7: ignores reply requests for non-AI or missing messages', () => {
    state().setReplyTo('u1');
    state().setReplyTo('missing');
    expect(state().replyTo).toBeNull();
  });

  it('R4.8: clearReply removes the preview', () => {
    state().setReplyTo('a1');
    state().clearReply();
    expect(state().replyTo).toBeNull();
  });

  it('R4.9: a sent message carries the quote and the preview clears', () => {
    state().setReplyTo('a1');
    state().sendMessage('Which gemstone?');

    expect(lastUserMessage()?.replyTo).toEqual({
      messageId: 'a1',
      text: 'Saturn is strong this year.',
    });
    expect(state().replyTo).toBeNull();
  });

  it('R4.9: a message sent without a reply has no quote', () => {
    state().sendMessage('Plain question');
    expect(lastUserMessage()).not.toHaveProperty('replyTo');
  });

  it('R4.9: the quote survives deleting the original message', () => {
    state().setReplyTo('a1');
    state().sendMessage('Which gemstone?');
    state().deleteMessage('a1');

    expect(lastUserMessage()?.replyTo?.text).toBe(
      'Saturn is strong this year.',
    );
  });

  it('R4.10: deleting the replied-to message clears the preview', () => {
    state().setReplyTo('a1');
    state().deleteMessage('a1');
    expect(state().replyTo).toBeNull();
  });

  it('R4.10: deleting a different message keeps the preview', () => {
    const other: Message = {
      id: 'a2',
      type: 'ai',
      text: 'More',
      createdAt: at,
    };
    useConversationStore.setState({ messages: [...MESSAGES, other] });
    state().setReplyTo('a1');
    state().deleteMessage('a2');
    expect(state().replyTo?.messageId).toBe('a1');
  });

  it('R1.5: reset clears the reply', () => {
    state().setReplyTo('a1');
    state().reset();
    expect(state().replyTo).toBeNull();
  });
});
