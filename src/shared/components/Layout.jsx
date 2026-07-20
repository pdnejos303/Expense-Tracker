import React from 'react';
import Navbar from './Navbar';
import TopHeader from './TopHeader';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { SIDEBAR_WIDTH } from '@/app/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

function Layout({ children }) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const hasSidebar = !!currentUser;
  const showTopHeader = !!currentUser && !isMobile;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
            zIndex: 9999,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 1,
            borderRadius: 1,
            textDecoration: 'none',
            fontWeight: 'bold',
          },
        }}
      >
        {t('app.skipToContent')}
      </Box>
      <Navbar />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          ml: hasSidebar ? { xs: 0, md: `${SIDEBAR_WIDTH}px` } : 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {showTopHeader && <TopHeader />}
        <Box
          component="main"
          id="main-content"
          sx={{
            flexGrow: 1,
            pb: hasSidebar ? { xs: 10, md: 4 } : 4,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
