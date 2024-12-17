// ไฟล์หลักในการเรนเดอร์ React App ลงใน DOM
// The main file to render the React app into the DOM

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

// สร้าง root element จาก div#root
// Create root element from div#root
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* ใช้ ThemeProvider และ CssBaseline จาก MUI เพื่อปรับปรุงการแสดงผล UI */}
    {/* Using ThemeProvider and CssBaseline from MUI for UI styling */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
