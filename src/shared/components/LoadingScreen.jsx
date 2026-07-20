import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { fadeInScale } from '@/shared/utils/animations';

const MotionBox = motion.create(Box);

function LoadingScreen({ pt = 10 }) {
  const { t } = useTranslation();
  return (
    <MotionBox
      variants={fadeInScale}
      initial="initial"
      animate="animate"
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt, gap: 2 }}
    >
      <CircularProgress size={36} thickness={4} />
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
        {t('common.loading')}
      </Typography>
    </MotionBox>
  );
}

export default LoadingScreen;
