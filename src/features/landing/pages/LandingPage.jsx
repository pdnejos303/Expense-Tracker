import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import SecurityIcon from '@mui/icons-material/Security';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp, easeOutQuart } from '@/shared/utils/animations';
import LanguageMenu from '@/shared/components/LanguageMenu';

// ─── Realistic App Preview ──────────────────────────
function MockDashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const SIDEBAR_BG = isDark ? '#0f172a' : '#0f172a';
  const SIDEBAR_TEXT = '#94a3b8';
  const CONTENT_BG = isDark ? '#0c0f1a' : '#f8fafc';
  const CARD_BG = isDark ? '#141829' : '#ffffff';
  const BORDER = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const barHeights = [55, 75, 45, 85, 60, 90, 50];
  const pieData = [
    { color: '#ef4444', pct: 35 },
    { color: '#f59e0b', pct: 25 },
    { color: '#3b82f6', pct: 20 },
    { color: '#8b5cf6', pct: 12 },
    { color: '#64748b', pct: 8 },
  ];

  const sidebarMenuItems = [
    { icon: <DashboardIcon sx={{ fontSize: 14 }} />, active: true },
    { icon: <AddCircleOutlineIcon sx={{ fontSize: 14 }} /> },
    { icon: <ListAltIcon sx={{ fontSize: 14 }} /> },
    { icon: <AssessmentIcon sx={{ fontSize: 14 }} /> },
    { icon: <AccountBalanceWalletIcon sx={{ fontSize: 14 }} /> },
    { icon: <CategoryIcon sx={{ fontSize: 14 }} /> },
    { icon: <SettingsIcon sx={{ fontSize: 14 }} /> },
  ];

  const transactions = [
    { name: t('landing.mockFood') || 'อาหาร', amount: '-฿350', type: 'expense' },
    { name: t('landing.mockSalary') || 'เงินเดือน', amount: '+฿45,000', type: 'income' },
    { name: t('landing.mockTransport') || 'เดินทาง', amount: '-฿120', type: 'expense' },
  ];

  return (
    <Paper
      sx={{
        borderRadius: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: BORDER,
        boxShadow: isDark
          ? `0 25px 80px -15px ${alpha('#000', 0.6)}`
          : `0 25px 80px -15px ${alpha(primary, 0.18)}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Browser chrome */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.75,
        px: 2, py: 1,
        bgcolor: isDark ? '#1a1f2e' : '#f1f5f9',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
          <Box key={c} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} />
        ))}
        <Box sx={{
          flex: 1, ml: 1.5,
          height: 20, borderRadius: 10,
          bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
          display: 'flex', alignItems: 'center', px: 1.5,
        }}>
          <Typography sx={{ fontSize: '0.5rem', color: SIDEBAR_TEXT, userSelect: 'none' }}>
            expense-tracker.app/dashboard
          </Typography>
        </Box>
      </Box>

      {/* App layout: sidebar + content */}
      <Box sx={{ display: 'flex', height: { xs: 220, sm: 260, md: 320 } }}>
        {/* Mini sidebar */}
        {!isMobile && (
          <Box sx={{
            width: { sm: 52, md: 64 }, bgcolor: SIDEBAR_BG,
            display: 'flex', flexDirection: 'column',
            py: 1.5, px: 0.75,
            borderRight: `1px solid ${alpha('#fff', 0.06)}`,
            flexShrink: 0,
          }}>
            {/* Logo */}
            <Box sx={{
              width: { sm: 24, md: 30 }, height: { sm: 24, md: 30 },
              borderRadius: '8px', mx: 'auto', mb: 1.5,
              background: `linear-gradient(135deg, ${primary}, ${theme.palette.primary.dark || primary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: { sm: 13, md: 16 } }} />
            </Box>

            <Divider sx={{ borderColor: alpha('#fff', 0.06), mb: 1 }} />

            {/* Menu items */}
            {sidebarMenuItems.map((item, i) => (
              <Box key={i} sx={{
                width: { sm: 28, md: 36 }, height: { sm: 28, md: 36 },
                borderRadius: '8px', mx: 'auto', mb: 0.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: item.active ? alpha(primary, 0.15) : 'transparent',
                color: item.active ? primary : SIDEBAR_TEXT,
                position: 'relative',
              }}>
                {item.icon}
                {item.active && (
                  <Box sx={{
                    position: 'absolute', right: -1,
                    width: 3, height: 14, borderRadius: 2, bgcolor: primary,
                  }} />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Main content */}
        <Box sx={{ flex: 1, bgcolor: CONTENT_BG, overflow: 'hidden', p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          {/* Page title */}
          <Typography sx={{
            fontSize: { xs: '0.625rem', md: '0.8125rem' },
            fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a',
            mb: { xs: 1, md: 1.5 },
          }}>
            {t('dashboard.title') || 'Dashboard'}
          </Typography>

          {/* Summary cards row */}
          <Grid container spacing={{ xs: 0.75, md: 1 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
            {[
              { label: t('landing.mockIncome'), value: '฿45,200', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', icon: <TrendingUpIcon sx={{ fontSize: { xs: 10, md: 14 }, color: '#fff' }} /> },
              { label: t('landing.mockExpense'), value: '฿32,100', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: <TrendingDownIcon sx={{ fontSize: { xs: 10, md: 14 }, color: '#fff' }} /> },
              { label: t('landing.mockBalance'), value: '฿13,100', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: <AccountBalanceIcon sx={{ fontSize: { xs: 10, md: 14 }, color: '#fff' }} /> },
            ].map((card) => (
              <Grid item xs={4} key={card.label}>
                <Box sx={{
                  background: card.gradient, borderRadius: { xs: 1.5, md: 2 },
                  p: { xs: 0.75, sm: 1, md: 1.5 }, color: '#fff',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontSize: { xs: '0.375rem', sm: '0.4375rem', md: '0.5625rem' }, color: alpha('#fff', 0.85), mb: 0.25 }}>
                        {card.label}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '0.5625rem', sm: '0.6875rem', md: '0.9375rem' }, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: { xs: 16, md: 24 }, height: { xs: 16, md: 24 },
                      borderRadius: '6px', bgcolor: alpha('#fff', 0.2),
                      display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center',
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Charts row */}
          <Grid container spacing={{ xs: 0.75, md: 1 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
            {/* Pie chart */}
            <Grid item xs={5}>
              <Box sx={{
                bgcolor: CARD_BG, borderRadius: { xs: 1.5, md: 2 },
                border: `1px solid ${BORDER}`,
                p: { xs: 0.75, md: 1.5 },
                height: '100%',
              }}>
                <Typography sx={{ fontSize: { xs: '0.375rem', md: '0.5625rem' }, fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155', mb: { xs: 0.5, md: 1 } }}>
                  {t('dashboard.expenseByCategory') || 'สัดส่วนรายจ่าย'}
                </Typography>
                {/* SVG Donut */}
                <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 0.25, md: 0.5 } }}>
                  <svg width={isMobile ? 50 : 80} height={isMobile ? 50 : 80} viewBox="0 0 100 100">
                    {(() => {
                      let cumulative = 0;
                      return pieData.map((slice, i) => {
                        const startAngle = cumulative * 3.6;
                        cumulative += slice.pct;
                        const endAngle = cumulative * 3.6;
                        const startRad = ((startAngle - 90) * Math.PI) / 180;
                        const endRad = ((endAngle - 90) * Math.PI) / 180;
                        const x1 = 50 + 38 * Math.cos(startRad);
                        const y1 = 50 + 38 * Math.sin(startRad);
                        const x2 = 50 + 38 * Math.cos(endRad);
                        const y2 = 50 + 38 * Math.sin(endRad);
                        const largeArc = slice.pct > 50 ? 1 : 0;
                        return (
                          <motion.path
                            key={i}
                            d={`M 50 50 L ${x1} ${y1} A 38 38 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={slice.color}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.8 + i * 0.1, ease: easeOutQuart }}
                            style={{ transformOrigin: '50px 50px' }}
                          />
                        );
                      });
                    })()}
                    <circle cx="50" cy="50" r="22" fill={CARD_BG} />
                  </svg>
                </Box>
                {/* Legend */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                  {[
                    { label: t('landing.mockFood') || 'อาหาร', color: '#ef4444' },
                    { label: t('landing.mockTransport') || 'เดินทาง', color: '#f59e0b' },
                    { label: t('landing.mockShopping') || 'ช้อปปิ้ง', color: '#3b82f6' },
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography sx={{ fontSize: { xs: '0.3125rem', md: '0.4375rem' }, color: SIDEBAR_TEXT }}>{item.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Bar chart */}
            <Grid item xs={7}>
              <Box sx={{
                bgcolor: CARD_BG, borderRadius: { xs: 1.5, md: 2 },
                border: `1px solid ${BORDER}`,
                p: { xs: 0.75, md: 1.5 },
                height: '100%',
                display: 'flex', flexDirection: 'column',
              }}>
                <Typography sx={{ fontSize: { xs: '0.375rem', md: '0.5625rem' }, fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155', mb: { xs: 0.5, md: 1 } }}>
                  {t('dashboard.monthlyTrend') || 'แนวโน้มรายเดือน'}
                </Typography>
                {/* Bar chart */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.25, md: 0.5 }, flex: 1, pt: 0.5 }}>
                  {barHeights.map((h, i) => (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 + i * 0.06, ease: easeOutQuart }}
                        style={{ height: `${h * 0.6}%`, originY: 1 }}
                      >
                        <Box sx={{
                          width: '100%', height: '100%',
                          borderRadius: '2px 2px 0 0',
                          bgcolor: alpha('#22c55e', isDark ? 0.7 : 0.75),
                        }} />
                      </motion.div>
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.06, ease: easeOutQuart }}
                        style={{ height: `${(100 - h) * 0.5}%`, originY: 1 }}
                      >
                        <Box sx={{
                          width: '100%', height: '100%',
                          borderRadius: '2px 2px 0 0',
                          bgcolor: alpha('#ef4444', isDark ? 0.6 : 0.65),
                        }} />
                      </motion.div>
                    </Box>
                  ))}
                </Box>
                {/* X axis labels */}
                <Box sx={{ display: 'flex', gap: { xs: 0.25, md: 0.5 }, mt: 0.5 }}>
                  {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'].map((m) => (
                    <Typography key={m} sx={{ flex: 1, textAlign: 'center', fontSize: { xs: '0.25rem', md: '0.375rem' }, color: SIDEBAR_TEXT }}>
                      {m}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Recent transactions */}
          <Box sx={{
            bgcolor: CARD_BG, borderRadius: { xs: 1.5, md: 2 },
            border: `1px solid ${BORDER}`,
            p: { xs: 0.75, md: 1.5 },
          }}>
            <Typography sx={{ fontSize: { xs: '0.375rem', md: '0.5625rem' }, fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155', mb: { xs: 0.5, md: 0.75 } }}>
              {t('dashboard.recentTransactions') || 'รายการล่าสุด'}
            </Typography>
            {transactions.map((tx, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 },
                py: { xs: 0.25, md: 0.5 },
                borderTop: i > 0 ? `1px solid ${BORDER}` : 'none',
              }}>
                <Box sx={{
                  width: { xs: 14, md: 22 }, height: { xs: 14, md: 22 },
                  borderRadius: '5px',
                  bgcolor: tx.type === 'income' ? alpha('#22c55e', 0.1) : alpha('#ef4444', 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tx.type === 'income'
                    ? <ArrowUpwardIcon sx={{ fontSize: { xs: 7, md: 11 }, color: '#22c55e' }} />
                    : <ArrowDownwardIcon sx={{ fontSize: { xs: 7, md: 11 }, color: '#ef4444' }} />
                  }
                </Box>
                <Typography sx={{ flex: 1, fontSize: { xs: '0.375rem', md: '0.5625rem' }, fontWeight: 500, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {tx.name}
                </Typography>
                <Typography sx={{
                  fontSize: { xs: '0.375rem', md: '0.5625rem' }, fontWeight: 600,
                  color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {tx.amount}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Feature Card ───────────────────────────────────
function FeatureCard({ icon, title, description }) {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 3 },
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -8px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 22, color: theme.palette.primary.main } })}
      </Box>
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 0.75, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Paper>
  );
}

// ─── Step Card ──────────────────────────────────────
function StepCard({ step, icon, title, description }) {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: 'center', px: { xs: 1, md: 2 } }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          position: 'relative',
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 24, color: theme.palette.primary.main } })}
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#fff' }}>{step}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  );
}

// ─── Main Landing Page ──────────────────────────────
function LandingPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>

      {/* ── Navbar ────────────────────────────────── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: alpha(theme.palette.background.default, 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${primary}, ${theme.palette.primary.dark || primary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1.125rem' }, color: 'text.primary', letterSpacing: '-0.01em' }}>
                Expense Tracker
              </Typography>
            </Box>

            {/* Language + Auth buttons */}
            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1.5 }, alignItems: 'center' }}>
              <LanguageMenu />
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8125rem' }, minWidth: 'auto', px: { xs: 1.5, sm: 2 } }}
              >
                {t('landing.login')}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/register')}
                sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8125rem' }, minWidth: 'auto', px: { xs: 1.5, sm: 2 } }}
              >
                {t('landing.register')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Hero ─────────────────────────────────── */}
      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 12 },
          position: 'relative',
          background: isDark
            ? `radial-gradient(ellipse at 20% 50%, ${alpha(primary, 0.06)} 0%, transparent 60%)`
            : `radial-gradient(ellipse at 20% 50%, ${alpha(primary, 0.04)} 0%, transparent 60%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOutQuart }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                    color: 'text.primary',
                    mb: 2.5,
                  }}
                >
                  {t('landing.heroTitle1')}
                  <br />
                  <Box component="span" sx={{ color: 'primary.main' }}>{t('landing.heroTitle2')}</Box>
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: easeOutQuart }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '0.9375rem', md: '1.0625rem' },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    mb: 4,
                    maxWidth: 480,
                  }}
                >
                  {t('landing.heroDesc')}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: easeOutQuart }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ py: { xs: 1.25, sm: 1.5 }, px: { xs: 3, sm: 4 }, fontSize: { xs: '0.875rem', sm: '0.9375rem' }, fontWeight: 700 }}
                  >
                    {t('landing.startFree')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ py: { xs: 1.25, sm: 1.5 }, px: { xs: 3, sm: 4 }, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                  >
                    {t('landing.login')}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: easeOutQuart }}
              >
                <MockDashboard />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Stats Bar ────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center" component={motion.div} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}>
            {[
              { value: '1,000+', label: t('landing.statUsers') },
              { value: '50,000+', label: t('landing.statRecords') },
              { value: '100%', label: t('landing.statFree') },
              { value: '24/7', label: t('landing.statAccess') },
            ].map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label} component={motion.div} variants={staggerItem}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'primary.main', letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.25 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ─────────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutQuart }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1.5 }}>
                {t('landing.featuresTitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
                {t('landing.featuresDesc')}
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={2.5} component={motion.div} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-60px' }}>
            {[
              { icon: <ReceiptLongIcon />, title: t('landing.feat1Title'), desc: t('landing.feat1Desc') },
              { icon: <SavingsIcon />, title: t('landing.feat2Title'), desc: t('landing.feat2Desc') },
              { icon: <BarChartIcon />, title: t('landing.feat3Title'), desc: t('landing.feat3Desc') },
              { icon: <CategoryIcon />, title: t('landing.feat4Title'), desc: t('landing.feat4Desc') },
              { icon: <TrendingUpIcon />, title: t('landing.feat5Title'), desc: t('landing.feat5Desc') },
              { icon: <SecurityIcon />, title: t('landing.feat6Title'), desc: t('landing.feat6Desc') },
            ].map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title} component={motion.div} variants={staggerItem}>
                <FeatureCard icon={f.icon} title={f.title} description={f.desc} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── How It Works ─────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1.5 }}>
              {t('landing.stepsTitle')}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 3 }} component={motion.div} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-60px' }}>
            <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
              <StepCard step={1} icon={<PersonAddIcon />} title={t('landing.step1Title')} description={t('landing.step1Desc')} />
            </Grid>
            <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
              <StepCard step={2} icon={<AddCircleOutlineIcon />} title={t('landing.step2Title')} description={t('landing.step2Desc')} />
            </Grid>
            <Grid item xs={12} sm={4} component={motion.div} variants={staggerItem}>
              <StepCard step={3} icon={<AssessmentIcon />} title={t('landing.step3Title')} description={t('landing.step3Desc')} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Final CTA ────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          background: isDark
            ? `radial-gradient(ellipse at 50% 80%, ${alpha(primary, 0.08)} 0%, transparent 60%)`
            : `radial-gradient(ellipse at 50% 80%, ${alpha(primary, 0.05)} 0%, transparent 60%)`,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutQuart }}
            viewport={{ once: true }}
          >
            <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 2 }}>
              {t('landing.ctaTitle1')}
              <br />
              {t('landing.ctaTitle2')}
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', mb: 4 }}>
              {t('landing.ctaDesc')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth={isSmall}
              onClick={() => navigate('/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{ py: { xs: 1.5, sm: 1.75 }, px: { xs: 4, sm: 5 }, fontSize: { xs: '0.9375rem', sm: '1rem' }, fontWeight: 700 }}
            >
              {t('landing.ctaButton')}
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* ── Footer ───────────────────────────────── */}
      <Box
        sx={{
          py: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Expense Tracker
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {t('landing.footer')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
