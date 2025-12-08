/**
 * Secure Storage Service
 * Uses react-native-keychain for secure credential storage
 * Falls back to in-memory storage when Keychain is unavailable
 */

const SERVICE_NAME = 'com.financetracker.auth';

// In-memory fallback storage for development/testing
const fallbackStorage: Map<string, string> = new Map();

export interface StoredSession {
  userId: string;
  email: string;
  name: string;
  token: string;
  expiresAt: string;
}

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
 * Store user session securely in device keychain
 */
export const storeSession = async (session: StoredSession): Promise<boolean> => {
  const sessionData = JSON.stringify(session);

  try {
    if (!(await isKeychainAvailable())) {
      console.warn('[Security] Keychain not available, using in-memory fallback');
      fallbackStorage.set(SERVICE_NAME, sessionData);
      return true;
    }

    const Keychain = require('react-native-keychain');
    await Keychain.setGenericPassword('session', sessionData, {
      service: SERVICE_NAME,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch (error) {
    console.warn('[Security] Keychain store failed, using fallback:', error);
    fallbackStorage.set(SERVICE_NAME, sessionData);
    return true;
  }
};

/**
 * Retrieve stored session from device keychain
 */
export const getSession = async (): Promise<StoredSession | null> => {
  try {
    // Check fallback first
    const fallbackData = fallbackStorage.get(SERVICE_NAME);
    if (fallbackData) {
      const session = JSON.parse(fallbackData) as StoredSession;
      if (new Date(session.expiresAt) < new Date()) {
        await clearSession();
        return null;
      }
      return session;
    }

    if (!(await isKeychainAvailable())) {
      return null;
    }

    const Keychain = require('react-native-keychain');
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });

    if (credentials && credentials.password) {
      const session = JSON.parse(credentials.password) as StoredSession;

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await clearSession();
        return null;
      }

      return session;
    }
    return null;
  } catch (error) {
    console.warn('[Security] Failed to get session:', error);
    return null;
  }
};

/**
 * Clear stored session (logout)
 */
export const clearSession = async (): Promise<boolean> => {
  fallbackStorage.delete(SERVICE_NAME);

  try {
    if (!(await isKeychainAvailable())) {
      return true;
    }

    const Keychain = require('react-native-keychain');
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    return true;
  } catch (error) {
    console.warn('[Security] Failed to clear session:', error);
    return true; // Still return true since fallback was cleared
  }
};

/**
 * Check if user has a valid session
 */
export const hasValidSession = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};

/**
 * Store sensitive data with a custom key
 */
export const storeSecureData = async (
  key: string,
  data: string,
): Promise<boolean> => {
  const serviceKey = `${SERVICE_NAME}.${key}`;

  try {
    if (!(await isKeychainAvailable())) {
      fallbackStorage.set(serviceKey, data);
      return true;
    }

    const Keychain = require('react-native-keychain');
    await Keychain.setGenericPassword(key, data, {
      service: serviceKey,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch (error) {
    console.warn(`[Security] Keychain store failed for ${key}, using fallback:`, error);
    fallbackStorage.set(serviceKey, data);
    return true;
  }
};

/**
 * Retrieve sensitive data by key
 */
export const getSecureData = async (key: string): Promise<string | null> => {
  const serviceKey = `${SERVICE_NAME}.${key}`;

  try {
    // Check fallback first
    const fallbackData = fallbackStorage.get(serviceKey);
    if (fallbackData) {
      return fallbackData;
    }

    if (!(await isKeychainAvailable())) {
      return null;
    }

    const Keychain = require('react-native-keychain');
    const credentials = await Keychain.getGenericPassword({
      service: serviceKey,
    });

    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.warn(`[Security] Failed to get secure data for ${key}:`, error);
    return null;
  }
};

/**
 * Delete sensitive data by key
 */
export const deleteSecureData = async (key: string): Promise<boolean> => {
  const serviceKey = `${SERVICE_NAME}.${key}`;
  fallbackStorage.delete(serviceKey);

  try {
    if (!(await isKeychainAvailable())) {
      return true;
    }

    const Keychain = require('react-native-keychain');
    await Keychain.resetGenericPassword({ service: serviceKey });
    return true;
  } catch (error) {
    console.warn(`[Security] Failed to delete secure data for ${key}:`, error);
    return true;
  }
};
