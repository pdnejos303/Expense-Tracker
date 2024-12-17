// ไฟล์ Transactions.js แสดงรายการธุรกรรมทั้งหมดของผู้ใช้ พร้อมตัวกรองตามประเภทและการค้นหาตามหมวดหมู่
// Users can view all transactions, filter by type (income/expense), search by category keyword, and delete transactions.

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Box,
  IconButton,
  Container,
} from '@mui/material';
import { firestore, auth } from '../firebase';
import DeleteIcon from '@mui/icons-material/Delete';

function Transactions() {
  // จัดเก็บรายการธุรกรรม, การกรองตามประเภท, keyword สำหรับค้นหา, และ state ของ Snackbar
  // Store transactions, filterType, searchKeyword, and snackbar state
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    // โหลดข้อมูลธุรกรรมจาก Firestore โดยกรองตาม filterType ถ้ามี
    // Fetch transactions from Firestore, filtered by type if specified
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      let transactionsRef = firestore
        .collection('transactions')
        .where('userId', '==', user.uid);

      if (filterType) {
        transactionsRef = transactionsRef.where('type', '==', filterType);
      }

      const snapshot = await transactionsRef.get();
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setTransactions(data);
    };
    fetchData();
  }, [filterType]);

  const handleDelete = async (id) => {
    // ลบรายการธุรกรรมและบันทึกประวัติการลบ
    // Delete a transaction and record the action in history
    const user = auth.currentUser;
    const transaction = transactions.find((t) => t.id === id);

    await firestore.collection('transactions').doc(id).delete();

    await firestore.collection('history').add({
      userId: user.uid,
      action: `ลบรายการ ${transaction.type} จำนวน ${transaction.amount} บาท`,
      timestamp: new Date(),
    });

    setTransactions(transactions.filter((transaction) => transaction.id !== id));
    setOpenSnackbar(true);
  };

  // กรอง transactions ตาม keyword ที่พิมพ์ในช่องค้นหา (ค้นหาจาก category)
  // Filter transactions by search keyword in category
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.category.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          รายการบันทึกทั้งหมด
        </Typography>
        {/* ส่วนควบคุมสำหรับกรองและค้นหา */}
        {/* Filters and search controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>กรองตามประเภท</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="กรองตามประเภท"
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="ค้นหา"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Box>
        {/* ตารางแสดงธุรกรรม */}
        {/* Transactions table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ประเภท</TableCell>
              <TableCell>หมวดหมู่</TableCell>
              <TableCell>จำนวนเงิน</TableCell>
              <TableCell>วันที่</TableCell>
              <TableCell>หมายเหตุ</TableCell>
              <TableCell>ใบเสร็จ</TableCell>
              <TableCell>การกระทำ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>
                  {new Date(transaction.date.seconds * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.note}</TableCell>
                <TableCell>
                  {transaction.receiptUrl && (
                    <a
                      href={transaction.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ดูใบเสร็จ
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Snackbar แจ้งเตือนเมื่อการลบสำเร็จ */}
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

export default Transactions;
