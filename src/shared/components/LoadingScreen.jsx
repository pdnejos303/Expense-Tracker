import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingScreen({ pt = 10 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt, gap: 2 }}>
      <CircularProgress size={36} thickness={4} />
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
        กำลังโหลด...
      </Typography>
    </Box>
  );
}

export default LoadingScreen;
