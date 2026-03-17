import React, { useEffect, useState } from 'react';
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
  alpha,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { firestore, auth } from '@/lib/firebase';
import { toDate, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { CHART_COLORS, CHART_MARGIN, INCOME_COLOR, EXPENSE_COLOR, GRID_LINE_COLOR } from '@/shared/constants/chart';
import { useChartHeight } from '@/shared/hooks/useChartHeight';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function StatCard({ icon, label, value, color }) {
  return (
    <Box sx={{
      p: 2.5,
      borderRadius: 3,
      bgcolor: alpha(color, 0.06),
      border: '1px solid',
      borderColor: alpha(color, 0.12),
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          bgcolor: alpha(color, 0.12),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 18, color } })}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary' }}>{value}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ReportsPage() {
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

  useEffect(() => { fetchData(); }, [timeRange, customStartDate, customEndDate]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    setError(null);

    let transactionsRef = firestore.collection('transactions').where('userId', '==', user.uid);
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
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        if (!docData.date) return null;
        return { id: doc.id, ...docData };
      }).filter(Boolean);
      setTransactions(data);
      processData(data);
      processCategoryData(data);
      calculateStatistics(data);
    } catch (err) {
      console.error('Reports fetch error:', err);
      setError('ไม่สามารถโหลดข้อมูลรายงานได้ กรุณาลองใหม่อีกครั้ง');
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('รายงานการเงิน', 20, 10);
    doc.autoTable({
      head: [['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'หมายเหตุ']],
      body: transactions.map((item) => [
        formatDateTH(item.date), item.type === 'income' ? 'รายรับ' : 'รายจ่าย',
        item.category, item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }), item.note || '',
      ]),
    });
    doc.save('report.pdf');
  };

  const columns = [
    { field: 'date', headerName: 'วันที่', width: 150, valueGetter: (value, row) => formatDateTH(row?.date) },
    { field: 'type', headerName: 'ประเภท', width: 100, valueGetter: (value) => value === 'income' ? 'รายรับ' : 'รายจ่าย' },
    { field: 'category', headerName: 'หมวดหมู่', width: 150 },
    { field: 'amount', headerName: 'จำนวนเงิน', width: 130, valueFormatter: (value) => formatCurrency(value) },
    { field: 'note', headerName: 'หมายเหตุ', width: 200 },
  ];

  const chartHeight = useChartHeight();
  const currencyTooltip = (v) => formatCurrency(v);
  const customTooltipStyle = {
    backgroundColor: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '12px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '8px 12px',
  };

  return (
    <PageContainer title="รายงาน" maxWidth="xl">
      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: { xs: 0, sm: 180 }, flex: { xs: '1 1 100%', sm: '0 0 auto' } }} size="small">
            <InputLabel>ช่วงเวลา</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="ช่วงเวลา">
              <MenuItem value="today">วันนี้</MenuItem>
              <MenuItem value="this_week">สัปดาห์นี้</MenuItem>
              <MenuItem value="this_month">เดือนนี้</MenuItem>
              <MenuItem value="custom">กำหนดเอง</MenuItem>
            </Select>
          </FormControl>
          {timeRange === 'custom' && (
            <>
              <TextField label="วันที่เริ่มต้น" type="date" size="small" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} />
              <TextField label="วันที่สิ้นสุด" type="date" size="small" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} />
            </>
          )}
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={handleDownloadPDF} disabled={transactions.length === 0} startIcon={<DownloadIcon />} size="small">
            ดาวน์โหลด PDF
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : error ? (
        <Box><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert><Button variant="contained" onClick={fetchData}>ลองใหม่</Button></Box>
      ) : (
        <>
          {/* Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <StatCard icon={<TrendingDownIcon />} label="ค่าเฉลี่ยรายจ่ายต่อวัน" value={formatCurrency(averageExpense)} color="#ef4444" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard icon={<CategoryIcon />} label="หมวดหมู่ที่ใช้จ่ายสูงสุด" value={highestExpenseCategory || '-'} color="#f59e0b" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard icon={<TrendingUpIcon />} label="รายรับสูงสุด" value={formatCurrency(highestIncome)} color="#22c55e" />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>แนวโน้มรายรับและรายจ่าย</Typography>
                {reportData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <LineChart data={reportData} margin={CHART_MARGIN}>
                      <CartesianGrid stroke={GRID_LINE_COLOR} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip formatter={currencyTooltip} contentStyle={customTooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                      <Line type="monotone" dataKey="income" stroke={INCOME_COLOR} strokeWidth={2.5} dot={{ r: 4 }} name="รายรับ" />
                      <Line type="monotone" dataKey="expense" stroke={EXPENSE_COLOR} strokeWidth={2.5} dot={{ r: 4 }} name="รายจ่าย" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="ไม่มีข้อมูลในช่วงเวลานี้" py={8} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '0.9375rem' }}>สัดส่วนรายจ่ายตามหมวดหมู่</Typography>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                        {categoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={currencyTooltip} contentStyle={customTooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8125rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="ไม่มีข้อมูลรายจ่าย" py={8} />
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Data Grid */}
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
              <Typography variant="subtitle1" sx={{ fontSize: '0.9375rem' }}>รายการธุรกรรม</Typography>
            </Box>
            <Box sx={{ height: 400, width: '100%', p: { xs: 1, sm: 2 } }}>
              <DataGrid
                rows={transactions}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' },
                  '& .MuiDataGrid-cell': { borderColor: '#f1f5f9' },
                }}
              />
            </Box>
          </Paper>
        </>
      )}
    </PageContainer>
  );
}

export default ReportsPage;
