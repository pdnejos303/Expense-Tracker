// ไฟล์นี้ทำหน้าที่เพิ่มรายการธุรกรรม (Transaction) ลงในระบบ โดยให้ผู้ใช้กรอกข้อมูลต่าง ๆ เช่น ประเภท (รายรับ/รายจ่าย), หมวดหมู่, จำนวนเงิน, วันที่, หมายเหตุ และสามารถอัพโหลดรูปใบเสร็จได้
// This file handles adding a transaction to the system. It allows users to input details such as type (income/expense), category, amount, date, note, and optionally upload a receipt image.

// Import React และ Hooks
// Import React and Hooks
import React, { useState, useEffect } from 'react';

// Import ส่วนประกอบ UI จาก MUI เช่น TextField, Button, Snackbar ฯลฯ
// Import MUI components like TextField, Button, Snackbar, etc.
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Box,
  Container,
} from '@mui/material';

// Import ฟังก์ชันการใช้งานจากไฟล์ firebase.js (เช่น firestore, storage, auth)
// Import Firestore, Storage, and Auth from firebase setup
import { firestore, storage, auth } from '../firebase';

function AddTransaction() {
  // เก็บสถานะข้อมูลรายการใน state ต่าง ๆ
  // Store transaction details in states
  const [type, setType] = useState('expense'); // ประเภทของรายการ (ค่าเริ่มต้นเป็นรายจ่าย)
  const [category, setCategory] = useState(''); // หมวดหมู่ที่เลือก
  const [amount, setAmount] = useState(''); // จำนวนเงิน
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // วันที่ (ค่าเริ่มต้นเป็นวันนี้)
  const [note, setNote] = useState(''); // หมายเหตุ
  const [receipt, setReceipt] = useState(null); // ไฟล์ใบเสร็จแนบ
  const [categories, setCategories] = useState([]); // รายการหมวดหมู่ที่โหลดมาจาก Firestore ตามประเภทที่เลือก
  const [openSnackbar, setOpenSnackbar] = useState(false); // สถานะเปิด-ปิด Snackbar แสดงข้อความเมื่อเพิ่มรายการเรียบร้อย

  useEffect(() => {
    // เมื่อ type เปลี่ยน ให้โหลดหมวดหมู่ใหม่จาก Firestore
    // When 'type' changes, fetch categories from Firestore
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // อ้างอิงไปยัง collection 'categories' โดย filter ตาม user และ type
      // Reference 'categories' collection filtered by userId and type
      const categoriesRef = firestore.collection('categories');
      const snapshot = await categoriesRef
        .where('userId', '==', user.uid)
        .where('type', '==', type)
        .get();

      // แปลงข้อมูลหมวดหมู่ที่ได้เป็น array แล้วเก็บลง state
      // Map fetched categories to array and store in state
      const data = snapshot.docs.map((doc) => doc.data());
      setCategories(data);
    };
    fetchCategories();
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันการ reload หน้า
    const user = auth.currentUser;
    if (!user) return;

    // ตรวจสอบว่ามีวันที่หรือไม่
    // Check if date is provided
    if (!date) {
      alert('กรุณากรอกวันที่');
      return;
    }

    // อัปโหลดใบเสร็จไปยัง Firebase Storage ถ้ามี
    // Upload the receipt to Firebase Storage if it exists
    let receiptUrl = '';
    if (receipt) {
      // ตรวจสอบขนาดไฟล์ไม่เกิน 2MB
      // Check file size not exceeding 2MB
      if (receipt.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
        return;
      }
      const storageRef = storage.ref();
      const receiptRef = storageRef.child(
        `receipts/${user.uid}/${Date.now()}_${receipt.name}`
      );
      await receiptRef.put(receipt);
      // รับ URL ไฟล์ใบเสร็จหลังอัปโหลดเสร็จ
      // Get the download URL of the uploaded receipt
      receiptUrl = await receiptRef.getDownloadURL();
    }

    // บันทึกรายการธุรกรรมลง Firestore
    // Save the transaction data to Firestore
    await firestore.collection('transactions').add({
      userId: user.uid,
      type,
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      note,
      receiptUrl,
      createdAt: new Date(),
    });

    // บันทึกประวัติการทำรายการ (history)
    // Save the action history to Firestore
    await firestore.collection('history').add({
      userId: user.uid,
      action: `เพิ่มรายการ ${type} จำนวน ${amount} บาท`,
      timestamp: new Date(),
    });

    // รีเซ็ตค่าฟอร์ม
    // Reset form fields
    setType('expense');
    setCategory('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setReceipt(null);
    setOpenSnackbar(true); // เปิด Snackbar แจ้งเตือน
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          เพิ่มรายการรายรับ-รายจ่าย
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* เลือกประเภท (รายรับ/รายจ่าย) */}
            {/* Select transaction type (income/expense) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>ประเภท</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  label="ประเภท"
                >
                  <MenuItem value="income">รายรับ</MenuItem>
                  <MenuItem value="expense">รายจ่าย</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* เลือกหมวดหมู่ ตามประเภทที่เลือกไว้ */}
            {/* Select category based on chosen type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="หมวดหมู่"
                >
                  {categories.map((cat, index) => (
                    <MenuItem key={index} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ช่องกรอกจำนวนเงิน */}
            {/* Amount input field */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="จำนวนเงิน"
                type="number"
                fullWidth
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>

            {/* ช่องกรอกวันที่ */}
            {/* Date input field */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="วันที่"
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Grid>

            {/* ช่องกรอกหมายเหตุ */}
            {/* Note input field */}
            <Grid item xs={12}>
              <TextField
                label="หมายเหตุ"
                multiline
                rows={4}
                fullWidth
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Grid>

            {/* อัปโหลดใบเสร็จ (เลือกไฟล์) */}
            {/* Receipt upload field */}
            <Grid item xs={12}>
              <Button variant="contained" component="label">
                อัปโหลดใบเสร็จ
                <input
                  type="file"
                  hidden
                  onChange={(e) => setReceipt(e.target.files[0])}
                />
              </Button>
              {receipt && <Typography>{receipt.name}</Typography>}
            </Grid>

            {/* ปุ่มบันทึก */}
            {/* Submit button */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                บันทึก
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Snackbar แจ้งเตือนเมื่อเพิ่มรายการสำเร็จ */}
        {/* Snackbar notification on successful transaction addition */}
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
            เพิ่มรายการเรียบร้อยแล้ว!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default AddTransaction;
