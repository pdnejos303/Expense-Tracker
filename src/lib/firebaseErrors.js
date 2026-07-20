import i18n from '@/lib/i18n';

const errorKeyMap = {
  'auth/user-not-found': 'errors.userNotFound',
  'auth/wrong-password': 'errors.wrongPassword',
  'auth/invalid-credential': 'errors.invalidCredential',
  'auth/email-already-in-use': 'errors.emailInUse',
  'auth/weak-password': 'errors.weakPassword',
  'auth/invalid-email': 'errors.invalidEmail',
  'auth/too-many-requests': 'errors.tooManyRequests',
  'auth/network-request-failed': 'errors.networkError',
  'auth/popup-closed-by-user': 'errors.popupClosed',
  'auth/account-exists-with-different-credential': 'errors.accountLinked',
  'auth/requires-recent-login': 'errors.recentLogin',
  'auth/user-disabled': 'errors.userDisabled',
  'permission-denied': 'errors.permissionDenied',
  'not-found': 'errors.notFound',
  'already-exists': 'errors.alreadyExists',
  'resource-exhausted': 'errors.rateLimited',
  'unavailable': 'errors.unavailable',
  'deadline-exceeded': 'errors.timeout',
  'storage/unauthorized': 'errors.uploadUnauthorized',
  'storage/canceled': 'errors.uploadCancelled',
  'storage/unknown': 'errors.uploadError',
};

export function getFirebaseErrorMessage(error) {
  if (!error) return i18n.t('errors.unknown');
  const code = error.code || '';
  const key = errorKeyMap[code];
  if (key) return i18n.t(key);
  return i18n.t('errors.generic');
}
