/**
 * Database Encryption Service
 * Manages encryption key for SQLite database using SQLCipher
 */
import CryptoJS from 'crypto-js';

const DB_KEY_SERVICE = 'com.financetracker.dbkey';
const KEY_LENGTH = 32; // 256 bits

// In-memory fallback for development/testing when Keychain is unavailable
let fallbackKey: string | null = null;

/**
 * Check if Keychain is available
 */
const isKeychainAvailable = async (): Promise<boolean> => {
  try {
    const Keychain = require('react-native-keychain');
    return Keychain && typeof Keychain.getGenericPassword === 'function';
  } catch {
    return false;
  }
};

/**
 * Generate a secure random encryption key
 */
const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(KEY_LENGTH).toString();
};

/**
 * Store the database encryption key securely in Keychain
 */
const storeEncryptionKey = async (key: string): Promise<boolean> => {
  try {
    if (!(await isKeychainAvailable())) {
      console.warn('[Security] Keychain not available, using in-memory fallback');
      fallbackKey = key;
      return true;
    }

    const Keychain = require('react-native-keychain');
    await Keychain.setGenericPassword('db_encryption_key', key, {
      service: DB_KEY_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (error) {
    console.warn('[Security] Keychain store failed, using fallback:', error);
    fallbackKey = key;
    return true;
  }
};

/**
 * Retrieve the database encryption key from Keychain
 */
const retrieveEncryptionKey = async (): Promise<string | null> => {
  // Check fallback first
  if (fallbackKey) {
    return fallbackKey;
  }

  try {
    if (!(await isKeychainAvailable())) {
      return null;
    }

    const Keychain = require('react-native-keychain');
    const credentials = await Keychain.getGenericPassword({
      service: DB_KEY_SERVICE,
    });

    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.warn('[Security] Keychain retrieve failed:', error);
    return null;
  }
};

/**
 * Get or create database encryption key
 * - First time: generates and stores a new key
 * - Subsequent calls: retrieves existing key
 */
export const getDatabaseEncryptionKey = async (): Promise<string> => {
  // Try to get existing key
  let key = await retrieveEncryptionKey();

  if (key) {
    return key;
  }

  // Generate new key if none exists
  key = generateEncryptionKey();
  const stored = await storeEncryptionKey(key);

  if (!stored) {
    throw new Error('Failed to store database encryption key');
  }

  console.log('[Security] New database encryption key generated and stored');
  return key;
};

/**
 * Check if database encryption key exists
 */
export const hasEncryptionKey = async (): Promise<boolean> => {
  const key = await retrieveEncryptionKey();
  return key !== null;
};

/**
 * Delete the encryption key (WARNING: This will make encrypted data unrecoverable!)
 */
export const deleteEncryptionKey = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({ service: DB_KEY_SERVICE });
    return true;
  } catch (error) {
    console.error('Failed to delete encryption key:', error);
    return false;
  }
};

