import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GoogleIcon from '@mui/icons-material/Google';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import { auth, googleProvider, firestore } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { showToast } from '@/lib/swal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion } from 'framer-motion';
import { easeOutQuart } from '@/shared/utils/animations';

const MotionPaper = motion.create(Paper);

function LoginPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

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
      showToast(t('auth.invalidEmail'), 'error');
      return;
    }
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate('/dashboard');
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), 'error');
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
      navigate('/dashboard');
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      {/* Left branded panel - desktop only */}
      {!isMobile && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuart }}
          sx={{
            width: '45%',
            minHeight: '100vh',
            background: `linear-gradient(160deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)}, ${theme.palette.mode === 'dark' ? '#0c0f1a' : '#0f172a'})`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: alpha('#fff', 0.05),
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -60,
              left: -60,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: alpha('#fff', 0.04),
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              left: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: alpha('#fff', 0.03),
            }}
          />

          {/* Brand content */}
          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 400, textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '20px',
                background: alpha('#fff', 0.15),
                backdropFilter: 'blur(10px)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 36 }} />
            </Box>

            <Typography
              variant="h4"
              sx={{ color: '#fff', fontWeight: 800, mb: 2, lineHeight: 1.2 }}
            >
              Expense Tracker
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: alpha('#fff', 0.8), mb: 6, lineHeight: 1.7, fontSize: '1.05rem' }}
            >
              {t('auth.welcomeBack')}
            </Typography>

            {/* Feature highlights */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                { icon: <TrendingUpIcon />, text: 'Track spending in real-time' },
                { icon: <SavingsOutlinedIcon />, text: 'Set budgets & save smarter' },
                { icon: <BarChartIcon />, text: 'Visualize your finances' },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2.5,
                    py: 1.5,
                    borderRadius: 3,
                    background: alpha('#fff', 0.08),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: alpha('#fff', 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography sx={{ color: alpha('#fff', 0.9), fontWeight: 500, fontSize: '0.9rem' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Right form panel */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: easeOutQuart }}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          {isMobile && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
            </Box>
          )}

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', sm: '2rem' } }}
          >
            {t('auth.login')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            {t('auth.welcomeBack')}
          </Typography>

          {/* Google login - prominent position */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            disabled={loading}
            startIcon={<GoogleIcon />}
            size="large"
            sx={{
              py: 1.5,
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.9375rem',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              },
            }}
          >
            {t('auth.loginWithGoogle')}
          </Button>

          <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.8125rem' }}>
            {t('common.or')}
          </Divider>

          <form onSubmit={handleSubmit}>
            <TextField
              label={t('auth.email')}
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3.5 }}
            />
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              size="large"
              sx={{
                py: 1.5,
                fontSize: '0.9375rem',
                fontWeight: 700,
                boxShadow: `0 4px 14px -3px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px -3px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.login')}
            </Button>
          </form>

          <Typography
            align="center"
            sx={{ mt: 4, fontSize: '0.875rem', color: 'text.secondary' }}
          >
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              style={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t('auth.register')}
            </Link>
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

export default LoginPage;
