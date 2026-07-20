import { describe, it, expect } from 'vitest';
import { toDate, toSeconds, formatDateISO } from '../timestamp';

describe('toDate', () => {
  it('returns null for null/undefined', () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
  });

  it('returns the same Date object if given a Date', () => {
    const d = new Date('2024-06-15');
    expect(toDate(d)).toBe(d);
  });

  it('handles Firestore-like timestamp with toDate()', () => {
    const fakeTimestamp = { toDate: () => new Date('2024-01-01') };
    const result = toDate(fakeTimestamp);
    expect(result).toEqual(new Date('2024-01-01'));
  });

  it('handles Firestore-like timestamp with seconds field', () => {
    const seconds = Math.floor(new Date('2024-06-15').getTime() / 1000);
    const result = toDate({ seconds });
    expect(result.getFullYear()).toBe(2024);
  });

  it('handles date string', () => {
    const result = toDate('2024-03-10');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
  });

  it('handles epoch number', () => {
    const epoch = new Date('2024-06-15').getTime();
    const result = toDate(epoch);
    expect(result).toBeInstanceOf(Date);
  });

  it('returns null for unrecognized input', () => {
    expect(toDate({})).toBeNull();
    expect(toDate(true)).toBeNull();
  });
});

describe('toSeconds', () => {
  it('returns 0 for null/undefined', () => {
    expect(toSeconds(null)).toBe(0);
    expect(toSeconds(undefined)).toBe(0);
  });

  it('returns seconds from Firestore-like timestamp', () => {
    expect(toSeconds({ seconds: 1700000000 })).toBe(1700000000);
  });

  it('converts Date to seconds', () => {
    const d = new Date('2024-01-01T00:00:00Z');
    const result = toSeconds(d);
    expect(result).toBe(Math.floor(d.getTime() / 1000));
  });
});

describe('formatDateISO', () => {
  it('formats a date to YYYY-MM-DD', () => {
    const result = formatDateISO(new Date('2024-06-15T12:00:00Z'));
    expect(result).toBe('2024-06-15');
  });

  it('returns empty string for null', () => {
    expect(formatDateISO(null)).toBe('');
  });

  it('works with Firestore-like timestamp', () => {
    const seconds = Math.floor(new Date('2024-03-10T00:00:00Z').getTime() / 1000);
    const result = formatDateISO({ seconds });
    expect(result).toBe('2024-03-10');
  });
});
