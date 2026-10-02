import { streamText } from '../streamText';

type FrameCallback = (timestamp: number) => void;
let queue: FrameCallback[] = [];

beforeEach(() => {
  queue = [];
  jest
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockImplementation(callback => {
      queue.push(callback);
      return queue.length;
    });
  jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {
    queue = [];
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

function frameAt(timestamp: number) {
  const pending = queue;
  queue = [];
  pending.forEach(callback => callback(timestamp));
}

function start(length = 90) {
  const onProgress = jest.fn();
  const onDone = jest.fn();
  const cancel = streamText({ length, charsPerSecond: 45, onProgress, onDone });
  return { onProgress, onDone, cancel };
}

describe('streamText', () => {
  it('R9.2: reveals text by elapsed time, using requestAnimationFrame', () => {
    const { onProgress } = start();
    expect(requestAnimationFrame).toHaveBeenCalled();

    frameAt(1000);
    frameAt(1500);
    expect(onProgress).toHaveBeenLastCalledWith(22);
  });

  it('R9.2: progress depends on elapsed time, not on the number of frames', () => {
    const slow = start();
    frameAt(0);
    frameAt(1000);

    queue = [];
    const fast = start();
    for (let t = 0; t <= 1000; t += 1000 / 120) {
      frameAt(t);
    }
    frameAt(1000);

    expect(slow.onProgress).toHaveBeenLastCalledWith(45);
    expect(fast.onProgress).toHaveBeenLastCalledWith(45);
  });

  it('R9.2: reports progress only when the visible count changes', () => {
    const { onProgress } = start();
    frameAt(0);
    frameAt(5);
    frameAt(10);
    expect(onProgress).not.toHaveBeenCalled();
    frameAt(30);
    frameAt(35);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });

  it('R9.5: finishes exactly once, at the full length', () => {
    const { onProgress, onDone } = start(9);
    frameAt(0);
    frameAt(10_000);
    frameAt(20_000);

    expect(onProgress).toHaveBeenLastCalledWith(9);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(queue).toHaveLength(0);
  });

  it('R9.8: cancel stops all further callbacks', () => {
    const { onProgress, onDone, cancel } = start();
    frameAt(0);
    const pending = queue;
    cancel();
    pending.forEach(callback => callback(10_000));

    expect(onProgress).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
