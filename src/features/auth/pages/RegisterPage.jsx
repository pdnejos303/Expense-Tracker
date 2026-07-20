import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, firestore } from '@/lib/firebase';
import { sanitizeText } from '@/lib/validation';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { showToast } from '@/lib/swal';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion } from 'framer-motion';
import { easeOutQuart } from '@/shared/utils/animations';

function RegisterPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [name, setName] = useState('');
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

  const passwordChecks = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const safeName = sanitizeText(name);
    if (!safeName || safeName.length > 100) {
      showToast(t('auth.nameLength'), 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast(t('auth.invalidEmail'), 'error');
      return;
    }
    if (!passwordChecks.length || !passwordChecks.letter || !passwordChecks.number) {
      showToast(t('auth.weakPassword'), 'error');
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
              {t('auth.createAccount')}
            </Typography>

            {/* Benefits */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                { icon: <CheckCircleOutlineIcon />, text: 'Free to use, no hidden fees' },
                { icon: <SecurityOutlinedIcon />, text: 'Secure & private by default' },
                { icon: <DevicesOutlinedIcon />, text: 'Access from any device' },
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
            {t('auth.register')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            {t('auth.createAccount')}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label={t('auth.name')}
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{ maxLength: 100 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2.5 }}
            />
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
              sx={{ mb: 1.5 }}
            />

            {/* Password strength indicators */}
            {password.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {[
                  { check: passwordChecks.length, label: '8+ chars' },
                  { check: passwordChecks.letter, label: 'Letters' },
                  { check: passwordChecks.number, label: 'Numbers' },
                ].map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: item.check ? 'success.main' : 'text.disabled',
                        transition: 'background-color 0.2s',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: item.check ? 'success.main' : 'text.disabled',
                        fontWeight: 500,
                        transition: 'color 0.2s',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {password.length === 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                {t('auth.passwordHint')}
              </Typography>
            )}

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
              {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.register')}
            </Button>
          </form>

          <Typography
            align="center"
            sx={{ mt: 4, fontSize: '0.875rem', color: 'text.secondary' }}
          >
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              style={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t('auth.login')}
            </Link>
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

export default RegisterPage;
