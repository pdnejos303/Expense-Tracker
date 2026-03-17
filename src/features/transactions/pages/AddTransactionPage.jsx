import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Grid,
  Paper,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { firestore, storage, auth } from '@/lib/firebase';
import { sanitizeText, validateImageFile, sanitizeFileName } from '@/lib/validation';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import PageContainer from '@/shared/components/PageContainer';

function AddTransactionPage() {
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [categories, setCategories] = useState([]);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await firestore
        .collection('categories')
        .where('userId', '==', user.uid)
        .where('type', '==', type)
        .get();
      setCategories(snapshot.docs.map((doc) => doc.data()));
      setCategory('');
    };
    fetchCategories();
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    if (!date) { showSnackbar('กรุณากรอกวันที่', 'error'); return; }
    if (!category) { showSnackbar('กรุณาเลือกหมวดหมู่', 'error'); return; }
    if (!amount || parseFloat(amount) <= 0) { showSnackbar('กรุณากรอกจำนวนเงินที่ถูกต้อง', 'error'); return; }

    setSubmitting(true);
    try {
      let receiptUrl = '';
      if (receipt) {
        const fileCheck = validateImageFile(receipt, 2);
        if (!fileCheck.valid) { showSnackbar(fileCheck.error, 'error'); setSubmitting(false); return; }
        const storageRef = storage.ref();
        const safeName = sanitizeFileName(receipt.name);
        const receiptRef = storageRef.child(`receipts/${user.uid}/${Date.now()}_${safeName}`);
        await receiptRef.put(receipt);
        receiptUrl = await receiptRef.getDownloadURL();
      }

      const sanitizedNote = sanitizeText(note);
      await firestore.collection('transactions').add({
        userId: user.uid, type, category, amount: parseFloat(amount),
        date: new Date(date), note: sanitizedNote, receiptUrl, createdAt: new Date(),
      });
      await firestore.collection('history').add({
        userId: user.uid,
        action: `เพิ่มรายการ ${type === 'income' ? 'รายรับ' : 'รายจ่าย'} หมวดหมู่ ${category} จำนวน ${amount} บาท`,
        timestamp: new Date(),
      });

      setType('expense'); setCategory(''); setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote(''); setReceipt(null);
      showSnackbar('เพิ่มรายการเรียบร้อยแล้ว!');
    } catch (err) {
      showSnackbar(getFirebaseErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="เพิ่มรายการรายรับ-รายจ่าย" maxWidth="md">
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>ประเภท</InputLabel>
                <Select value={type} onChange={(e) => setType(e.target.value)} label="ประเภท">
                  <MenuItem value="income">รายรับ</MenuItem>
                  <MenuItem value="expense">รายจ่าย</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                หมวดหมู่
              </Typography>
              {categories.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  ไม่มีหมวดหมู่ กรุณาเพิ่มในหน้าหมวดหมู่
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map((cat, index) => (
                    <Chip
                      key={index}
                      label={cat.name}
                      onClick={() => setCategory(cat.name)}
                      variant={category === cat.name ? 'filled' : 'outlined'}
                      color={category === cat.name ? 'primary' : 'default'}
                      sx={{
                        fontWeight: category === cat.name ? 600 : 400,
                        cursor: 'pointer',
                        px: 0.5,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="จำนวนเงิน"
                type="number"
                fullWidth
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="วันที่"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{
                  '& input[type="date"]': { cursor: 'pointer' },
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="หมายเหตุ"
                multiline
                rows={3}
                fullWidth
                value={note}
                onChange={(e) => setNote(e.target.value)}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderStyle: 'dashed',
                  py: 1.5,
                  px: 3,
                  color: 'text.secondary',
                  borderColor: '#cbd5e1',
                  '&:hover': { borderColor: 'primary.main', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
                }}
              >
                อัปโหลดใบเสร็จ
                <input type="file" hidden accept="image/*" onChange={(e) => setReceipt(e.target.files[0])} aria-label="เลือกไฟล์ใบเสร็จ" />
              </Button>
              {receipt && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {receipt.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
                size="large"
                startIcon={<SaveIcon />}
                sx={{ px: 4 }}
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default AddTransactionPage;
