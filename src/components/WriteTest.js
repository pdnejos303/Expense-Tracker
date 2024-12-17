// ไฟล์ Dashboard.js ใช้สำหรับแสดงสรุปสถานะทางการเงินของผู้ใช้ รวมถึงข้อมูลสรุปรายรับ-รายจ่าย ยอดคงเหลือ
// กราฟสัดส่วนรายจ่ายตามหมวดหมู่ กราฟแนวโน้มรายรับ-รายจ่ายรายเดือน รายการธุรกรรมล่าสุด และแจ้งเตือนงบประมาณ
//
// This Dashboard.js file provides an overview of the user's financial status.
// It includes summaries of total income/expense, balance, category-wise expense distribution (PieChart),
// monthly trends for income and expenses (BarChart), recent transactions, and budget alerts.

// Import React และ Hooks สำหรับการจัดการสถานะและเอฟเฟกต์
// Import React and Hooks for state management and side effects
import React, { useEffect, useState } from 'react';

// Import ส่วนประกอบจาก MUI สำหรับ UI เช่น Typography, Paper, Box, Grid, Snackbar เป็นต้น
// Import MUI components for UI such as Typography, Paper, Box, Grid, Snackbar etc.
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
  Container,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';

// Import ไอคอนจาก MUI เช่น ArrowUpward, ArrowDownward
// Import icons from MUI icons
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

// Import ฟังก์ชันเชื่อมต่อ Firebase (auth, firestore)
// Import Firestore and Auth from Firebase
import { firestore, auth } from '../firebase';

// Import components สำหรับสร้างกราฟด้วย Recharts
// Import Recharts components for charts
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
} from 'recharts';

