// ไฟล์นี้จัดการหมวดหมู่ (categories) ของผู้ใช้ สามารถดู แก้ไข เพิ่ม และลบหมวดหมู่ได้
// This file manages user categories. Users can view, edit, add, and delete categories.
// นอกจากนี้ยังแสดงจำนวนครั้งและยอดเงินรวมที่ใช้จ่ายในแต่ละหมวดหมู่

import React, { useEffect, useState } from 'react';
import {
  Typography,
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
  Box,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from '@mui/material';

// ไอคอนสำหรับแก้ไขและลบ
// Icons for edit and delete
import { Edit, Delete } from '@mui/icons-material';

// firestore และ auth สำหรับเชื่อมต่อ Firebase
// Firestore and Auth for Firebase connection
import { firestore, auth } from '../firebase';

// Import ไอคอนทั้งหมด จาก Material Icons
// Import all icons from Material Icons
import * as Icons from '@mui/icons-material';

function Categories() {
  const [categories, setCategories] = useState([]); // เก็บหมวดหมู่
  const [filterType, setFilterType] = useState(''); // ใช้ filter ประเภทหมวดหมู่
  const [openDialog, setOpenDialog] = useState(false); // เปิด/ปิด Dialog
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    type: 'expense',
    color: '#000000',
    icon: 'Category',
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [filterType]);

  const fetchCategories = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ดึงหมวดหมู่จาก Firestore ตาม userId และประเภท (ถ้ามีการเลือก)
    // Fetch categories filtered by userId and optionally by type
    let categoriesRef = firestore
      .collection('categories')
      .where('userId', '==', user.uid);
    if (filterType) {
      categoriesRef = categoriesRef.where('type', '==', filterType);
    }
    const snapshot = await categoriesRef.get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCategories(data);
  };

  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ดึงข้อมูลธุรกรรมทั้งหมดของผู้ใช้ เพื่อใช้คำนวณจำนวนครั้ง และยอดรวมต่อหมวดหมู่
    // Fetch all user transactions to calculate counts and totals per category
    const transactionsRef = firestore
      .collection('transactions')
      .where('userId', '==', user.uid);
    const snapshot = await transactionsRef.get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTransactions(data);
  };

  const handleDelete = async (id) => {
    // ยืนยันก่อนลบหมวดหมู่
    // Confirm before deleting category
    if (window.confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) {
      await firestore.collection('categories').doc(id).delete();
      fetchCategories();
    }
  };

  const handleEdit = (category) => {
    // เปิด Dialog พร้อมข้อมูลหมวดหมู่ที่ต้องการแก้ไข
    // Open dialog with the selected category data
    setCategoryForm(category);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    // ตั้งค่า form เป็นค่าเริ่มต้น และเปิด Dialog สำหรับเพิ่ม
    // Reset form and open dialog for adding new category
    setCategoryForm({
      id: '',
      name: '',
      type: 'expense',
      color: '#000000',
      icon: 'Category',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // ถ้า categoryForm มี id แสดงว่าแก้ไขหมวดหมู่เก่า ถ้าไม่มีก็สร้างใหม่
    // If categoryForm has an id, update existing category; otherwise, create a new one
    if (categoryForm.id) {
      await firestore.collection('categories').doc(categoryForm.id).update({
        name: categoryForm.name,
        type: categoryForm.type,
        color: categoryForm.color,
        icon: categoryForm.icon,
      });
    } else {
      await firestore.collection('categories').add({
        userId: user.uid,
        name: categoryForm.name,
        type: categoryForm.type,
        color: categoryForm.color,
        icon: categoryForm.icon,
      });
    }
    setOpenDialog(false);
    fetchCategories();
  };

  // รายการไอคอนให้เลือก (50 ไอคอน)
  // An array of 50 icon options for user to choose from
  const iconOptions = [
    'Home',
    'ShoppingCart',
    'Fastfood',
    'LocalCafe',
    'DirectionsCar',
    'Flight',
    'Movie',
    'MusicNote',
    'FitnessCenter',
    'LocalHospital',
    'School',
    'Work',
    'Pets',
    'LocalGroceryStore',
    'LocalGasStation',
    'LocalAtm',
    'LocalLibrary',
    'Restaurant',
    'BeachAccess',
    'DirectionsBus',
    'DirectionsWalk',
    'Train',
    'LocalHotel',
    'ChildCare',
    'Palette',
    'Book',
    'LaptopMac',
    'PhoneIphone',
    'LocalParking',
    'LocalLaundryService',
    'LocalMall',
    'Casino',
    'Spa',
    'LocalPharmacy',
    'LocalShipping',
    'LocalOffer',
    'LocalPostOffice',
    'LocalFlorist',
    'LocalBar',
    'DirectionsBike',
    'DirectionsBoat',
    'LocalAirport',
    'CameraAlt',
    'Brush',
    'EventSeat',
    'HeadsetMic',
    'Keyboard',
    'VideogameAsset',
    'Watch',
    'Weekend',
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          จัดการหมวดหมู่``
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {/* เลือกประเภทหมวดหมู่เพื่อ Filter */}
          {/* Filter categories by type */}
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
          <Button variant="contained" onClick={handleAdd}>
            เพิ่มหมวดหมู่
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อหมวดหมู่</TableCell>
              <TableCell>ประเภท</TableCell>
              <TableCell>ไอคอน</TableCell>
              <TableCell>สี</TableCell>
              <TableCell>จำนวนครั้ง</TableCell>
              <TableCell>ยอดเงินรวม</TableCell>
              <TableCell>การกระทำ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => {
              // สร้าง component ของไอคอนตามชื่อ icon ใน category
              // Dynamically create icon component based on category.icon
              const IconComponent = Icons[category.icon];

              // คำนวณจำนวนธุรกรรมและยอดรวมในหมวดหมู่
              // Calculate transaction count and total amount for the category
              const categoryTransactions = transactions.filter(
                (t) => t.category === category.name && t.type === category.type
              );
              const transactionCount = categoryTransactions.length;
              const totalAmount = categoryTransactions.reduce(
                (sum, t) => sum + t.amount,
                0
              );

              return (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {category.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                  </TableCell>
                  <TableCell>
                    {IconComponent && <IconComponent />}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: category.color,
                        borderRadius: '50%',
                      }}
                    />
                  </TableCell>
                  <TableCell>{transactionCount}</TableCell>
                  <TableCell>฿{totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {/* ปุ่มแก้ไขหมวดหมู่ */}
                    {/* Edit category button */}
                    <IconButton onClick={() => handleEdit(category)}>
                      <Edit />
                    </IconButton>

                    {/* ปุ่มลบหมวดหมู่ */}
                    {/* Delete category button */}
                    <IconButton onClick={() => handleDelete(category.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Dialog สำหรับเพิ่ม/แก้ไขหมวดหมู่ */}
        {/* Dialog for adding/editing categories */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {categoryForm.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="ชื่อหมวดหมู่"
              fullWidth
              sx={{ mt: 2 }}
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={categoryForm.type}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, type: e.target.value })
                }
                label="ประเภท"
              >
                <MenuItem value="income">รายรับ</MenuItem>
                <MenuItem value="expense">รายจ่าย</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography>เลือกสี:</Typography>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, color: e.target.value })
                }
                style={{ width: '100%', height: '40px', border: 'none' }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography>เลือกไอคอน:</Typography>
              <Grid container spacing={2} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {iconOptions.map((iconName, index) => {
                  const IconComponent = Icons[iconName];
                  return (
                    <Grid item xs={2} key={index}>
                      <IconButton
                        onClick={() =>
                          setCategoryForm({ ...categoryForm, icon: iconName })
                        }
                        color={
                          categoryForm.icon === iconName ? 'primary' : 'default'
                        }
                      >
                        <IconComponent />
                      </IconButton>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Categories;
