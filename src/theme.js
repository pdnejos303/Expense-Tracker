// ไฟล์ theme.js สร้างธีม MUI โดยใช้สี primary จาก Local Storage หรือใช้ default (#4caf50)
// This theme.js file creates an MUI theme with a primary color from Local Storage or a default color.

import { createTheme } from '@mui/material/styles';

const themeColor = localStorage.getItem('themeColor') || '#4caf50';

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

export default theme;
