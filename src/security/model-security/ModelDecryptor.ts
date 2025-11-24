// Model decryption service - decrypts models from /assets/models_encrypted/

import { Platform } from 'react-native';
import { AES256Encryption } from '../encryption/AES256Encryption';
import { KeychainManager } from '../keychain/KeychainManager';
import RNFS from 'react-native-fs';

export interface DecryptedModel {
  buffer: ArrayBuffer;
  path: string;
}

/**
 * Model decryption service
 * Handles decryption of encrypted TFLite models
 */
export class ModelDecryptor {
  private static decryptedModels: Map<string, DecryptedModel> = new Map();

  /**
   * Decrypt and load model from encrypted file
   */
  static async decryptModel(
    encryptedPath: string,
    modelName: string,
  ): Promise<DecryptedModel> {
    // Check cache first
    const cached = this.decryptedModels.get(modelName);
    if (cached) {
      return cached;
    }

    try {
      // Get encryption key from keychain
      const key = await KeychainManager.getKey(`model_key_${modelName}`);
      if (!key) {
        throw new Error(`Encryption key not found for model: ${modelName}`);
      }

      // Read encrypted file
      let encryptedData: ArrayBuffer;
      if (Platform.OS === 'web') {
        // Web: Fetch and read as array buffer
        const response = await fetch(encryptedPath);
        encryptedData = await response.arrayBuffer();
      } else {
        // Mobile: Use react-native-fs
        const base64 = await RNFS.readFile(encryptedPath, 'base64');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        encryptedData = bytes.buffer;
      }

      // Extract IV (first 12 bytes) and encrypted data
      const iv = new Uint8Array(encryptedData.slice(0, 12));
      const encrypted = encryptedData.slice(12);

      // Decrypt
      const { decrypted } = await AES256Encryption.decrypt(encrypted, key, iv);

      // Save decrypted model to temporary location
      const tempPath = await this.saveTemporaryModel(decrypted, modelName);

      const decryptedModel: DecryptedModel = {
        buffer: decrypted,
        path: tempPath,
      };

      // Cache decrypted model
      this.decryptedModels.set(modelName, decryptedModel);

      return decryptedModel;
    } catch (error) {
      throw new Error(
        `Failed to decrypt model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Save decrypted model to temporary location
   */
  private static async saveTemporaryModel(
    buffer: ArrayBuffer,
    modelName: string,
  ): Promise<string> {
    const tempDir = Platform.OS === 'ios'
      ? RNFS.DocumentDirectoryPath
      : RNFS.CachesDirectoryPath;
    const tempPath = `${tempDir}/${modelName}_decrypted.tflite`;

    // Convert ArrayBuffer to base64 for RNFS
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    await RNFS.writeFile(tempPath, base64, 'base64');

    return tempPath;
  }

  /**
   * Clear decrypted model cache
   */
  static async clearCache(modelName?: string): Promise<void> {
    if (modelName) {
      const cached = this.decryptedModels.get(modelName);
      if (cached) {
        // Delete temporary file
        try {
          await RNFS.unlink(cached.path);
        } catch (error) {
          console.warn('Failed to delete temporary model file:', error);
        }
        this.decryptedModels.delete(modelName);
      }
    } else {
      // Clear all
      for (const [name, model] of this.decryptedModels.entries()) {
        try {
          await RNFS.unlink(model.path);
        } catch (error) {
          console.warn(`Failed to delete temporary model file for ${name}:`, error);
        }
      }
      this.decryptedModels.clear();
    }
  }

  /**
   * Check if model is encrypted
   */
  static isEncryptedPath(path: string): boolean {
    return path.includes('models_encrypted') || path.endsWith('.encrypted');
  }
}
