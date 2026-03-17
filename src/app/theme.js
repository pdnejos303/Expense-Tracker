import { createTheme, alpha } from '@mui/material/styles';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };

// ─── Theme Presets ───────────────────────────────────────────
export const THEME_PRESETS = {
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    nameLocal: 'เอเมอรัลด์',
    icon: '🌿',
    primary: '#10b981',
    secondary: '#f59e0b',
    accent: '#06b6d4',
    preview: ['#10b981', '#059669', '#047857'],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    nameLocal: 'โอเชี่ยน',
    icon: '🌊',
    primary: '#3b82f6',
    secondary: '#f43f5e',
    accent: '#8b5cf6',
    preview: ['#3b82f6', '#2563eb', '#1d4ed8'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    nameLocal: 'ซันเซ็ท',
    icon: '🌅',
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#eab308',
    preview: ['#f97316', '#ea580c', '#c2410c'],
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    nameLocal: 'ลาเวนเดอร์',
    icon: '💜',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#06b6d4',
    preview: ['#8b5cf6', '#7c3aed', '#6d28d9'],
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold',
    nameLocal: 'โรสโกลด์',
    icon: '🌸',
    primary: '#f43f5e',
    secondary: '#f97316',
    accent: '#a855f7',
    preview: ['#f43f5e', '#e11d48', '#be123c'],
  },
};

export const DEFAULT_THEME_ID = 'emerald';
export const DEFAULT_MODE = 'light';

// ─── Light palette factory ───────────────────────────────────
function lightPalette(preset) {
  return {
    mode: 'light',
    primary: { main: preset.primary },
    secondary: { main: preset.secondary },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
    income: { main: '#22c55e', light: '#86efac', dark: '#16a34a' },
    expense: { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
    sidebar: {
      bg: '#0f172a',
      text: '#94a3b8',
      activeText: '#ffffff',
      hoverBg: alpha('#ffffff', 0.05),
      activeBg: alpha(preset.primary, 0.15),
      divider: alpha('#ffffff', 0.08),
      userBg: alpha('#ffffff', 0.05),
    },
  };
}

// ─── Dark palette factory ────────────────────────────────────
function darkPalette(preset) {
  return {
    mode: 'dark',
    primary: { main: preset.primary },
    secondary: { main: preset.secondary },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
    income: { main: '#22c55e', light: '#86efac', dark: '#16a34a' },
    expense: { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
    background: {
      default: '#0c0f1a',
      paper: '#141829',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: alpha('#ffffff', 0.08),
    sidebar: {
      bg: '#080b14',
      text: '#64748b',
      activeText: '#f1f5f9',
      hoverBg: alpha('#ffffff', 0.04),
      activeBg: alpha(preset.primary, 0.12),
      divider: alpha('#ffffff', 0.06),
      userBg: alpha('#ffffff', 0.04),
    },
  };
}

// ─── Component overrides factory ─────────────────────────────
function getComponents(palette) {
  const isDark = palette.mode === 'dark';
  const borderColor = isDark ? alpha('#ffffff', 0.1) : '#e2e8f0';
  const hoverBg = isDark ? alpha('#ffffff', 0.04) : '#f8fafc';
  const tableHeadBg = isDark ? alpha('#ffffff', 0.03) : '#f8fafc';
  const progressBg = isDark ? alpha('#ffffff', 0.06) : '#f1f5f9';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          colorScheme: isDark ? 'dark' : 'light',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': {
            boxShadow: `0 4px 12px -2px ${alpha(palette.primary.main, 0.35)}`,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: tableHeadBg,
            fontWeight: 600,
            color: isDark ? '#94a3b8' : '#475569',
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `2px solid ${borderColor}`,
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.05) : '#f1f5f9'}`,
          padding: '10px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${hoverBg} !important`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: progressBg,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor,
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: isDark ? alpha('#ffffff', 0.25) : '#94a3b8',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': {
            borderColor,
            borderWidth: '1.5px',
          },
          '&:hover fieldset': {
            borderColor: isDark ? alpha('#ffffff', 0.25) : '#94a3b8',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: 'none',
          boxShadow: isDark
            ? '0 25px 60px -12px rgb(0 0 0 / 0.7)'
            : '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.25rem',
          padding: '24px 24px 8px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `2px solid ${borderColor}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: 'none' },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${borderColor}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#0f172a',
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '6px 12px',
        },
      },
    },
  };
}

// ─── Shadow sets ─────────────────────────────────────────────
const lightShadows = [
  'none',
  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  ...Array(19).fill('0 25px 50px -12px rgb(0 0 0 / 0.25)'),
];

const darkShadows = [
  'none',
  '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  ...Array(19).fill('0 25px 50px -12px rgb(0 0 0 / 0.6)'),
];

// ─── Main theme factory ──────────────────────────────────────
export function createAppTheme(themeId = DEFAULT_THEME_ID, mode = DEFAULT_MODE) {
  const preset = THEME_PRESETS[themeId] || THEME_PRESETS[DEFAULT_THEME_ID];
  const isDark = mode === 'dark';
  const palette = isDark ? darkPalette(preset) : lightPalette(preset);

  return createTheme({
    palette,
    typography: {
      fontFamily: '"Inter", "Sarabun", -apple-system, BlinkMacSystemFont, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 500, color: palette.text.secondary },
      body2: { color: palette.text.secondary },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    shadows: isDark ? darkShadows : lightShadows,
    components: getComponents(palette),
  });
}

export const SEMANTIC_COLORS = {
  income: '#22c55e',
  expense: '#ef4444',
  gridLine: '#e2e8f0',
};
