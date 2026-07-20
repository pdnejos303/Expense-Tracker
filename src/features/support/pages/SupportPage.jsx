import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Divider,
  IconButton,
  alpha,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FavoriteIcon from '@mui/icons-material/Favorite';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CoffeeIcon from '@mui/icons-material/Coffee';
import StarIcon from '@mui/icons-material/Star';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CampaignIcon from '@mui/icons-material/Campaign';
import { showToast } from '@/lib/swal';
import PageContainer from '@/shared/components/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, scrollReveal } from '@/shared/utils/animations';

/* ─────────────────────────────────────────────
   แก้ข้อมูลตรงนี้
   ───────────────────────────────────────────── */
const SUPPORT_CONFIG = {
  // PromptPay
  promptPayId: '0624402347', // เบอร์โทร หรือ เลขบัตรประชาชน
  promptPayName: 'ภัคพล แก้วเขียว',
  // ถ้ามี QR Code เป็นรูปภาพ ใส่ URL ตรงนี้ (หรือวางไฟล์ใน public/ แล้วใส่ path)
  promptPayQrUrl: 'promptpay-qr.png', // เช่น '/promptpay-qr.png'

  // บัญชีธนาคาร
  bankAccounts: [
     { bank: 'กสิกรไทย', accountNumber: '159-8-01601-8', accountName: 'ภัคพล แก้วเขียว' },
     { bank: 'กรุงเทพ', accountNumber: '877-7-667497', accountName: 'ภัคพล แก้วเขียว' },
  ],

  // Ad Slots - ใส่ Ad HTML/script ตรงนี้
  showAdBanner: true,
};

const BANK_COLORS = {
  กสิกรไทย: '#138f2d',
  ไทยพาณิชย์: '#4e2a82',
  กรุงเทพ: '#1e22aa',
  กรุงไทย: '#1ba5e0',
  กรุงศรี: '#fec43b',
  ทหารไทยธนชาต: '#0055a5',
  ออมสิน: '#eb198d',
};

