import { describe, it, expect } from 'vitest';
import { sanitizeText, validateImageFile, sanitizeFileName } from '../validation';

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<b>hello</b>')).toBe('hello');
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(123)).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeText('Hello World')).toBe('Hello World');
  });

  it('handles nested tags', () => {
    expect(sanitizeText('<div><p>text</p></div>')).toBe('text');
  });
});

describe('validateImageFile', () => {
  it('returns invalid for null file', () => {
    const result = validateImageFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('accepts valid JPEG file', () => {
    const file = { type: 'image/jpeg', size: 500 * 1024 };
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts valid PNG file', () => {
    const file = { type: 'image/png', size: 100 * 1024 };
    expect(validateImageFile(file).valid).toBe(true);
  });

  it('rejects invalid file type', () => {
    const file = { type: 'application/pdf', size: 100 * 1024 };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects file exceeding max size', () => {
    const file = { type: 'image/jpeg', size: 3 * 1024 * 1024 };
    const result = validateImageFile(file, 2);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('accepts file at exact max size', () => {
    const file = { type: 'image/png', size: 2 * 1024 * 1024 };
    expect(validateImageFile(file, 2).valid).toBe(true);
  });

  it('uses custom max size', () => {
    const file = { type: 'image/jpeg', size: 4 * 1024 * 1024 };
    expect(validateImageFile(file, 5).valid).toBe(true);
    expect(validateImageFile(file, 3).valid).toBe(false);
  });
});

describe('sanitizeFileName', () => {
  it('keeps alphanumeric and safe characters', () => {
    expect(sanitizeFileName('photo-1.jpg')).toBe('photo-1.jpg');
  });

  it('replaces spaces and special characters with underscore', () => {
    expect(sanitizeFileName('my file (1).png')).toBe('my_file__1_.png');
  });

  it('replaces Thai characters', () => {
    const result = sanitizeFileName('รูปภาพ.jpg');
    expect(result).toMatch(/^[a-zA-Z0-9._-]+$/);
    expect(result).toContain('.jpg');
  });

  it('handles path traversal by removing slashes', () => {
    const result = sanitizeFileName('../../../etc/passwd');
    expect(result).not.toContain('/');
    // dots are allowed by the regex, but slashes are replaced
    expect(result).toMatch(/^[a-zA-Z0-9._-]+$/);
  });
});
