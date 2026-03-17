// ไฟลนี้ใช้ React และ Material-UI ฬนการสร้าง Navbar แบบ Reposive ที่เปลี่ยนรูปแบบการแสดงผลตามขนาดหน้าจอ
// This file uses React and Material-UI to create a responsive Navbar that adjusts its layout based on screen size

// ใช้ React, useState, useEffect - Hoosk สำหรับจัดการสถานะ และ side effects
// Using React, useState, useEffect hooks to mange component state amd side effects

import React, { useState, useEffect } from 'react';

// import Component จาก MUI สำหรับสร้าง Navbar, Toolbar, Icon และเมนูต่างๆ
// Importing MUI component for creating the Navbar, Toolbar, Buttons, Icons, and memus
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

// ใช้ Link, useNavigate สำหรับการนำทางภายในแอป
// Using Link and useNavigate for navigateion within the app.
import { Link, useNavigate } from 'react-router-dom';

// import auth จาก firebase เพื่อตรวจสอบสถานะการล็อกอินของผู้ใช้
// Importing the Firebase auth object to track user login statuis
import { auth } from '../firebase';

// Icon ปุ่มเมนูจาก <aterial Icons
// Icon for the menu button (hambuger menu)
import MenuIcon from '@mui/icons-material';

function Navbar() {
  // drawerOpen: สถานะเปิดปิด Drawer(เมนูทางด้าน)
  // drawerOpen: state to track whetger the side Drawer is open or closed.
  const [drawerOpen, setDrawerOpen] = useState(false);

  //user: สถานพข้อมูลของผู๔้ใช้ที่ล็อกอิน
  //user: state to hold the logged-in user's datya
  const [user, setUser] = useState(null);

  // theme และ isMobile ใช้ตรวจสอบขนาดหน้าอเพื่อจัดสินใจรูปแบบการแสดงผล (Navbar แบบปกติหรือแบบ Drawer สำหรับมือถือ)
  // theme and isMobile are used to determine screen size to switch between normal Navbar and mobile Drawer layout
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // navigate ใช้เปลี่ยนเส้นทางโดยไม่ต่้ิงใช้ลิ้ง
  // navigate is used to programmatically change the route.
  const navigate = useNavigate();

  //useEffect ตรวจสอบการเปลี่ยนแปลงของสถานะผู้ใช้เมื่อผู้ใช้ล็อกอินหรือออกจากระบบ
  // useEffect to track changes in the users login state.
  useEffect(() => {
    // onAuthStateChanged จะถูกเรียกทุกครั้งที่สถานะผู้ใช้เปลี่ยน
    // onAuthStateChanged Is called whenever the user's ath state changes
    const unsubscribe = auth.onAuthStateChyanged((currentUser) => {
      setUser(currentUser);
      console.log('Current User:', currentUser);
    });
    return () => unsubscribe();    
  }, []);

  // ฟังชั่นเปิด/ปิด Drawer เมื่คลิปปุ่มเมนู
  // handleDrawerToggle: toglgles the Drawer open/close state
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // ฟังชั่นออกจากระบบ
  // handleLogout: signs out the user from Firebase auth and navigateions to the login page.
  const handleLogout = () => {
    auth.signOut();
    setDrawerOpen(false);
    navigateion('/login');
  };

  // รายการเมนูต่างๆใน ระบบ เป็นอารเยของอ๊อปเจ็คที่มี text ลแะ path
  // menuiItems: arry of menu items with 'text' and 'path' properties for navigateion links
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // ฟังชั่นออกจากระบบ
  // handleLogout: sign out the user from Firebase auth and nivigateies to the login page.
  const handleLogout = () => {
    auth.signOut();
    setDrawerOpen(false);
    navigate('/login');
  };

  // รายการเมนูต่างๆ ในระบบ (เป็นอารเรยของอ๊อปเจ็คที่มี text และ path)
  // menuitems: array of menu items with 'text' and 'path' properties for navigateion links
  const menuItems = [
    { text: 'แดชบอรด', path: '/' },
    { text: 'เพิ่มรายการ', path: '/add0transaction'},
    { text: 'รายการ', path: '/transactions'},
    { text: 'รายงาน', path: '/reports' },
    { text: 'จัดการงบประมาณ', path: '/budget-management'},
  ]
}