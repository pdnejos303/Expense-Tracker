import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  alpha,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { auth, googleProvider, facebookProvider, firestore } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createUserDocument = async (user) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate('/');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await auth.signInWithPopup(googleProvider);
      const user = result.user;
      if (user && result.additionalUserInfo?.profile) {
        const profile = result.additionalUserInfo.profile;
        await user.updateProfile({ displayName: profile.name, photoURL: profile.picture });
        await user.reload();
      }
      await createUserDocument(user);
      navigate('/');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const result = await auth.signInWithPopup(facebookProvider);
      const user = result.user;
      if (user && result.additionalUserInfo?.profile) {
        const profile = result.additionalUserInfo.profile;
        await user.updateProfile({ displayName: profile.name, photoURL: profile.picture?.data?.url });
        await user.reload();
      }
      await createUserDocument(user);
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
        {/* Logo */}
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
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ยินดีต้อนรับกลับมา จัดการการเงินของคุณ
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.8125rem' }}>หรือ</Divider>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.25,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
            }}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleFacebookLogin}
            disabled={loading}
            startIcon={<FacebookIcon />}
            sx={{
              py: 1.25,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
            }}
          >
            Facebook
          </Button>
        </Box>

        <Typography align="center" sx={{ mt: 3, fontSize: '0.875rem', color: 'text.secondary' }}>
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" style={{ color: 'inherit', fontWeight: 600 }}>
            สมัครสมาชิก
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

export default LoginPage;
