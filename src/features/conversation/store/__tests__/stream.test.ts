import {
  fetchConversation,
  sendMessage as sendToApi,
} from '../../../../services/chatApi';
import type { AiMessage, Message } from '../../conversation.types';
import { MOCK_AI_REPLY } from '../../mockConversation';
import {
  selectIsBusy,
  STREAM_CHARS_PER_SECOND,
  useConversationStore,
} from '../useConversationStore';
import { deferred } from '../../../../testUtils';

jest.mock('../../../../services/chatApi');
const mockSend = jest.mocked(sendToApi);

const STREAM_MS = Math.ceil(
  (MOCK_AI_REPLY.text.length / STREAM_CHARS_PER_SECOND) * 1000,
);

const state = () => useConversationStore.getState();
const replies = () =>
  state().messages.filter(
    (m): m is AiMessage => m.type === 'ai' && m.id.startsWith('ai-local-'),
  );

async function sendAndSucceed(text = 'Hi') {
  const call = deferred<void>();
  mockSend.mockReturnValueOnce(call.promise);
  const done = state().sendMessage(text);
  call.resolve();
  await done;
}

beforeEach(() => {
  jest.useFakeTimers();
  mockSend.mockReset();
  state().reset();
  useConversationStore.setState({ loadState: 'ready', messages: [] });
});

afterEach(() => {
  state().reset();
  jest.useRealTimers();
});

describe('conversation store: streaming reply', () => {
  it("R9.1: a sent message adds the PRD's AI reply, which starts streaming", async () => {
    await sendAndSucceed();

    const [reply] = replies();
    expect(reply.text).toBe(MOCK_AI_REPLY.text);
    expect(reply.recommendations).toEqual(MOCK_AI_REPLY.recommendations);
    expect(reply.recommendations).not.toBe(MOCK_AI_REPLY.recommendations);
    expect(state().streaming).toEqual({
      messageId: reply.id,
      visibleLength: 0,
    });
  });

  it('R9.1: the user message turns sent in the same update the reply appears', async () => {
    await sendAndSucceed();
    const [user, reply] = state().messages as [Message, Message];
    expect(user).toMatchObject({ type: 'user', status: 'sent' });
    expect(reply.type).toBe('ai');
  });

  it('R9.2: reveals the reply over time and then stops streaming', async () => {
    await sendAndSucceed();
    jest.advanceTimersByTime(STREAM_MS / 2);
    const midway = state().streaming?.visibleLength ?? 0;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(MOCK_AI_REPLY.text.length);

    jest.advanceTimersByTime(STREAM_MS);
    expect(state().streaming).toBeNull();
  });

  it('R9.2: streaming frames do not touch the messages array', async () => {
    await sendAndSucceed();
    const messages = state().messages;
    jest.advanceTimersByTime(STREAM_MS * 2);
    expect(state().messages).toBe(messages);
  });

  it('R6.2, R6.9: the conversation is busy until the reply finishes', async () => {
    await sendAndSucceed();
    expect(selectIsBusy(state())).toBe(true);
    await state().sendMessage('Too early');
    expect(state().messages.filter(m => m.type === 'user')).toHaveLength(1);

    jest.advanceTimersByTime(STREAM_MS * 2);
    expect(selectIsBusy(state())).toBe(false);
  });

  it('R6.9: Retry is ignored while a reply is streaming', async () => {
    const failed = deferred<void>();
    mockSend.mockReturnValueOnce(failed.promise);
    const failing = state().sendMessage('First');
    failed.reject(new Error('offline'));
    await failing;
    const failedId = state().messages[0].id;

    await sendAndSucceed('Second');
    await state().retryMessage(failedId);
    expect(state().messages[0]).toMatchObject({ status: 'failed' });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('R9.6: actions cannot open on the streaming reply', async () => {
    await sendAndSucceed();
    const [reply] = replies();
    state().openActions(reply.id);
    expect(state().actionMessageId).toBeNull();

    jest.advanceTimersByTime(STREAM_MS * 2);
    state().openActions(reply.id);
    expect(state().actionMessageId).toBe(reply.id);
  });

  it('R9.7: a failed send adds no reply', async () => {
    const call = deferred<void>();
    mockSend.mockReturnValueOnce(call.promise);
    const done = state().sendMessage('Hi');
    call.reject(new Error('offline'));
    await done;

    expect(replies()).toHaveLength(0);
    expect(state().streaming).toBeNull();
  });

  it('R9.7: a successful retry streams the reply', async () => {
    const first = deferred<void>();
    mockSend.mockReturnValueOnce(first.promise);
    const sending = state().sendMessage('Hi');
    first.reject(new Error('offline'));
    await sending;

    const retry = deferred<void>();
    mockSend.mockReturnValueOnce(retry.promise);
    const retrying = state().retryMessage(state().messages[0].id);
    retry.resolve();
    await retrying;

    expect(replies()).toHaveLength(1);
    expect(state().streaming?.messageId).toBe(replies()[0].id);
  });

  it('R9.8: reset during a stream stops it with no further writes', async () => {
    await sendAndSucceed();
    jest.advanceTimersByTime(STREAM_MS / 3);
    state().reset();
    const afterReset = state();

    jest.advanceTimersByTime(STREAM_MS * 2);
    expect(state()).toBe(afterReset);
    expect(state().streaming).toBeNull();
  });

  it('R9.8: reloading during a stream stops it', async () => {
    jest.mocked(fetchConversation).mockReturnValueOnce(new Promise(() => {}));
    await sendAndSucceed();
    expect(state().load()).toBeInstanceOf(Promise);
    const afterReload = state();

    jest.advanceTimersByTime(STREAM_MS * 2);
    expect(state()).toBe(afterReload);
  });
});
