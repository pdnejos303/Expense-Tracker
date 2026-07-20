import React from 'react';
import { Typography, Box } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { motion } from 'framer-motion';
import { fadeInUp, easeOutQuart } from '@/shared/utils/animations';

const MotionBox = motion.create(Box);

function EmptyState({ message, py = 4 }) {
  return (
    <MotionBox
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      sx={{ py, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: easeOutQuart }}
      >
        <InboxIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
      </motion.div>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {message}
      </Typography>
    </MotionBox>
  );
}

export default EmptyState;
