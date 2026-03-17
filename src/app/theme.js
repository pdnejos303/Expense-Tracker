import { createTheme } from '@mui/material/styles';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };

export function createAppTheme(primaryColor) {
  const primary = primaryColor || '#4caf50';

  return createTheme({
    palette: {
      primary: { main: primary },
      secondary: { main: '#ff5722' },
      success: { main: '#22c55e' },
      error: { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      info: { main: '#3b82f6' },
      income: { main: '#22c55e', light: '#86efac', dark: '#16a34a' },
      expense: { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
      background: {
        default: '#f1f5f9',
        paper: '#ffffff',
      },
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
      },
      divider: '#e2e8f0',
    },
    typography: {
      fontFamily: '"Inter", "Sarabun", -apple-system, BlinkMacSystemFont, sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      subtitle1: {
        fontWeight: 600,
      },
      subtitle2: {
        fontWeight: 500,
        color: '#64748b',
      },
      body2: {
        color: '#64748b',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      ...Array(19).fill('0 25px 50px -12px rgb(0 0 0 / 0.25)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#f1f5f9',
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
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: '1px solid #e2e8f0',
            borderRadius: 16,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: '#f8fafc',
              fontWeight: 600,
              color: '#475569',
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #e2e8f0',
              padding: '12px 16px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #f1f5f9',
            padding: '10px 16px',
            fontSize: '0.875rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#f8fafc !important',
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
            backgroundColor: '#f1f5f9',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              '& fieldset': {
                borderColor: '#e2e8f0',
                borderWidth: '1.5px',
              },
              '&:hover fieldset': {
                borderColor: '#94a3b8',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '& fieldset': {
              borderColor: '#e2e8f0',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: 'none',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
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
            border: '2px solid #e2e8f0',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            border: 'none',
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            borderTop: '1px solid #e2e8f0',
          },
        },
      },
    },
  });
}

export const SEMANTIC_COLORS = {
  income: '#22c55e',
  expense: '#ef4444',
  gridLine: '#e2e8f0',
};
