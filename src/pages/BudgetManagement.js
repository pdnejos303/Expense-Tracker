// ไฟล์นี้จัดการงบประมาณ (budgets) ของผู้ใช้ แสดงสรุปงบประมาณทั้งหมด ใช้ไปแล้ว เหลือเท่าไหร่ และแบ่งตามหมวดหมู่
// This file manages user's budgets, displaying total budgets, amount spent, remaining amount, and categorizing them by categories.
// นอกจากนี้ ยังสามารถเพิ่ม/แก้ไข/ลบงบประมาณ และแสดงกราฟสัดส่วนการใช้จ่ายตามหมวดหมู่

import React, { useEffect, useState } from 'react';
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
  Snackbar,
  Alert,
  Container,
} from '@mui/material';

// ใช้ firestore และ auth จาก firebase
// Using Firestore and Auth from Firebase
import { firestore, auth } from '../firebase';

// ใช้ไลบรารี recharts สร้างกราฟ Pie
// Using recharts library for creating a Pie chart
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

function BudgetManagement() {
  // จัดเก็บข้อมูลงบประมาณ, ธุรกรรม, หมวดหมู่ และสถานะอื่นๆ ลงใน state
  // Store budgets, transactions, categories and other states
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);

  // สถานะสำหรับเปิด/ปิด dialog เพิ่ม/แก้ไขงบประมาณ
  // State for opening/closing budget dialog
  const [openDialog, setOpenDialog] = useState(false);

  // เก็บข้อมูลฟอร์มงบประมาณใหม่หรืองบประมาณที่แก้ไข
  // Store new/edited budget form data
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    startDate: '',
    endDate: '',
  });

  // เก็บหมวดหมู่เพื่อนำไปแสดงในฟอร์ม
  // Store categories to show in the form
  const [categories, setCategories] = useState([]);

  // Snackbar สำหรับแจ้งบันทึกงบประมาณสำเร็จ
  // Snackbar for budget save success notification
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // เก็บงบประมาณที่กำลังแก้ไข (ถ้ามี)
  // Store currently edited budget if any
  const [selectedBudget, setSelectedBudget] = useState(null);

  // เก็บงบประมาณที่ใกล้ถึงลิมิตเพื่อแจ้งเตือนผู้ใช้
  // Store budgets that are close to their limit to alert user
  const [alertBudgets, setAlertBudgets] = useState([]);

  // timeRange อาจใช้ต่อยอดในการเลือกช่วงเวลาที่ต้องการ
  // timeRange can be used to filter transactions by certain time range (not implemented further here)
  const [timeRange, setTimeRange] = useState('this_month');

  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
    fetchCategories();
  }, []);

  useEffect(() => {
    // คำนวณผลรวมต่าง ๆ เมื่อ budgets หรือ transactions เปลี่ยน
    // Calculate totals when budgets or transactions change
    calculateTotals();
    checkBudgetAlerts();
  }, [budgets, transactions]);

  const fetchBudgets = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ดึงข้อมูลงบประมาณจาก Firestore ตาม userId
    // Fetch budgets from Firestore by userId
    const budgetsRef = firestore
      .collection('budgets')
      .where('userId', '==', user.uid);
    const snapshot = await budgetsRef.get();
    const data = snapshot.docs.map((doc) => {
      const budget = doc.data();
      return {
        ...budget,
        id: doc.id,
        // แปลงข้อมูลวันที่จาก Firestore เป็น Date object
        // Convert Firestore timestamps to Date objects if needed
        startDate: budget.startDate.toDate
          ? budget.startDate.toDate()
          : budget.startDate,
        endDate: budget.endDate.toDate
          ? budget.endDate.toDate()
          : budget.endDate,
      };
    });
    setBudgets(data);
  };

  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ดึงข้อมูลธุรกรรมของผู้ใช้
    // Fetch user's transactions
    const transactionsRef = firestore
      .collection('transactions')
      .where('userId', '==', user.uid);
    const snapshot = await transactionsRef.get();
    const data = snapshot.docs.map((doc) => doc.data());
    setTransactions(data);
  };

  const fetchCategories = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ดึงข้อมูลหมวดหมู่ของผู้ใช้
    // Fetch user's categories
    const categoriesRef = firestore
      .collection('categories')
      .where('userId', '==', user.uid);
    const snapshot = await categoriesRef.get();
    const data = snapshot.docs.map((doc) => doc.data());
    setCategories(data);
  };

  const calculateTotals = () => {
    // คำนวณงบประมาณรวม
    // Calculate total budgets amount
    const totalBudgetAmount = budgets.reduce(
      (sum, budget) => sum + parseFloat(budget.amount),
      0
    );
    setTotalBudget(totalBudgetAmount);

    // คำนวณการใช้จ่ายรวม (sum ของธุรกรรมที่เป็น expense)
    // Calculate total spent amount (sum of expenses)
    const totalSpentAmount = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    setTotalSpent(totalSpentAmount);

    // งบประมาณที่เหลือ = งบทั้งหมด - ใช้ไปแล้ว
    // Remaining budget = totalBudget - totalSpent
    setRemainingBudget(totalBudgetAmount - totalSpentAmount);
  };

  const checkBudgetAlerts = () => {
    // ตรวจสอบงบประมาณที่ใกล้ใช้เต็มหรือเกินกว่า 80%
    // Check budgets that are close to their limit (>=80%)
    const alerts = budgets.filter((budget) => {
      const spent = transactions
        .filter((t) => {
          const tDate =
            t.date && t.date.seconds
              ? new Date(t.date.seconds * 1000)
              : t.date.toDate
              ? t.date.toDate()
              : t.date;
          return (
            t.category === budget.category &&
            t.type === 'expense' &&
            tDate >= budget.startDate &&
            tDate <= budget.endDate
          );
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const percentage = (spent / budget.amount) * 100;
      return percentage >= 80;
    });
    setAlertBudgets(alerts);
  };

  // เปิด Dialog เพิ่มงบประมาณใหม่
  // Open dialog to add new budget
  const handleOpenDialog = () => {
    setNewBudget({
      category: '',
      amount: '',
      startDate: '',
      endDate: '',
    });
    setSelectedBudget(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveBudget = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ถ้ามี selectedBudget แสดงว่าแก้ไขงบประมาณเดิม
    // If selectedBudget exists, update existing budget
    if (selectedBudget) {
      await firestore
        .collection('budgets')
        .doc(selectedBudget.id)
        .update({
          category: newBudget.category,
          amount: parseFloat(newBudget.amount),
          startDate: new Date(newBudget.startDate),
          endDate: new Date(newBudget.endDate),
        });
    } else {
      // ถ้าไม่มีก็เพิ่มงบประมาณใหม่
      // Otherwise, add a new budget
      await firestore.collection('budgets').add({
        userId: user.uid,
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        startDate: new Date(newBudget.startDate),
        endDate: new Date(newBudget.endDate),
        createdAt: new Date(),
      });
    }

    await fetchBudgets();
    setOpenDialog(false);
    setOpenSnackbar(true); // แสดง Snackbar แจ้งว่าบันทึกสำเร็จ
  };

  const handleEditBudget = (budget) => {
    // เปิด Dialog พร้อมข้อมูลงบประมาณที่ต้องแก้ไข
    // Open dialog with the selected budget data to edit
    setSelectedBudget(budget);
    setNewBudget({
      category: budget.category,
      amount: budget.amount,
      startDate: budget.startDate.toISOString().split('T')[0],
      endDate: budget.endDate.toISOString().split('T')[0],
    });
    setOpenDialog(true);
  };

  const handleDeleteBudget = async (id) => {
    // ลบงบประมาณโดยใช้ id
    // Delete budget by id
    await firestore.collection('budgets').doc(id).delete();
    await fetchBudgets();
  };

  // เตรียมข้อมูลสำหรับกราฟ Pie แสดงสัดส่วนการใช้จ่ายตามหมวดหมู่
  // Prepare data for Pie chart (expense by category)
  const expenseByCategory = budgets.map((budget) => {
    const spent = transactions
      .filter((t) => {
        const tDate =
          t.date && t.date.seconds
            ? new Date(t.date.seconds * 1000)
            : t.date.toDate
            ? t.date.toDate()
            : t.date;
        return (
          t.category === budget.category &&
          t.type === 'expense' &&
          tDate >= budget.startDate &&
          tDate <= budget.endDate
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      name: budget.category,
      value: spent,
    };
  });

  // สีสำหรับกราฟ
  // Colors for the chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          การจัดการงบประมาณ
        </Typography>

        {/* แสดงสรุปยอดรวมงบประมาณ */}
        {/* Display budget summary: total, spent, and remaining */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">งบประมาณทั้งหมด</Typography>
              <Typography variant="h4">฿{totalBudget.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">ใช้ไปแล้ว</Typography>
              <Typography variant="h4">฿{totalSpent.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">เงินเหลือใช้</Typography>
              <Typography variant="h4">฿{remainingBudget.toFixed(2)}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ส่วนงบประมาณตามหมวดหมู่ และกราฟสัดส่วนการใช้จ่าย */}
        {/* Budget by category and spending proportion chart */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5">งบประมาณตามหมวดหมู่</Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleOpenDialog}
              >
                เพิ่มงบประมาณ
              </Button>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {budgets.map((budget, index) => {
                  const spent = transactions
                    .filter((t) => {
                      const tDate =
                        t.date && t.date.seconds
                          ? new Date(t.date.seconds * 1000)
                          : t.date.toDate
                          ? t.date.toDate()
                          : t.date;
                      return (
                        t.category === budget.category &&
                        t.type === 'expense' &&
                        tDate >= budget.startDate &&
                        tDate <= budget.endDate
                      );
                    })
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                  const percentage = (spent / budget.amount) * 100;
                  return (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ padding: 2 }}>
                        <Typography variant="h6">{budget.category}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={percentage > 100 ? 100 : percentage}
                          sx={{ height: 10, borderRadius: 5 }}
                          color={
                            percentage >= 100 ? 'secondary' : 'primary'
                          }
                        />
                        <Typography>
                          ใช้ไป {spent.toFixed(2)} จาก {budget.amount.toFixed(2)} บาท (
                          {percentage.toFixed(2)}%)
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditBudget(budget)}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDeleteBudget(budget.id)}
                            sx={{ ml: 2 }}
                          >
                            ลบ
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* กราฟสัดส่วนการใช้จ่ายตามหมวดหมู่ด้วย PieChart */}
            {/* PieChart for expenses proportion by category */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="h5" align="center">
                  สัดส่วนการใช้จ่ายตามหมวดหมู่
                </Typography>
                <PieChart width={400} height={300}>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {expenseByCategory.map((entry, index) => (
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
          </Grid>
        </Box>

        {/* แจ้งเตือนถ้ามีงบประมาณใกล้ถึงลิมิต */}
        {/* Alerts if any budgets are close to their limit */}
        {alertBudgets.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h5">การแจ้งเตือน</Typography>
              {alertBudgets.map((budget, index) => (
                <Alert severity="warning" key={index} sx={{ mt: 2 }}>
                  การใช้จ่ายในหมวดหมู่ {budget.category}{' '}
                  ใกล้ถึงขีดจำกัดงบประมาณแล้ว!
                </Alert>
              ))}
            </Paper>
          </Box>
        )}

        {/* Dialog สำหรับเพิ่ม/แก้ไขงบประมาณ */}
        {/* Dialog for adding/editing budgets */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {selectedBudget ? 'แก้ไขงบประมาณ' : 'เพิ่มงบประมาณ'}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget({
                    ...newBudget,
                    category: e.target.value,
                  })
                }
                label="หมวดหมู่"
              >
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="จำนวนเงินงบประมาณ"
              type="number"
              fullWidth
              required
              sx={{ mt: 2 }}
              value={newBudget.amount}
              onChange={(e) =>
                setNewBudget({ ...newBudget, amount: e.target.value })
              }
            />
            <TextField
              label="วันที่เริ่มต้น"
              type="date"
              fullWidth
              required
              sx={{ mt: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
              value={newBudget.startDate}
              onChange={(e) =>
                setNewBudget({
                  ...newBudget,
                  startDate: e.target.value,
                })
              }
            />
            <TextField
              label="วันที่สิ้นสุด"
              type="date"
              fullWidth
              required
              sx={{ mt: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
              value={newBudget.endDate}
              onChange={(e) =>
                setNewBudget({
                  ...newBudget,
                  endDate: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>ยกเลิก</Button>
            <Button onClick={handleSaveBudget}>บันทึก</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar เมื่อบันทึกงบประมาณสำเร็จ */}
        {/* Snackbar when budget is saved successfully */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            บันทึกงบประมาณเรียบร้อยแล้ว!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default BudgetManagement;
