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
import { firestore, auth } from '@/lib/firebase';
import { toSeconds, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import QuickAddCategoryDialog from '@/shared/components/QuickAddCategoryDialog';

const PAGE_SIZE = 20;

function MobileHistoryCard({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: isIncome ? alpha('#22c55e', 0.1) : alpha('#ef4444', 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isIncome ? '#16a34a' : '#dc2626' }}>
          {isIncome ? '+' : '-'}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1 }}>
            {transaction.category}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: isIncome ? '#22c55e' : '#ef4444', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {formatDateTH(transaction.date)}
            </Typography>
            {transaction.note && (
              <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {transaction.note}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => onDelete(transaction.id)} sx={{ color: '#ef4444' }}>
            <Delete sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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
    let ref = firestore.collection('transactions').where('userId', '==', user.uid);
    if (filterType) ref = ref.where('type', '==', filterType);
    if (filterCategory) ref = ref.where('category', '==', filterCategory);
    if (startDate) ref = ref.where('date', '>=', new Date(startDate));
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); ref = ref.where('date', '<=', end); }
    try {
      const snapshot = await ref.get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => toSeconds(b.date) - toSeconds(a.date));
      setTransactions(data); setPage(0);
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await firestore.collection('categories').where('userId', '==', user.uid).get();
    setCategories(snapshot.docs.map((doc) => doc.data()));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await firestore.collection('transactions').doc(deleteId).delete();
    fetchTransactions(); setDeleteDialog(false); setDeleteId(null);
    showSnackbar('ลบรายการเรียบร้อยแล้ว!');
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
    <PageContainer title="ประวัติการทำรายการ">
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl sx={{ minWidth: 0, flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 150px' } }} size="small">
            <InputLabel>ประเภท</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="ประเภท">
              <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 0.5, flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 auto' } }}>
            <FormControl sx={{ minWidth: 0, flex: 1 }} size="small">
              <InputLabel>หมวดหมู่</InputLabel>
              <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="หมวดหมู่">
                <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
                {categories.map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
              </Select>
            </FormControl>
            <IconButton
              onClick={() => setQuickAddOpen(true)}
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, alignSelf: 'stretch', width: 40 }}
              aria-label="เพิ่มหมวดหมู่ใหม่"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          <TextField label="วันที่เริ่มต้น" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={dateInputSx} />
          <TextField label="วันที่สิ้นสุด" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={dateInputSx} />
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message="ไม่พบรายการ" /></Paper>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {paginatedTransactions.map((transaction) => (
              <MobileHistoryCard
                key={transaction.id}
                transaction={transaction}
                onDelete={(id) => { setDeleteId(id); setDeleteDialog(true); }}
              />
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
              labelRowsPerPage="ต่อหน้า"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
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
                  <TableCell>วันที่</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell align="right">จำนวนเงิน</TableCell>
                  <TableCell>หมายเหตุ</TableCell>
                  <TableCell align="center">การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{formatDateTH(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
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
                      <IconButton size="small" onClick={() => { setDeleteId(transaction.id); setDeleteDialog(true); }} sx={{ color: '#ef4444' }} aria-label={`ลบ ${transaction.category}`}>
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
            labelRowsPerPage="แสดงต่อหน้า"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          />
        </Paper>
      )}

      <QuickAddCategoryDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => fetchCategories()}
      />
      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} message="คุณต้องการลบรายการนี้หรือไม่?" />
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default HistoryPage;
