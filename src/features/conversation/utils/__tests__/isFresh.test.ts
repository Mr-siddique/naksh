import { FRESH_MS, isFresh } from '../isFresh';

const NOW = new Date(2026, 9, 1, 15, 30).getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe('isFresh', () => {
  it('R10.8: is true for a message created just now', () => {
    expect(isFresh(ago(0), NOW)).toBe(true);
    expect(isFresh(ago(FRESH_MS - 1), NOW)).toBe(true);
  });

  it('R10.8: is false once the message is a second old', () => {
    expect(isFresh(ago(FRESH_MS), NOW)).toBe(false);
    expect(isFresh(ago(60 * 60 * 1000), NOW)).toBe(false);
  });

  it('R10.8: is false for a createdAt in the future (clock skew)', () => {
    expect(isFresh(ago(-5000), NOW)).toBe(false);
  });
});
