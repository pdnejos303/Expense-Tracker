import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Grid,
  Paper,
  Box,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  alpha,
  CircularProgress,
  Collapse,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { firestore, auth } from '@/lib/firebase';
import { userQuery, mapDocs } from '@/lib/db';
import { toDate } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { getBudgetAdvice } from '@/lib/openai';
import { CHART_COLORS, getTooltipStyle } from '@/shared/constants/chart';
import { useChartHeight } from '@/shared/hooks/useChartHeight';
import { showToast, showConfirm } from '@/lib/swal';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import QuickAddCategoryDialog from '@/shared/components/QuickAddCategoryDialog';
import GradientStatCard from '@/shared/components/GradientStatCard';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/shared/utils/animations';

function BudgetManagementPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '', startDate: '', endDate: '' });
  const [categories, setCategories] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [alertBudgets, setAlertBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const chartHeight = useChartHeight();

  // AI Budget Advisor
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { calculateTotals(); checkBudgetAlerts(); }, [budgets, transactions]);

  const fetchAll = async () => {
    setLoading(true);
    try { await Promise.all([fetchBudgets(), fetchTransactions(), fetchCategories()]); }
    catch (err) { showToast(getFirebaseErrorMessage(err), 'error'); }
    finally { setLoading(false); }
  };

  const fetchBudgets = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await userQuery('budgets', user.uid).get();
    setBudgets(mapDocs(snapshot).map((b) => ({ ...b, startDate: toDate(b.startDate), endDate: toDate(b.endDate) })));
  };

  const fetchTransactions = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await userQuery('transactions', user.uid).get();
    setTransactions(snapshot.docs.map((doc) => doc.data()));
  };

  const fetchCategories = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await userQuery('categories', user.uid).get();
    setCategories(snapshot.docs.map((doc) => doc.data()));
  };

  const getSpent = (budget) => transactions.filter((t) => {
    const tDate = toDate(t.date);
    return tDate && t.category === budget.category && t.type === 'expense' && tDate >= budget.startDate && tDate <= budget.endDate;
  }).reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const calculateTotals = () => {
    const tb = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0); setTotalBudget(tb);
    const ts = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0); setTotalSpent(ts);
    setRemainingBudget(tb - ts);
  };

  const checkBudgetAlerts = () => { setAlertBudgets(budgets.filter((b) => (getSpent(b) / b.amount) * 100 >= 80)); };

  const handleSaveBudget = async () => {
    const user = auth.currentUser; if (!user) return;
    if (!newBudget.category || !newBudget.amount || !newBudget.startDate || !newBudget.endDate) { showToast(t('budget.fillAll'), 'error'); return; }
    try {
      if (selectedBudget) {
        await firestore.collection('budgets').doc(selectedBudget.id).update({ category: newBudget.category, amount: parseFloat(newBudget.amount), startDate: new Date(newBudget.startDate), endDate: new Date(newBudget.endDate) });
      } else {
        await firestore.collection('budgets').add({ userId: user.uid, category: newBudget.category, amount: parseFloat(newBudget.amount), startDate: new Date(newBudget.startDate), endDate: new Date(newBudget.endDate), createdAt: new Date() });
      }
      await fetchBudgets(); setOpenDialog(false); showToast(t('budget.saveSuccess'));
    } catch (err) { showToast(getFirebaseErrorMessage(err), 'error'); }
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setNewBudget({ category: budget.category, amount: budget.amount, startDate: budget.startDate.toISOString().split('T')[0], endDate: budget.endDate.toISOString().split('T')[0] });
    setOpenDialog(true);
  };

  const handleDeleteBudget = async (id) => {
    const result = await showConfirm({
      title: t('confirm.title'),
      text: t('budget.deleteConfirm'),
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
    });
    if (!result.isConfirmed) return;
    await firestore.collection('budgets').doc(id).delete();
    await fetchBudgets();
    showToast(t('budget.deleteSuccess'));
  };

  // AI Budget Advisor
  const handleGetAdvice = async () => {
    if (transactions.length === 0) {
      showToast(t('budget.notEnoughData'), 'warning');
      return;
    }
    setAiAdviceLoading(true);
    setShowAdvice(true);
    try {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      // Calculate avg monthly spending by category for last 3 months
      const categorySpending = {};
      transactions.forEach((t) => {
        if (t.type !== 'expense') return;
        const tDate = toDate(t.date);
        if (!tDate || tDate < threeMonthsAgo) return;
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

      const spendingByCategory = Object.entries(categorySpending).map(([category, total]) => ({
        category,
        avgMonthly: total / 3,
      }));

      const existingBudgets = budgets.map((b) => ({
        category: b.category,
        amount: b.amount,
      }));

      const advice = await getBudgetAdvice(spendingByCategory, existingBudgets);
      setAiAdvice(advice);
    } catch (err) {
      setAiAdvice(t('budget.aiError'));
    } finally {
      setAiAdviceLoading(false);
    }
  };

  const expenseByCategory = budgets.map((b) => ({ name: b.category, value: getSpent(b) }));
  const customTooltipStyle = getTooltipStyle(theme.palette.mode === 'dark');

  if (loading) return <LoadingScreen />;

  return (
    <PageContainer title={t('budget.title')}>
      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
        <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
          <GradientStatCard label={t('budget.totalBudget')} value={formatCurrency(totalBudget)} icon={<AccountBalanceWalletIcon />} gradient="linear-gradient(135deg, #3b82f6 0%, #3b82f6dd 100%)" />
        </Grid>
        <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
          <GradientStatCard label={t('budget.totalSpent')} value={formatCurrency(totalSpent)} icon={<TrendingDownIcon />} gradient="linear-gradient(135deg, #ef4444 0%, #ef4444dd 100%)" />
        </Grid>
        <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
          <GradientStatCard label={t('budget.remaining')} value={formatCurrency(remainingBudget)} icon={<SavingsIcon />} gradient={remainingBudget >= 0 ? 'linear-gradient(135deg, #22c55e 0%, #22c55edd 100%)' : 'linear-gradient(135deg, #f97316 0%, #f97316dd 100%)'} />
        </Grid>
      </Grid>

      {/* AI Budget Advisor */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid', borderColor: alpha('#8b5cf6', 0.2), bgcolor: alpha('#8b5cf6', 0.02) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showAdvice ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              {t('budget.aiAdvice')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={aiAdviceLoading ? <CircularProgress size={14} /> : <AutoFixHighIcon />}
            disabled={aiAdviceLoading}
            onClick={handleGetAdvice}
            sx={{
              borderColor: alpha('#8b5cf6', 0.4),
              color: '#7c3aed',
              fontSize: '0.8125rem',
              '&:hover': { borderColor: '#8b5cf6', bgcolor: alpha('#8b5cf6', 0.08) },
            }}
          >
            {aiAdviceLoading ? t('common.analyzing') : t('common.analyze')}
          </Button>
        </Box>
        <Collapse in={showAdvice}>
          {aiAdviceLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
              <CircularProgress size={18} sx={{ color: '#8b5cf6' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                {t('budget.aiAnalyzingSpending')}
              </Typography>
            </Box>
          ) : aiAdvice ? (
            <Box sx={{
              bgcolor: alpha('#8b5cf6', 0.04),
              borderRadius: 2,
              p: 2,
              '& p, & li': { fontSize: '0.8125rem', lineHeight: 1.7 },
              '& ul': { pl: 2, mt: 0.5, mb: 0 },
            }}>
              <Typography
                sx={{ fontSize: '0.8125rem', color: 'text.primary', whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{
                  __html: aiAdvice
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^- /gm, '&bull; ')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </Box>
          ) : null}
        </Collapse>
      </Paper>

      {/* Alerts */}
      {alertBudgets.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alertBudgets.map((budget, i) => (
            <Alert severity="warning" key={i} sx={{ mb: 1, bgcolor: alpha('#f59e0b', 0.08), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}>
              {t('budget.nearLimit', { category: budget.category })}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={2.5}>
        {/* Budget List */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>{t('budget.byCategory')}</Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => { setNewBudget({ category: '', amount: '', startDate: '', endDate: '' }); setSelectedBudget(null); setOpenDialog(true); }}>
              {t('budget.addBudget')}
            </Button>
          </Box>
          {budgets.length === 0 ? (
            <Paper sx={{ p: 6 }}><EmptyState message={t('budget.noBudget')} /></Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
              {budgets.map((budget, index) => {
                const spent = getSpent(budget);
                const percentage = (spent / budget.amount) * 100;
                const isOver = percentage >= 100;
                const isWarning = percentage >= 80;
                return (
                  <Paper key={index} sx={{ p: 2.5 }} component={motion.div} variants={staggerItem}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{budget.category}</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditBudget(budget)} sx={{ color: '#3b82f6' }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteBudget(budget.id)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.min(percentage, 100)} sx={{ mb: 1, '& .MuiLinearProgress-bar': { borderRadius: 8, backgroundColor: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e' } }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e' }}>
                        {percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>{t('budget.spendingRatio')}</Typography>
            {expenseByCategory.some((e) => e.value > 0) ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                    {expenseByCategory.map((_, i) => (<Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={customTooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message={t('budget.noSpendingData')} py={8} />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBudget ? t('budget.editBudget') : t('budget.addBudget')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('common.category')}</InputLabel>
              <Select value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })} label={t('common.category')}>
                {categories.filter((c) => c.type === 'expense').map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
              </Select>
            </FormControl>
            <IconButton
              onClick={() => setQuickAddOpen(true)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, alignSelf: 'stretch', width: 56 }}
              aria-label={t('category.addNew')}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <TextField label={t('budget.budgetAmount')} type="number" fullWidth required sx={{ mt: 2 }} value={newBudget.amount} onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })} />
          <TextField label={t('budget.startDate')} type="date" fullWidth required sx={{ mt: 2, '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} InputLabelProps={{ shrink: true }} value={newBudget.startDate} onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })} />
          <TextField label={t('budget.endDate')} type="date" fullWidth required sx={{ mt: 2, '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} InputLabelProps={{ shrink: true }} value={newBudget.endDate} onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveBudget} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <QuickAddCategoryDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultType="expense"
        onCreated={async (name) => {
          await fetchCategories();
          setNewBudget((b) => ({ ...b, category: name }));
        }}
      />
    </PageContainer>
  );
}

export default BudgetManagementPage;
