import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Avatar,
  Box,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Divider,
  Grid,
  Chip,
  alpha,
} from '@mui/material';
import { auth, firestore, storage } from '@/lib/firebase';
import { sanitizeText, validateImageFile, sanitizeFileName } from '@/lib/validation';
import { formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';

function InfoRow({ icon, iconColor, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          bgcolor: alpha(iconColor, 0.08),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 20, color: iconColor } })}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function StatCard({ icon, iconColor, label, value }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: alpha(iconColor, 0.04),
        border: '1px solid',
        borderColor: alpha(iconColor, 0.1),
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          bgcolor: alpha(iconColor, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 18, color: iconColor } })}
      </Box>
      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', mt: 0.25 }}>{label}</Typography>
    </Box>
  );
}

function ProfilePage() {
  const [userData, setUserData] = useState({});
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, income: 0, expense: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/login'); return; }
      setDisplayName(user.displayName || '');

      try {
        const [userDoc, transSnap] = await Promise.all([
          firestore.collection('users').doc(user.uid).get(),
          firestore.collection('transactions').where('userId', '==', user.uid).get(),
        ]);

        if (userDoc.exists) setUserData(userDoc.data());

        let income = 0;
        let expense = 0;
        transSnap.docs.forEach((doc) => {
          const t = doc.data();
          if (t.type === 'income') income += t.amount;
          else if (t.type === 'expense') expense += t.amount;
        });
        setStats({ count: transSnap.size, income, expense });
      } catch (err) {
        showSnackbar(getFirebaseErrorMessage(err), 'error');
      }
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleLogout = async () => { await auth.signOut(); navigate('/login'); };

  const handleSave = async () => {
    const user = auth.currentUser; if (!user) return;
    const safeName = sanitizeText(displayName);
    if (!safeName || safeName.length > 100) { showSnackbar('ชื่อต้องมี 1-100 ตัวอักษร', 'error'); return; }
    try {
      await user.updateProfile({ displayName: safeName });
      await firestore.collection('users').doc(user.uid).update({ name: safeName });
      setEditing(false); showSnackbar('บันทึกข้อมูลเรียบร้อยแล้ว!');
    } catch (err) { showSnackbar(getFirebaseErrorMessage(err), 'error'); }
  };

  const handlePhotoUpload = async (event) => {
    const user = auth.currentUser;
    const file = event.target.files[0];
    if (!user || !file) return;
    const fileCheck = validateImageFile(file, 5);
    if (!fileCheck.valid) { showSnackbar(fileCheck.error, 'error'); return; }
    setUploading(true);
    try {
      const storageRef = storage.ref();
      const safeName = sanitizeFileName(file.name);
      const userPhotoRef = storageRef.child(`user_photos/${user.uid}/${safeName}`);
      await userPhotoRef.put(file);
      const photoURL = await userPhotoRef.getDownloadURL();
      await user.updateProfile({ photoURL });
      showSnackbar('อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว!');
    } catch (err) { showSnackbar(getFirebaseErrorMessage(err), 'error'); }
    finally { setUploading(false); }
  };

  if (loading) return <LoadingScreen />;

  const user = auth.currentUser;
  const providerIds = user?.providerData?.map((p) => p.providerId) || [];
  const getProviderLabel = () => {
    if (providerIds.includes('google.com')) return 'Google';
    if (providerIds.includes('facebook.com')) return 'Facebook';
    return 'อีเมล';
  };

  return (
    <PageContainer maxWidth="sm">
      {/* Header Card - Avatar + Name */}
      <Paper
        sx={{
          overflow: 'hidden',
          mb: 2.5,
        }}
      >
        {/* Banner */}
        <Box
          sx={{
            height: 100,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
            position: 'relative',
          }}
        />

        {/* Avatar + Name Section */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pb: 3, mt: -6, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName}
              sx={{
                width: 96,
                height: 96,
                border: '4px solid #fff',
                boxShadow: '0 4px 14px -2px rgb(0 0 0 / 0.15)',
                fontSize: '2rem',
                bgcolor: (theme) => theme.palette.primary.main,
              }}
            >
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </Avatar>
            <input accept="image/*" style={{ display: 'none' }} id="upload-photo" type="file" onChange={handlePhotoUpload} aria-label="อัปโหลดรูปโปรไฟล์" />
            <label htmlFor="upload-photo">
              <IconButton
                component="span"
                disabled={uploading}
                aria-label="เปลี่ยนรูปโปรไฟล์"
                sx={{
                  position: 'absolute',
                  bottom: 2,
                  right: -2,
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px -1px rgb(0 0 0 / 0.2)',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                {uploading ? <CircularProgress size={14} color="inherit" /> : <PhotoCamera sx={{ fontSize: 14 }} />}
              </IconButton>
            </label>
          </Box>

          {/* Name */}
          {editing ? (
            <Box sx={{ maxWidth: 300, mx: 'auto' }}>
              <TextField
                label="ชื่อ"
                fullWidth
                size="small"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                inputProps={{ maxLength: 100 }}
                autoFocus
                sx={{ mb: 1.5 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  size="small"
                  startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                >
                  บันทึก
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => { setEditing(false); setDisplayName(user?.displayName || ''); }}
                  size="small"
                  startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                >
                  ยกเลิก
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25, fontSize: '1.375rem' }}>
                {user?.displayName || 'ไม่มีชื่อ'}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 1 }}>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Chip
                  icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />}
                  label={getProviderLabel()}
                  size="small"
                  sx={{
                    fontSize: '0.6875rem',
                    height: 24,
                    bgcolor: alpha('#3b82f6', 0.08),
                    color: '#3b82f6',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#3b82f6' },
                  }}
                />
                <Button
                  size="small"
                  startIcon={<EditIcon sx={{ fontSize: 13 }} />}
                  onClick={() => setEditing(true)}
                  sx={{ fontSize: '0.75rem', color: 'text.secondary', minWidth: 'auto', px: 1 }}
                >
                  แก้ไข
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid item xs={4}>
          <Paper sx={{ border: 'none' }}>
            <StatCard
              icon={<ReceiptLongIcon />}
              iconColor="#8b5cf6"
              label="รายการทั้งหมด"
              value={stats.count.toLocaleString()}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ border: 'none' }}>
            <StatCard
              icon={<TrendingUpIcon />}
              iconColor="#22c55e"
              label="รายรับรวม"
              value={formatCurrency(stats.income)}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ border: 'none' }}>
            <StatCard
              icon={<TrendingDownIcon />}
              iconColor="#ef4444"
              label="รายจ่ายรวม"
              value={formatCurrency(stats.expense)}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Info Section */}
      <Paper sx={{ px: { xs: 3, sm: 4 }, py: 1, mb: 2.5 }}>
        <InfoRow
          icon={<EmailIcon />}
          iconColor="#3b82f6"
          label="อีเมล"
          value={user?.email}
        />
        <Divider />
        <InfoRow
          icon={<CalendarTodayIcon />}
          iconColor="#22c55e"
          label="วันที่สมัครสมาชิก"
          value={
            userData.createdAt
              ? formatDateTH(userData.createdAt)
              : user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString('th-TH')
              : '-'
          }
        />
        <Divider />
        <InfoRow
          icon={<AccountBalanceIcon />}
          iconColor="#f59e0b"
          label="ยอดคงเหลือ"
          value={formatCurrency(stats.income - stats.expense)}
        />
      </Paper>

      {/* Logout */}
      <Button
        variant="outlined"
        color="error"
        onClick={handleLogout}
        fullWidth
        startIcon={<LogoutIcon />}
        size="large"
        sx={{
          py: 1.5,
          borderColor: alpha('#ef4444', 0.3),
          '&:hover': {
            bgcolor: alpha('#ef4444', 0.04),
            borderColor: '#ef4444',
          },
        }}
      >
        ออกจากระบบ
      </Button>

      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default ProfilePage;
