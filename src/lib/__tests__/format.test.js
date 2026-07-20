import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format';

describe('formatCurrency', () => {
  it('formats a positive number with ฿ prefix and 2 decimal places', () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain('฿');
    expect(result).toContain('1,234.50');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('฿0.00');
  });

  it('formats negative numbers', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500.00');
  });

  it('handles string input by converting to number', () => {
    const result = formatCurrency('9999');
    expect(result).toContain('9,999.00');
  });

  it('formats large numbers with commas', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1,000,000.00');
  });
});
