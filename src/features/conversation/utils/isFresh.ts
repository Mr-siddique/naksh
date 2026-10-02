export const FRESH_MS = 1000;

/**
 * True for a message created within the last second. Entering animations
 * use it so only newly sent or received messages animate, not ones that
 * mount from the initial load or by scrolling back into view (R10.8).
 * `now` is epoch ms because callers pass `Date.now()` during render.
 */
export function isFresh(createdAt: string, now: number = Date.now()): boolean {
  const age = now - Date.parse(createdAt);
  return age >= 0 && age < FRESH_MS;
}
