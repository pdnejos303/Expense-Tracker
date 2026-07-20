import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  TextField,
  Box,
  Chip,
  TableContainer,
  Paper,
  TablePagination,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete, Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { firestore, auth } from '@/lib/firebase';
import { userQuery, mapDocs } from '@/lib/db';
import { toSeconds, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { showToast, showConfirm } from '@/lib/swal';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import QuickAddCategoryDialog from '@/shared/components/QuickAddCategoryDialog';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/shared/utils/animations';

const PAGE_SIZE = 20;

function HistoryPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const debounceRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchTransactions(); }, 300);
  }, [filterType, filterCategory, startDate, endDate]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    debouncedFetch();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [debouncedFetch]);

  const fetchTransactions = async () => {
    const user = auth.currentUser; if (!user) return;
    setLoading(true);
    let ref = userQuery('transactions', user.uid);
    if (filterType) ref = ref.where('type', '==', filterType);
    if (filterCategory) ref = ref.where('category', '==', filterCategory);
    if (startDate) ref = ref.where('date', '>=', new Date(startDate));
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); ref = ref.where('date', '<=', end); }
    try {
      const snapshot = await ref.get();
      const data = mapDocs(snapshot);
      data.sort((a, b) => toSeconds(b.date) - toSeconds(a.date));
      setTransactions(data); setPage(0);
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await userQuery('categories', user.uid).get();
    setCategories(snapshot.docs.map((doc) => doc.data()));
  };

  const handleDelete = async (id) => {
    const result = await showConfirm({
      title: t('confirm.title'),
      text: t('history.deleteConfirm'),
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
    });
    if (!result.isConfirmed) return;
    await firestore.collection('transactions').doc(id).delete();
    fetchTransactions();
    showToast(t('transaction.deleteSuccess'));
  };

  const paginatedTransactions = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const dateInputSx = {
    flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' },
    '& input[type="date"]': { cursor: 'pointer' },
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer',
    },
  };

  return (
    <PageContainer title={t('history.title')}>
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl sx={{ minWidth: 0, flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 150px' } }} size="small">
            <InputLabel>{t('history.filterByType')}</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label={t('history.filterByType')}>
              <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
              <MenuItem value="income">{t('common.income')}</MenuItem>
              <MenuItem value="expense">{t('common.expense')}</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 0.5, flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' } }}>
            <FormControl sx={{ minWidth: 0, flex: 1 }} size="small">
              <InputLabel>{t('history.filterByCategory')}</InputLabel>
              <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label={t('history.filterByCategory')}>
                <MenuItem value=""><em>{t('common.all')}</em></MenuItem>
                {categories.map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
              </Select>
            </FormControl>
            <IconButton
              onClick={() => setQuickAddOpen(true)}
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, alignSelf: 'stretch', width: 40 }}
              aria-label={t('category.addNew')}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          <TextField label={t('history.startDate')} type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={dateInputSx} />
          <TextField label={t('history.endDate')} type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={dateInputSx} />
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message={t('history.noResults')} /></Paper>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
            {paginatedTransactions.map((transaction) => (
              <motion.div key={transaction.id} variants={staggerItem}>
                <TransactionCard
                  transaction={transaction}
                  actions={
                    <IconButton size="small" onClick={() => handleDelete(transaction.id)} sx={{ color: '#ef4444' }}>
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                  }
                />
              </motion.div>
            ))}
          </Box>
          <Paper sx={{ mt: 1.5 }}>
            <TablePagination
              component="div"
              count={transactions.length}
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
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.date')}</TableCell>
                  <TableCell>{t('common.type')}</TableCell>
                  <TableCell>{t('common.category')}</TableCell>
                  <TableCell align="right">{t('common.amount')}</TableCell>
                  <TableCell>{t('common.note')}</TableCell>
                  <TableCell align="center">{t('common.action')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{formatDateTH(transaction.date)}</TableCell>
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
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {transaction.note}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleDelete(transaction.id)} sx={{ color: '#ef4444' }} aria-label={`${t('common.delete')} ${transaction.category}`}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={transactions.length}
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

      <QuickAddCategoryDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => fetchCategories()}
      />
    </PageContainer>
  );
}

export default HistoryPage;
