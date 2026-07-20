import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  IconButton,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { firestore, auth } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import iconMap, { iconOptions } from '@/shared/constants/iconMap';

const defaultForm = { name: '', type: 'expense', color: '#3b82f6', icon: 'Category' };

function QuickAddCategoryDialog({ open, onClose, onCreated, defaultType }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setForm({ ...defaultForm, type: defaultType || 'expense' });
    setError('');
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!form.name.trim()) { setError(t('category.enterName')); return; }
    setSaving(true);
    setError('');
    try {
      await firestore.collection('categories').add({
        userId: user.uid,
        name: form.name.trim(),
        type: form.type,
        color: form.color,
        icon: form.icon,
      });
      onCreated?.(form.name.trim(), form.type);
      onClose();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ onEnter: handleOpen }}
    >
      <DialogTitle sx={{ pb: 1 }}>{t('category.addNew')}</DialogTitle>
      <DialogContent>
        <TextField
          label={t('category.categoryName')}
          fullWidth
          sx={{ mt: 1.5 }}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={!!error}
          helperText={error}
          autoFocus
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>{t('common.type')}</InputLabel>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} label={t('common.type')}>
            <MenuItem value="income">{t('common.income')}</MenuItem>
            <MenuItem value="expense">{t('common.expense')}</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.primary' }}>{t('common.color')}</Typography>
          <Box
            component="label"
            sx={{
              display: 'block', width: '100%', height: 40, borderRadius: 2,
              backgroundColor: form.color, border: '2px solid', borderColor: alpha(form.color, 0.3),
              cursor: 'pointer', '&:hover': { opacity: 0.85 },
            }}
          >
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.primary' }}>{t('common.icon')}</Typography>
          <Box sx={{ maxHeight: 180, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
            <Grid container spacing={0.5}>
              {iconOptions.map((iconName) => {
                const Ic = iconMap[iconName]; if (!Ic) return null;
                const isSelected = form.icon === iconName;
                return (
                  <Grid item key={iconName}>
                    <IconButton
                      onClick={() => setForm({ ...form, icon: iconName })}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) },
                      }}
                    >
                      <Ic fontSize="small" />
                    </IconButton>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? t('common.saving') : t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuickAddCategoryDialog;
