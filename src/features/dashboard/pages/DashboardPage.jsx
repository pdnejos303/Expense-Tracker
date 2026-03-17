import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { ArrowUpward, ArrowDownward, TrendingUp, TrendingDown, AccountBalance, Warning } from '@mui/icons-material';
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

function SummaryCard({ title, amount, icon, gradient, textColor }) {
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
              {formatCurrency(amount)}
            </Typography>
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
  const navigate = useNavigate();
  const chartHeight = useChartHeight();

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
      const categoryData = {};
      const monthlyDataTemp = {};
      const alertsTemp = [];

      transactionsData.forEach((transaction) => {
        const date = toDate(transaction.date);
        if (!date) return;
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (transaction.type === 'income') {
          income += transaction.amount;
          if (!monthlyDataTemp[monthKey]) {
            monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }
          monthlyDataTemp[monthKey].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          expense += transaction.amount;
          categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
          if (!monthlyDataTemp[monthKey]) {
            monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }
          monthlyDataTemp[monthKey].expense += transaction.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);
      setBalance(income - expense);
      setExpenseData(Object.entries(categoryData).map(([name, value]) => ({ name, value })));
      setMonthlyData(Object.values(monthlyDataTemp));

      const recentSnapshot = await firestore
        .collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(5)
        .get();
      setRecentTransactions(recentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

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
      });
      setAlerts(alertsTemp);
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
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
    padding: '8px 12px',
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
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alertMsg, index) => (
            <Alert
              severity="warning"
              key={index}
              icon={<Warning />}
              sx={{ mb: 1, bgcolor: alpha('#f59e0b', 0.08), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}
            >
              {alertMsg}
            </Alert>
          ))}
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="รายรับทั้งหมด"
            amount={totalIncome}
            icon={<TrendingUp sx={{ color: '#fff', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="รายจ่ายทั้งหมด"
            amount={totalExpense}
            icon={<TrendingDown sx={{ color: '#fff', fontSize: 22 }} />}
            gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="ยอดคงเหลือ"
            amount={balance}
            icon={<AccountBalance sx={{ color: '#fff', fontSize: 22 }} />}
            gradient={balance >= 0
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
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
                  <CartesianGrid stroke={GRID_LINE_COLOR} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
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
                      <Divider sx={{ borderColor: '#f1f5f9' }} />
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
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </Typography>
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
