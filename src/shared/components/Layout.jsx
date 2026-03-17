import React from 'react';
import Navbar from './Navbar';
import { Box } from '@mui/material';
import { SIDEBAR_WIDTH } from '@/app/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

function Layout({ children }) {
  const { currentUser } = useAuth();
  const hasSidebar = !!currentUser;

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
        ข้ามไปยังเนื้อหาหลัก
      </Box>
      <Navbar />
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          ml: hasSidebar ? { xs: 0, md: `${SIDEBAR_WIDTH}px` } : 0,
          pb: hasSidebar ? { xs: 10, md: 4 } : 4,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
