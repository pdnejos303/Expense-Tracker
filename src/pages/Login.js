// ไฟล์ Login.js ใช้สำหรับการเข้าสู่ระบบด้วยอีเมล/รหัสผ่าน หรือใช้ Google/Facebook Login
// This Login.js file handles user login via email/password or Google/Facebook authentication.

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { auth, googleProvider, facebookProvider, firestore } from '../firebase';

function Login({ setUser }) {
  // จัดการสถานะอีเมลและรหัสผ่านสำหรับฟอร์มล็อกอิน
  // Manage email and password states for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const createUserDocument = async (user) => {
    // สร้างหรืออัปเดตเอกสารผู้ใช้ใน Firestore หากยังไม่มี
    // Create or update user document in Firestore if it doesn't exist
    const userDocRef = firestore.collection('users').doc(user.uid);
    const doc = await userDocRef.get();
    if (!doc.exists) {
      await userDocRef.set({
        name: user.displayName || '',
        email: user.email,
        currency: 'THB',
        budgetAlerts: false,
        paymentDueAlerts: false,
        createdAt: new Date(),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ตรวจสอบรูปแบบอีเมล
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      alert('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // ล็อกอินด้วยอีเมล/รหัสผ่าน
    // Sign in with email/password
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        setUser(userCredential.user); // อัปเดตสถานะผู้ใช้ใน App.js
        navigate('/');
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleGoogleLogin = () => {
    // ล็อกอินด้วย Google
    // Sign in with Google
    auth
      .signInWithPopup(googleProvider)
      .then(async (result) => {
        const user = result.user;

        // อัปเดตโปรไฟล์ของผู้ใช้ด้วยข้อมูลจาก Google
        // Update user's profile with Google info
        if (user) {
          const additionalUserInfo = result.additionalUserInfo;
          if (additionalUserInfo && additionalUserInfo.profile) {
            const profile = additionalUserInfo.profile;
            const photoURL = profile.picture;
            const displayName = profile.name;

            await user.updateProfile({
              displayName: displayName,
              photoURL: photoURL,
            });
            await user.reload();
            setUser(auth.currentUser);
          }
        }

        await createUserDocument(user);
        navigate('/');
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleFacebookLogin = () => {
    // ล็อกอินด้วย Facebook
    // Sign in with Facebook
    auth
      .signInWithPopup(facebookProvider)
      .then(async (result) => {
        const user = result.user;

        // อัปเดตโปรไฟล์ของผู้ใช้ด้วยข้อมูลจาก Facebook
        // Update user's profile with Facebook info
        if (user) {
          const additionalUserInfo = result.additionalUserInfo;
          if (additionalUserInfo && additionalUserInfo.profile) {
            const profile = additionalUserInfo.profile;
            const photoURL = profile.picture?.data?.url;
            const displayName = profile.name;

            await user.updateProfile({
              displayName: displayName,
              photoURL: photoURL,
            });
            await user.reload();
            setUser(auth.currentUser);
          }
        }

        await createUserDocument(user);
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
          เข้าสู่ระบบ
        </Typography>
        <form onSubmit={handleSubmit}>
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
            เข้าสู่ระบบ
          </Button>
        </form>
        <Divider sx={{ my: 3 }}>หรือ</Divider>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton color="primary" onClick={handleGoogleLogin}>
            <GoogleIcon fontSize="large" />
          </IconButton>
          <IconButton color="primary" onClick={handleFacebookLogin}>
            <FacebookIcon fontSize="large" />
          </IconButton>
        </Box>
        <Typography align="center" sx={{ mt: 2 }}>
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
