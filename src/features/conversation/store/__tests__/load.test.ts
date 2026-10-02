import { fetchConversation } from '../../../../services/chatApi';
import type { Message } from '../../conversation.types';
import { useConversationStore } from '../useConversationStore';
import { deferred } from '../../../../testUtils';

jest.mock('../../../../services/chatApi');
const mockFetch = jest.mocked(fetchConversation);

function nextFetch() {
  const call = deferred<Message[]>();
  mockFetch.mockReturnValueOnce(call.promise);
  return call;
}

const MESSAGES: Message[] = [
  {
    id: '1',
    type: 'system',
    text: 'Started',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
];

const state = () => useConversationStore.getState();

beforeEach(() => {
  mockFetch.mockReset();
  state().reset();
});

describe('conversation store: load', () => {
  it('R1.1: starts in the loading state with no messages', () => {
    expect(state().loadState).toBe('loading');
    expect(state().messages).toEqual([]);
  });

  it('R1.1: requests the conversation and stays loading until it resolves', async () => {
    const request = nextFetch();
    const done = state().load();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(state().loadState).toBe('loading');

    request.resolve(MESSAGES);
    await done;
    expect(state().loadState).toBe('ready');
    expect(state().messages).toBe(MESSAGES);
  });

  it('R1.3: becomes ready with no messages for an empty conversation', async () => {
    const request = nextFetch();
    const done = state().load();
    request.resolve([]);
    await done;

    expect(state().loadState).toBe('ready');
    expect(state().messages).toEqual([]);
  });

  it('R1.4: enters the error state when the request fails', async () => {
    const request = nextFetch();
    const done = state().load();
    request.reject(new Error('offline'));
    await done;

    expect(state().loadState).toBe('error');
    expect(state().messages).toEqual([]);
  });

  it('R1.5: retrying after an error shows loading again and repeats the request', async () => {
    const failed = nextFetch();
    const first = state().load();
    failed.reject(new Error('offline'));
    await first;

    const retry = nextFetch();
    const second = state().load();
    expect(state().loadState).toBe('loading');
    expect(mockFetch).toHaveBeenCalledTimes(2);

    retry.resolve(MESSAGES);
    await second;
    expect(state().loadState).toBe('ready');
    expect(state().messages).toBe(MESSAGES);
  });

  it('R1.5: reloading clears the previous conversation while loading', async () => {
    const first = nextFetch();
    const done = state().load();
    first.resolve(MESSAGES);
    await done;

    mockFetch.mockResolvedValueOnce(MESSAGES);
    const reload = state().load();
    expect(state().loadState).toBe('loading');
    expect(state().messages).toEqual([]);
    await reload;
  });

  it('R1.5: ignores a result that arrives after reset()', async () => {
    const request = nextFetch();
    const done = state().load();
    state().reset();

    request.resolve(MESSAGES);
    await done;
    expect(state().loadState).toBe('loading');
    expect(state().messages).toEqual([]);
  });

  it('R1.5: ignores a failure that arrives after reset()', async () => {
    const request = nextFetch();
    const done = state().load();
    state().reset();

    request.reject(new Error('offline'));
    await done;
    expect(state().loadState).toBe('loading');
    expect(state().messages).toEqual([]);
  });

  it('R1.5: only the latest of overlapping loads (e.g. double Retry) wins', async () => {
    const older = nextFetch();
    const newer = nextFetch();
    const first = state().load();
    const second = state().load();

    newer.resolve([]);
    await second;
    older.resolve(MESSAGES);
    await first;

    expect(state().loadState).toBe('ready');
    expect(state().messages).toEqual([]);
  });
});
