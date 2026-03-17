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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { firestore, auth } from '@/lib/firebase';
import { formatCurrency } from '@/lib/format';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import SnackbarAlert from '@/shared/components/SnackbarAlert';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import PageContainer from '@/shared/components/PageContainer';
import LoadingScreen from '@/shared/components/LoadingScreen';
import EmptyState from '@/shared/components/EmptyState';
import Home from '@mui/icons-material/Home';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Fastfood from '@mui/icons-material/Fastfood';
import LocalCafe from '@mui/icons-material/LocalCafe';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Flight from '@mui/icons-material/Flight';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNote from '@mui/icons-material/MusicNote';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import LocalHospital from '@mui/icons-material/LocalHospital';
import School from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import Pets from '@mui/icons-material/Pets';
import LocalGroceryStore from '@mui/icons-material/LocalGroceryStore';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import LocalAtm from '@mui/icons-material/LocalAtm';
import LocalLibrary from '@mui/icons-material/LocalLibrary';
import Restaurant from '@mui/icons-material/Restaurant';
import BeachAccess from '@mui/icons-material/BeachAccess';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import Train from '@mui/icons-material/Train';
import LocalHotel from '@mui/icons-material/LocalHotel';
import ChildCare from '@mui/icons-material/ChildCare';
import PaletteIcon from '@mui/icons-material/Palette';
import BookIcon from '@mui/icons-material/Book';
import LaptopMac from '@mui/icons-material/LaptopMac';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import LocalParking from '@mui/icons-material/LocalParking';
import LocalLaundryService from '@mui/icons-material/LocalLaundryService';
import LocalMall from '@mui/icons-material/LocalMall';
import Casino from '@mui/icons-material/Casino';
import Spa from '@mui/icons-material/Spa';
import LocalPharmacy from '@mui/icons-material/LocalPharmacy';
import LocalShipping from '@mui/icons-material/LocalShipping';
import LocalOffer from '@mui/icons-material/LocalOffer';
import LocalPostOffice from '@mui/icons-material/LocalPostOffice';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import LocalBar from '@mui/icons-material/LocalBar';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import DirectionsBoat from '@mui/icons-material/DirectionsBoat';
import LocalAirport from '@mui/icons-material/LocalAirport';
import CameraAlt from '@mui/icons-material/CameraAlt';
import BrushIcon from '@mui/icons-material/Brush';
import EventSeat from '@mui/icons-material/EventSeat';
import HeadsetMic from '@mui/icons-material/HeadsetMic';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VideogameAsset from '@mui/icons-material/VideogameAsset';
import WatchIcon from '@mui/icons-material/Watch';
import Weekend from '@mui/icons-material/Weekend';
import CategoryIcon from '@mui/icons-material/Category';

const iconMap = {
  Home, ShoppingCart, Fastfood, LocalCafe, DirectionsCar,
  Flight, Movie: MovieIcon, MusicNote, FitnessCenter, LocalHospital,
  School, Work: WorkIcon, Pets, LocalGroceryStore, LocalGasStation,
  LocalAtm, LocalLibrary, Restaurant, BeachAccess, DirectionsBus,
  DirectionsWalk, Train, LocalHotel, ChildCare, Palette: PaletteIcon,
  Book: BookIcon, LaptopMac, PhoneIphone, LocalParking, LocalLaundryService,
  LocalMall, Casino, Spa, LocalPharmacy, LocalShipping,
  LocalOffer, LocalPostOffice, LocalFlorist, LocalBar, DirectionsBike,
  DirectionsBoat, LocalAirport, CameraAlt, Brush: BrushIcon, EventSeat,
  HeadsetMic, Keyboard: KeyboardIcon, VideogameAsset, Watch: WatchIcon, Weekend,
  Category: CategoryIcon,
};

