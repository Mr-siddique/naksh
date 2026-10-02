import {
  fetchConversation,
  sendMessage as sendToApi,
} from '../../../../services/chatApi';
import type { Message, UserMessage } from '../../conversation.types';
import { selectIsBusy, useConversationStore } from '../useConversationStore';
import { deferred } from '../../../../testUtils';

jest.mock('../../../../services/chatApi');
jest.mock('../../utils/streamText', () => ({
  streamText: (options: import('../../utils/streamText').StreamTextOptions) => {
    options.onProgress(options.length);
    options.onDone();
    return () => {};
  },
}));
const mockSend = jest.mocked(sendToApi);

function nextSend() {
  const call = deferred<void>();
  mockSend.mockReturnValueOnce(call.promise);
  return call;
}

const EXISTING: Message = {
  id: 'ai-1',
  type: 'ai',
  text: 'Hello',
  createdAt: '2026-10-01T09:00:00.000Z',
};

const state = () => useConversationStore.getState();
const userMessages = () =>
  state().messages.filter((m): m is UserMessage => m.type === 'user');

beforeEach(() => {
  mockSend.mockReset();
  state().reset();
  useConversationStore.setState({ loadState: 'ready', messages: [EXISTING] });
});

describe('conversation store: send', () => {
  it('R6.3: adds the message immediately as sending, with trimmed text', async () => {
    const send = nextSend();
    const done = state().sendMessage('  Will I get promoted?  ');

    const [sent] = userMessages();
    expect(sent).toMatchObject({
      type: 'user',
      text: 'Will I get promoted?',
      status: 'sending',
    });
    expect(state().messages[state().messages.length - 1]).toBe(sent);
    expect(Date.parse(sent.createdAt)).not.toBeNaN();
    expect(mockSend).toHaveBeenCalledWith('Will I get promoted?');

    send.resolve();
    await done;
  });

  it('NFR1: keeps other message objects unchanged through a send', async () => {
    const send = nextSend();
    const done = state().sendMessage('Hi');
    expect(state().messages[0]).toBe(EXISTING);
    send.resolve();
    await done;
    expect(state().messages[0]).toBe(EXISTING);
  });

  it('R6.2: ignores empty or whitespace-only text', async () => {
    await state().sendMessage('   ');
    expect(userMessages()).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('R6.4: marks the message sent when the send succeeds', async () => {
    const send = nextSend();
    const done = state().sendMessage('Hi');
    send.resolve();
    await done;

    expect(userMessages()[0].status).toBe('sent');
  });

  it('R6.5: marks the message failed when the send fails', async () => {
    const send = nextSend();
    const done = state().sendMessage('Hi');
    send.reject(new Error('offline'));
    await done;

    expect(userMessages()[0].status).toBe('failed');
  });

  it('R6.6: retry resends the same message in place without duplicating it', async () => {
    const first = nextSend();
    const sending = state().sendMessage('Hi');
    first.reject(new Error('offline'));
    await sending;
    const failed = userMessages()[0];
    const index = state().messages.indexOf(failed);

    const second = nextSend();
    const retrying = state().retryMessage(failed.id);
    expect(userMessages()).toHaveLength(1);
    expect(userMessages()[0]).toMatchObject({
      id: failed.id,
      status: 'sending',
    });

    second.resolve();
    await retrying;
    expect(userMessages()).toHaveLength(1);
    expect(state().messages[index]).toMatchObject({
      id: failed.id,
      text: 'Hi',
      status: 'sent',
      createdAt: failed.createdAt,
    });
    expect(mockSend).toHaveBeenLastCalledWith('Hi');
  });

  it('R6.6: retry does nothing for a message that has not failed', async () => {
    const send = nextSend();
    const done = state().sendMessage('Hi');
    send.resolve();
    await done;

    await state().retryMessage(userMessages()[0].id);
    await state().retryMessage('missing');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('R6.2: is busy while a message is sending', async () => {
    expect(selectIsBusy(state())).toBe(false);
    const send = nextSend();
    const done = state().sendMessage('Hi');
    expect(selectIsBusy(state())).toBe(true);

    send.resolve();
    await done;
    expect(selectIsBusy(state())).toBe(false);
  });

  it('R6.2: ignores a send while another message is sending', async () => {
    const send = nextSend();
    const done = state().sendMessage('First');
    await state().sendMessage('Second');

    expect(userMessages().map(m => m.text)).toEqual(['First']);
    expect(mockSend).toHaveBeenCalledTimes(1);
    send.resolve();
    await done;
  });

  it('R6.2: ignores a send while a retry is sending', async () => {
    const first = nextSend();
    const failing = state().sendMessage('First');
    first.reject(new Error('offline'));
    await failing;

    const retry = nextSend();
    const retrying = state().retryMessage(userMessages()[0].id);
    await state().sendMessage('Second');

    expect(userMessages().map(m => m.text)).toEqual(['First']);
    retry.resolve();
    await retrying;
  });

  it('R6.9: ignores a retry while another message is sending', async () => {
    const first = nextSend();
    const failing = state().sendMessage('First');
    first.reject(new Error('offline'));
    await failing;
    const failedId = userMessages()[0].id;

    const second = nextSend();
    const sending = state().sendMessage('Second');
    await state().retryMessage(failedId);

    expect(userMessages()[0].status).toBe('failed');
    expect(mockSend).toHaveBeenCalledTimes(2);
    second.resolve();
    await sending;
  });

  it('R6.8: a failed message does not block sending new ones', async () => {
    const first = nextSend();
    const failing = state().sendMessage('First');
    first.reject(new Error('offline'));
    await failing;

    const second = nextSend();
    const sending = state().sendMessage('Second');
    second.resolve();
    await sending;

    expect(userMessages().map(m => [m.text, m.status])).toEqual([
      ['First', 'failed'],
      ['Second', 'sent'],
    ]);
  });

  it('R6.3: gives every sent message a unique id', async () => {
    for (const text of ['One', 'Two', 'Three']) {
      const send = nextSend();
      const done = state().sendMessage(text);
      send.resolve();
      await done;
    }
    const ids = userMessages().map(m => m.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('R1.5: ignores a send result that arrives after reset()', async () => {
    const send = nextSend();
    const done = state().sendMessage('Hi');
    state().reset();
    const afterReset = state().messages;

    send.resolve();
    await done;
    expect(state().messages).toBe(afterReset);
  });

  it('R1.5: ignores a send result that arrives after a reload', async () => {
    const send = nextSend();
    const done = state().sendMessage('Hi');
    useConversationStore.setState({ messages: [EXISTING] });
    jest.mocked(fetchConversation).mockReturnValueOnce(new Promise(() => {}));
    state().load();
    const afterReload = state().messages;

    send.reject(new Error('offline'));
    await done;
    expect(state().messages).toBe(afterReload);
  });
});
