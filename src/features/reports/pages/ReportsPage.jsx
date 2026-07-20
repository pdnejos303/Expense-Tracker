import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Alert,
  useTheme,
  useMediaQuery,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import GridOnIcon from '@mui/icons-material/GridOn';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { auth } from '@/lib/firebase';
import { userQuery, mapDocs } from '@/lib/db';
import { toDate, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { exportCSV, exportExcel, exportPDF } from '@/lib/exportData';
import { CHART_COLORS, CHART_MARGIN, INCOME_COLOR, EXPENSE_COLOR, GRID_LINE_COLOR, getTooltipStyle } from '@/shared/constants/chart';
import { useChartHeight } from '@/shared/hooks/useChartHeight';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import GradientStatCard from '@/shared/components/GradientStatCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/shared/utils/animations';

function ReportsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [averageExpense, setAverageExpense] = useState(0);
  const [highestExpenseCategory, setHighestExpenseCategory] = useState('');
  const [highestIncome, setHighestIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartHeight = useChartHeight();

  useEffect(() => { fetchData(); }, [timeRange, customStartDate, customEndDate]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    setError(null);

    let transactionsRef = userQuery('transactions', user.uid);
    let startDate;
    let endDate = new Date();

    if (timeRange === 'today') {
      startDate = new Date(); startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'this_week') {
      const current = new Date();
      const first = current.getDate() - current.getDay();
      startDate = new Date(current.setDate(first)); startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'this_month') {
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) { setLoading(false); return; }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate); endDate.setHours(23, 59, 59, 999);
    }

    try {
      transactionsRef = transactionsRef.where('date', '>=', startDate).where('date', '<=', endDate);
      const snapshot = await transactionsRef.get();
      const data = mapDocs(snapshot).filter((item) => item.date);
      setTransactions(data);
      processData(data);
      processCategoryData(data);
      calculateStatistics(data);
    } catch (err) {
      console.error('Reports fetch error:', err);
      setError(t('report.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    const groupedData = {};
    data.forEach((item) => {
      const d = toDate(item.date);
      if (!d) return;
      const date = d.toLocaleDateString('th-TH');
      if (!groupedData[date]) groupedData[date] = { date, income: 0, expense: 0 };
      if (item.type === 'income') groupedData[date].income += item.amount;
      else if (item.type === 'expense') groupedData[date].expense += item.amount;
    });
    setReportData(Object.values(groupedData));
  };

  const processCategoryData = (data) => {
    const categories = {};
    data.forEach((item) => {
      if (item.type === 'expense') categories[item.category] = (categories[item.category] || 0) + item.amount;
    });
    setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })));
  };

  const calculateStatistics = (data) => {
    const expenseData = data.filter((item) => item.type === 'expense');
    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
    const uniqueDates = new Set(expenseData.map((item) => toDate(item.date)).filter(Boolean).map((d) => d.toDateString()));
    setAverageExpense(totalExpense / (uniqueDates.size || 1));
    const categoryTotals = {};
    expenseData.forEach((item) => { categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount; });
    const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    setHighestExpenseCategory(highestCategory ? highestCategory[0] : '-');
    const incomeData = data.filter((item) => item.type === 'income');
    setHighestIncome(incomeData.reduce((max, item) => Math.max(max, item.amount), 0));
  };

  const handleExport = (type) => {
    setExportAnchor(null);
    if (type === 'csv') exportCSV(transactions);
    else if (type === 'excel') exportExcel(transactions);
    else if (type === 'pdf') exportPDF(transactions);
  };

  const columns = [
    { field: 'date', headerName: t('common.date'), flex: 1, minWidth: 100, valueGetter: (value, row) => formatDateTH(row?.date) },
    { field: 'type', headerName: t('common.type'), flex: 0.7, minWidth: 80, valueGetter: (value) => value === 'income' ? t('common.income') : t('common.expense') },
    { field: 'category', headerName: t('common.category'), flex: 1, minWidth: 100 },
    { field: 'amount', headerName: t('common.amount'), flex: 0.9, minWidth: 100, valueFormatter: (value) => formatCurrency(value) },
    { field: 'note', headerName: t('common.note'), flex: 1.2, minWidth: 100 },
  ];

  const isDark = theme.palette.mode === 'dark';
  const currencyTooltip = (v) => formatCurrency(v);
  const customTooltipStyle = getTooltipStyle(isDark);
  const dateInputSx = {
    '& input[type="date"]': { cursor: 'pointer' },
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer',
    },
  };

  return (
    <PageContainer title={t('report.title')} maxWidth="lg">
      {/* ─── Filters ─── */}
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl sx={{ minWidth: { xs: 0, sm: 180 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }} size="small">
            <InputLabel>{t('report.timeRange')}</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label={t('report.timeRange')}>
              <MenuItem value="today">{t('report.today')}</MenuItem>
              <MenuItem value="this_week">{t('report.thisWeek')}</MenuItem>
              <MenuItem value="this_month">{t('report.thisMonth')}</MenuItem>
              <MenuItem value="custom">{t('report.custom')}</MenuItem>
            </Select>
          </FormControl>
          {timeRange === 'custom' && (
            <>
              <TextField label={t('report.startDate')} type="date" size="small" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' }, ...dateInputSx }} />
              <TextField label={t('report.endDate')} type="date" size="small" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' }, ...dateInputSx }} />
            </>
          )}
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
          <Button
            variant="contained"
            onClick={(e) => setExportAnchor(e.currentTarget)}
            disabled={transactions.length === 0}
            startIcon={<DownloadIcon />}
            size="small"
            sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
          >
            {t('report.export')}
          </Button>
          <Menu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={() => setExportAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 200, mt: 0.5 } } }}
          >
            <MenuItem onClick={() => handleExport('csv')}>
              <ListItemIcon><TableChartIcon fontSize="small" sx={{ color: '#22c55e' }} /></ListItemIcon>
              <ListItemText primary="CSV" secondary={t('report.csvDesc')} secondaryTypographyProps={{ fontSize: '0.6875rem' }} />
            </MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>
              <ListItemIcon><GridOnIcon fontSize="small" sx={{ color: '#16a34a' }} /></ListItemIcon>
              <ListItemText primary="Excel (.xlsx)" secondary={t('report.xlsxDesc')} secondaryTypographyProps={{ fontSize: '0.6875rem' }} />
            </MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>
              <ListItemIcon><PictureAsPdfIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
              <ListItemText primary="PDF" secondary={t('report.pdfDesc')} secondaryTypographyProps={{ fontSize: '0.6875rem' }} />
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : error ? (
        <Box><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert><Button variant="contained" onClick={fetchData}>{t('common.retry')}</Button></Box>
      ) : (
        <>
          {/* ─── Statistics (same Grid pattern as Dashboard) ─── */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
            <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
              <GradientStatCard icon={<TrendingDownIcon />} label={t('report.dailyAvgExpense')} value={formatCurrency(averageExpense)} gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" />
            </Grid>
            <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
              <GradientStatCard icon={<CategoryIcon />} label={t('report.topCategory')} value={highestExpenseCategory || '-'} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" />
            </Grid>
            <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
              <GradientStatCard icon={<TrendingUpIcon />} label={t('report.topIncome')} value={formatCurrency(highestIncome)} gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" />
            </Grid>
          </Grid>

          {/* ─── Charts ─── */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>{t('report.trendTitle')}</Typography>
                {reportData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <LineChart data={reportData} margin={CHART_MARGIN}>
                      <CartesianGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : GRID_LINE_COLOR} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip formatter={currencyTooltip} contentStyle={customTooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                      <Line type="monotone" dataKey="income" stroke={INCOME_COLOR} strokeWidth={2.5} dot={{ r: 4 }} name={t('common.income')} />
                      <Line type="monotone" dataKey="expense" stroke={EXPENSE_COLOR} strokeWidth={2.5} dot={{ r: 4 }} name={t('common.expense')} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t('report.noDataInRange')} py={8} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>{t('report.expenseByCategory')}</Typography>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 70 : 90} innerRadius={isMobile ? 35 : 50} paddingAngle={3} strokeWidth={0}>
                        {categoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={currencyTooltip} contentStyle={customTooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t('report.noExpenseData')} py={8} />
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ─── Transactions ─── */}
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem' }}>{t('report.transactionList')}</Typography>
            </Box>
            {isMobile ? (
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {transactions.length === 0 ? (
                  <EmptyState message={t('report.noTransactions')} py={4} />
                ) : (
                  transactions.map((item) => (
                    <TransactionCard key={item.id} transaction={item} />
                  ))
                )}
              </Box>
            ) : (
              <Box sx={{ height: 400, width: '100%', p: 2 }}>
                <DataGrid
                  rows={transactions}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  density="compact"
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' },
                    '& .MuiDataGrid-cell': { borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', fontSize: '0.8125rem' },
                  }}
                />
              </Box>
            )}
          </Paper>
        </>
      )}
    </PageContainer>
  );
}

export default ReportsPage;
