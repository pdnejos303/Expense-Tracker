import React from 'react';
import { Paper, Box, Typography, alpha } from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

/**
 * Gradient summary tile used across Dashboard, Reports and Budget.
 * - `change`: optional period-over-period delta (%). Renders a trend arrow + label.
 * - `footer`: optional extra content under the value (takes over when `change` is null).
 */
function GradientStatCard({ label, value, icon, gradient, change, footer }) {
  const hasChange = change !== undefined && change !== null;
  return (
    <Paper sx={{ p: 0, overflow: 'hidden', position: 'relative', border: 'none' }}>
      <Box sx={{ background: gradient, p: { xs: 2.5, sm: 3 }, color: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: alpha('#fff', 0.85), mb: 0.5 }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {value}
            </Typography>
            {hasChange && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75, gap: 0.5 }}>
                {change > 0 ? (
                  <ArrowUpward sx={{ fontSize: 14, color: alpha('#fff', 0.9) }} />
                ) : change < 0 ? (
                  <ArrowDownward sx={{ fontSize: 14, color: alpha('#fff', 0.9) }} />
                ) : null}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: alpha('#fff', 0.9) }}>
                  {change === 0
                    ? 'ไม่เปลี่ยนแปลง'
                    : `${Math.abs(change).toFixed(1)}% จากช่วงก่อนหน้า`}
                </Typography>
              </Box>
            )}
            {!hasChange && footer}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: alpha('#fff', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 22, color: '#fff' } })}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default GradientStatCard;
