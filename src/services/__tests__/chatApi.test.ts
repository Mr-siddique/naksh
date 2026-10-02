import {
  fetchConversation,
  getScenario,
  LOAD_DELAY_MS,
  SEND_DELAY_MS,
  sendMessage,
  setScenario,
} from '../chatApi';

/** Tracks whether a promise has settled, without awaiting it. */
function track<T>(promise: Promise<T>) {
  const state = { settled: false };
  promise.then(
    () => (state.settled = true),
    () => (state.settled = true),
  );
  return state;
}

beforeEach(() => {
  jest.useFakeTimers();
  setScenario('normal');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('chatApi', () => {
  it('R7.2: getScenario returns the scenario last set', () => {
    setScenario('empty');
    expect(getScenario()).toBe('empty');
  });

  it('R1.1: resolves the conversation only after the load delay', async () => {
    const request = fetchConversation();
    const state = track(request);

    await jest.advanceTimersByTimeAsync(LOAD_DELAY_MS - 1);
    expect(state.settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    const messages = await request;
    expect(messages.map(m => m.id)).toEqual(['1', '2', '3', '4']);
  });

  it('R1.3, R7.2: resolves an empty conversation in the empty scenario', async () => {
    setScenario('empty');
    const request = fetchConversation();
    await jest.advanceTimersByTimeAsync(LOAD_DELAY_MS);
    await expect(request).resolves.toEqual([]);
  });

  it('R1.4, R7.2: rejects in the loadFails scenario', async () => {
    setScenario('loadFails');
    const error = fetchConversation().catch((e: unknown) => e);
    await jest.advanceTimersByTimeAsync(LOAD_DELAY_MS);
    expect(await error).toBeInstanceOf(Error);
  });

  it('R6.4: resolves a send only after the send delay', async () => {
    const request = sendMessage('Hello');
    const state = track(request);

    await jest.advanceTimersByTimeAsync(SEND_DELAY_MS - 1);
    expect(state.settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await expect(request).resolves.toBeUndefined();
  });

  it('R6.5, R7.2: rejects sends in the sendsFail scenario', async () => {
    setScenario('sendsFail');
    const error = sendMessage('Hello').catch((e: unknown) => e);
    await jest.advanceTimersByTimeAsync(SEND_DELAY_MS);
    expect(await error).toBeInstanceOf(Error);
  });

  it('R7.2: loads normally while only sends fail', async () => {
    setScenario('sendsFail');
    const request = fetchConversation();
    await jest.advanceTimersByTimeAsync(LOAD_DELAY_MS);
    await expect(request).resolves.toHaveLength(4);
  });
});
