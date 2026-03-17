import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  alpha,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeSettings } from '@/app/ThemeContext';
import menuItems from '@/shared/config/menuItems';
import { SIDEBAR_WIDTH } from '@/app/theme';

function Navbar() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { currentUser } = useAuth();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeSettings();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const sb = theme.palette.sidebar || {};
  const SIDEBAR_BG = sb.bg || '#0f172a';
  const SIDEBAR_TEXT = sb.text || '#94a3b8';
  const SIDEBAR_ACTIVE_TEXT = sb.activeText || '#ffffff';

  const handleLogout = async () => {
    await auth.signOut();
    setMobileDrawerOpen(false);
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  if (!currentUser) return null;

  const bottomNavItems = menuItems.slice(0, 5);
  const currentBottomIndex = bottomNavItems.findIndex((item) => item.path === location.pathname);

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SIDEBAR_BG,
        color: SIDEBAR_TEXT,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => handleNavigate('/')}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: SIDEBAR_ACTIVE_TEXT,
              fontWeight: 700,
              fontSize: '1rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            Expense Tracker
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: SIDEBAR_TEXT, lineHeight: 1 }}>
            จัดการการเงิน
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: sb.divider || alpha('#fff', 0.08), mx: 2 }} />

      {/* Menu items */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                px: 2,
                py: 1,
                color: isActive ? SIDEBAR_ACTIVE_TEXT : SIDEBAR_TEXT,
                bgcolor: isActive ? (sb.activeBg || alpha(theme.palette.primary.main, 0.15)) : 'transparent',
                '&:hover': {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.2)
                    : (sb.hoverBg || alpha('#fff', 0.05)),
                },
                transition: 'all 0.15s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? theme.palette.primary.main : SIDEBAR_TEXT,
                  minWidth: 40,
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.main,
                    position: 'absolute',
                    right: 8,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: sb.divider || alpha('#fff', 0.08), mx: 2 }} />

      {/* Dark mode toggle */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box
          onClick={toggleMode}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: '10px',
            cursor: 'pointer',
            color: SIDEBAR_TEXT,
            '&:hover': { bgcolor: sb.hoverBg || alpha('#fff', 0.05) },
            transition: 'all 0.15s ease',
          }}
        >
          {mode === 'dark' ? (
            <LightModeIcon sx={{ fontSize: 20 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 20 }} />
          )}
          <Typography sx={{ fontSize: '0.875rem' }}>
            {mode === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: sb.divider || alpha('#fff', 0.08), mx: 2 }} />

      {/* User section */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: sb.userBg || alpha('#fff', 0.05),
            cursor: 'pointer',
            '&:hover': { bgcolor: sb.hoverBg || alpha('#fff', 0.08) },
          }}
          onClick={() => handleNavigate('/profile')}
        >
          <Avatar
            src={currentUser.photoURL}
            alt={currentUser.displayName}
            sx={{
              width: 36,
              height: 36,
              border: `2px solid ${alpha(SIDEBAR_ACTIVE_TEXT, 0.2)}`,
              fontSize: '0.875rem',
            }}
          >
            {(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: SIDEBAR_ACTIVE_TEXT,
                fontSize: '0.8125rem',
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser.displayName || currentUser.email}
            </Typography>
            <Typography sx={{ color: SIDEBAR_TEXT, fontSize: '0.7rem', lineHeight: 1.2 }}>
              ดูโปรไฟล์
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            sx={{
              color: SIDEBAR_TEXT,
              '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) },
            }}
            aria-label="ออกจากระบบ"
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    const isDark = mode === 'dark';
    return (
      <>
        {/* Mobile top bar */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <IconButton
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="เปิดเมนู"
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Expense Tracker
            </Typography>
          </Box>
          <Tooltip title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}>
            <IconButton onClick={toggleMode} size="small" sx={{ color: 'text.secondary' }}>
              {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Spacer for fixed top bar */}
        <Box sx={{ height: 56 }} />

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: { border: 'none' },
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* Bottom navigation */}
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
          }}
        >
          <BottomNavigation
            value={currentBottomIndex >= 0 ? currentBottomIndex : false}
            onChange={(_, newValue) => {
              navigate(bottomNavItems[newValue].path);
            }}
            showLabels
            sx={{
              height: 64,
              bgcolor: 'background.paper',
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                py: 1,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.625rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  fontSize: '0.625rem',
                  fontWeight: 700,
                },
              },
            }}
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.text}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          width: SIDEBAR_WIDTH,
          border: 'none',
          bgcolor: SIDEBAR_BG,
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}

export default Navbar;
