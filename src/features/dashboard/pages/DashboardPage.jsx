import React, { useEffect, useState, useMemo } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Divider,
  Button,
  alpha,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Collapse,
  TextField,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Warning,
  CalendarToday,
  Savings,
  Schedule,
  SmartToy,
  AutoFixHigh,
  ErrorOutline,
} from '@mui/icons-material';
import { firestore, auth } from '@/lib/firebase';
import { toDate, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { getFinancialInsights, detectAnomalies } from '@/lib/openai';
import { CHART_COLORS, CHART_MARGIN, INCOME_COLOR, EXPENSE_COLOR, GRID_LINE_COLOR } from '@/shared/constants/chart';
import { useChartHeight } from '@/shared/hooks/useChartHeight';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';

/* ─── Time range helpers ─── */
function getTimeRange(rangeKey, customStart, customEnd) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (rangeKey) {
    case 'thisMonth':
      return { start: new Date(year, month, 1), end: now, label: 'เดือนนี้' };
    case 'lastMonth':
      return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0, 23, 59, 59), label: 'เดือนก่อน' };
    case '3months':
      return { start: new Date(year, month - 2, 1), end: now, label: '3 เดือน' };
    case '6months':
      return { start: new Date(year, month - 5, 1), end: now, label: '6 เดือน' };
    case 'thisYear':
      return { start: new Date(year, 0, 1), end: now, label: 'ปีนี้' };
    case 'custom':
      return {
        start: customStart ? new Date(customStart) : new Date(year, month, 1),
        end: customEnd ? new Date(customEnd + 'T23:59:59') : now,
        label: 'กำหนดเอง',
      };
    default:
      return { start: new Date(year, month, 1), end: now, label: 'เดือนนี้' };
  }
}

