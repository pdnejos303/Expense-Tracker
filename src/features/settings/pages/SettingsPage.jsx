import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Grid,
  Divider,
  alpha,
  Switch,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { auth, firestore } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useThemeSettings } from '@/app/ThemeContext';
import { THEME_PRESETS } from '@/app/theme';

const currencies = ['THB', 'USD', 'EUR', 'JPY'];

function ThemePresetCard({ preset, isSelected, onClick, mode }) {
  const isDark = mode === 'dark';

  return (
    <Box
      role="radio"
      aria-checked={isSelected}
      aria-label={preset.nameLocal}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      }}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '2px solid',
        borderColor: isSelected ? preset.primary : 'divider',
        boxShadow: isSelected ? `0 0 0 3px ${alpha(preset.primary, 0.25)}` : 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isSelected
            ? `0 8px 25px -5px ${alpha(preset.primary, 0.4)}`
            : '0 4px 15px -3px rgb(0 0 0 / 0.1)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: preset.primary,
          outlineOffset: 2,
        },
      }}
    >
      {/* Gradient header */}
      <Box
        sx={{
          height: { xs: 48, md: 56 },
          background: `linear-gradient(135deg, ${preset.preview[0]} 0%, ${preset.preview[1]} 50%, ${preset.preview[2]} 100%)`,
          position: 'relative',
        }}
      >
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 22, color: preset.primary }} />
          </Box>
        )}
      </Box>

      {/* Mini preview */}
      <Box sx={{ p: 1.25, bgcolor: isDark ? '#141829' : '#f8fafc' }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Box sx={{
            width: 24,
            borderRadius: '4px',
            bgcolor: isDark ? '#080b14' : '#0f172a',
            p: 0.4,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
          }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{ height: 3, borderRadius: 0.5, bgcolor: i === 0 ? preset.primary : alpha('#fff', 0.15) }} />
            ))}
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
            <Box sx={{ display: 'flex', gap: 0.4 }}>
              <Box sx={{ flex: 1, height: 10, borderRadius: '3px', bgcolor: alpha(preset.primary, 0.15) }} />
              <Box sx={{ flex: 1, height: 10, borderRadius: '3px', bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06) }} />
            </Box>
            <Box sx={{ height: 16, borderRadius: '3px', bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04) }} />
          </Box>
        </Box>
      </Box>

      {/* Label */}
      <Box
        sx={{
          px: 1.25,
          py: 0.75,
          bgcolor: isDark ? '#0c0f1a' : '#ffffff',
          borderTop: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
          textAlign: 'center',
        }}
      >
        <Typography sx={{
          fontSize: '0.75rem',
          fontWeight: isSelected ? 700 : 500,
          color: isSelected ? preset.primary : (isDark ? '#94a3b8' : '#475569'),
        }}>
          {preset.nameLocal}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" sx={{ mb: 1.5, fontSize: '0.9375rem' }}>
      {children}
    </Typography>
  );
}

