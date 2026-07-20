import React from 'react';
import { Container, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, staggerItem } from '@/shared/utils/animations';

const MotionBox = motion.create(Box);

function PageContainer({ title, maxWidth = 'lg', titleAlign, children, action }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <MotionBox
        variants={pageVariants}
        initial="initial"
        animate="animate"
        sx={{ pt: { xs: 2.5, sm: 3, md: 4 }, pb: isMobile ? '80px' : 4 }}
      >
        {(title || action) && (
          <MotionBox
            variants={staggerItem}
            sx={{
              display: 'flex',
              alignItems: titleAlign === 'center' ? 'center' : 'flex-start',
              justifyContent: titleAlign === 'center' ? 'center' : 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            {title && (
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
            )}
            {action && <Box>{action}</Box>}
          </MotionBox>
        )}
        {children}
      </MotionBox>
    </Container>
  );
}

export default PageContainer;
