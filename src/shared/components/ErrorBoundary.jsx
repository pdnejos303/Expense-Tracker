import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          gap={2}
          p={3}
        >
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
          <Typography variant="h5" gutterBottom>
            เกิดข้อผิดพลาด
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            ขออภัย เกิดปัญหาบางอย่างขึ้น กรุณาลองใหม่อีกครั้ง
          </Typography>
          <Button variant="contained" onClick={this.handleReset} sx={{ mt: 2 }}>
            ลองใหม่
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
