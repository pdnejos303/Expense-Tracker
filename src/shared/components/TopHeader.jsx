import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Popover,
  alpha,
  useTheme,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import PaletteIcon from '@mui/icons-material/Palette';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeSettings } from '@/app/ThemeContext';
import { THEME_PRESETS } from '@/app/theme';
import LanguageMenu from '@/shared/components/LanguageMenu';
import { showConfirm } from '@/lib/swal';

function TopHeader() {
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [themeAnchor, setThemeAnchor] = useState(null);
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, toggleMode, themeId, setThemeId } = useThemeSettings();
  const navigate = useNavigate();
  const isDark = mode === 'dark';

  if (!currentUser) return null;

  const handleLogout = async () => {
    setProfileAnchor(null);
    const result = await showConfirm({
      title: t('logoutConfirm.title'),
      text: t('logoutConfirm.message'),
      confirmButtonText: t('logoutConfirm.confirm'),
      cancelButtonText: t('common.cancel'),
    });
    if (!result.isConfirmed) return;
    await auth.signOut();
    navigate('/');
  };

  return (
    <Box
      sx={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: { md: 3, lg: 4 },
        gap: 0.5,
        bgcolor: 'background.default',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar - 1,
      }}
    >
      {/* Theme Color Picker */}
      <Tooltip title={t('settings.theme')}>
        <IconButton
          onClick={(e) => setThemeAnchor(e.currentTarget)}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <PaletteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Language Switcher */}
      <LanguageMenu />

      {/* Dark/Light Mode Toggle */}
      <Tooltip title={isDark ? t('nav.lightMode') : t('nav.darkMode')}>
        <IconButton
          onClick={toggleMode}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Divider */}
      <Box
        sx={{
          width: 1,
          height: 24,
          bgcolor: 'divider',
          mx: 1,
        }}
      />

      {/* Profile Avatar */}
      <Box
        onClick={(e) => setProfileAnchor(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          py: 0.5,
          px: 1,
          borderRadius: '10px',
          '&:hover': { bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04) },
          transition: 'background-color 0.15s ease',
        }}
      >
        <Avatar
          src={currentUser.photoURL}
          alt={currentUser.displayName}
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.8125rem',
            bgcolor: 'primary.main',
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          {(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ display: { md: 'none', lg: 'block' } }}>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3,
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentUser.displayName || currentUser.email}
          </Typography>
        </Box>
      </Box>

      {/* ── Theme Color Popover ── */}
      <Popover
        anchorEl={themeAnchor}
        open={Boolean(themeAnchor)}
        onClose={() => setThemeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { p: 2, borderRadius: '14px', minWidth: 220 },
          },
        }}
      >
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
          {t('settings.theme')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.values(THEME_PRESETS).map((preset) => {
            const isSelected = themeId === preset.id;
            return (
              <Tooltip key={preset.id} title={t(preset.nameLocal)}>
                <Box
                  onClick={() => {
                    setThemeId(preset.id);
                    setThemeAnchor(null);
                  }}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${preset.preview[0]}, ${preset.preview[2]})`,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: isSelected ? preset.primary : 'transparent',
                    boxShadow: isSelected ? `0 0 0 2px ${alpha(preset.primary, 0.3)}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {isSelected && (
                    <CheckIcon sx={{ fontSize: 16, color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Popover>

      {/* ── Profile Menu ── */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: '12px' } } }}
      >
        <MenuItem
          onClick={() => { setProfileAnchor(null); navigate('/profile'); }}
          sx={{ gap: 1.5, fontSize: '0.875rem', py: 1 }}
        >
          <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          {t('nav.profile')}
        </MenuItem>
        <MenuItem
          onClick={() => { setProfileAnchor(null); navigate('/settings'); }}
          sx={{ gap: 1.5, fontSize: '0.875rem', py: 1 }}
        >
          <SettingsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          {t('nav.settings')}
        </MenuItem>
        <Box sx={{ mx: 1.5, my: 0.5, borderTop: '1px solid', borderColor: 'divider' }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ gap: 1.5, fontSize: '0.875rem', py: 1, color: 'error.main' }}
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
          {t('nav.logout')}
        </MenuItem>
      </Menu>

    </Box>
  );
}

export default TopHeader;
