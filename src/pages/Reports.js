// ไฟล์ Reports.js ใช้สร้างรายงานสรุปข้อมูลทางการเงินในช่วงเวลาที่เลือก
// สามารถเลือกช่วงเวลาได้ (วันนี้, สัปดาห์นี้, เดือนนี้ หรือกำหนดเอง)
// จากนั้นจะแสดงข้อมูลในรูปแบบกราฟต่าง ๆ (LineChart, PieChart, BarChart) และตารางข้อมูล
// Users can select a time range (today, this week, this month, or custom dates).
// The file then displays data in various chart formats (LineChart, PieChart, BarChart) and a transaction table.
// Also includes functionalities like PDF download of the report.

// Import React และ Hooks สำหรับการจัดการ state และ side effects
// Import React and Hooks for state management and side effects
import React, { useEffect, useState } from 'react';

// Import ส่วนประกอบ UI จาก MUI เช่น Typography, FormControl, InputLabel, Select, TextField, Button, Box, Container, Grid
// Importing MUI UI components for building forms, layout and typography
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Container,
  Grid,
} from '@mui/material';

// Import firestore และ auth จาก firebase
// Import firestore and auth from Firebase
import { firestore, auth } from '../firebase';

// Import ส่วนประกอบสำหรับกราฟและ DataGrid
// Importing chart components (LineChart, PieChart, etc.) and DataGrid from Material-UI X
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';

