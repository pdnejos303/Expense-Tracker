/**
 * Shared validation and sanitization utilities
 */

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
  if (!file) return { valid: false, error: 'ไม่พบไฟล์' };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `ประเภทไฟล์ไม่ถูกต้อง (${file.type || 'unknown'}) — รองรับเฉพาะ JPEG, PNG, GIF, WebP`,
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB}MB` };
  }

  return { valid: true, error: null };
}

/**
 * Sanitize a filename to prevent path traversal
 */
export function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
