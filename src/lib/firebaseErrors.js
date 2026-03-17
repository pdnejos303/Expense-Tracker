/**
 * Maps Firebase error codes to user-friendly Thai messages.
 */

const errorMessages = {
  // Auth errors
  'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้',
  'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
  'auth/invalid-credential': 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง',
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
  'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/too-many-requests': 'มีการเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณารอสักครู่แล้วลองใหม่',
  'auth/network-request-failed': 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาตรวจสอบการเชื่อมต่อ',
  'auth/popup-closed-by-user': 'การเข้าสู่ระบบถูกยกเลิก',
  'auth/account-exists-with-different-credential': 'บัญชีนี้เชื่อมต่อกับผู้ให้บริการอื่นอยู่แล้ว',
  'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการนี้',
  'auth/user-disabled': 'บัญชีนี้ถูกระงับการใช้งาน',

  // Firestore errors
  'permission-denied': 'คุณไม่มีสิทธิ์ดำเนินการนี้',
  'not-found': 'ไม่พบข้อมูลที่ต้องการ',
  'already-exists': 'ข้อมูลนี้มีอยู่แล้ว',
  'resource-exhausted': 'ใช้งานเกินขีดจำกัด กรุณารอสักครู่',
  'unavailable': 'ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ภายหลัง',
  'deadline-exceeded': 'การดำเนินการใช้เวลานานเกินไป กรุณาลองใหม่',

  // Storage errors
  'storage/unauthorized': 'คุณไม่มีสิทธิ์อัปโหลดไฟล์',
  'storage/canceled': 'การอัปโหลดถูกยกเลิก',
  'storage/unknown': 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
};

/**
 * Get a user-friendly error message from a Firebase error.
 * @param {Error} error - The error object from Firebase
 * @returns {string} Thai error message
 */
export function getFirebaseErrorMessage(error) {
  if (!error) return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';

  const code = error.code || '';
  if (errorMessages[code]) {
    return errorMessages[code];
  }

  // Fallback: generic message without exposing raw error
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
}
