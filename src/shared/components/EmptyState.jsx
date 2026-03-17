import React from 'react';
import { Typography, Box } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

function EmptyState({ message, py = 4 }) {
  return (
    <Box sx={{ py, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <InboxIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {message}
      </Typography>
    </Box>
  );
}

export default EmptyState;
