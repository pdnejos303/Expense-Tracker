// ไฟล์ Settings.js ใช้สำหรับการตั้งค่าของผู้ใช้ เช่น สกุลเงิน, การแจ้งเตือนงบประมาณ, การแจ้งเตือนบิล
// และการเปลี่ยนสีธีมของแอป ผู้ใช้สามารถบันทึกการตั้งค่าเหล่านี้ลงใน Firestore
//
// This Settings.js file allows the user to configure app settings like currency, budget alerts,
// payment due alerts, and theme color. Settings are stored in Firestore.

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  Container,
} from '@mui/material';
import { auth, firestore } from '../firebase';

function Settings({ setThemeColor }) {
  // เก็บสถานะข้อมูลผู้ใช้, การตั้งค่า currency, alerts, themeColor, และ Snackbar
  // Storing user data, currency, alerts, theme color, and snackbar states
  const [userData, setUserData] = useState({});
  const [currency, setCurrency] = useState('');
  const [budgetAlerts, setBudgetAlerts] = useState(false);
  const [paymentDueAlerts, setPaymentDueAlerts] = useState(false);
  const [themeColorState, setThemeColorState] = useState('#4caf50');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // รายการสกุลเงินและสีธีมที่รองรับ
  // Supported currencies and theme colors
  const currencies = ['THB', 'USD', 'EUR', 'JPY'];
  const themeColors = [
    { name: 'สีแดง', color: '#f44336' },
    { name: 'สีชมพู', color: '#e91e63' },
    { name: 'สีม่วง', color: '#9c27b0' },
    { name: 'สีม่วงคราม', color: '#673ab7' },
    { name: 'สีน้ำเงิน', color: '#3f51b5' },
    { name: 'สีฟ้า', color: '#2196f3' },
    { name: 'สีเขียว', color: '#4caf50' },
    { name: 'สีเหลือง', color: '#ffeb3b' },
    { name: 'สีส้ม', color: '#ff9800' },
    { name: 'สีน้ำตาล', color: '#795548' },
  ];

  useEffect(() => {
    // โหลดข้อมูลผู้ใช้จาก Firestore เพื่อแสดงการตั้งค่าปัจจุบัน
    // Load user settings from Firestore
    const user = auth.currentUser;
    if (user) {
      const userDocRef = firestore.collection('users').doc(user.uid);
      userDocRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setUserData(data);
          setCurrency(data.currency || 'THB');
          setBudgetAlerts(data.budgetAlerts || false);
          setPaymentDueAlerts(data.paymentDueAlerts || false);
          setThemeColorState(data.themeColor || '#4caf50');
        } else {
          // ถ้ายังไม่มีเอกสารผู้ใช้ ให้สร้างใหม่
          userDocRef.set({
            name: user.displayName || '',
            email: user.email || '',
            currency: 'THB',
            budgetAlerts: false,
            paymentDueAlerts: false,
            themeColor: '#4caf50',
            createdAt: new Date(),
          });
        }
      });
    }
  }, []);

  const handleSaveSettings = async () => {
    // บันทึกการตั้งค่าลง Firestore และเปลี่ยนสีธีมของแอป
    // Save settings to Firestore and update the app theme color
    const user = auth.currentUser;
    if (user) {
      const userDocRef = firestore.collection('users').doc(user.uid);
      await userDocRef.update({
        currency,
        budgetAlerts,
        paymentDueAlerts,
        themeColor: themeColorState,
      });
      setThemeColor(themeColorState);
      localStorage.setItem('themeColor', themeColorState);
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          การตั้งค่า
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>สกุลเงิน</InputLabel>
          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            label="สกุลเงิน"
          >
            {currencies.map((curr, index) => (
              <MenuItem key={index} value={curr}>
                {curr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
            />
          }
          label="แจ้งเตือนเมื่อใกล้ถึงงบประมาณที่ตั้งไว้"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={paymentDueAlerts}
              onChange={(e) => setPaymentDueAlerts(e.target.checked)}
            />
          }
          label="แจ้งเตือนวันครบกำหนดชำระหนี้หรือบิล"
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>สีธีม</InputLabel>
          <Select
            value={themeColorState}
            onChange={(e) => setThemeColorState(e.target.value)}
            label="สีธีม"
          >
            {themeColors.map((theme, index) => (
              <MenuItem key={index} value={theme.color}>
                {theme.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          sx={{ mt: 2 }}
        >
          บันทึกการตั้งค่า
        </Button>
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
            บันทึกการตั้งค่าเรียบร้อยแล้ว!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Settings;
