export type StreamTextOptions = {
  length: number;
  charsPerSecond: number;
  onProgress: (visibleLength: number) => void;
  onDone: () => void;
};

export function streamText({
  length,
  charsPerSecond,
  onProgress,
  onDone,
}: StreamTextOptions): () => void {
  let startedAt: number | undefined;
  let lastVisible = 0;
  let cancelled = false;
  let frame = 0;

  const tick = (now: number) => {
    if (cancelled) {
      return;
    }
    startedAt ??= now;
    const visibleLength = Math.min(
      length,
      Math.floor(((now - startedAt) * charsPerSecond) / 1000),
    );
    if (visibleLength !== lastVisible) {
      lastVisible = visibleLength;
      onProgress(visibleLength);
    }
    if (visibleLength >= length) {
      onDone();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
