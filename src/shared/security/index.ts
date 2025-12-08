/**
 * Security Module Exports
 */

// Cryptographic utilities
export {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  encryptData,
  decryptData,
} from './crypto';

// Secure storage
export {
  storeSession,
  getSession,
  clearSession,
  hasValidSession,
  storeSecureData,
  getSecureData,
  deleteSecureData,
} from './secureStorage';
export type { StoredSession } from './secureStorage';

// Login security (rate limiting)
export {
  isLockedOut,
  recordFailedAttempt,
  recordSuccessfulLogin,
  getRemainingAttempts,
  unlockAccount,
} from './loginSecurity';

// Database encryption
export {
  getDatabaseEncryptionKey,
  hasEncryptionKey,
  deleteEncryptionKey,
} from './databaseEncryption';

