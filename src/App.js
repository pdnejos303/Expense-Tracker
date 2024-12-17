// ไฟล์ App.js เป็นจุดเริ่มต้นหลักของแอป แสดง Navbar และกำหนดเส้นทาง (Routes) ไปยังหน้าต่าง ๆ
// แยกส่วนต่าง ๆ ของแอปออกเป็นหน้า เช่น Dashboard, Reports, Settings ฯลฯ
// นอกจากนี้ยังจัดการธีมของ MUI และตรวจสอบสถานะการล็อกอินของผู้ใช้
//
// The App.js file is the main entry point of the application, displaying a Navbar and setting up Routes to different pages.
// It also integrates theme handling via MUI ThemeProvider and checks user authentication state.

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import BudgetManagement from './pages/BudgetManagement';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import History from './pages/History';
import { auth } from './firebase';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

function App() {
  // เก็บสถานะผู้ใช้ปัจจุบันและสีธีมใน state
  // Store current user and theme color in state
  const [user, setUser] = useState(null);
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem('themeColor') || '#4caf50'
  );

  useEffect(() => {
    // ตรวจสอบการเปลี่ยนแปลงสถานะการล็อกอินของผู้ใช้
    // Listen to auth state changes and update user state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // สร้างธีม MUI โดยใช้สี primary จาก themeColor
  // Create MUI theme using themeColor as primary color
  const theme = createTheme({
    palette: {
      primary: {
        main: themeColor,
      },
      secondary: {
        main: '#ff5722',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Login setUser={setUser} />} />
          <Route
            path="/add-transaction"
            element={user ? <AddTransaction /> : <Login setUser={setUser} />}
          />
          <Route
            path="/transactions"
            element={user ? <Transactions /> : <Login setUser={setUser} />}
          />
          <Route
            path="/reports"
            element={user ? <Reports /> : <Login setUser={setUser} />}
          />
          <Route
            path="/budget-management"
            element={user ? <BudgetManagement /> : <Login setUser={setUser} />}
          />
          <Route
            path="/categories"
            element={user ? <Categories /> : <Login setUser={setUser} />}
          />
          <Route
            path="/settings"
            element={user ? <Settings setThemeColor={setThemeColor} /> : <Login setUser={setUser} />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Login setUser={setUser} />}
          />
          <Route
            path="/history"
            element={user ? <History /> : <Login setUser={setUser} />}
          />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="*" element={<div>หน้าที่คุณค้นหาไม่มีอยู่</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
