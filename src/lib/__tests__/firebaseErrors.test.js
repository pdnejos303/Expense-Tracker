import { describe, it, expect, beforeAll } from 'vitest';
import i18n from '../i18n';
import { getFirebaseErrorMessage } from '../firebaseErrors';

beforeAll(() => {
  i18n.changeLanguage('th');
});

describe('getFirebaseErrorMessage', () => {
  it('returns translated message for known error codes', () => {
    const msg = getFirebaseErrorMessage({ code: 'auth/user-not-found' });
    expect(msg).toBe(i18n.t('errors.userNotFound'));
    expect(msg).toBeTruthy();
  });

  it('returns generic message for unknown error codes', () => {
    const msg = getFirebaseErrorMessage({ code: 'auth/some-unknown-error' });
    expect(msg).toBe(i18n.t('errors.generic'));
  });

  it('returns unknown message for null error', () => {
    const msg = getFirebaseErrorMessage(null);
    expect(msg).toBe(i18n.t('errors.unknown'));
  });

  it('returns generic message for error without code', () => {
    const msg = getFirebaseErrorMessage({ message: 'something failed' });
    expect(msg).toBe(i18n.t('errors.generic'));
  });

  it('handles all documented Firebase auth errors', () => {
    const codes = [
      'auth/wrong-password',
      'auth/invalid-credential',
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/invalid-email',
      'auth/too-many-requests',
      'auth/network-request-failed',
      'auth/popup-closed-by-user',
    ];
    codes.forEach((code) => {
      const msg = getFirebaseErrorMessage({ code });
      // Should return a translated string, not the key
      expect(msg).not.toBe(code);
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  it('changes language and returns correct translation', () => {
    i18n.changeLanguage('en');
    const msg = getFirebaseErrorMessage({ code: 'auth/wrong-password' });
    expect(msg).toBe('Incorrect password');

    i18n.changeLanguage('th');
    const msgTh = getFirebaseErrorMessage({ code: 'auth/wrong-password' });
    expect(msgTh).toBe('รหัสผ่านไม่ถูกต้อง');
  });
});
