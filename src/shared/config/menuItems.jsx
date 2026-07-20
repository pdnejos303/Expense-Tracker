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
import FavoriteIcon from '@mui/icons-material/Favorite';

const menuItems = [
  { text: 'dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'addTransaction', path: '/add-transaction', icon: <AddCircleOutlineIcon /> },
  { text: 'transactions', path: '/transactions', icon: <ListAltIcon /> },
  { text: 'reports', path: '/reports', icon: <AssessmentIcon /> },
  { text: 'budgetManagement', path: '/budget-management', icon: <AccountBalanceWalletIcon /> },
  { text: 'planner', path: '/planner', icon: <AutoFixHighIcon /> },
  { text: 'categories', path: '/categories', icon: <CategoryIcon /> },
  { text: 'settings', path: '/settings', icon: <SettingsIcon /> },
  { text: 'profile', path: '/profile', icon: <PersonIcon /> },
  { text: 'history', path: '/history', icon: <HistoryIcon /> },
  { text: 'support', path: '/support', icon: <FavoriteIcon /> },
];

export default menuItems;
