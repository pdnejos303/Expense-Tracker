// ไฟล์นี้ใช้ React และ Material-UI ในการสร้าง Navbar แบบ Responsive ที่เปลี่ยนรูปแบบการแสดงผลตามขนาดหน้าจอ
// This file uses React and Material-UI to create a responsive Navbar that adjusts its layout based on screen size.

// ใช้ React, useState, useEffect - Hooks สำหรับจัดการสถานะ และ side effects
// Using React, useState, useEffect hooks to manage component state and side effects.
import React, { useState, useEffect } from 'react';

// import Component จาก MUI สำหรับสร้าง Navbar, Toolbar, Button, Icon และเมนูต่าง ๆ
// Importing MUI components for creating the Navbar, Toolbar, Buttons, Icons, and menus.
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

// ใช้ Link, useNavigate สำหรับนำทางภายในแอป
// Using Link and useNavigate for navigation within the app.
import { Link, useNavigate } from 'react-router-dom';

// import auth จาก firebase เพื่อตรวจสอบสถานะการล็อกอินของผู้ใช้
// Importing the Firebase auth object to track user login status.
import { auth } from '../firebase';

// Icon ปุ่มเมนูจาก Material Icons
// Icon for the menu button (hamburger menu).
import MenuIcon from '@mui/icons-material/Menu';

function Navbar() {
  // drawerOpen: สถานะเปิด-ปิด Drawer (เมนูด้านข้าง)
  // drawerOpen: state to track whether the side Drawer is open or closed.
  const [drawerOpen, setDrawerOpen] = useState(false);

  // user: สถานะข้อมูลผู้ใช้ที่ล็อกอิน
  // user: state to hold the logged-in user's data.
  const [user, setUser] = useState(null);

  // theme และ isMobile ใช้ตรวจสอบขนาดหน้าจอเพื่อตัดสินใจรูปแบบการแสดงผล (Navbar แบบปกติหรือแบบ Drawer สำหรับมือถือ)
  // theme and isMobile are used to determine screen size to switch between normal Navbar and mobile Drawer layout.
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // navigate ใช้เปลี่ยนเส้นทางโดยไม่ต้องใช้ลิงค์
  // navigate is used to programmatically change the route.
  const navigate = useNavigate();

  // useEffect ตรวจสอบการเปลี่ยนแปลงของสถานะผู้ใช้ เมื่อผู้ใช้ล็อกอิน/ออกระบบ
  // useEffect to track changes in the user's login state.
  useEffect(() => {
    // onAuthStateChanged จะถูกเรียกทุกครั้งที่สถานะผู้ใช้เปลี่ยน
    // onAuthStateChanged is called whenever the user's auth state changes.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      console.log('Current User:', currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ฟังก์ชันเปิด/ปิด Drawer เมื่อคลิกปุ่มเมนู
  // handleDrawerToggle: toggles the Drawer open/close state.
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // ฟังก์ชันออกจากระบบ
  // handleLogout: signs out the user from Firebase auth and navigates to the login page.
  const handleLogout = () => {
    auth.signOut();
    setDrawerOpen(false);
    navigate('/login');
  };

  // รายการเมนูต่าง ๆ ในระบบ (เป็นอาร์เรย์ของอ็อบเจ็คที่มี text และ path)
  // menuItems: array of menu items with 'text' and 'path' properties for navigation links.
  const menuItems = [
    { text: 'แดชบอร์ด', path: '/' },
    { text: 'เพิ่มรายการ', path: '/add-transaction' },
    { text: 'รายการ', path: '/transactions' },
    { text: 'รายงาน', path: '/reports' },
    { text: 'จัดการงบประมาณ', path: '/budget-management' },
    { text: 'หมวดหมู่', path: '/categories' },
    { text: 'การตั้งค่า', path: '/settings' },
    { text: 'โปรไฟล์', path: '/profile' },
    { text: 'ประวัติ', path: '/history' },
  ];

  return (
    // AppBar และ Toolbar สร้างแถบเมนูด้านบน
    // AppBar and Toolbar create the top navigation bar.
    <AppBar position="static">
      <Toolbar>
        {/* Typography ใช้แสดงชื่อระบบ บริเวณซ้ายมือสุดของแถบเมนู */}
        {/* Typography displays the system name/logo at the left side of the Navbar */}
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          ระบบบันทึกรายรับ-รายจ่าย
        </Typography>

        {/* ตรวจสอบหากเป็นมือถือ ให้ใช้ Drawer แทนปุ่มทั่วไป */}
        {/* If on mobile view, use a Drawer (side menu) instead of normal menu buttons */}
        {isMobile ? (
          <>
            {/* IconButton เปิด-ปิดเมนู Drawer */}
            {/* IconButton to toggle the Drawer on mobile */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>

            {/* Drawer สร้างเมนูแบบ Side Panel */}
            {/* Drawer creates a side panel menu on mobile */}
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={handleDrawerToggle}
            >
              <List>
                {/* แสดงรายการเมนูใน Drawer */}
                {/* Render the menu items in the Drawer */}
                {menuItems.map((item, index) => (
                  <ListItem
                    button
                    key={index}
                    component={Link}
                    to={item.path}
                    onClick={handleDrawerToggle}
                  >
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
                {/* หากผู้ใช้ล็อกอินแล้วแสดงปุ่มออกจากระบบ มิฉะนั้นแสดงปุ่มเข้าสู่ระบบ */}
                {/* If user is logged in, show Logout item. Otherwise, show Login item. */}
                {user ? (
                  <ListItem button onClick={handleLogout}>
                    <ListItemText primary="ออกจากระบบ" />
                  </ListItem>
                ) : (
                  <ListItem
                    button
                    component={Link}
                    to="/login"
                    onClick={handleDrawerToggle}
                  >
                    <ListItemText primary="เข้าสู่ระบบ" />
                  </ListItem>
                )}
              </List>
            </Drawer>
          </>
        ) : (
          <>
            {/* บน Desktop, แสดงเมนูเป็นปุ่มเรียงต่อกันบน Navbar */}
            {/* On Desktop, show menu items as inline buttons */}
            {menuItems.map((item, index) => (
              <Button
                color="inherit"
                component={Link}
                to={item.path}
                key={index}
              >
                {item.text}
              </Button>
            ))}

            {/* หากผู้ใช้ล็อกอิน แสดงภาพ Avatar และชื่อ และปุ่มออกจากระบบ */}
            {/* If user is logged in, display their Avatar, Name, and Logout button */}
            {user ? (
              <>
                {/* แสดงภาพโปรไฟล์ของผู้ใช้ ถ้ามี */}
                {/* Display user's profile picture if available */}
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName}
                  sx={{ ml: 2 }}
                />
                {/* แสดงชื่อผู้ใช้ */}
                {/* Display user's display name */}
                <Typography variant="h6" style={{ marginLeft: 10 }}>
                  {user.displayName}
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  ออกจากระบบ
                </Button>
              </>
            ) : (
              // ถ้าไม่ล็อกอิน แสดงปุ่มเข้าสู่ระบบ
              // If not logged in, show the Login button
              <Button color="inherit" component={Link} to="/login">
                เข้าสู่ระบบ
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
