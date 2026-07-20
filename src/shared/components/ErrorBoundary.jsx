import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import i18n from '@/lib/i18n';

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
            {i18n.t('errors.generic')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {i18n.t('errors.generic')}
          </Typography>
          <Button variant="contained" onClick={this.handleReset} sx={{ mt: 2 }}>
            {i18n.t('common.retry')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
