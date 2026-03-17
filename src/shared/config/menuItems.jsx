import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const menuItems = [
  { text: 'แดชบอร์ด', path: '/', icon: <DashboardIcon /> },
  { text: 'เพิ่มรายการ', path: '/add-transaction', icon: <AddCircleOutlineIcon /> },
  { text: 'รายการ', path: '/transactions', icon: <ListAltIcon /> },
  { text: 'รายงาน', path: '/reports', icon: <AssessmentIcon /> },
  { text: 'จัดการงบประมาณ', path: '/budget-management', icon: <AccountBalanceWalletIcon /> },
  { text: 'AI วางแผนเงิน', path: '/planner', icon: <AutoFixHighIcon /> },
  { text: 'หมวดหมู่', path: '/categories', icon: <CategoryIcon /> },
  { text: 'การตั้งค่า', path: '/settings', icon: <SettingsIcon /> },
  { text: 'โปรไฟล์', path: '/profile', icon: <PersonIcon /> },
  { text: 'ประวัติ', path: '/history', icon: <HistoryIcon /> },
];

export default menuItems;
