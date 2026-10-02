export const FRESH_MS = 1000;

export function isFresh(createdAt: string, now: number = Date.now()): boolean {
  const age = now - Date.parse(createdAt);
  return age >= 0 && age < FRESH_MS;
}
