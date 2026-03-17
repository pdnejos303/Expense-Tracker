import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'ยืนยันการลบ',
  message = 'คุณต้องการลบรายการนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
  confirmText = 'ลบ',
  confirmColor = 'error',
  cancelText = 'ยกเลิก',
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            bgcolor: 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', pt: 0.5 }}>
            {message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
