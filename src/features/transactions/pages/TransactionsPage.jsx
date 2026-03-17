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
} from '@mui/material';
import { firestore, auth } from '@/lib/firebase';
import { toSeconds, formatDateTH, formatDateISO } from '@/lib/timestamp';
import { formatCurrency } from '@/lib/format';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const PAGE_SIZE = 20;

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', type: 'expense', category: '', amount: '', date: '', note: '' });
  const [categories, setCategories] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchData(); }, [filterType]);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      let transactionsRef = firestore.collection('transactions').where('userId', '==', user.uid);
      if (filterType) transactionsRef = transactionsRef.where('type', '==', filterType);
      const snapshot = await transactionsRef.get();
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      data.sort((a, b) => toSeconds(b.date) - toSeconds(a.date));
      setTransactions(data);
      setPage(0);
    } catch (err) {
      showSnackbar(getFirebaseErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (type) => {
    const user = auth.currentUser;
    if (!user) return;
    const snapshot = await firestore.collection('categories').where('userId', '==', user.uid).where('type', '==', type).get();
    setCategories(snapshot.docs.map((doc) => doc.data()));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const user = auth.currentUser;
    const transaction = transactions.find((t) => t.id === deleteId);
    await firestore.collection('transactions').doc(deleteId).delete();
    await firestore.collection('history').add({
      userId: user.uid,
      action: `ลบรายการ ${transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'} หมวดหมู่ ${transaction.category} จำนวน ${transaction.amount} บาท`,
      timestamp: new Date(),
    });
    setTransactions(transactions.filter((t) => t.id !== deleteId));
    setDeleteDialog(false);
    setDeleteId(null);
    showSnackbar('ลบรายการเรียบร้อยแล้ว!');
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
      showSnackbar('แก้ไขรายการเรียบร้อยแล้ว!');
    } catch (err) {
      showSnackbar(getFirebaseErrorMessage(err), 'error');
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    t.category?.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  const paginatedTransactions = filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <PageContainer title="รายการบันทึกทั้งหมด">
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: { xs: 0, sm: 180 }, flex: { xs: '1 1 100%', sm: '0 0 auto' } }} size="small">
            <InputLabel>กรองตามประเภท</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="กรองตามประเภท">
              <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="ค้นหาตามหมวดหมู่"
            size="small"
            value={searchKeyword}
            onChange={(e) => { setSearchKeyword(e.target.value); setPage(0); }}
            sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, minWidth: 200 }}
          />
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message="ไม่พบรายการ" /></Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell align="right">จำนวนเงิน</TableCell>
                  <TableCell>วันที่</TableCell>
                  <TableCell>หมายเหตุ</TableCell>
                  <TableCell>ใบเสร็จ</TableCell>
                  <TableCell align="center">การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
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
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{formatDateTH(transaction.date)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {transaction.note}
                    </TableCell>
                    <TableCell>
                      {transaction.receiptUrl && (
                        <Button component="a" href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{ fontSize: '0.75rem' }} aria-label={`ดูใบเสร็จ ${transaction.category} (เปิดในแท็บใหม่)`}>
                          ดูใบเสร็จ
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditOpen(transaction)} sx={{ color: '#3b82f6' }} aria-label={`แก้ไข ${transaction.category}`}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => { setDeleteId(transaction.id); setDeleteDialog(true); }} sx={{ color: '#ef4444' }} aria-label={`ลบ ${transaction.category}`}><DeleteIcon fontSize="small" /></IconButton>
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
            labelRowsPerPage="แสดงต่อหน้า"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
          />
        </Paper>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>แก้ไขรายการ</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>ประเภท</InputLabel>
                <Select value={editForm.type} onChange={async (e) => { const t = e.target.value; setEditForm({ ...editForm, type: t, category: '' }); await fetchCategories(t); }} label="ประเภท">
                  <MenuItem value="income">รายรับ</MenuItem>
                  <MenuItem value="expense">รายจ่าย</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} label="หมวดหมู่">
                  {categories.map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="จำนวนเงิน" type="number" fullWidth value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="วันที่" type="date" fullWidth InputLabelProps={{ shrink: true }} value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} sx={{ '& input[type="date"]': { cursor: 'pointer' }, '& input[type="date"]::-webkit-calendar-picker-indicator': { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto', color: 'transparent', background: 'transparent', cursor: 'pointer' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="หมายเหตุ" fullWidth multiline rows={2} value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setEditDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleEditSave} variant="contained">บันทึก</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} />
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default TransactionsPage;