function SettingsPage() {
  const [currency, setCurrency] = useState('THB');
  const [budgetAlerts, setBudgetAlerts] = useState(false);
  const [paymentDueAlerts, setPaymentDueAlerts] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { themeId, setThemeId, mode, toggleMode } = useThemeSettings();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser; if (!user) return;
      const doc = await firestore.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data();
        setCurrency(data.currency || 'THB');
        setBudgetAlerts(data.budgetAlerts || false);
        setPaymentDueAlerts(data.paymentDueAlerts || false);
        if (data.themeId) setThemeId(data.themeId);
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const user = auth.currentUser; if (!user) return;
    setSaving(true);
    try {
      await firestore.collection('users').doc(user.uid).update({
        currency,
        budgetAlerts,
        paymentDueAlerts,
        themeId,
        themeMode: mode,
      });
      showSnackbar('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
    } catch (err) { showSnackbar(getFirebaseErrorMessage(err), 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  // ─── General Settings Panel ─────────────────────────
  const generalPanel = (
    <Paper sx={{ p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      {/* Currency */}
      <SectionTitle>สกุลเงิน</SectionTitle>
      <FormControl fullWidth size="small">
        <InputLabel>สกุลเงิน</InputLabel>
        <Select value={currency} onChange={(e) => setCurrency(e.target.value)} label="สกุลเงิน">
          {currencies.map((curr) => (<MenuItem key={curr} value={curr}>{curr}</MenuItem>))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      {/* Notifications */}
      <SectionTitle>การแจ้งเตือน</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <FormControlLabel
          control={<Checkbox checked={budgetAlerts} onChange={(e) => setBudgetAlerts(e.target.checked)} />}
          label={<Typography sx={{ fontSize: '0.875rem' }}>แจ้งเตือนเมื่อใกล้ถึงงบประมาณที่ตั้งไว้</Typography>}
        />
        <FormControlLabel
          control={<Checkbox checked={paymentDueAlerts} onChange={(e) => setPaymentDueAlerts(e.target.checked)} />}
          label={<Typography sx={{ fontSize: '0.875rem' }}>แจ้งเตือนวันครบกำหนดชำระหนี้หรือบิล</Typography>}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Dark Mode */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDark ? (
            <DarkModeIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          ) : (
            <LightModeIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
          )}
          <Box>
            <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem', lineHeight: 1.3 }}>
              โหมดมืด
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {isDark ? 'เปิดอยู่ — ถนอมสายตา' : 'ปิดอยู่ — โหมดสว่าง'}
            </Typography>
          </Box>
        </Box>
        <Switch checked={isDark} onChange={toggleMode} color="primary" />
      </Box>

      {/* Save button - only on mobile (single column) */}
      {!isDesktop && (
        <>
          <Divider sx={{ my: 3 }} />
          {/* Theme section inline on mobile */}
          <SectionTitle>ธีม</SectionTitle>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 2 }}>
            เลือกชุดสีที่ชอบ — ใช้ได้ทั้งโหมดสว่างและมืด
          </Typography>
          <Grid container spacing={1.5} role="radiogroup" aria-label="เลือกธีม">
            {Object.values(THEME_PRESETS).map((preset) => (
              <Grid item xs={4} key={preset.id}>
                <ThemePresetCard
                  preset={preset}
                  isSelected={themeId === preset.id}
                  onClick={() => setThemeId(preset.id)}
                  mode={mode}
                />
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={saving}
            fullWidth
            startIcon={<SaveIcon />}
            size="large"
            sx={{ mt: 3, py: 1.5 }}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </>
      )}
    </Paper>
  );

  // ─── Theme Panel (desktop only) ─────────────────────
  const themePanel = (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle>ธีม</SectionTitle>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 2.5 }}>
        เลือกชุดสีที่ชอบ — ใช้ได้ทั้งโหมดสว่างและมืด
      </Typography>

      <Grid container spacing={2} role="radiogroup" aria-label="เลือกธีม" sx={{ mb: 3 }}>
        {Object.values(THEME_PRESETS).map((preset) => (
          <Grid item xs={6} lg={4} key={preset.id}>
            <ThemePresetCard
              preset={preset}
              isSelected={themeId === preset.id}
              onClick={() => setThemeId(preset.id)}
              mode={mode}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ flex: 1 }} />

      <Button
        variant="contained"
        onClick={handleSaveSettings}
        disabled={saving}
        fullWidth
        startIcon={<SaveIcon />}
        size="large"
        sx={{ py: 1.5 }}
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </Button>
    </Paper>
  );

  return (
    <PageContainer title="การตั้งค่า" maxWidth="lg">
      {isDesktop ? (
        /* Desktop: 2-column layout */
        <Grid container spacing={3}>
          <Grid item md={5} lg={4}>
            {generalPanel}
          </Grid>
          <Grid item md={7} lg={8}>
            {themePanel}
          </Grid>
        </Grid>
      ) : (
        /* Mobile: single column */
        generalPanel
      )}

      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default SettingsPage;
