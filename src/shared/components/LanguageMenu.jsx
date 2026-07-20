import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/lib/i18n';

/** Language switcher icon button with its dropdown. Used by Navbar, TopHeader and Landing. */
function LanguageMenu({ sx }) {
  const [anchor, setAnchor] = useState(null);
  const { t, i18n } = useTranslation();

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setAnchor(null);
  };

  return (
    <>
      <Tooltip title={t('settings.language')}>
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          size="small"
          aria-label={t('settings.language')}
          sx={{ color: 'text.secondary', ...sx }}
        >
          <LanguageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 150, borderRadius: '12px' } } }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.language === lang.code}
            onClick={() => selectLanguage(lang.code)}
            sx={{ gap: 1.5, fontSize: '0.875rem', py: 1 }}
          >
            <span>{lang.flag}</span>
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageMenu;
