export const CHART_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#14b8a6',
  '#6366f1',
];

export const CHART_HEIGHT = 300;
export const CHART_HEIGHT_MOBILE = 220;

export const CHART_MARGIN = { top: 10, right: 20, left: 10, bottom: 5 };

export const INCOME_COLOR = '#22c55e';
export const EXPENSE_COLOR = '#ef4444';
export const INCOME_COLOR_DARK = '#16a34a';
export const EXPENSE_COLOR_DARK = '#dc2626';
export const GRID_LINE_COLOR = '#e2e8f0';

/** Recharts <Tooltip contentStyle> — pass theme.palette.mode === 'dark'. */
export function getTooltipStyle(isDark) {
  return {
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: '12px',
    boxShadow: isDark ? '0 10px 25px -5px rgb(0 0 0 / 0.4)' : '0 10px 25px -5px rgb(0 0 0 / 0.1)',
    padding: '8px 12px',
    color: isDark ? '#f1f5f9' : undefined,
  };
}