function getPreviousRange(start, end) {
  const duration = end - start;
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

/* ─── Components ─── */
function SummaryCard({ title, amount, icon, gradient, change }) {
  return (
    <Paper sx={{ p: 0, overflow: 'hidden', position: 'relative', border: 'none' }}>
      <Box sx={{ background: gradient, p: { xs: 2.5, sm: 3 }, color: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: alpha('#fff', 0.85), mb: 0.5 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {typeof amount === 'string' ? amount : formatCurrency(amount)}
            </Typography>
            {change !== undefined && change !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75, gap: 0.5 }}>
                {change > 0 ? (
                  <ArrowUpward sx={{ fontSize: 14, color: alpha('#fff', 0.9) }} />
                ) : change < 0 ? (
                  <ArrowDownward sx={{ fontSize: 14, color: alpha('#fff', 0.9) }} />
                ) : null}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: alpha('#fff', 0.9) }}>
                  {change === 0
                    ? 'ไม่เปลี่ยนแปลง'
                    : `${Math.abs(change).toFixed(1)}% จากช่วงก่อนหน้า`}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha('#fff', 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function ChartCard({ title, children }) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>{title}</Typography>
      {children}
    </Paper>
  );
}

function SpendingHeatmap({ dailySpending, year, month, isDark }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const maxSpend = Math.max(...Object.values(dailySpending), 1);

  const getColor = (amt) => {
    if (!amt || amt === 0) return isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
    const intensity = Math.min(amt / maxSpend, 1);
    if (intensity < 0.25) return isDark ? '#7f1d1d' : '#fecaca';
    if (intensity < 0.5) return isDark ? '#991b1b' : '#f87171';
    if (intensity < 0.75) return '#ef4444';
    return '#b91c1c';
  };

  const dayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(<Box key={`empty-${i}`} sx={{ width: '100%', aspectRatio: '1', borderRadius: '4px' }} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const amt = dailySpending[day] || 0;
    cells.push(
      <Tooltip key={day} title={amt > 0 ? `${day} ${monthNames[month]}: ${formatCurrency(amt)}` : `${day} ${monthNames[month]}: ไม่มีรายจ่าย`} arrow placement="top">
        <Box sx={{
          width: '100%', aspectRatio: '1', borderRadius: '4px', bgcolor: getColor(amt),
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default',
          transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.15)' },
        }}>
          <Typography sx={{ fontSize: { xs: '0.625rem', sm: '0.6875rem' }, color: amt > 0 && amt / maxSpend >= 0.5 ? '#fff' : (isDark ? '#94a3b8' : '#475569'), fontWeight: 500 }}>
            {day}
          </Typography>
        </Box>
      </Tooltip>,
    );
  }

  return (
    <Box>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
        {monthNames[month]} {year + 543}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {dayLabels.map((label) => (
          <Typography key={label} sx={{ fontSize: '0.625rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{label}</Typography>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>{cells}</Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, justifyContent: 'flex-end' }}>
        <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8' }}>น้อย</Typography>
        {[isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', isDark ? '#7f1d1d' : '#fecaca', isDark ? '#991b1b' : '#f87171', '#ef4444', '#b91c1c'].map((color, i) => (
          <Box key={i} sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: color }} />
        ))}
        <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8' }}>มาก</Typography>
      </Box>
    </Box>
  );
}

/* ─── AI Insights Card ─── */
function AIInsightsCard({ data }) {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleGetInsights = async () => {
    setLoading(true);
    setShow(true);
    try {
      const result = await getFinancialInsights(data);
      setInsights(result);
    } catch {
      setInsights('ไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, border: '1px solid', borderColor: alpha('#8b5cf6', 0.2), bgcolor: alpha('#8b5cf6', 0.02) }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: show ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy sx={{ color: '#8b5cf6', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>AI สรุปการเงิน</Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <AutoFixHigh />}
          disabled={loading}
          onClick={handleGetInsights}
          sx={{
            borderColor: alpha('#8b5cf6', 0.4), color: '#7c3aed', fontSize: '0.8125rem',
            '&:hover': { borderColor: '#8b5cf6', bgcolor: alpha('#8b5cf6', 0.08) },
          }}
        >
          {loading ? 'กำลังวิเคราะห์...' : show ? 'วิเคราะห์ใหม่' : 'วิเคราะห์'}
        </Button>
      </Box>
      <Collapse in={show}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={18} sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>AI กำลังวิเคราะห์ข้อมูลการเงินของคุณ...</Typography>
          </Box>
        ) : insights ? (
          <Box sx={{ bgcolor: alpha('#8b5cf6', 0.04), borderRadius: 2, p: 2 }}>
            <Typography
              sx={{ fontSize: '0.8125rem', color: 'text.primary', whiteSpace: 'pre-line', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{
                __html: insights
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^- /gm, '&bull; ')
                  .replace(/\n/g, '<br/>'),
              }}
            />
          </Box>
        ) : null}
      </Collapse>
    </Paper>
  );
}

/* ─── Anomaly Alert ─── */
function AnomalyAlert({ transactions, categoryAverages }) {
  const [anomaly, setAnomaly] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (transactions.length === 0 || categoryAverages.length === 0 || checked) return;
    setChecked(true);
    detectAnomalies(transactions, categoryAverages)
      .then((result) => setAnomaly(result))
      .catch(() => {});
  }, [transactions, categoryAverages, checked]);

  if (!anomaly) return null;

  return (
    <Alert
      severity="warning"
      icon={<ErrorOutline />}
      sx={{ mb: 2, bgcolor: alpha('#f59e0b', 0.08), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mb: 0.5 }}>AI ตรวจพบรายจ่ายผิดปกติ</Typography>
      <Typography
        sx={{ fontSize: '0.8125rem', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{
          __html: anomaly
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- /gm, '&bull; ')
            .replace(/\n/g, '<br/>'),
        }}
      />
    </Alert>
  );
}

