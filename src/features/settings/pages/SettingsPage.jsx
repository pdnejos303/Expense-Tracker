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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { auth, firestore } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';

const currencies = ['THB', 'USD', 'EUR', 'JPY'];
const themeColors = [
  { name: 'สีแดง', color: '#f44336' },
  { name: 'สีชมพู', color: '#e91e63' },
  { name: 'สีม่วง', color: '#9c27b0' },
  { name: 'สีม่วงคราม', color: '#673ab7' },
  { name: 'สีน้ำเงิน', color: '#3f51b5' },
  { name: 'สีฟ้า', color: '#2196f3' },
  { name: 'สีเขียว', color: '#4caf50' },
  { name: 'สีเหลือง', color: '#ffeb3b' },
  { name: 'สีส้ม', color: '#ff9800' },
  { name: 'สีน้ำตาล', color: '#795548' },
];

function SettingsPage({ setThemeColor }) {
  const [currency, setCurrency] = useState('THB');
  const [budgetAlerts, setBudgetAlerts] = useState(false);
  const [paymentDueAlerts, setPaymentDueAlerts] = useState(false);
  const [themeColorState, setThemeColorState] = useState('#4caf50');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser; if (!user) return;
      const doc = await firestore.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data();
        setCurrency(data.currency || 'THB');
        setBudgetAlerts(data.budgetAlerts || false);
        setPaymentDueAlerts(data.paymentDueAlerts || false);
        setThemeColorState(data.themeColor || '#4caf50');
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const user = auth.currentUser; if (!user) return;
    setSaving(true);
    try {
      await firestore.collection('users').doc(user.uid).update({ currency, budgetAlerts, paymentDueAlerts, themeColor: themeColorState });
      setThemeColor(themeColorState);
      localStorage.setItem('themeColor', themeColorState);
      showSnackbar('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
    } catch (err) { showSnackbar(getFirebaseErrorMessage(err), 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <PageContainer title="การตั้งค่า" maxWidth="sm">
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        {/* Currency */}
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontSize: '0.9375rem' }}>สกุลเงิน</Typography>
        <FormControl fullWidth size="small">
          <InputLabel>สกุลเงิน</InputLabel>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)} label="สกุลเงิน">
            {currencies.map((curr) => (<MenuItem key={curr} value={curr}>{curr}</MenuItem>))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        {/* Notifications */}
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontSize: '0.9375rem' }}>การแจ้งเตือน</Typography>
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

        {/* Theme Color */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>สีธีม</Typography>
        <Grid container spacing={1.5} role="radiogroup" aria-label="เลือกสีธีม">
          {themeColors.map((tc) => (
            <Grid item key={tc.color}>
              <Box
                role="radio"
                aria-checked={themeColorState === tc.color}
                aria-label={tc.name}
                tabIndex={0}
                onClick={() => setThemeColorState(tc.color)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setThemeColorState(tc.color); } }}
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: tc.color,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: themeColorState === tc.color ? '3px solid #1e293b' : '2px solid transparent',
                  boxShadow: themeColorState === tc.color ? `0 0 0 3px ${alpha(tc.color, 0.3)}` : 'none',
                  transition: 'all 0.15s',
                  '&:hover': { transform: 'scale(1.1)' },
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                }}
                title={tc.name}
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
          sx={{ mt: 4, py: 1.5 }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </Paper>

      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default SettingsPage;
