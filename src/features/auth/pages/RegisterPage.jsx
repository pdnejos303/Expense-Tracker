import React, { useState } from 'react';
import { auth, firestore } from '@/lib/firebase';
import { sanitizeText } from '@/lib/validation';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const safeName = sanitizeText(name);
    if (!safeName || safeName.length > 100) {
      setError('ชื่อต้องมี 1-100 ตัวอักษร');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await user.updateProfile({ displayName: safeName });
      await firestore.collection('users').doc(user.uid).set({
        name: safeName,
        email,
        currency: 'THB',
        budgetAlerts: false,
        paymentDueAlerts: false,
        createdAt: new Date(),
      });
      navigate('/');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            สมัครสมาชิก
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            สร้างบัญชีเพื่อเริ่มจัดการการเงินของคุณ
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="ชื่อ"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 100 }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="อีเมล"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="อย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข"
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={loading}
            size="large"
            sx={{ py: 1.5, fontSize: '0.9375rem' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'สมัครสมาชิก'}
          </Button>
        </form>

        <Typography align="center" sx={{ mt: 3, fontSize: '0.875rem', color: 'text.secondary' }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>
            เข้าสู่ระบบ
          </Link>
        </Typography>
      </Paper>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RegisterPage;
