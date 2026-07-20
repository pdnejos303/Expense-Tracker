import { describe, it, expect } from 'vitest';
import i18n, { LANGUAGES } from '../i18n';

describe('i18n configuration', () => {
  it('has Thai as fallback language', () => {
    expect(i18n.options.fallbackLng).toContain('th');
  });

  it('has all 3 languages loaded', () => {
    expect(i18n.hasResourceBundle('th', 'translation')).toBe(true);
    expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    expect(i18n.hasResourceBundle('ja', 'translation')).toBe(true);
  });

  it('translates common keys in Thai', () => {
    i18n.changeLanguage('th');
    expect(i18n.t('common.save')).toBe('บันทึก');
    expect(i18n.t('common.cancel')).toBe('ยกเลิก');
  });

  it('translates common keys in English', () => {
    i18n.changeLanguage('en');
    expect(i18n.t('common.save')).toBe('Save');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  it('translates common keys in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('common.save')).toBe('保存');
    expect(i18n.t('common.cancel')).toBe('キャンセル');
  });

  it('handles interpolation', () => {
    i18n.changeLanguage('en');
    const result = i18n.t('common.paginationOf', { from: 1, to: 10, count: 100 });
    expect(result).toBe('1-10 of 100');
  });

  it('returns key for missing translations', () => {
    const result = i18n.t('nonexistent.key');
    expect(result).toBe('nonexistent.key');
  });
});

describe('LANGUAGES constant', () => {
  it('has 3 languages', () => {
    expect(LANGUAGES).toHaveLength(3);
  });

  it('each language has code, label, and flag', () => {
    LANGUAGES.forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('label');
      expect(lang).toHaveProperty('flag');
    });
  });

  it('includes th, en, ja', () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toContain('th');
    expect(codes).toContain('en');
    expect(codes).toContain('ja');
  });
});
