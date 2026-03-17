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
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { firestore, auth } from '@/lib/firebase';
import { toSeconds, formatDateTH } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const debounceRef = useRef(null);

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

  return (
    <PageContainer title="ประวัติการทำรายการ">
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: { xs: 0, sm: 150 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }} size="small">
            <InputLabel>ประเภท</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="ประเภท">
              <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: { xs: 0, sm: 150 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }} size="small">
            <InputLabel>หมวดหมู่</InputLabel>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="หมวดหมู่">
              <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
              {categories.map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField label="วันที่เริ่มต้น" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' }, '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} />
          <TextField label="วันที่สิ้นสุด" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' }, '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} />
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message="ไม่พบรายการ" /></Paper>
      ) : (
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

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} message="คุณต้องการลบรายการนี้หรือไม่?" />
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default HistoryPage;
