import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  InputAdornment,
  CircularProgress,
  Collapse,
  Divider,
  alpha,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SavingsIcon from '@mui/icons-material/Savings';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getSpendingPlan } from '@/lib/openai';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import PageContainer from '@/shared/components/PageContainer';

function PlannerPage() {
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState('');
  const [goals, setGoals] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const dailyBudget = budget && days && parseFloat(days) > 0
    ? (parseFloat(budget) / parseFloat(days)).toFixed(0)
    : null;

  const handleSubmit = async () => {
    if (!budget || parseFloat(budget) <= 0) {
      showSnackbar('กรุณากรอกจำนวนเงิน', 'error');
      return;
    }
    if (!days || parseFloat(days) <= 0) {
      showSnackbar('กรุณากรอกจำนวนวัน', 'error');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const plan = await getSpendingPlan({
        budget: parseFloat(budget),
        days: parseFloat(days),
        fixedExpenses: fixedExpenses.trim() || null,
        goals: goals.trim() || null,
        lifestyle: lifestyle.trim() || null,
      });
      setResult(plan);
    } catch (err) {
      showSnackbar(err.message || 'ไม่สามารถสร้างแผนได้ กรุณาลองใหม่', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBudget('');
    setDays('');
    setFixedExpenses('');
    setGoals('');
    setLifestyle('');
    setResult('');
  };

  return (
    <PageContainer title="AI วางแผนการใช้เงิน" maxWidth="md">
      {/* Input Form */}
      <Paper sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px',
            bgcolor: alpha('#8b5cf6', 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SmartToyIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
              วางแผนการใช้เงิน
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              กรอกข้อมูลเพื่อให้ AI ช่วยวางแผนบริหารเงินของคุณ
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="งบประมาณที่มี"
              type="number"
              fullWidth
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWalletIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
              }}
              inputProps={{ min: 0, step: '100' }}
              placeholder="เช่น 15000"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="จำนวนวันที่ต้องบริหาร"
              type="number"
              fullWidth
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">วัน</InputAdornment>,
              }}
              inputProps={{ min: 1, step: '1' }}
              placeholder="เช่น 15"
            />
          </Grid>

          {/* Daily budget preview */}
          {dailyBudget && (
            <Grid item xs={12}>
              <Box sx={{
                p: 2, borderRadius: 2,
                bgcolor: alpha('#22c55e', 0.06),
                border: '1px solid',
                borderColor: alpha('#22c55e', 0.15),
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <SavingsIcon sx={{ color: '#22c55e', fontSize: 22 }} />
                <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
                  งบเฉลี่ยต่อวัน: <strong>{parseFloat(dailyBudget).toLocaleString('th-TH')} บาท</strong>
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              label="ค่าใช้จ่ายคงที่ที่ต้องจ่าย (ถ้ามี)"
              multiline
              rows={2}
              fullWidth
              value={fixedExpenses}
              onChange={(e) => setFixedExpenses(e.target.value)}
              placeholder="เช่น ค่าเช่า 5000, ค่าเน็ต 600, ค่าโทรศัพท์ 300"
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="เป้าหมายหรือสิ่งที่อยากทำในช่วงนี้ (ถ้ามี)"
              multiline
              rows={2}
              fullWidth
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="เช่น อยากเก็บเงิน 2000, ต้องซื้อของขวัญ, อยากกินข้าวนอกบ้าน 2 ครั้ง"
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="ไลฟ์สไตล์/บริบทเพิ่มเติม (ถ้ามี)"
              multiline
              rows={2}
              fullWidth
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
              placeholder="เช่น ทำงานออฟฟิศ กินข้าวนอกบ้านบ่อย, อยู่คอนโด ทำอาหารเองได้"
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading || !budget || !days}
                startIcon={loading ? <CircularProgress size={18} /> : <AutoFixHighIcon />}
                sx={{
                  px: 4,
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
                  '&.Mui-disabled': { background: 'action.disabledBackground' },
                }}
              >
                {loading ? 'AI กำลังวางแผน...' : 'วางแผนการใช้เงิน'}
              </Button>
              {(budget || days || fixedExpenses || goals || lifestyle || result) && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleReset}
                  startIcon={<RestartAltIcon />}
                  sx={{ color: 'text.secondary', borderColor: 'divider' }}
                >
                  ล้างข้อมูล
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      <Collapse in={loading}>
        <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#8b5cf6', mb: 2 }} />
          <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>
            AI กำลังวิเคราะห์และวางแผนการใช้เงินให้คุณ...
          </Typography>
        </Paper>
      </Collapse>

      {/* Result */}
      <Collapse in={!!result && !loading}>
        {result && (
          <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: alpha('#8b5cf6', 0.2) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                bgcolor: alpha('#8b5cf6', 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AutoFixHighIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                แผนการใช้เงินของคุณ
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{
              '& p, & li': { fontSize: '0.875rem', lineHeight: 1.8 },
              '& ul, & ol': { pl: 2.5, mt: 0.5, mb: 1 },
              '& strong': { color: 'text.primary' },
              '& br': { display: 'block', content: '""', mt: 0.5 },
            }}>
              <Typography
                component="div"
                sx={{ fontSize: '0.875rem', color: 'text.primary', whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{
                  __html: result
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.*$)/gm, '<h4 style="margin:16px 0 8px;font-size:1rem">$1</h4>')
                    .replace(/^## (.*$)/gm, '<h3 style="margin:20px 0 10px;font-size:1.0625rem">$1</h3>')
                    .replace(/^- /gm, '&bull; ')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </Box>
          </Paper>
        )}
      </Collapse>

      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default PlannerPage;
