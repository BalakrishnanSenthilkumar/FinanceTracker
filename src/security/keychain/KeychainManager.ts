// Keychain access wrapper

import { Platform } from 'react-native';

/**
 * Keychain manager for secure key storage
 * Uses react-native-keychain or native keychain APIs
 */
export class KeychainManager {
  private static readonly SERVICE_NAME = 'com.financetracker.ai';
  private static readonly MODEL_KEY_TAG = 'model_encryption_key';

  /**
   * Store encryption key in keychain
   */
  static async storeKey(key: Uint8Array, tag: string = this.MODEL_KEY_TAG): Promise<void> {
    try {
      // Convert Uint8Array to base64 for storage
      const keyBase64 = this.arrayBufferToBase64(key.buffer);

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Use react-native-keychain library
        // Example: await Keychain.setGenericPassword(tag, keyBase64, { service: this.SERVICE_NAME });
        throw new Error(
          'Keychain implementation required. Install react-native-keychain or implement native module.',
        );
      } else {
        // Web: Use localStorage (less secure, but works)
        localStorage.setItem(`${this.SERVICE_NAME}_${tag}`, keyBase64);
      }
    } catch (error) {
      throw new Error(`Failed to store key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve encryption key from keychain
   */
  static async getKey(tag: string = this.MODEL_KEY_TAG): Promise<Uint8Array | null> {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Use react-native-keychain library
        // Example: const credentials = await Keychain.getGenericPassword({ service: this.SERVICE_NAME });
        // if (credentials) { return this.base64ToArrayBuffer(credentials.password); }
        throw new Error(
          'Keychain implementation required. Install react-native-keychain or implement native module.',
        );
      } else {
        // Web: Use localStorage
        const keyBase64 = localStorage.getItem(`${this.SERVICE_NAME}_${tag}`);
        if (keyBase64) {
          return this.base64ToArrayBuffer(keyBase64);
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }

  /**
   * Delete key from keychain
   */
  static async deleteKey(tag: string = this.MODEL_KEY_TAG): Promise<void> {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // await Keychain.resetGenericPassword({ service: this.SERVICE_NAME });
        throw new Error(
          'Keychain implementation required. Install react-native-keychain or implement native module.',
        );
      } else {
        localStorage.removeItem(`${this.SERVICE_NAME}_${tag}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if key exists
   */
  static async hasKey(tag: string = this.MODEL_KEY_TAG): Promise<boolean> {
    const key = await this.getKey(tag);
    return key !== null;
  }

  // Helper methods
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
