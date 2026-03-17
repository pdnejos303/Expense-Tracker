import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { firestore, storage, auth } from '@/lib/firebase';
import { sanitizeText, validateImageFile, sanitizeFileName } from '@/lib/validation';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { suggestCategory } from '@/lib/openai';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import PageContainer from '@/shared/components/PageContainer';
import QuickAddCategoryDialog from '@/shared/components/QuickAddCategoryDialog';

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
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // AI categorization
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchCategories = async (selectName) => {
    const user = auth.currentUser;
    if (!user) return;
    const snapshot = await firestore
      .collection('categories')
      .where('userId', '==', user.uid)
      .where('type', '==', type)
      .get();
    setCategories(snapshot.docs.map((doc) => doc.data()));
    if (selectName) setCategory(selectName);
    else setCategory('');
  };

  useEffect(() => { fetchCategories(); }, [type]);

  // Debounced AI suggestion when note changes
  useEffect(() => {
    if (!note.trim() || note.length < 3 || categories.length === 0) {
      setAiSuggestion(null);
      return;
    }
    const timer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const suggestion = await suggestCategory(
          note,
          categories.map((c) => c.name),
          type,
        );
        setAiSuggestion(suggestion);
      } catch {
        setAiSuggestion(null);
      } finally {
        setAiLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [note, categories, type]);

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
      setNote(''); setReceipt(null); setAiSuggestion(null);
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
            <Grid item xs={12}>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, val) => { if (val) setType(val); }}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textTransform: 'none',
                    gap: 1,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      borderColor: 'transparent',
                    },
                  },
                }}
              >
                <ToggleButton
                  value="expense"
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(239,68,68,0.1)',
                      color: '#dc2626',
                      '&:hover': { bgcolor: 'rgba(239,68,68,0.15)' },
                    },
                  }}
                >
                  <TrendingDownIcon fontSize="small" />
                  รายจ่าย
                </ToggleButton>
                <ToggleButton
                  value="income"
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(34,197,94,0.1)',
                      color: '#16a34a',
                      '&:hover': { bgcolor: 'rgba(34,197,94,0.15)' },
                    },
                  }}
                >
                  <TrendingUpIcon fontSize="small" />
                  รายรับ
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)} label="หมวดหมู่">
                    {categories.length === 0 && (
                      <MenuItem disabled>ไม่มีหมวดหมู่</MenuItem>
                    )}
                    {categories.map((cat, index) => (
                      <MenuItem key={index} value={cat.name}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setQuickAddOpen(true)}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, alignSelf: 'stretch', width: 56 }}
                  aria-label="เพิ่มหมวดหมู่ใหม่"
                >
                  <AddIcon />
                </IconButton>
              </Box>
              {/* AI Category Suggestion */}
              {(aiSuggestion || aiLoading) && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {aiLoading ? (
                    <>
                      <CircularProgress size={14} />
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        AI กำลังวิเคราะห์...
                      </Typography>
                    </>
                  ) : aiSuggestion ? (
                    <>
                      <AutoFixHighIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        AI แนะนำ:
                      </Typography>
                      <Chip
                        label={aiSuggestion}
                        size="small"
                        onClick={() => setCategory(aiSuggestion)}
                        sx={{
                          fontSize: '0.75rem',
                          height: 24,
                          bgcolor: alpha('#8b5cf6', 0.1),
                          color: '#7c3aed',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: alpha('#8b5cf6', 0.2) },
                        }}
                      />
                    </>
                  ) : null}
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
                helperText={note.length >= 3 ? 'AI จะแนะนำหมวดหมู่อัตโนมัติจากหมายเหตุ' : ''}
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
      <QuickAddCategoryDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultType={type}
        onCreated={(name, createdType) => {
          if (createdType === type) fetchCategories(name);
          else fetchCategories();
        }}
      />
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default AddTransactionPage;
