import React from 'react';
import { Container, Box, Typography } from '@mui/material';

function PageContainer({ title, maxWidth = 'lg', titleAlign, children, action }) {
  return (
    <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ pt: { xs: 2.5, sm: 3, md: 4 } }}>
        {(title || action) && (
          <Box
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
          </Box>
        )}
        {children}
      </Box>
    </Container>
  );
}

export default PageContainer;