// jsPDF และ jspdf-autotable สำหรับแปลงข้อมูลเป็นไฟล์ PDF
// jsPDF and jspdf-autotable for exporting data as PDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Reports() {
  // เก็บสถานะของช่วงเวลาที่เลือก, วันที่เริ่ม-สิ้นสุดแบบกำหนดเอง, ข้อมูลรายงาน, ธุรกรรม, ข้อมูลหมวดหมู่, สถิติต่างๆ
  // Store states for selected time range, custom start/end dates, report data, transactions, category data, and statistics
  const [timeRange, setTimeRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [averageExpense, setAverageExpense] = useState(0);
  const [highestExpenseCategory, setHighestExpenseCategory] = useState('');
  const [highestIncome, setHighestIncome] = useState(0);

  useEffect(() => {
    // เมื่อเปลี่ยน timeRange, customStartDate, หรือ customEndDate ให้ fetchData ใหม่
    // Re-fetch data when time range or custom dates change
    fetchData();
  }, [timeRange, customStartDate, customEndDate]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    let transactionsRef = firestore
      .collection('transactions')
      .where('userId', '==', user.uid);

    // กำหนดช่วงเวลาตาม timeRange
    // Define start and end date based on selected time range
    let startDate;
    let endDate = new Date();

    if (timeRange === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'this_week') {
      const current = new Date();
      const first = current.getDate() - current.getDay();
      startDate = new Date(current.setDate(first));
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'this_month') {
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
        return;
      }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    }

    // กรองธุรกรรมตามช่วงเวลา
    // Filter transactions by the selected date range
    transactionsRef = transactionsRef
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);
    const snapshot = await transactionsRef.get();
    const data = snapshot.docs
      .map((doc) => {
        const docData = doc.data();
        if (!docData.date) {
          console.warn(`Transaction with id ${doc.id} is missing 'date' field.`);
          return null;
        }
        return { id: doc.id, ...docData };
      })
      .filter((item) => item !== null);
    setTransactions(data);

    // ประมวลผลข้อมูลเพิ่มเติมสำหรับกราฟและสถิติ
    // Process data for charts and statistics
    processData(data);
    processCategoryData(data);
    calculateStatistics(data);
  };

  const processData = (data) => {
    // รวมข้อมูลตามวัน เพื่อแสดงแนวโน้มรายรับ-รายจ่ายใน LineChart
    // Group data by date for LineChart (income vs. expense trends)
    const groupedData = {};
    data.forEach((item) => {
      if (!item.date || !item.date.seconds) return;
      const date = new Date(item.date.seconds * 1000).toLocaleDateString();
      if (!groupedData[date]) {
        groupedData[date] = { date, income: 0, expense: 0 };
      }
      if (item.type === 'income') {
        groupedData[date].income += item.amount;
      } else if (item.type === 'expense') {
        groupedData[date].expense += item.amount;
      }
    });
    setReportData(Object.values(groupedData));
  };

  const processCategoryData = (data) => {
    // สร้างข้อมูลสำหรับ PieChart โดยรวมรายจ่ายตามหมวดหมู่
    // Create categoryData for PieChart by summing expenses per category
    const categories = {};
    data.forEach((item) => {
      if (item.type === 'expense') {
        if (!categories[item.category]) {
          categories[item.category] = 0;
        }
        categories[item.category] += item.amount;
      }
    });
    setCategoryData(
      Object.keys(categories).map((key) => ({
        name: key,
        value: categories[key],
      }))
    );
  };

  const calculateStatistics = (data) => {
    // คำนวณสถิติต่างๆ เช่น ค่าเฉลี่ยรายจ่ายต่อวัน, หมวดหมู่รายจ่ายสูงสุด, รายรับสูงสุด
    // Calculate statistics like average daily expense, highest expense category, highest income in the period

    // ค่าเฉลี่ยรายจ่ายต่อวัน
    const expenseData = data.filter((item) => item.type === 'expense');
    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
    const uniqueDates = new Set(
      expenseData
        .filter((item) => item.date && item.date.seconds)
        .map((item) => new Date(item.date.seconds * 1000).toDateString())
    );
    const avgExpense = totalExpense / (uniqueDates.size || 1);
    setAverageExpense(avgExpense);

    // หมวดหมู่รายจ่ายสูงสุด
    const categoryTotals = {};
    expenseData.forEach((item) => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += item.amount;
    });
    const highestCategory = Object.keys(categoryTotals).reduce((a, b) =>
      categoryTotals[a] > categoryTotals[b] ? a : b,
      ''
    );
    setHighestExpenseCategory(highestCategory);

    // รายรับสูงสุดในช่วงเวลาที่เลือก
    const incomeData = data.filter((item) => item.type === 'income');
    const maxIncome = incomeData.reduce(
      (max, item) => (item.amount > max ? item.amount : max),
      0
    );
    setHighestIncome(maxIncome);
  };

  const handleDownloadPDF = () => {
    // ส่งออกข้อมูลเป็น PDF โดยใช้ jsPDF และ autoTable
    // Export the transactions data as PDF
    const doc = new jsPDF();
    doc.text('รายงานการเงิน', 20, 10);
    doc.autoTable({
      head: [['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'หมายเหตุ']],
      body: transactions.map((item) => [
        item.date
          ? new Date(item.date.seconds * 1000).toLocaleDateString()
          : '',
        item.type,
        item.category,
        item.amount,
        item.note,
      ]),
    });
    doc.save('report.pdf');
  };

  // คอลัมน์สำหรับ DataGrid (ตารางธุรกรรม)
  // Columns for the DataGrid showing transaction details
  const columns = [
    {
      field: 'date',
      headerName: 'วันที่',
      width: 150,
      valueGetter: (params) => {
        if (!params.row || !params.row.date || !params.row.date.seconds) {
          return '';
        }
        return new Date(params.row.date.seconds * 1000).toLocaleDateString();
      },
    },
    { field: 'category', headerName: 'หมวดหมู่', width: 150 },
    { field: 'type', headerName: 'ประเภท', width: 100 },
    { field: 'amount', headerName: 'จำนวนเงิน', width: 130 },
    { field: 'note', headerName: 'หมายเหตุ', width: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <Container maxWidth="xl">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          รายงาน
        </Typography>
        {/* เลือกช่วงเวลาสำหรับรายงาน */}
        {/* Time range selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>ช่วงเวลา</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="ช่วงเวลา"
            >
              <MenuItem value="today">วันนี้</MenuItem>
              <MenuItem value="this_week">สัปดาห์นี้</MenuItem>
              <MenuItem value="this_month">เดือนนี้</MenuItem>
              <MenuItem value="custom">กำหนดเอง</MenuItem>
            </Select>
          </FormControl>
          {timeRange === 'custom' && (
            <>
              <TextField
                label="วันที่เริ่มต้น"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mr: 2 }}
              />
              <TextField
                label="วันที่สิ้นสุด"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </>
          )}
        </Box>

        {/* กราฟแนวโน้มรายรับ-รายจ่าย */}
        {/* LineChart for income and expense trends */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" align="center">
              แนวโน้มรายรับและรายจ่าย
            </Typography>
            <LineChart
              width={600}
              height={300}
              data={reportData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#82ca9d"
                name="รายรับ"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#8884d8"
                name="รายจ่าย"
              />
            </LineChart>
          </Grid>

          {/* PieChart แสดงสัดส่วนรายจ่ายตามหมวดหมู่ */}
          {/* PieChart for expense distribution by category */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" align="center">
              สัดส่วนรายจ่ายตามหมวดหมู่
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Grid>
        </Grid>

        {/* แสดงสถิติสำคัญ */}
        {/* Key statistics display */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">สถิติที่สำคัญ</Typography>
          <Typography>ค่าเฉลี่ยรายจ่ายต่อวัน: ฿{averageExpense.toFixed(2)}</Typography>
          <Typography>หมวดหมู่ที่ใช้จ่ายสูงสุด: {highestExpenseCategory}</Typography>
          <Typography>รายรับสูงสุดในช่วงเวลาที่เลือก: ฿{highestIncome}</Typography>
        </Box>

        {/* ตารางแสดงรายการธุรกรรม */}
        {/* DataGrid showing transactions */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">รายการธุรกรรม</Typography>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>
        </Box>

        {/* ปุ่มดาวน์โหลดรายงานเป็น PDF */}
        {/* Button to download the report as PDF */}
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleDownloadPDF}>
            ดาวน์โหลดรายงานเป็น PDF
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Reports;
