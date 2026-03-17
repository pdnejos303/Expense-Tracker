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
import AddIcon from '@mui/icons-material/Add';
import QuickAddCategoryDialog from '@/shared/components/QuickAddCategoryDialog';

const PAGE_SIZE = 20;

function MobileTransactionCard({ transaction, onEdit, onDelete }) {
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
              <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {transaction.note}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0 }}>
            <IconButton size="small" onClick={() => onEdit(transaction)} sx={{ color: 'primary.main' }}>
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(transaction.id)} sx={{ color: '#ef4444' }}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

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
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl sx={{ minWidth: 0, flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 180px' } }} size="small">
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
            sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '0 0 200px' } }}
          />
        </Box>
      </Paper>

      {loading ? (
        <LoadingScreen pt={4} />
      ) : filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message="ไม่พบรายการ" /></Paper>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {paginatedTransactions.map((transaction) => (
              <MobileTransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEditOpen}
                onDelete={(id) => { setDeleteId(id); setDeleteDialog(true); }}
              />
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
              labelRowsPerPage="ต่อหน้า"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
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
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} label="หมวดหมู่">
                    {categories.map((cat, i) => (<MenuItem key={i} value={cat.name}>{cat.name}</MenuItem>))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setQuickAddOpen(true)}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, alignSelf: 'stretch', width: { xs: 48, sm: 56 } }}
                  aria-label="เพิ่มหมวดหมู่ใหม่"
                >
                  <AddIcon />
                </IconButton>
              </Box>
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
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 1 }}>
          <Button onClick={() => setEditDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleEditSave} variant="contained">บันทึก</Button>
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
      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} />
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default TransactionsPage;
