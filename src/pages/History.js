// ไฟล์ History.js ใช้แสดงประวัติธุรกรรมทั้งหมดของผู้ใช้ พร้อมฟิลเตอร์ค้นหาตามประเภท หมวดหมู่ และช่วงเวลา
// Users can view all transaction history, and filter by type, category, and date range.
// นอกจากนี้ยังสามารถลบรายการได้

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { firestore, auth } from '../firebase';

function History() {
  // เก็บรายการธุรกรรม, หมวดหมู่, ฟิลเตอร์ต่างๆ และสถานะ Snackbar
  // Store transactions, categories, filters, and snackbar state
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [filterType, filterCategory, startDate, endDate]);

  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // สร้าง query ตามฟิลเตอร์ที่ผู้ใช้เลือก
    // Create Firestore query based on selected filters
    let transactionsRef = firestore
      .collection('transactions')
      .where('userId', '==', user.uid);

    if (filterType) {
      transactionsRef = transactionsRef.where('type', '==', filterType);
    }
    if (filterCategory) {
      transactionsRef = transactionsRef.where('category', '==', filterCategory);
    }
    if (startDate) {
      transactionsRef = transactionsRef.where('date', '>=', new Date(startDate));
    }
    if (endDate) {
      transactionsRef = transactionsRef.where('date', '<=', new Date(endDate));
    }

    const snapshot = await transactionsRef.get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTransactions(data);
  };

  const fetchCategories = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ดึงหมวดหมู่ทั้งหมดของผู้ใช้เพื่อให้เลือกฟิลเตอร์
    // Fetch all user categories for filter
    const categoriesRef = firestore
      .collection('categories')
      .where('userId', '==', user.uid);
    const snapshot = await categoriesRef.get();
    const data = snapshot.docs.map((doc) => doc.data());
    setCategories(data);
  };

  const handleDelete = async (id) => {
    // ลบรายการธุรกรรมตาม id
    // Delete transaction by id
    if (window.confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      await firestore.collection('transactions').doc(id).delete();
      fetchTransactions();
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          ประวัติการทำรายการ
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {/* ฟิลเตอร์ประเภท (รายรับ/รายจ่าย) */}
          {/* Filter by type (income/expense) */}
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>ประเภท</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="ประเภท"
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>

          {/* ฟิลเตอร์หมวดหมู่ */}
          {/* Filter by category */}
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>หมวดหมู่</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="หมวดหมู่"
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              {categories.map((cat, index) => (
                <MenuItem key={index} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ฟิลเตอร์วันที่เริ่มต้นและสิ้นสุด */}
          {/* Filter by start and end date */}
          <TextField
            label="วันที่เริ่มต้น"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mr: 2 }}
          />
          <TextField
            label="วันที่สิ้นสุด"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Box>

        {/* ตารางแสดงประวัติธุรกรรม */}
        {/* Transactions history table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>วันที่</TableCell>
              <TableCell>ประเภท</TableCell>
              <TableCell>หมวดหมู่</TableCell>
              <TableCell>จำนวนเงิน</TableCell>
              <TableCell>หมายเหตุ</TableCell>
              <TableCell>การกระทำ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.date && transaction.date.seconds
                    ? new Date(transaction.date.seconds * 1000).toLocaleDateString()
                    : ''}
                </TableCell>
                <TableCell>
                  {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.note}</TableCell>
                <TableCell>
                  {/* ปุ่มลบรายการ */}
                  {/* Delete transaction button */}
                  <IconButton onClick={() => handleDelete(transaction.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Snackbar แจ้งเตือนเมื่อทำการลบเรียบร้อย */}
        {/* Snackbar notification after successful deletion */}
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
            ลบรายการเรียบร้อยแล้ว!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default History;
