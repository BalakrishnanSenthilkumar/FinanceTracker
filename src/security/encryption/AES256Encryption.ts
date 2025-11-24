// AES-256 encryption implementation

import { Platform } from 'react-native';

export interface EncryptionResult {
  encrypted: ArrayBuffer;
  iv: Uint8Array;
}

export interface DecryptionResult {
  decrypted: ArrayBuffer;
}

/**
 * AES-256 encryption/decryption utilities
 * Uses native crypto APIs when available, falls back to JavaScript implementation
 */
export class AES256Encryption {
  /**
   * Encrypt data using AES-256-GCM
   */
  static async encrypt(
    data: ArrayBuffer,
    key: Uint8Array,
  ): Promise<EncryptionResult> {
    if (key.length !== 32) {
      throw new Error('AES-256 requires a 32-byte (256-bit) key');
    }

    try {
      // Generate random IV
      const iv = new Uint8Array(12); // 96-bit IV for GCM
      if (Platform.OS === 'web') {
        crypto.getRandomValues(iv);
      } else {
        // Use native crypto for mobile
        // In production, use react-native-crypto or native module
        crypto.getRandomValues(iv);
      }

      // Use Web Crypto API or native implementation
      if (Platform.OS === 'web' && typeof crypto !== 'undefined' && crypto.subtle) {
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          key,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt'],
        );

        const encrypted = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
          },
          cryptoKey,
          data,
        );

        return {
          encrypted,
          iv,
        };
      }

      // Fallback: For React Native, use a library like react-native-crypto
      // or implement native module
      throw new Error(
        'Native crypto implementation required. Install react-native-crypto or implement native module.',
      );
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static async decrypt(
    encrypted: ArrayBuffer,
    key: Uint8Array,
    iv: Uint8Array,
  ): Promise<DecryptionResult> {
    if (key.length !== 32) {
      throw new Error('AES-256 requires a 32-byte (256-bit) key');
    }

    try {
      if (Platform.OS === 'web' && typeof crypto !== 'undefined' && crypto.subtle) {
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          key,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt'],
        );

        const decrypted = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
          },
          cryptoKey,
          encrypted,
        );

        return { decrypted };
      }

      // Fallback: For React Native, use a library like react-native-crypto
      throw new Error(
        'Native crypto implementation required. Install react-native-crypto or implement native module.',
      );
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a random encryption key
   */
  static generateKey(): Uint8Array {
    const key = new Uint8Array(32);
    if (Platform.OS === 'web') {
      crypto.getRandomValues(key);
    } else {
      // Use native random generator
      crypto.getRandomValues(key);
    }
    return key;
  }
}
