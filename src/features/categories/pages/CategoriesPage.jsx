import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  TableContainer,
  Paper,
  Chip,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { firestore, auth } from '@/lib/firebase';
import { userQuery, mapDocs } from '@/lib/db';
import { formatCurrency } from '@/lib/format';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { showToast, showConfirm } from '@/lib/swal';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import iconMap, { iconOptions } from '@/shared/constants/iconMap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/shared/utils/animations';

function MobileCategoryCard({ category, transactionCount, totalAmount, onEdit, onDelete }) {
  const { t } = useTranslation();
  const isIncome = category.type === 'income';
  const IconComponent = iconMap[category.icon];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: alpha(category.color || '#9e9e9e', 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {IconComponent ? (
            <IconComponent sx={{ color: category.color || '#9e9e9e', fontSize: 20 }} />
          ) : (
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: category.color || '#9e9e9e' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {category.name}
            </Typography>
            <Chip
              label={isIncome ? t('common.income') : t('common.expense')}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                bgcolor: isIncome ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: isIncome ? '#16a34a' : '#dc2626',
                fontWeight: 600,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {`${transactionCount} ${t('category.usageCount')} | ${formatCurrency(totalAmount)}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0 }}>
              <IconButton size="small" onClick={() => onEdit(category)} sx={{ color: 'primary.main' }}>
                <Edit sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(category.id)} sx={{ color: '#ef4444' }}>
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', type: 'expense', color: '#3b82f6', icon: 'Category' });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { fetchData(); }, [filterType]);

  const fetchData = async () => {
    setLoading(true);
    try { await Promise.all([fetchCategories(), fetchTransactions()]); }
    catch (err) { showToast(getFirebaseErrorMessage(err), 'error'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const user = auth.currentUser; if (!user) return;
    let ref = userQuery('categories', user.uid);
    if (filterType) ref = ref.where('type', '==', filterType);
    const snapshot = await ref.get();
    setCategories(mapDocs(snapshot));
  };

  const fetchTransactions = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await userQuery('transactions', user.uid).get();
    setTransactions(mapDocs(snapshot));
  };

  const handleDelete = async (id) => {
    const result = await showConfirm({
      title: t('confirm.title'),
      text: t('category.deleteConfirm'),
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
    });
    if (!result.isConfirmed) return;
    await firestore.collection('categories').doc(id).delete();
    fetchCategories();
    showToast(t('category.deleteSuccess'));
  };

  const handleSave = async () => {
    const user = auth.currentUser; if (!user) return;
    if (!categoryForm.name) { showToast(t('category.enterName'), 'error'); return; }
    try {
      if (categoryForm.id) {
        await firestore.collection('categories').doc(categoryForm.id).update({ name: categoryForm.name, type: categoryForm.type, color: categoryForm.color, icon: categoryForm.icon });
      } else {
        await firestore.collection('categories').add({ userId: user.uid, name: categoryForm.name, type: categoryForm.type, color: categoryForm.color, icon: categoryForm.icon });
      }
      setOpenDialog(false); fetchCategories();
      showToast(t('category.saveSuccess'));
    } catch (err) { showToast(getFirebaseErrorMessage(err), 'error'); }
  };

  const handleEditOpen = (category) => {
    setCategoryForm({ ...category, color: category.color || '#3b82f6', icon: category.icon || 'Category' });
    setOpenDialog(true);
  };

  if (loading) return <LoadingScreen />;

  return (
    <PageContainer title={t('category.title')} maxWidth="lg">
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 0, flex: { xs: '1 1 auto', sm: '0 0 180px' } }} size="small">
            <InputLabel>{t('common.type')}</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label={t('common.type')}>
              <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
              <MenuItem value="income">{t('common.income')}</MenuItem>
              <MenuItem value="expense">{t('common.expense')}</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => { setCategoryForm({ id: '', name: '', type: 'expense', color: '#3b82f6', icon: 'Category' }); setOpenDialog(true); }}>
            {t('category.addCategory')}
          </Button>
        </Box>
      </Paper>

      {categories.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message={t('category.noCategories')} /></Paper>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
          {categories.map((category) => {
            const categoryTransactions = transactions.filter((t) => t.category === category.name && t.type === category.type);
            return (
              <motion.div key={category.id} variants={staggerItem}>
                <MobileCategoryCard
                  category={category}
                  transactionCount={categoryTransactions.length}
                  totalAmount={categoryTransactions.reduce((sum, t) => sum + t.amount, 0)}
                  onEdit={handleEditOpen}
                  onDelete={(id) => handleDelete(id)}
                />
              </motion.div>
            );
          })}
        </Box>
      ) : (
        /* Desktop: Table layout */
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('category.categoryName')}</TableCell>
                  <TableCell>{t('common.type')}</TableCell>
                  <TableCell>{t('common.icon')}</TableCell>
                  <TableCell>{t('common.color')}</TableCell>
                  <TableCell align="right">{t('category.usageCount')}</TableCell>
                  <TableCell align="right">{t('category.totalAmount')}</TableCell>
                  <TableCell align="center">{t('common.action')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon];
                  const categoryTransactions = transactions.filter((t) => t.category === category.name && t.type === category.type);
                  return (
                    <TableRow key={category.id}>
                      <TableCell sx={{ fontWeight: 500 }}>{category.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={category.type === 'income' ? t('common.income') : t('common.expense')}
                          size="small"
                          sx={{
                            bgcolor: category.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: category.type === 'income' ? '#16a34a' : '#dc2626',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{IconComponent && <IconComponent sx={{ color: category.color || '#9e9e9e', fontSize: 20 }} />}</TableCell>
                      <TableCell>
                        <Box sx={{ width: 24, height: 24, backgroundColor: category.color || '#9e9e9e', borderRadius: '6px', border: '2px solid', borderColor: alpha(category.color || '#9e9e9e', 0.3) }} role="img" aria-label={`${t('common.color')} ${category.color || '#9e9e9e'}`} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{categoryTransactions.length}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(categoryTransactions.reduce((sum, t) => sum + t.amount, 0))}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEditOpen(category)} sx={{ color: '#3b82f6' }} aria-label={`${t('common.edit')} ${category.name}`}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(category.id)} sx={{ color: '#ef4444' }} aria-label={`${t('common.delete')} ${category.name}`}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{categoryForm.id ? t('category.editCategory') : t('category.addCategory')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField label={t('category.categoryName')} fullWidth value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('common.type')}</InputLabel>
                <Select value={categoryForm.type} onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })} label={t('common.type')}>
                  <MenuItem value="income">{t('common.income')}</MenuItem>
                  <MenuItem value="expense">{t('common.expense')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>{t('category.selectColor')}</Typography>
              <Box
                component="label"
                sx={{
                  display: 'block', width: '100%', height: 44, borderRadius: 2.5,
                  backgroundColor: categoryForm.color || '#3b82f6', border: '2px solid', borderColor: alpha(categoryForm.color || '#3b82f6', 0.3),
                  cursor: 'pointer', transition: 'all 0.15s',
                  '&:hover': { opacity: 0.85 },
                  '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                }}
              >
                <input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} aria-label={t('category.selectColorTitle')} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>{t('category.selectIcon')}</Typography>
              <Box sx={{ maxHeight: { xs: 160, sm: 220 }, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
                <Grid container spacing={0.5}>
                  {iconOptions.map((iconName) => {
                    const Ic = iconMap[iconName]; if (!Ic) return null;
                    const isSelected = categoryForm.icon === iconName;
                    return (
                      <Grid item key={iconName}>
                        <IconButton
                          onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                          size="small"
                          aria-label={iconName}
                          aria-pressed={isSelected}
                          sx={{
                            borderRadius: 2,
                            bgcolor: isSelected ? (t) => alpha(t.palette.primary.main, 0.1) : 'transparent',
                            color: isSelected ? 'primary.main' : 'text.secondary',
                            '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) },
                          }}
                        >
                          <Ic fontSize="small" />
                        </IconButton>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
}

export default CategoriesPage;
