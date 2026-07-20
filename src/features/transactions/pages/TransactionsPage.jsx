import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  TableContainer,
  Paper,
  TablePagination,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { firestore, auth } from '@/lib/firebase';
import { userQuery, mapDocs } from '@/lib/db';
import { toSeconds, formatDateTH, formatDateISO } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { showToast, showConfirm } from '@/lib/swal';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import QuickAddCategoryDialog from '@/shared/components/QuickAddCategoryDialog';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/shared/utils/animations';
import TransactionCard from '@/shared/components/TransactionCard';

const PAGE_SIZE = 20;

function TransactionsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', type: 'expense', category: '', amount: '', date: '', note: '' });
  const [categories, setCategories] = useState([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { fetchData(); }, [filterType]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      let transactionsRef = userQuery('transactions', user.uid);
      if (filterType) transactionsRef = transactionsRef.where('type', '==', filterType);
      const snapshot = await transactionsRef.get();
      const data = mapDocs(snapshot);
      data.sort((a, b) => toSeconds(b.date) - toSeconds(a.date));
      setTransactions(data);
      setPage(0);
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (type) => {
    const user = auth.currentUser;
    if (!user) return;
    const snapshot = await userQuery('categories', user.uid).where('type', '==', type).get();
    setCategories(snapshot.docs.map((doc) => doc.data()));
  };

  const handleDelete = async (id) => {
    const result = await showConfirm({
      title: t('confirm.title'),
      text: t('confirm.message'),
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
    });
    if (!result.isConfirmed) return;
    const user = auth.currentUser;
    const transaction = transactions.find((tx) => tx.id === id);
    await firestore.collection('transactions').doc(id).delete();
    await firestore.collection('history').add({
      userId: user.uid,
      action: `ลบรายการ ${transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'} หมวดหมู่ ${transaction.category} จำนวน ${transaction.amount} บาท`,
      timestamp: new Date(),
    });
    setTransactions(transactions.filter((tx) => tx.id !== id));
    showToast(t('transaction.deleteSuccess'));
  };

  const handleEditOpen = async (transaction) => {
    await fetchCategories(transaction.type);
    setEditForm({
      id: transaction.id, type: transaction.type, category: transaction.category,
      amount: transaction.amount.toString(), date: formatDateISO(transaction.date), note: transaction.note || '',
    });
    setEditDialog(true);
  };

  const handleEditSave = async () => {
    try {
      await firestore.collection('transactions').doc(editForm.id).update({
        type: editForm.type, category: editForm.category,
        amount: parseFloat(editForm.amount), date: new Date(editForm.date), note: editForm.note,
      });
      await firestore.collection('history').add({
        userId: auth.currentUser.uid,
        action: `แก้ไขรายการ ${editForm.type === 'income' ? 'รายรับ' : 'รายจ่าย'} หมวดหมู่ ${editForm.category} จำนวน ${editForm.amount} บาท`,
        timestamp: new Date(),
      });
      setEditDialog(false);
      fetchData();
      showToast(t('transaction.editSuccess'));
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), 'error');
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    t.category?.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  const paginatedTransactions = filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <PageContainer title={t('transaction.allRecords')}>
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl sx={{ minWidth: 0, flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 180px' } }} size="small">
            <InputLabel>{t('transaction.filterByType')}</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label={t('transaction.filterByType')}>
              <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
              <MenuItem value="income">{t('common.income')}</MenuItem>
              <MenuItem value="expense">{t('common.expense')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t('transaction.searchCategory')}
            size="small"
            value={searchKeyword}
            onChange={(e) => { setSearchKeyword(e.target.value); setPage(0); }}
            sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 200px' } }}
          />
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message={t('transaction.noResults')} /></Paper>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
            {paginatedTransactions.map((transaction) => (
              <motion.div key={transaction.id} variants={staggerItem}>
                <TransactionCard
                  transaction={transaction}
                  actions={
                    <>
                      <IconButton size="small" onClick={() => handleEditOpen(transaction)} sx={{ color: 'primary.main' }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(transaction.id)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </>
                  }
                />
              </motion.div>
            ))}
          </Box>
          <Paper sx={{ mt: 1.5 }}>
            <TablePagination
              component="div"
              count={filteredTransactions.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage={t('common.rowsPerPage')}
              labelDisplayedRows={({ from, to, count }) => t('common.paginationOf', { from, to, count })}
            />
          </Paper>
        </>
      ) : (
        /* Desktop: Table layout */
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.type')}</TableCell>
                  <TableCell>{t('common.category')}</TableCell>
                  <TableCell align="right">{t('common.amount')}</TableCell>
                  <TableCell>{t('common.date')}</TableCell>
                  <TableCell>{t('common.note')}</TableCell>
                  <TableCell>{t('common.receipt')}</TableCell>
                  <TableCell align="center">{t('common.action')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'income' ? t('common.income') : t('common.expense')}
                        size="small"
                        sx={{
                          bgcolor: transaction.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: transaction.type === 'income' ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{transaction.category}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{formatDateTH(transaction.date)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {transaction.note}
                    </TableCell>
                    <TableCell>
                      {transaction.receiptUrl && (
                        <Button component="a" href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{ fontSize: '0.75rem' }} aria-label={`${t('transaction.viewReceipt')} ${transaction.category}`}>
                          {t('transaction.viewReceipt')}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditOpen(transaction)} sx={{ color: '#3b82f6' }} aria-label={`${t('common.edit')} ${transaction.category}`}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(transaction.id)} sx={{ color: '#ef4444' }} aria-label={`${t('common.delete')} ${transaction.category}`}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredTransactions.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage={t('common.rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) => t('common.paginationOf', { from, to, count })}
          />
        </Paper>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('transaction.editTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('common.type')}</InputLabel>
                <Select value={editForm.type} onChange={async (e) => { const t = e.target.value; setEditForm({ ...editForm, type: t, category: '' }); await fetchCategories(t); }} label={t('common.type')}>
                  <MenuItem value="income">{t('common.income')}</MenuItem>
                  <MenuItem value="expense">{t('common.expense')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('common.category')}</InputLabel>
                  <Select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} label={t('common.category')}>
                    {categories.map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setQuickAddOpen(true)}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, alignSelf: 'stretch', width: { xs: 48, sm: 56 } }}
                  aria-label={t('category.addNew')}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t('common.amount')} type="number" fullWidth value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t('common.date')} type="date" fullWidth InputLabelProps={{ shrink: true }} value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} sx={{ '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('common.note')} fullWidth multiline rows={2} value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 1 }}>
          <Button onClick={() => setEditDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleEditSave} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <QuickAddCategoryDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultType={editForm.type}
        onCreated={async (name, createdType) => {
          await fetchCategories(createdType);
          if (createdType === editForm.type) setEditForm((f) => ({ ...f, category: name }));
        }}
      />
    </PageContainer>
  );
}

export default TransactionsPage;
