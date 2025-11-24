// TensorFlow Lite model loader implementation

import { Platform } from 'react-native';
import { TFLiteModule, TFLiteModel } from '../utils/TFLiteModule';
import { ModelDecryptor } from '../../security/model-security/ModelDecryptor';

// Dynamic import for react-native-fs to avoid type errors if not installed
let RNFS: any;
try {
  RNFS = require('react-native-fs');
} catch (error) {
  console.warn('react-native-fs not available');
}

export interface ModelLoadOptions {
  encrypted?: boolean;
  modelName?: string;
}

/**
 * TFLite Model Loader
 * Handles loading TFLite models from filesystem or assets
 */
export class TFLiteLoader {
  private static loadedModels: Map<string, TFLiteModel> = new Map();

  /**
   * Load a TFLite model
   */
  static async loadModel(
    modelPath: string,
    options: ModelLoadOptions = {},
  ): Promise<TFLiteModel> {
    // Check cache
    const cacheKey = options.modelName || modelPath;
    const cached = this.loadedModels.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let finalPath = modelPath;

      // Handle encrypted models
      if (options.encrypted || ModelDecryptor.isEncryptedPath(modelPath)) {
        const decrypted = await ModelDecryptor.decryptModel(
          modelPath,
          options.modelName || 'default',
        );
        finalPath = decrypted.path;
      } else {
        // For non-encrypted models, resolve asset path
        finalPath = await this.resolveModelPath(modelPath);
      }

      // Load model using TFLite module
      const model = await TFLiteModule.loadModel(finalPath);

      // Cache model
      this.loadedModels.set(cacheKey, model);

      return model;
    } catch (error) {
      throw new Error(
        `Failed to load TFLite model: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Load model from buffer (for decrypted models)
   */
  static async loadModelFromBuffer(
    buffer: ArrayBuffer,
    modelName: string,
  ): Promise<TFLiteModel> {
    const cacheKey = `buffer_${modelName}`;
    const cached = this.loadedModels.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const model = await TFLiteModule.loadModelFromBuffer(buffer);
      this.loadedModels.set(cacheKey, model);
      return model;
    } catch (error) {
      throw new Error(
        `Failed to load TFLite model from buffer: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Resolve model path for different platforms
   */
  private static async resolveModelPath(path: string): Promise<string> {
    // If path starts with http/https, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // For React Native, resolve asset path
    if (!RNFS) {
      throw new Error('react-native-fs is required for model loading');
    }

    if (Platform.OS === 'android') {
      // Android: assets are bundled, use asset:// prefix or copy to filesystem
      if (path.startsWith('assets/')) {
        // Copy asset to filesystem for TFLite to access
        const assetPath = path.replace('assets/', '');
        const destPath = `${RNFS.DocumentDirectoryPath}/${assetPath
          .split('/')
          .pop()}`;

        // Check if already copied
        const exists = await RNFS.exists(destPath);
        if (!exists) {
          // Copy from assets (implementation depends on asset bundling)
          // For now, assume model is in assets folder
          await RNFS.copyFileAssets(assetPath, destPath);
        }

        return destPath;
      }
    } else if (Platform.OS === 'ios') {
      // iOS: models in bundle, copy to documents
      if (path.startsWith('assets/')) {
        const assetPath = path.replace('assets/', '');
        const destPath = `${RNFS.DocumentDirectoryPath}/${assetPath
          .split('/')
          .pop()}`;

        const exists = await RNFS.exists(destPath);
        if (!exists) {
          // Copy from bundle
          const bundlePath = `${RNFS.MainBundlePath}/${assetPath}`;
          await RNFS.copyFile(bundlePath, destPath);
        }

        return destPath;
      }
    }

    // Return path as-is if it's already a filesystem path
    return path;
  }

  /**
   * Unload a model from memory
   */
  static unloadModel(modelName: string): void {
    this.loadedModels.delete(modelName);
  }

  /**
   * Get loaded model
   */
  static getLoadedModel(modelName: string): TFLiteModel | undefined {
    return this.loadedModels.get(modelName);
  }

  /**
   * Check if model is loaded
   */
  static isModelLoaded(modelName: string): boolean {
    return this.loadedModels.has(modelName);
  }
}