// useNavigate ใช้ในการนำทางโปรแกรมmatically
// useNavigate for programmatic navigation
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  // เก็บสถานะข้อมูลสรุปรายรับ รายจ่าย ยอดคงเหลือ ข้อมูลสำหรับกราฟและรายการธุรกรรมล่าสุด
  // States to store income, expense, balance, chart data, recent transactions, budgets, alerts, and all transactions
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [expenseData, setExpenseData] = useState([]); 
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      // หากผู้ใช้ไม่ได้ล็อกอิน ให้กลับไปหน้า /login
      // If user is not logged in, redirect to /login
      if (!user) {
        navigate('/login');
        return;
      }

      // ดึงข้อมูลธุรกรรมจาก Firestore
      // Fetch user transactions from Firestore
      const transactionsRef = firestore
        .collection('transactions')
        .where('userId', '==', user.uid);
      const snapshot = await transactionsRef.get();
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsData);

      // ดึงข้อมูลงบประมาณ (budgets) จาก Firestore
      // Fetch budgets from Firestore
      const budgetsRef = firestore
        .collection('budgets')
        .where('userId', '==', user.uid);
      const budgetsSnapshot = await budgetsRef.get();
      const budgetsData = budgetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBudgets(budgetsData);

      // คำนวณสรุปรายรับ-รายจ่าย และเตรียมข้อมูลสำหรับกราฟ
      // Calculate totals and prepare data for charts
      let income = 0;
      let expense = 0;
      let categoryData = {};
      let monthlyDataTemp = {};
      let alertsTemp = [];

      transactionsData.forEach((transaction) => {
        const date = new Date(transaction.date.seconds * 1000);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (transaction.type === 'income') {
          income += transaction.amount;
          // บันทึกข้อมูลรายเดือนสำหรับกราฟ
          // Record monthly income
          if (!monthlyDataTemp[monthKey]) {
            monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }
          monthlyDataTemp[monthKey].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          expense += transaction.amount;
          // บันทึกข้อมูลรายจ่ายตามหมวดหมู่สำหรับ Pie Chart
          // Record category-wise expenses for Pie Chart
          if (categoryData[transaction.category]) {
            categoryData[transaction.category] += transaction.amount;
          } else {
            categoryData[transaction.category] = transaction.amount;
          }

          // บันทึกข้อมูลรายเดือนสำหรับรายจ่าย
          // Record monthly expense
          if (!monthlyDataTemp[monthKey]) {
            monthlyDataTemp[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }
          monthlyDataTemp[monthKey].expense += transaction.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);
      setBalance(income - expense);

      // แปลงข้อมูลหมวดหมู่ expenseData สำหรับ Pie Chart
      // Convert categoryData to expenseData array for Pie Chart
      const expenseChartData = Object.keys(categoryData).map((key) => ({
        name: key,
        value: categoryData[key],
      }));
      setExpenseData(expenseChartData);

      // แปลง monthlyDataTemp เป็น array สำหรับ Bar Chart
      // Convert monthlyDataTemp into an array for Bar Chart
      const monthlyChartData = Object.values(monthlyDataTemp);
      setMonthlyData(monthlyChartData);

      // ดึงรายการธุรกรรมล่าสุด (5 รายการล่าสุด)
      // Fetch 5 most recent transactions
      const recentTransactionsRef = firestore
        .collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(5);
      const recentSnapshot = await recentTransactionsRef.get();
      const recentData = recentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentTransactions(recentData);

      // ตรวจสอบการใช้งบประมาณเกินหรือใกล้เคียงกับงบประมาณที่ตั้งไว้
      // Check if any budget is exceeded or close to exceeding
      budgetsData.forEach((budget) => {
        const spent = transactionsData
          .filter(
            (t) =>
              t.category === budget.category &&
              t.type === 'expense' &&
              t.date.seconds * 1000 >= budget.startDate.seconds * 1000 &&
              t.date.seconds * 1000 <= budget.endDate.seconds * 1000
          )
          .reduce((total, t) => total + t.amount, 0);

        const percentage = (spent / budget.amount) * 100;
        if (percentage >= 100) {
          alertsTemp.push(`คุณใช้จ่ายเกินงบประมาณในหมวดหมู่ ${budget.category}`);
        } else if (percentage >= 80) {
          alertsTemp.push(
            `คุณใช้จ่าย ${percentage.toFixed(2)}% ของงบประมาณในหมวดหมู่ ${budget.category}`
          );
        }
      });

      setAlerts(alertsTemp);
    };

    fetchData();
  }, [navigate]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          แดชบอร์ด
        </Typography>
        <Grid container spacing={3}>
          {/* สรุปรายรับ รายจ่าย และยอดคงเหลือ */}
          {/* Summary of Income, Expense and Balance */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">รายรับทั้งหมด</Typography>
              <Typography variant="h4" color="green">
                ฿{totalIncome.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">รายจ่ายทั้งหมด</Typography>
              <Typography variant="h4" color="red">
                ฿{totalExpense.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">ยอดคงเหลือ</Typography>
              <Typography variant="h4" color="blue">
                ฿{balance.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          {/* Pie Chart สำหรับสัดส่วนรายจ่ายตามหมวดหมู่ */}
          {/* Pie Chart for expense distribution by category */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h5" align="center">
                สัดส่วนรายจ่ายตามหมวดหมู่
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Paper>
          </Grid>

          {/* Bar Chart สำหรับแนวโน้มรายรับรายจ่ายรายเดือน */}
          {/* Bar Chart for monthly income and expense trends */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h5" align="center">
                แนวโน้มรายรับและรายจ่ายรายเดือน
              </Typography>
              <BarChart
                width={500}
                height={300}
                data={monthlyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#82ca9d" name="รายรับ" />
                <Bar dataKey="expense" fill="#8884d8" name="รายจ่าย" />
              </BarChart>
            </Paper>
          </Grid>

          {/* รายการธุรกรรมล่าสุด */}
          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h5">รายการธุรกรรมล่าสุด</Typography>
              <List>
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id}>
                    <ListItem>
                      <ListItemIcon>
                        {transaction.type === 'income' ? (
                          <ArrowUpward color="success" />
                        ) : (
                          <ArrowDownward color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${transaction.category} - ฿${transaction.amount.toFixed(2)}`}
                        secondary={new Date(
                          transaction.date.seconds * 1000
                        ).toLocaleDateString()}
                      />
                      <Typography
                        variant="h6"
                        color={
                          transaction.type === 'income' ? 'green' : 'red'
                        }
                      >
                        {transaction.type === 'income' ? '+' : '-'}฿
                        {parseFloat(transaction.amount).toFixed(2)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* งบประมาณและเป้าหมาย พร้อมแถบแสดงการใช้งานงบประมาณ */}
          {/* Budget and goals section with progress bars */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h5">งบประมาณและเป้าหมาย</Typography>
              {budgets.map((budget, index) => {
                const spent = transactions
                  .filter(
                    (t) =>
                      t.category === budget.category &&
                      t.type === 'expense' &&
                      t.date.seconds * 1000 >= budget.startDate.seconds * 1000 &&
                      t.date.seconds * 1000 <= budget.endDate.seconds * 1000
                  )
                  .reduce((total, t) => total + t.amount, 0);
                const percentage = (spent / budget.amount) * 100;
                return (
                  <Box key={index} sx={{ mt: 2 }}>
                    <Typography variant="h6">{budget.category}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage > 100 ? 100 : percentage}
                      sx={{ height: 10, borderRadius: 5 }}
                      color={percentage >= 100 ? 'secondary' : 'primary'}
                    />
                    <Typography>
                      ใช้ไป {spent.toFixed(2)} จาก {budget.amount.toFixed(2)} บาท (
                      {percentage.toFixed(2)}%)
                    </Typography>
                  </Box>
                );
              })}
            </Paper>
          </Grid>

          {/* แจ้งเตือนงบประมาณ ถ้ามี */}
          {/* Budget Alerts if any */}
          <Grid item xs={12}>
            {alerts.length > 0 && (
              <Paper sx={{ padding: 2 }}>
                <Typography variant="h5">การแจ้งเตือน</Typography>
                <List>
                  {alerts.map((alert, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={alert} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Snackbar สำหรับแจ้งเตือนอัตโนมัติ (ถ้ามี alert) */}
        {/* Snackbar for automatic alerts (if any) */}
        <Snackbar
          open={alerts.length > 0}
          autoHideDuration={6000}
          onClose={() => setAlerts([])}
        >
          <Alert
            onClose={() => setAlerts([])}
            severity="warning"
            sx={{ width: '100%' }}
          >
            {alerts[0]}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Dashboard;
