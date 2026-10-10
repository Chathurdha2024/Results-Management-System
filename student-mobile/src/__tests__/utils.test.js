import { timeAgo, nonPassingGrades } from '../utils';

describe('utils.timeAgo (unit tests)', () => {
  const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
  const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
  const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

  it('M-U01: returns empty string for missing input', () => {
    expect(timeAgo('')).toBe('');
    expect(timeAgo(null)).toBe('');
    expect(timeAgo(undefined)).toBe('');
  });

  it('M-U02: returns "just now" for timestamps under 10 seconds old', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now');
  });

  it('M-U03: formats minutes', () => {
    expect(timeAgo(minutesAgo(1))).toBe('1 min ago');
    expect(timeAgo(minutesAgo(45))).toBe('45 mins ago');
  });

  it('M-U04: formats hours', () => {
    expect(timeAgo(hoursAgo(2))).toBe('2 hours ago');
  });

  it('M-U05: formats days', () => {
    expect(timeAgo(daysAgo(3))).toBe('3 days ago');
  });

  it('M-U06: nonPassingGrades contains E, F, AB and -', () => {
    expect(nonPassingGrades).toEqual(['E', 'F', 'AB', '-']);
  });
});
