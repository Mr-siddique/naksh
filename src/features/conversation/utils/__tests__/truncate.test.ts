import { truncate } from '../truncate';

describe('truncate', () => {
  it('NFR4: keeps short text unchanged', () => {
    expect(truncate('Saturn', 10)).toBe('Saturn');
    expect(truncate('1234567890', 10)).toBe('1234567890');
  });

  it('NFR4: shortens long text with an ellipsis', () => {
    expect(truncate('Saturn is strong this year', 10)).toBe('Saturn is…');
  });
});
