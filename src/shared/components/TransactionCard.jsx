import React from 'react';
import { Paper, Box, Typography, alpha } from '@mui/material';
import { formatCurrency } from '@/lib/format';
import { formatDateTH } from '@/lib/timestamp';
import {
  INCOME_COLOR,
  EXPENSE_COLOR,
  INCOME_COLOR_DARK,
  EXPENSE_COLOR_DARK,
} from '@/shared/constants/chart';

/**
 * Compact transaction row used by the mobile lists on Transactions,
 * History and Reports. Pass `actions` for per-page buttons (edit/delete).
 */
function TransactionCard({ transaction, actions }) {
  const isIncome = transaction.type === 'income';
  const sign = isIncome ? '+' : '-';

  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: alpha(isIncome ? INCOME_COLOR : EXPENSE_COLOR, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: isIncome ? INCOME_COLOR_DARK : EXPENSE_COLOR_DARK,
          }}
        >
          {sign}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mr: 1,
            }}
          >
            {transaction.category}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: isIncome ? INCOME_COLOR : EXPENSE_COLOR,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {sign}{formatCurrency(transaction.amount)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {formatDateTH(transaction.date)}
            </Typography>
            {transaction.note && (
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  color: 'text.secondary',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {transaction.note}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex' }}>{actions}</Box>}
        </Box>
      </Box>
    </Paper>
  );
}

export default TransactionCard;
