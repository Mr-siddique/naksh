import Clipboard from '@react-native-clipboard/clipboard';
import type { Message } from '../../conversation.types';
import { TOAST_MS, useConversationStore } from '../useConversationStore';

jest.mock('../../../../services/chatApi');

const at = '2026-10-01T09:00:00.000Z';
const MESSAGES: Message[] = [
  { id: 'u1', type: 'user', text: 'Hi', createdAt: at },
  { id: 'a1', type: 'ai', text: 'Saturn is strong.', createdAt: at },
  { id: 'h1', type: 'human', text: 'Hello', createdAt: at },
  { id: 's1', type: 'system', text: 'Started', createdAt: at },
];

const state = () => useConversationStore.getState();

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(Clipboard.setString).mockClear();
  state().reset();
  useConversationStore.setState({ loadState: 'ready', messages: MESSAGES });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('conversation store: message actions', () => {
  it('R4.1: opens the action sheet for an AI message', () => {
    state().openActions('a1');
    expect(state().actionMessageId).toBe('a1');
    state().closeActions();
    expect(state().actionMessageId).toBeNull();
  });

  it('R4.2: does not open actions for other message types', () => {
    for (const id of ['u1', 'h1', 's1', 'missing']) {
      state().openActions(id);
      expect(state().actionMessageId).toBeNull();
    }
  });

  it('R4.3: copies the text and shows a brief "Copied" toast', () => {
    state().openActions('a1');
    state().copyMessage('a1');

    expect(Clipboard.setString).toHaveBeenCalledWith('Saturn is strong.');
    expect(state().toast).toBe('Copied');
    expect(state().actionMessageId).toBeNull();

    jest.advanceTimersByTime(TOAST_MS - 1);
    expect(state().toast).toBe('Copied');
    jest.advanceTimersByTime(1);
    expect(state().toast).toBeNull();
  });

  it('R4.3: copying again restarts the toast timer', () => {
    state().copyMessage('a1');
    jest.advanceTimersByTime(TOAST_MS - 100);
    state().copyMessage('a1');
    jest.advanceTimersByTime(200);
    expect(state().toast).toBe('Copied');
    jest.advanceTimersByTime(TOAST_MS);
    expect(state().toast).toBeNull();
  });

  it('R4.3: closes the sheet when copying a message that no longer exists', () => {
    state().openActions('a1');
    state().copyMessage('missing');
    expect(state().actionMessageId).toBeNull();
    expect(Clipboard.setString).not.toHaveBeenCalled();
  });

  it('R4.4: deletes the message and closes the sheet', () => {
    state().openActions('a1');
    state().deleteMessage('a1');

    expect(state().messages.map(m => m.id)).toEqual(['u1', 'h1', 's1']);
    expect(state().actionMessageId).toBeNull();
  });

  it('NFR1: deleting keeps the other message objects unchanged', () => {
    state().deleteMessage('a1');
    expect(state().messages[0]).toBe(MESSAGES[0]);
    expect(state().messages[1]).toBe(MESSAGES[2]);
  });

  it('R4.3: reset clears a pending toast', () => {
    state().copyMessage('a1');
    state().reset();
    expect(state().toast).toBeNull();
    useConversationStore.setState({ toast: 'Other' });
    jest.advanceTimersByTime(TOAST_MS);
    expect(state().toast).toBe('Other');
  });
});
