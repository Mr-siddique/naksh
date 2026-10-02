import { formatDateLabel } from '../formatDateLabel';

const NOW = new Date(2026, 9, 1, 15, 30); // Thu 1 Oct 2026, 15:30

describe('formatDateLabel', () => {
  it('R2.3: labels any time on the current day "Today"', () => {
    expect(formatDateLabel(new Date(2026, 9, 1, 0, 0), NOW)).toBe('Today');
    expect(formatDateLabel(new Date(2026, 9, 1, 23, 59), NOW)).toBe('Today');
  });

  it('R2.3: labels any time on the previous day "Yesterday"', () => {
    expect(formatDateLabel(new Date(2026, 8, 30, 0, 0), NOW)).toBe('Yesterday');
    expect(formatDateLabel(new Date(2026, 8, 30, 23, 59), NOW)).toBe(
      'Yesterday',
    );
  });

  it('R2.3: labels older days as "D Mon YYYY"', () => {
    expect(formatDateLabel(new Date(2026, 8, 28, 12), NOW)).toBe('28 Sep 2026');
    expect(formatDateLabel(new Date(2025, 11, 5, 12), NOW)).toBe('5 Dec 2025');
  });

  it('R2.3: handles "Yesterday" across a month and year boundary', () => {
    const newYear = new Date(2027, 0, 1, 9);
    expect(formatDateLabel(new Date(2026, 11, 31, 22), newYear)).toBe(
      'Yesterday',
    );
  });

  it('R2.3: handles "Yesterday" across a DST change', () => {
    const afterFallBack = new Date(2026, 10, 2, 0, 30); // day after US fall-back
    expect(formatDateLabel(new Date(2026, 10, 1, 0, 30), afterFallBack)).toBe(
      'Yesterday',
    );
  });
});
