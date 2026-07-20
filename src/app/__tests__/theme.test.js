import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, DEFAULT_THEME_ID, DEFAULT_MODE, createAppTheme, SIDEBAR_WIDTH } from '../theme';

describe('THEME_PRESETS', () => {
  it('has at least 3 presets', () => {
    const presets = Object.keys(THEME_PRESETS);
    expect(presets.length).toBeGreaterThanOrEqual(3);
  });

  it('each preset has required fields', () => {
    Object.values(THEME_PRESETS).forEach((preset) => {
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('nameLocal');
      expect(preset).toHaveProperty('primary');
      expect(preset).toHaveProperty('secondary');
      expect(preset).toHaveProperty('preview');
      expect(preset.preview).toHaveLength(3);
    });
  });

  it('nameLocal is an i18n key (not hardcoded Thai)', () => {
    Object.values(THEME_PRESETS).forEach((preset) => {
      expect(preset.nameLocal).toMatch(/^themeName\./);
    });
  });

  it('default theme exists in presets', () => {
    expect(THEME_PRESETS).toHaveProperty(DEFAULT_THEME_ID);
  });
});

describe('createAppTheme', () => {
  it('creates a light theme by default', () => {
    const theme = createAppTheme();
    expect(theme.palette.mode).toBe('light');
  });

  it('creates a dark theme when requested', () => {
    const theme = createAppTheme('emerald', 'dark');
    expect(theme.palette.mode).toBe('dark');
  });

  it('uses the preset primary color', () => {
    const theme = createAppTheme('ocean', 'light');
    expect(theme.palette.primary.main).toBe(THEME_PRESETS.ocean.primary);
  });

  it('falls back to default theme for unknown id', () => {
    const theme = createAppTheme('nonexistent', 'light');
    expect(theme.palette.primary.main).toBe(THEME_PRESETS[DEFAULT_THEME_ID].primary);
  });

  it('includes sidebar palette in light mode', () => {
    const theme = createAppTheme('emerald', 'light');
    expect(theme.palette.sidebar).toBeDefined();
    expect(theme.palette.sidebar.bg).toBeDefined();
  });

  it('includes sidebar palette in dark mode', () => {
    const theme = createAppTheme('emerald', 'dark');
    expect(theme.palette.sidebar).toBeDefined();
  });

  it('has income and expense palette colors', () => {
    const theme = createAppTheme();
    expect(theme.palette.income).toBeDefined();
    expect(theme.palette.expense).toBeDefined();
    expect(theme.palette.income.main).toBe('#22c55e');
    expect(theme.palette.expense.main).toBe('#ef4444');
  });
});

describe('constants', () => {
  it('SIDEBAR_WIDTH is a reasonable number', () => {
    expect(SIDEBAR_WIDTH).toBeGreaterThan(0);
    expect(SIDEBAR_WIDTH).toBeLessThan(400);
  });

  it('DEFAULT_MODE is light', () => {
    expect(DEFAULT_MODE).toBe('light');
  });
});
