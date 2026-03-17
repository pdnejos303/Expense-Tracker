import React from 'react';
import { Snackbar, Alert } from '@mui/material';

function SnackbarAlert({ open, message, severity, onClose, autoHideDuration = 4000 }) {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default SnackbarAlert;
