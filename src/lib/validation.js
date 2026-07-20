/**
 * Shared validation and sanitization utilities
 */
import i18n from '@/lib/i18n';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Strip HTML tags from a string to prevent XSS
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate file is an allowed image type by checking MIME type
 */
export function validateImageFile(file, maxSizeMB = 2) {
  if (!file) return { valid: false, error: i18n.t('validation.noFile') };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: i18n.t('validation.invalidFileType', { type: file.type || 'unknown' }),
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: i18n.t('validation.fileTooLarge', { size: maxSizeMB }) };
  }

  return { valid: true, error: null };
}

/**
 * Sanitize a filename to prevent path traversal
 */
export function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
