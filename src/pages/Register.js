// ไฟล์ Register.js สำหรับสมัครสมาชิกด้วยอีเมลและรหัสผ่าน สร้างข้อมูลผู้ใช้ใน Firestore
// This Register.js file handles user registration with email and password, and stores user data in Firestore.

import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  // จัดเก็บข้อมูลผู้ใช้ที่กรอกจากฟอร์มสมัครสมาชิก
  // Store user input (name, email, password) from registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ตรวจสอบรูปแบบอีเมล
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      alert('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // สร้างผู้ใช้ใหม่ด้วยอีเมลและรหัสผ่าน
    // Create new user with email and password
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        // อัปเดตโปรไฟล์ด้วยชื่อที่กำหนด
        // Update user profile with the provided name
        await user.updateProfile({ displayName: name });

        // บันทึกข้อมูลผู้ใช้ลง Firestore
        // Save user data to Firestore
        await firestore.collection('users').doc(user.uid).set({
          name,
          email,
          currency: 'THB',
          budgetAlerts: false,
          paymentDueAlerts: false,
          createdAt: new Date(),
        });
        navigate('/');
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          สมัครสมาชิก
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="ชื่อ"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="อีเมล"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 3 }}
          >
            สมัครสมาชิก
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Register;