function SupportPage() {
  const { t } = useTranslation();
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text.replace(/[-\s]/g, ''));
    showToast(t('support.copied'));
  };

  return (
    <PageContainer title={t('support.title')} maxWidth="md">
      {/* Hero */}
      <Paper
        sx={{
          p: 0,
          overflow: 'hidden',
          mb: 3,
          border: 'none',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #f97316 100%)',
            p: { xs: 4, sm: 5 },
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              bgcolor: alpha('#fff', 0.2),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <FavoriteIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {t('support.heroText')}
          </Typography>
          <Typography sx={{ fontSize: '0.9375rem', color: alpha('#fff', 0.85), maxWidth: 500, mx: 'auto' }}>
            {t('support.heroSub')}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={2.5} component={motion.div} variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}>
        {/* PromptPay */}
        <Grid item xs={12} md={6} component={motion.div} variants={staggerItem}>
          <Paper sx={{ p: { xs: 3, sm: 4 }, height: '100%', textAlign: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: alpha('#3b82f6', 0.1),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <QrCode2Icon sx={{ fontSize: 24, color: '#3b82f6' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', mb: 0.5 }}>
              {t('support.promptPay')}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 3 }}>
              {t('support.promptPayDesc')}
            </Typography>

            {/* QR Code */}
            {SUPPORT_CONFIG.promptPayQrUrl ? (
              <Box
                component="img"
                src={SUPPORT_CONFIG.promptPayQrUrl}
                alt="PromptPay QR Code"
                sx={{
                  width: 200,
                  height: 200,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha('#3b82f6', 0.03),
                }}
              >
                <QrCode2Icon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {t('support.qrPlaceholder')}
                </Typography>
                <Typography sx={{ fontSize: '0.625rem', color: '#cbd5e1' }}>
                  promptPayQrUrl
                </Typography>
              </Box>
            )}

            {/* PromptPay Number */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: alpha('#3b82f6', 0.06),
                borderRadius: 2,
                px: 2.5,
                py: 1.5,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
                {SUPPORT_CONFIG.promptPayId}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleCopy(SUPPORT_CONFIG.promptPayId)}
                sx={{ color: '#3b82f6' }}
                aria-label={t('support.copyPromptPay')}
              >
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 1.5 }}>
              {t('support.nameLabel')} {SUPPORT_CONFIG.promptPayName}
            </Typography>
          </Paper>
        </Grid>

        {/* Bank Accounts */}
        <Grid item xs={12} md={6} component={motion.div} variants={staggerItem}>
          <Paper sx={{ p: { xs: 3, sm: 4 }, height: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  bgcolor: alpha('#22c55e', 0.1),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 24, color: '#22c55e' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', mb: 0.5 }}>
                {t('support.bankTransfer')}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                {t('support.bankDesc')}
              </Typography>
            </Box>

            {SUPPORT_CONFIG.bankAccounts.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SUPPORT_CONFIG.bankAccounts.map((account, i) => {
                  const bankColor = BANK_COLORS[account.bank] || '#64748b';
                  return (
                    <Box
                      key={i}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha(bankColor, 0.2),
                        bgcolor: alpha(bankColor, 0.03),
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={account.bank}
                          size="small"
                          sx={{
                            bgcolor: alpha(bankColor, 0.1),
                            color: bankColor,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(account.accountNumber)}
                          sx={{ color: bankColor }}
                          aria-label={t('support.copyAccount', { bank: account.bank })}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em' }}>
                        {account.accountNumber}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.5 }}>
                        {account.accountName}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: alpha('#22c55e', 0.03),
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  {t('support.addBankHint')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Suggested amounts */}
      <Paper component={motion.div} variants={scrollReveal} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} sx={{ p: { xs: 3, sm: 4 }, mt: 2.5, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 2 }}>
          <CoffeeIcon sx={{ fontSize: 18, verticalAlign: 'text-bottom', mr: 0.5, color: '#f59e0b' }} />
          {t('support.buyCoffee')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[20, 50, 100, 200, 500].map((amount) => (
            <Box
              key={amount}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                border: '1.5px solid',
                borderColor: 'divider',
                cursor: 'default',
                textAlign: 'center',
                minWidth: 80,
                '&:hover': { borderColor: 'primary.main', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
                transition: 'all 0.15s',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                ฿{amount}
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>
                {amount <= 20 ? t('support.coffee1') : amount <= 50 ? t('support.coffee2') : amount <= 100 ? t('support.coffee3') : amount <= 200 ? t('support.coffee4') : t('support.coffee5')}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Thank you */}
      <Paper
        component={motion.div} variants={scrollReveal} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}
        sx={{
          p: { xs: 3, sm: 4 },
          mt: 2.5,
          textAlign: 'center',
          bgcolor: alpha('#f59e0b', 0.04),
          border: '1px solid',
          borderColor: alpha('#f59e0b', 0.15),
        }}
      >
        <StarIcon sx={{ fontSize: 28, color: '#f59e0b', mb: 1 }} />
        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 0.5 }}>
          {t('support.thankYou')}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {t('support.thankYouSub')}
        </Typography>
      </Paper>

      {/* Ad Banner Slot */}
      {SUPPORT_CONFIG.showAdBanner && (
        <Paper
          sx={{
            mt: 2.5,
            p: 0,
            overflow: 'hidden',
            border: '1px dashed',
            borderColor: alpha('#94a3b8', 0.3),
            bgcolor: alpha('#94a3b8', 0.03),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              py: 5,
              gap: 1,
            }}
          >
            <CampaignIcon sx={{ fontSize: 32, color: '#cbd5e1' }} />
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>
              {t('support.adLabel')}
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#cbd5e1' }}>
              {t('support.adHint')}
            </Typography>
            {/*
              วาง Ad code ตรงนี้ เช่น:
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXX"
                data-ad-slot="XXXXXXX"
                data-ad-format="auto"
              />
            */}
          </Box>
        </Paper>
      )}

    </PageContainer>
  );
}

export default SupportPage;
