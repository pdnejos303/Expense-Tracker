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
  Receipt,
  Schedule,
} from '@mui/icons-material';
import { firestore, auth } from '@/lib/firebase';
import { toDate, toSeconds, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
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

function SummaryCard({ title, amount, icon, gradient, change }) {
  return (
    <Paper
      sx={{
        p: 0,
        overflow: 'hidden',
        position: 'relative',
        border: 'none',
      }}
    >
      <Box
        sx={{
          background: gradient,
          p: { xs: 2.5, sm: 3 },
          color: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: alpha('#fff', 0.85),
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {typeof amount === 'string' ? amount : formatCurrency(amount)}
            </Typography>
            {change !== undefined && change !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75, gap: 0.5 }}>
                {change > 0 ? (
                  <ArrowUpward sx={{ fontSize: 14, color: alpha('#fff', 0.9) }} />
                ) : change < 0 ? (
                  <ArrowDownward sx={{ fontSize: 14, color: alpha('#fff', 0.9) }} />
                ) : null}
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: alpha('#fff', 0.9),
                  }}
                >
                  {change === 0
                    ? 'ไม่เปลี่ยนแปลง'
                    : `${Math.abs(change).toFixed(1)}% จากเดือนก่อน`}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: alpha('#fff', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontSize: '0.9375rem' }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function SpendingHeatmap({ dailySpending, year, month, isDark }) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay(); // 0=Sun

  const maxSpend = Math.max(...Object.values(dailySpending), 1);

  const getColor = (amount) => {
    if (!amount || amount === 0) return isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
    const intensity = Math.min(amount / maxSpend, 1);
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
  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    cells.push(<Box key={`empty-${i}`} sx={{ width: '100%', aspectRatio: '1', borderRadius: '4px' }} />);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const amount = dailySpending[day] || 0;
    cells.push(
      <Tooltip
        key={day}
        title={amount > 0 ? `${day} ${monthNames[month]}: ${formatCurrency(amount)}` : `${day} ${monthNames[month]}: ไม่มีรายจ่าย`}
        arrow
        placement="top"
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '4px',
            bgcolor: getColor(amount),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
            transition: 'transform 0.1s',
            '&:hover': { transform: 'scale(1.15)' },
          }}
        >
          <Typography sx={{ fontSize: { xs: '0.625rem', sm: '0.6875rem' }, color: amount > 0 && amount / maxSpend >= 0.5 ? '#fff' : (isDark ? '#94a3b8' : '#475569'), fontWeight: 500 }}>
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
      {/* Day labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {dayLabels.map((label) => (
          <Typography key={label} sx={{ fontSize: '0.625rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
            {label}
          </Typography>
        ))}
      </Box>
      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {cells}
      </Box>
      {/* Legend */}
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

function DashboardPage() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [expenseData, setExpenseData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for enhanced monitoring
  const [currentMonthIncome, setCurrentMonthIncome] = useState(0);
  const [currentMonthExpense, setCurrentMonthExpense] = useState(0);
  const [prevMonthIncome, setPrevMonthIncome] = useState(0);
  const [prevMonthExpense, setPrevMonthExpense] = useState(0);
  const [dailySpending, setDailySpending] = useState({});
  const [topExpenses, setTopExpenses] = useState([]);
  const [budgetProjections, setBudgetProjections] = useState([]);

  const navigate = useNavigate();
  const chartHeight = useChartHeight();
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Derived values
  const incomeChange = useMemo(() => {
    if (prevMonthIncome === 0) return currentMonthIncome > 0 ? 100 : 0;
    return ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100;
  }, [currentMonthIncome, prevMonthIncome]);

  const expenseChange = useMemo(() => {
    if (prevMonthExpense === 0) return currentMonthExpense > 0 ? 100 : 0;
    return ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100;
  }, [currentMonthExpense, prevMonthExpense]);

  const dailyAvgExpense = useMemo(() => {
    if (currentDay === 0) return 0;
    return currentMonthExpense / currentDay;
  }, [currentMonthExpense, currentDay]);

  const savingsRate = useMemo(() => {
    if (currentMonthIncome === 0) return 0;
    return ((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100;
  }, [currentMonthIncome, currentMonthExpense]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setError(null);

    try {
      const transactionsRef = firestore
        .collection('transactions')
        .where('userId', '==', user.uid);
      const snapshot = await transactionsRef.get();
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsData);

      const budgetsRef = firestore
        .collection('budgets')
        .where('userId', '==', user.uid);
      const budgetsSnapshot = await budgetsRef.get();
      const budgetsData = budgetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBudgets(budgetsData);

      let income = 0;
      let expense = 0;
      let curMonthInc = 0;
      let curMonthExp = 0;
      let prevMonthInc = 0;
      let prevMonthExp = 0;
      const categoryData = {};
      const monthlyDataTemp = {};
      const alertsTemp = [];
      const dailySpendingTemp = {};
      const expenseItems = [];

      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      transactionsData.forEach((transaction) => {
        const date = toDate(transaction.date);
        if (!date) return;
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const txMonth = date.getMonth();
        const txYear = date.getFullYear();
        const txDay = date.getDate();

        if (transaction.type === 'income') {
          income += transaction.amount;
          if (!monthlyDataTemp[monthKey]) {
            monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }
          monthlyDataTemp[monthKey].income += transaction.amount;

          // Current month income
          if (txMonth === currentMonth && txYear === currentYear) {
            curMonthInc += transaction.amount;
          }
          // Previous month income
          if (txMonth === prevMonth && txYear === prevMonthYear) {
            prevMonthInc += transaction.amount;
          }
        } else if (transaction.type === 'expense') {
          expense += transaction.amount;
          categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
          if (!monthlyDataTemp[monthKey]) {
            monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }
          monthlyDataTemp[monthKey].expense += transaction.amount;

          // Current month expense
          if (txMonth === currentMonth && txYear === currentYear) {
            curMonthExp += transaction.amount;
            // Daily spending for heatmap
            dailySpendingTemp[txDay] = (dailySpendingTemp[txDay] || 0) + transaction.amount;
            // Collect for top expenses
            expenseItems.push(transaction);
          }
          // Previous month expense
          if (txMonth === prevMonth && txYear === prevMonthYear) {
            prevMonthExp += transaction.amount;
          }
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);
      setBalance(income - expense);
      setExpenseData(Object.entries(categoryData).map(([name, value]) => ({ name, value })));
      setMonthlyData(Object.values(monthlyDataTemp));

      setCurrentMonthIncome(curMonthInc);
      setCurrentMonthExpense(curMonthExp);
      setPrevMonthIncome(prevMonthInc);
      setPrevMonthExpense(prevMonthExp);
      setDailySpending(dailySpendingTemp);

      // Top 5 expenses this month
      expenseItems.sort((a, b) => b.amount - a.amount);
      setTopExpenses(expenseItems.slice(0, 5));

      const recentSnapshot = await firestore
        .collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(5)
        .get();
      setRecentTransactions(recentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      // Budget alerts + projections
      const projectionsTemp = [];
      budgetsData.forEach((budget) => {
        const budgetStart = toDate(budget.startDate);
        const budgetEnd = toDate(budget.endDate);
        if (!budgetStart || !budgetEnd) return;
        const spent = transactionsData
          .filter((t) => {
            const tDate = toDate(t.date);
            return tDate && t.category === budget.category && t.type === 'expense' && tDate >= budgetStart && tDate <= budgetEnd;
          })
          .reduce((total, t) => total + t.amount, 0);
        const percentage = (spent / budget.amount) * 100;
        if (percentage >= 100) {
          alertsTemp.push(`คุณใช้จ่ายเกินงบประมาณในหมวดหมู่ ${budget.category}`);
        } else if (percentage >= 80) {
          alertsTemp.push(`คุณใช้จ่าย ${percentage.toFixed(0)}% ของงบประมาณในหมวดหมู่ ${budget.category}`);
        }

        // Burn rate projection
        const totalBudgetDays = Math.max(1, Math.ceil((budgetEnd - budgetStart) / (1000 * 60 * 60 * 24)));
        const elapsed = Math.max(1, Math.ceil((now - budgetStart) / (1000 * 60 * 60 * 24)));
        const remaining = budget.amount - spent;
        if (spent > 0 && remaining > 0 && elapsed > 0) {
          const dailyRate = spent / elapsed;
          const daysUntilDepleted = Math.ceil(remaining / dailyRate);
          const remainingBudgetDays = Math.max(0, Math.ceil((budgetEnd - now) / (1000 * 60 * 60 * 24)));
          if (daysUntilDepleted < remainingBudgetDays) {
            projectionsTemp.push({
              category: budget.category,
              daysLeft: daysUntilDepleted,
              dailyRate,
              spent,
              limit: budget.amount,
              percentage,
            });
          }
        }
      });
      setAlerts(alertsTemp);
      setBudgetProjections(projectionsTemp);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      {/* Alerts */}
      {(alerts.length > 0 || budgetProjections.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alertMsg, index) => (
            <Alert
              severity="warning"
              key={`alert-${index}`}
              icon={<Warning />}
              sx={{ mb: 1, bgcolor: alpha('#f59e0b', 0.08), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}
            >
              {alertMsg}
            </Alert>
          ))}
          {budgetProjections.map((proj, index) => (
            <Alert
              severity="info"
              key={`proj-${index}`}
              icon={<Schedule />}
              sx={{ mb: 1, bgcolor: alpha('#3b82f6', 0.08), border: '1px solid', borderColor: alpha('#3b82f6', 0.2) }}
            >
              งบ "{proj.category}" จะหมดในอีก <strong>{proj.daysLeft} วัน</strong> (ใช้จ่ายเฉลี่ย {formatCurrency(proj.dailyRate)}/วัน)
            </Alert>
          ))}
        </Box>
      )}

      {/* Summary Cards - Row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="รายรับเดือนนี้"
            amount={currentMonthIncome}
            icon={<TrendingUp sx={{ color: '#fff', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
            change={prevMonthIncome > 0 || currentMonthIncome > 0 ? incomeChange : null}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="รายจ่ายเดือนนี้"
            amount={currentMonthExpense}
            icon={<TrendingDown sx={{ color: '#fff', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            change={prevMonthExpense > 0 || currentMonthExpense > 0 ? expenseChange : null}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="ยอดคงเหลือรวม"
            amount={balance}
            icon={<AccountBalance sx={{ color: '#fff', fontSize: 22 }} />}
            gradient={balance >= 0
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
            }
          />
        </Grid>
      </Grid>

      {/* Summary Cards - Row 2: Daily Average + Savings Rate */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <SummaryCard
            title="ค่าใช้จ่ายเฉลี่ย/วัน (เดือนนี้)"
            amount={dailyAvgExpense}
            icon={<CalendarToday sx={{ color: '#fff', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SummaryCard
            title="อัตราการออม (เดือนนี้)"
            amount={`${savingsRate >= 0 ? '' : ''}${savingsRate.toFixed(1)}%`}
            icon={<Savings sx={{ color: '#fff', fontSize: 22 }} />}
            gradient={savingsRate >= 20
              ? 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
              : savingsRate >= 0
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            }
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="สัดส่วนรายจ่ายตามหมวดหมู่">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={currencyTooltip}
                    contentStyle={customTooltipStyle}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.8125rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="ยังไม่มีข้อมูลรายจ่าย" py={8} />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="แนวโน้มรายรับ-รายจ่ายรายเดือน">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={monthlyData} margin={CHART_MARGIN} barGap={4}>
                  <CartesianGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : GRID_LINE_COLOR} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#64748b' : '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#64748b' : '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={currencyTooltip}
                    contentStyle={customTooltipStyle}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.8125rem' }}
                  />
                  <Bar
                    dataKey="income"
                    fill={INCOME_COLOR}
                    name="รายรับ"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    fill={EXPENSE_COLOR}
                    name="รายจ่าย"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="ยังไม่มีข้อมูล" py={8} />
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Spending Heatmap + Top Expenses */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="รายจ่ายรายวัน">
            {Object.keys(dailySpending).length > 0 ? (
              <SpendingHeatmap
                dailySpending={dailySpending}
                year={currentYear}
                month={currentMonth}
                isDark={isDark}
              />
            ) : (
              <EmptyState message="ยังไม่มีข้อมูลรายจ่ายเดือนนี้" py={8} />
            )}
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>
              รายจ่ายสูงสุดเดือนนี้
            </Typography>
            {topExpenses.length > 0 ? (
              <List disablePadding>
                {topExpenses.map((tx, i) => (
                  <React.Fragment key={tx.id}>
                    <ListItem disableGutters sx={{ px: 0, py: 1.25 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            bgcolor: alpha(CHART_COLORS[i % CHART_COLORS.length], 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>
                            {i + 1}
                          </Typography>
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={tx.category}
                        secondary={formatDateTH(tx.date)}
                        primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.6875rem' }}
                      />
                      {tx.note && (
                        <Chip
                          label={tx.note}
                          size="small"
                          sx={{ mr: 1.5, fontSize: '0.6875rem', maxWidth: 100 }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#ef4444',
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        -{formatCurrency(tx.amount)}
                      </Typography>
                    </ListItem>
                    {i < topExpenses.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <EmptyState message="ยังไม่มีรายจ่ายเดือนนี้" />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions & Budget */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem' }}>
                รายการธุรกรรมล่าสุด
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/transactions')}
                sx={{ fontSize: '0.75rem' }}
              >
                ดูทั้งหมด
              </Button>
            </Box>
            {recentTransactions.length > 0 ? (
              <List disablePadding>
                {recentTransactions.map((transaction, i) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem
                      disableGutters
                      sx={{ px: 0, py: 1.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: transaction.type === 'income'
                              ? alpha('#22c55e', 0.1)
                              : alpha('#ef4444', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {transaction.type === 'income' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: '#22c55e' }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 16, color: '#ef4444' }} />
                          )}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={transaction.category}
                        secondary={formatDateTH(transaction.date)}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem',
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: transaction.type === 'income' ? '#22c55e' : '#ef4444',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </ListItem>
                    {i < recentTransactions.length - 1 && (
                      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }} />
                    )}
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
              <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem' }}>
                งบประมาณและเป้าหมาย
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/budget-management')}
                sx={{ fontSize: '0.75rem' }}
              >
                จัดการ
              </Button>
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

                  // Find matching projection
                  const projection = budgetProjections.find((p) => p.category === budget.category);

                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>
                          {budget.category}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#64748b',
                          }}
                        >
                          {percentage.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentage, 100)}
                        sx={{
                          mb: 0.5,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 8,
                            backgroundColor: isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                        </Typography>
                        {projection && (
                          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#f59e0b' }}>
                            เหลืออีก {projection.daysLeft} วัน
                          </Typography>
                        )}
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
