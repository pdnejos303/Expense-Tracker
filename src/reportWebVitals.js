// ไฟล์หลักในการเรนเดอร์ React App ลงใน DOM 
// ใช้ ThemeProvider และ CssBaseline เพื่อจัดการธีมและรีเซ็ต CSS
//
// The main file that renders the React app into the DOM.
// Uses ThemeProvider and CssBaseline for theme management and CSS reset.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

// สร้าง root element และเรนเดอร์ App
// Create root element and render App
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