const iconOptions = Object.keys(iconMap).filter((k) => k !== 'Category');

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', type: 'expense', color: '#3b82f6', icon: 'Category' });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchData(); }, [filterType]);

  const fetchData = async () => {
    setLoading(true);
    try { await Promise.all([fetchCategories(), fetchTransactions()]); }
    catch (err) { showSnackbar(getFirebaseErrorMessage(err), 'error'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const user = auth.currentUser; if (!user) return;
    let ref = firestore.collection('categories').where('userId', '==', user.uid);
    if (filterType) ref = ref.where('type', '==', filterType);
    const snapshot = await ref.get();
    setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTransactions = async () => {
    const user = auth.currentUser; if (!user) return;
    const snapshot = await firestore.collection('transactions').where('userId', '==', user.uid).get();
    setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await firestore.collection('categories').doc(deleteId).delete();
    fetchCategories(); setDeleteDialog(false); setDeleteId(null);
    showSnackbar('ลบหมวดหมู่เรียบร้อยแล้ว!');
  };

  const handleSave = async () => {
    const user = auth.currentUser; if (!user) return;
    if (!categoryForm.name) { showSnackbar('กรุณากรอกชื่อหมวดหมู่', 'error'); return; }
    try {
      if (categoryForm.id) {
        await firestore.collection('categories').doc(categoryForm.id).update({ name: categoryForm.name, type: categoryForm.type, color: categoryForm.color, icon: categoryForm.icon });
      } else {
        await firestore.collection('categories').add({ userId: user.uid, name: categoryForm.name, type: categoryForm.type, color: categoryForm.color, icon: categoryForm.icon });
      }
      setOpenDialog(false); fetchCategories();
      showSnackbar('บันทึกหมวดหมู่เรียบร้อยแล้ว!');
    } catch (err) { showSnackbar(getFirebaseErrorMessage(err), 'error'); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <PageContainer title="จัดการหมวดหมู่" maxWidth="lg">
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: { xs: 0, sm: 180 }, flex: { xs: '1 1 auto', sm: '0 0 auto' } }} size="small">
            <InputLabel>ประเภท</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="ประเภท">
              <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => { setCategoryForm({ id: '', name: '', type: 'expense', color: '#3b82f6', icon: 'Category' }); setOpenDialog(true); }}>
            เพิ่มหมวดหมู่
          </Button>
        </Box>
      </Paper>

      {categories.length === 0 ? (
        <Paper sx={{ p: 6 }}><EmptyState message="ยังไม่มีหมวดหมู่" /></Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อหมวดหมู่</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>ไอคอน</TableCell>
                  <TableCell>สี</TableCell>
                  <TableCell align="right">จำนวนครั้ง</TableCell>
                  <TableCell align="right">ยอดเงินรวม</TableCell>
                  <TableCell align="center">การกระทำ</TableCell>
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
                          label={category.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                          size="small"
                          sx={{
                            bgcolor: category.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: category.type === 'income' ? '#16a34a' : '#dc2626',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{IconComponent && <IconComponent sx={{ color: category.color, fontSize: 20 }} />}</TableCell>
                      <TableCell>
                        <Box sx={{ width: 24, height: 24, backgroundColor: category.color, borderRadius: '6px', border: '2px solid', borderColor: alpha(category.color, 0.3) }} role="img" aria-label={`สี ${category.color}`} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{categoryTransactions.length}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(categoryTransactions.reduce((sum, t) => sum + t.amount, 0))}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => { setCategoryForm(category); setOpenDialog(true); }} sx={{ color: '#3b82f6' }} aria-label={`แก้ไข ${category.name}`}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => { setDeleteId(category.id); setDeleteDialog(true); }} sx={{ color: '#ef4444' }} aria-label={`ลบ ${category.name}`}><Delete fontSize="small" /></IconButton>
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
        <DialogTitle>{categoryForm.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</DialogTitle>
        <DialogContent>
          <TextField label="ชื่อหมวดหมู่" fullWidth sx={{ mt: 2 }} value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>ประเภท</InputLabel>
            <Select value={categoryForm.type} onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })} label="ประเภท">
              <MenuItem value="income">รายรับ</MenuItem>
              <MenuItem value="expense">รายจ่าย</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>เลือกสี</Typography>
            <Box
              component="label"
              sx={{
                display: 'block', width: '100%', height: 44, borderRadius: 2.5,
                backgroundColor: categoryForm.color, border: '2px solid', borderColor: alpha(categoryForm.color, 0.3),
                cursor: 'pointer', transition: 'all 0.15s',
                '&:hover': { opacity: 0.85 },
                '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              }}
            >
              <input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} aria-label="เลือกสีหมวดหมู่" style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            </Box>
          </Box>
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>เลือกไอคอน</Typography>
            <Box sx={{ maxHeight: 220, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, p: 1.5 }}>
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
                          bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                          color: isSelected ? 'primary.main' : 'text.secondary',
                          '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) },
                        }}
                      >
                        <Ic fontSize="small" />
                      </IconButton>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleSave} variant="contained">บันทึก</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} message="คุณต้องการลบหมวดหมู่นี้หรือไม่?" />
      <SnackbarAlert open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </PageContainer>
  );
}

export default CategoriesPage;