/* ─── Main Dashboard ─── */
function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rangeKey, setRangeKey] = useState('thisMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const navigate = useNavigate();
  const chartHeight = useChartHeight();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const range = useMemo(() => getTimeRange(rangeKey, customStart, customEnd), [rangeKey, customStart, customEnd]);
  const prevRange = useMemo(() => getPreviousRange(range.start, range.end), [range]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setError(null);
    try {
      const [txSnap, budgetSnap] = await Promise.all([
        firestore.collection('transactions').where('userId', '==', user.uid).get(),
        firestore.collection('budgets').where('userId', '==', user.uid).get(),
      ]);
      setTransactions(txSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setBudgets(budgetSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ─── Computed data based on selected time range ─── */
  const computed = useMemo(() => {
    let rangeIncome = 0;
    let rangeExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;
    const categoryData = {};
    const monthlyDataTemp = {};
    const dailySpendingTemp = {};
    const expenseItems = [];

    transactions.forEach((tx) => {
      const date = toDate(tx.date);
      if (!date) return;

      if (date >= range.start && date <= range.end) {
        if (tx.type === 'income') {
          rangeIncome += tx.amount;
        } else if (tx.type === 'expense') {
          rangeExpense += tx.amount;
          categoryData[tx.category] = (categoryData[tx.category] || 0) + tx.amount;
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            dailySpendingTemp[date.getDate()] = (dailySpendingTemp[date.getDate()] || 0) + tx.amount;
          }
          expenseItems.push(tx);
        }
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!monthlyDataTemp[monthKey]) {
          monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
        }
        monthlyDataTemp[monthKey][tx.type === 'income' ? 'income' : 'expense'] += tx.amount;
      }

      if (date >= prevRange.start && date <= prevRange.end) {
        if (tx.type === 'income') prevIncome += tx.amount;
        else if (tx.type === 'expense') prevExpense += tx.amount;
      }
    });

    const balance = rangeIncome - rangeExpense;
    const daysInRange = Math.max(1, Math.ceil((Math.min(now, range.end) - range.start) / (1000 * 60 * 60 * 24)));
    const dailyAvg = rangeExpense / daysInRange;
    const savingsRate = rangeIncome > 0 ? ((rangeIncome - rangeExpense) / rangeIncome) * 100 : 0;

    const incomeChange = prevIncome === 0 ? (rangeIncome > 0 ? 100 : 0) : ((rangeIncome - prevIncome) / prevIncome) * 100;
    const expenseChange = prevExpense === 0 ? (rangeExpense > 0 ? 100 : 0) : ((rangeExpense - prevExpense) / prevExpense) * 100;

    const expenseData = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    expenseItems.sort((a, b) => b.amount - a.amount);
    const topExpenses = expenseItems.slice(0, 5);

    const monthlyData = Object.values(monthlyDataTemp).sort((a, b) => {
      const [am, ay] = a.month.split('/').map(Number);
      const [bm, by] = b.month.split('/').map(Number);
      return ay !== by ? ay - by : am - bm;
    });

    // Budget alerts
    const alerts = [];
    const projections = [];
    budgets.forEach((budget) => {
      const budgetStart = toDate(budget.startDate);
      const budgetEnd = toDate(budget.endDate);
      if (!budgetStart || !budgetEnd) return;
      const spent = transactions
        .filter((t) => {
          const tDate = toDate(t.date);
          return tDate && t.category === budget.category && t.type === 'expense' && tDate >= budgetStart && tDate <= budgetEnd;
        })
        .reduce((total, t) => total + t.amount, 0);
      const percentage = (spent / budget.amount) * 100;
      if (percentage >= 100) {
        alerts.push(`คุณใช้จ่ายเกินงบประมาณในหมวดหมู่ ${budget.category}`);
      } else if (percentage >= 80) {
        alerts.push(`คุณใช้จ่าย ${percentage.toFixed(0)}% ของงบประมาณในหมวดหมู่ ${budget.category}`);
      }
      const elapsed = Math.max(1, Math.ceil((now - budgetStart) / (1000 * 60 * 60 * 24)));
      const remaining = budget.amount - spent;
      if (spent > 0 && remaining > 0) {
        const dailyRate = spent / elapsed;
        const daysUntilDepleted = Math.ceil(remaining / dailyRate);
        const remainingBudgetDays = Math.max(0, Math.ceil((budgetEnd - now) / (1000 * 60 * 60 * 24)));
        if (daysUntilDepleted < remainingBudgetDays) {
          projections.push({ category: budget.category, daysLeft: daysUntilDepleted, dailyRate, spent, limit: budget.amount, percentage });
        }
      }
    });

    // Recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => (toDate(b.date) || 0) - (toDate(a.date) || 0))
      .slice(0, 5);

    // Anomaly detection data
    const categoryAvgs = {};
    const categoryCounts = {};
    transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      categoryAvgs[t.category] = (categoryAvgs[t.category] || 0) + t.amount;
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    const categoryAverages = Object.entries(categoryAvgs).map(([category, total]) => ({
      category, avg: total / categoryCounts[category],
    }));
    const recentExpenses = [...transactions]
      .filter((t) => t.type === 'expense')
      .sort((a, b) => (toDate(b.date) || 0) - (toDate(a.date) || 0))
      .slice(0, 10)
      .map((t) => ({ category: t.category, amount: t.amount, note: t.note || '' }));

    return {
      rangeIncome, rangeExpense, balance, dailyAvg, savingsRate,
      incomeChange, expenseChange,
      expenseData, monthlyData, topExpenses, dailySpending: dailySpendingTemp,
      alerts, projections, recentTransactions,
      categoryAverages, recentExpenses,
    };
  }, [transactions, budgets, range, prevRange, currentMonth, currentYear]);

  const aiData = useMemo(() => ({
    currentMonthIncome: computed.rangeIncome,
    currentMonthExpense: computed.rangeExpense,
    prevMonthIncome: 0,
    prevMonthExpense: 0,
    savingsRate: computed.savingsRate,
    dailyAvg: computed.dailyAvg,
    topCategories: computed.expenseData.slice(0, 5),
    budgetAlerts: computed.alerts,
  }), [computed]);

  const currencyTooltip = (value) => formatCurrency(value);
  const customTooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: '12px',
    boxShadow: isDark ? '0 10px 25px -5px rgb(0 0 0 / 0.4)' : '0 10px 25px -5px rgb(0 0 0 / 0.1)',
    padding: '8px 12px',
    color: isDark ? '#f1f5f9' : undefined,
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <PageContainer title="แดชบอร์ด">
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchData}>ลองใหม่</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="แดชบอร์ด">
      {/* ─── Time Range Selector ─── */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <CalendarToday sx={{ fontSize: 18, color: '#64748b' }} />
        <ToggleButtonGroup
          value={rangeKey}
          exclusive
          onChange={(_, val) => { if (val) setRangeKey(val); }}
          size="small"
          sx={{
            flexWrap: 'wrap',
            '& .MuiToggleButton-root': {
              px: { xs: 1.5, sm: 2 }, py: 0.75, fontSize: '0.8125rem', textTransform: 'none', fontWeight: 500,
              border: '1px solid', borderColor: 'divider',
              '&.Mui-selected': { bgcolor: alpha('#3b82f6', 0.1), color: '#2563eb', borderColor: alpha('#3b82f6', 0.3), fontWeight: 600 },
            },
          }}
        >
          <ToggleButton value="thisMonth">เดือนนี้</ToggleButton>
          <ToggleButton value="lastMonth">เดือนก่อน</ToggleButton>
          <ToggleButton value="3months">3 เดือน</ToggleButton>
          <ToggleButton value="6months">6 เดือน</ToggleButton>
          <ToggleButton value="thisYear">ปีนี้</ToggleButton>
          <ToggleButton value="custom">กำหนดเอง</ToggleButton>
        </ToggleButtonGroup>
        {rangeKey === 'custom' && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField type="date" size="small" value={customStart} onChange={(e) => setCustomStart(e.target.value)} InputLabelProps={{ shrink: true }} label="เริ่มต้น" sx={{ width: 160 }} />
            <Typography sx={{ color: '#94a3b8' }}>-</Typography>
            <TextField type="date" size="small" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} InputLabelProps={{ shrink: true }} label="สิ้นสุด" sx={{ width: 160 }} />
          </Box>
        )}
      </Paper>

      {/* ─── Anomaly Detection Alert ─── */}
      <AnomalyAlert transactions={computed.recentExpenses} categoryAverages={computed.categoryAverages} />

      {/* ─── Budget Alerts ─── */}
      {(computed.alerts.length > 0 || computed.projections.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {computed.alerts.map((alertMsg, index) => (
            <Alert severity="warning" key={`alert-${index}`} icon={<Warning />} sx={{ mb: 1, bgcolor: alpha('#f59e0b', 0.08), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}>
              {alertMsg}
            </Alert>
          ))}
          {computed.projections.map((proj, index) => (
            <Alert severity="info" key={`proj-${index}`} icon={<Schedule />} sx={{ mb: 1, bgcolor: alpha('#3b82f6', 0.08), border: '1px solid', borderColor: alpha('#3b82f6', 0.2) }}>
              งบ &quot;{proj.category}&quot; จะหมดในอีก <strong>{proj.daysLeft} วัน</strong> (ใช้จ่ายเฉลี่ย {formatCurrency(proj.dailyRate)}/วัน)
            </Alert>
          ))}
        </Box>
      )}

      {/* ─── AI Insights Card ─── */}
      <AIInsightsCard data={aiData} />

      {/* ─── Summary Cards Row 1 ─── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard title={`รายรับ (${range.label})`} amount={computed.rangeIncome} icon={<TrendingUp sx={{ color: '#fff', fontSize: 22 }} />} gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" change={computed.incomeChange !== 0 ? computed.incomeChange : null} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title={`รายจ่าย (${range.label})`} amount={computed.rangeExpense} icon={<TrendingDown sx={{ color: '#fff', fontSize: 22 }} />} gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" change={computed.expenseChange !== 0 ? computed.expenseChange : null} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="ยอดคงเหลือ" amount={computed.balance} icon={<AccountBalance sx={{ color: '#fff', fontSize: 22 }} />} gradient={computed.balance >= 0 ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'} />
        </Grid>
      </Grid>

      {/* ─── Summary Cards Row 2 ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <SummaryCard title={`ค่าใช้จ่ายเฉลี่ย/วัน (${range.label})`} amount={computed.dailyAvg} icon={<CalendarToday sx={{ color: '#fff', fontSize: 22 }} />} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SummaryCard title={`อัตราการออม (${range.label})`} amount={`${computed.savingsRate.toFixed(1)}%`} icon={<Savings sx={{ color: '#fff', fontSize: 22 }} />} gradient={computed.savingsRate >= 20 ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' : computed.savingsRate >= 0 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'} />
        </Grid>
      </Grid>

      {/* ─── Charts ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="สัดส่วนรายจ่ายตามหมวดหมู่">
            {computed.expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie data={computed.expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                    {computed.expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={currencyTooltip} contentStyle={customTooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="ยังไม่มีข้อมูลรายจ่าย" py={8} />
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="แนวโน้มรายรับ-รายจ่ายรายเดือน">
            {computed.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={computed.monthlyData} margin={CHART_MARGIN} barGap={4}>
                  <CartesianGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : GRID_LINE_COLOR} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip formatter={currencyTooltip} contentStyle={customTooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                  <Bar dataKey="income" fill={INCOME_COLOR} name="รายรับ" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" fill={EXPENSE_COLOR} name="รายจ่าย" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="ยังไม่มีข้อมูล" py={8} />
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* ─── Spending Heatmap + Top Expenses ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="รายจ่ายรายวัน">
            {Object.keys(computed.dailySpending).length > 0 ? (
              <SpendingHeatmap dailySpending={computed.dailySpending} year={currentYear} month={currentMonth} isDark={isDark} />
            ) : (
              <EmptyState message="ยังไม่มีข้อมูลรายจ่ายเดือนนี้" py={8} />
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>
              รายจ่ายสูงสุด ({range.label})
            </Typography>
            {computed.topExpenses.length > 0 ? (
              <List disablePadding>
                {computed.topExpenses.map((tx, i) => (
                  <React.Fragment key={tx.id}>
                    <ListItem disableGutters sx={{ px: 0, py: 1.25 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: alpha(CHART_COLORS[i % CHART_COLORS.length], 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>{i + 1}</Typography>
                        </Box>
                      </ListItemIcon>
                      <ListItemText primary={tx.category} secondary={formatDateTH(tx.date)} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }} secondaryTypographyProps={{ fontSize: '0.6875rem' }} />
                      {tx.note && <Chip label={tx.note} size="small" sx={{ mr: 1.5, fontSize: '0.6875rem', maxWidth: 100 }} />}
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#ef4444', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        -{formatCurrency(tx.amount)}
                      </Typography>
                    </ListItem>
                    {i < computed.topExpenses.length - 1 && <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <EmptyState message="ยังไม่มีรายจ่าย" />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ─── Recent Transactions & Budget ─── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem' }}>รายการธุรกรรมล่าสุด</Typography>
              <Button size="small" onClick={() => navigate('/transactions')} sx={{ fontSize: '0.75rem' }}>ดูทั้งหมด</Button>
            </Box>
            {computed.recentTransactions.length > 0 ? (
              <List disablePadding>
                {computed.recentTransactions.map((transaction, i) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem disableGutters sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: transaction.type === 'income' ? alpha('#22c55e', 0.1) : alpha('#ef4444', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {transaction.type === 'income' ? <ArrowUpward sx={{ fontSize: 16, color: '#22c55e' }} /> : <ArrowDownward sx={{ fontSize: 16, color: '#ef4444' }} />}
                        </Box>
                      </ListItemIcon>
                      <ListItemText primary={transaction.category} secondary={formatDateTH(transaction.date)} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }} secondaryTypographyProps={{ fontSize: '0.75rem' }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: transaction.type === 'income' ? '#22c55e' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </ListItem>
                    {i < computed.recentTransactions.length - 1 && <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <EmptyState message="ยังไม่มีรายการ" />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem' }}>งบประมาณและเป้าหมาย</Typography>
              <Button size="small" onClick={() => navigate('/budget-management')} sx={{ fontSize: '0.75rem' }}>จัดการ</Button>
            </Box>
            {budgets.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {budgets.map((budget, index) => {
                  const budgetStart2 = toDate(budget.startDate);
                  const budgetEnd2 = toDate(budget.endDate);
                  const spent = transactions
                    .filter((t) => {
                      const tDate = toDate(t.date);
                      return tDate && t.category === budget.category && t.type === 'expense' && tDate >= budgetStart2 && tDate <= budgetEnd2;
                    })
                    .reduce((total, t) => total + t.amount, 0);
                  const percentage = (spent / budget.amount) * 100;
                  const isOver = percentage >= 100;
                  const isWarning = percentage >= 80;
                  const projection = computed.projections.find((p) => p.category === budget.category);

                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>{budget.category}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#64748b' }}>{percentage.toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(percentage, 100)} sx={{ mb: 0.5, '& .MuiLinearProgress-bar': { borderRadius: 8, backgroundColor: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e' } }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatCurrency(spent)} / {formatCurrency(budget.amount)}</Typography>
                        {projection && <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#f59e0b' }}>เหลืออีก {projection.daysLeft} วัน</Typography>}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <EmptyState message="ยังไม่ได้ตั้งงบประมาณ" />
            )}
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

export default DashboardPage;
