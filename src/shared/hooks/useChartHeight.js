import { useTheme, useMediaQuery } from '@mui/material';
import { CHART_HEIGHT, CHART_HEIGHT_MOBILE } from '@/shared/constants/chart';

export function useChartHeight() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT;
}
