// Gemma model service for downloading and managing Gemma 3N model
// Uses react-native-llm-mediapipe for model inference

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface GemmaModelConfig {
  modelUrl?: string;
  modelName?: string;
  quantized?: boolean;
  onProgress?: (progress: DownloadProgress) => void;
}

export interface DownloadProgress {
  bytesWritten: number;
  contentLength: number;
  progress: number; // 0-100
  speed: number; // bytes per second
  eta: number; // estimated seconds remaining
}

export class GemmaModelService {
  // Official Google Gemma 3N model distributed through HuggingFace
  // Official Google page: https://deepmind.google/models/gemma/gemma-3n/
  private static readonly DEFAULT_MODEL_URL =
    'https://huggingface.co/MrZeggers/gemma-3n-mobile/resolve/main/gemma-3n-E4B-it-int4.task';
  private static readonly DEFAULT_MODEL_NAME = 'gemma-3n-E4B-it-int4.task';
  private static modelPath: string | null = null;

  /**
   * Get the default model path where the app expects the model
   * Use this to know where to place manually downloaded models
   */
  static getDefaultModelPath(): string {
    const downloadDir =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DocumentDirectoryPath;
    return `${downloadDir}/${this.DEFAULT_MODEL_NAME}`;
  }

  /**
   * Download Gemma 3N model from HuggingFace
   */
  static async downloadModel(config: GemmaModelConfig = {}): Promise<string> {
    const modelUrl = config.modelUrl || this.DEFAULT_MODEL_URL;
    const modelName = config.modelName || this.DEFAULT_MODEL_NAME;
    const onProgress = config.onProgress;

    try {
      // Determine download directory
      const downloadDir =
        Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.DocumentDirectoryPath;
      const modelPath = `${downloadDir}/${modelName}`;

      // Check if model already exists
      const exists = await RNFS.exists(modelPath);
      if (exists) {
        const size = await this.getModelSize(modelPath);
        console.log(
          `✅ Model already exists at: ${modelPath} (${this.formatBytes(
            size,
          )})`,
        );
        this.modelPath = modelPath;
        return modelPath;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 Starting Gemma 3N Model Download');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Source: ${modelUrl}`);
      console.log(`💾 Destination: ${modelPath}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const startTime = Date.now();
      let lastBytesWritten = 0;
      let lastUpdateTime = startTime;

      // Download model file
      const downloadResult = await RNFS.downloadFile({
        fromUrl: modelUrl,
        toFile: modelPath,
        progress: res => {
          const now = Date.now();
          const timeDelta = (now - lastUpdateTime) / 1000; // seconds
          const bytesDelta = res.bytesWritten - lastBytesWritten;
          const speed = timeDelta > 0 ? bytesDelta / timeDelta : 0;
          const progress = (res.bytesWritten / res.contentLength) * 100;
          const remaining = res.contentLength - res.bytesWritten;
          const eta = speed > 0 ? remaining / speed : 0;

          // Update tracking
          lastBytesWritten = res.bytesWritten;
          lastUpdateTime = now;

          // Format progress info
          const progressInfo: DownloadProgress = {
            bytesWritten: res.bytesWritten,
            contentLength: res.contentLength,
            progress,
            speed,
            eta,
          };

          // Log progress (every 5% or every 2 seconds)
          if (progress % 5 < 0.1 || timeDelta >= 2) {
            console.log(
              `📊 Progress: ${progress.toFixed(1)}% | ` +
                `${this.formatBytes(res.bytesWritten)} / ${this.formatBytes(
                  res.contentLength,
                )} | ` +
                `Speed: ${this.formatBytes(speed)}/s | ` +
                `ETA: ${this.formatTime(eta)}`,
            );
          }

          // Call progress callback
          if (onProgress) {
            onProgress(progressInfo);
          }
        },
      }).promise;

      const totalTime = (Date.now() - startTime) / 1000;
      const finalSize = await this.getModelSize(modelPath);

      if (downloadResult.statusCode === 200) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Model downloaded successfully!');
        console.log(`📦 Size: ${this.formatBytes(finalSize)}`);
        console.log(`⏱️  Time: ${this.formatTime(totalTime)}`);
        console.log(`📁 Location: ${modelPath}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.modelPath = modelPath;
        return modelPath;
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.statusCode}`,
        );
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ Model download failed!');
      console.error(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error(
        `Model download failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Format seconds to human-readable time
   */
  private static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Copy model from Downloads folder (Android only)
   * Useful when user downloads model directly on phone
   */
  static async copyFromDownloads(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const modelName = this.DEFAULT_MODEL_NAME;
      const defaultPath = this.getDefaultModelPath();

      // Check if already in app directory
      const exists = await RNFS.exists(defaultPath);
      if (exists) {
        console.log('✅ Model already in app directory');
        return true;
      }

      // Try common Android Downloads paths
      const possiblePaths = [
        '/sdcard/Download/' + modelName,
        '/storage/emulated/0/Download/' + modelName,
        '/storage/emulated/0/Downloads/' + modelName,
        RNFS.DownloadDirectoryPath + '/' + modelName,
      ];

      for (const sourcePath of possiblePaths) {
        try {
          const sourceExists = await RNFS.exists(sourcePath);
          if (sourceExists) {
            console.log(`📋 Found model in Downloads: ${sourcePath}`);
            console.log(`📥 Copying to app directory...`);
            await RNFS.copyFile(sourcePath, defaultPath);

            // Verify copy was successful
            const copiedExists = await RNFS.exists(defaultPath);
            if (copiedExists) {
              const size = await this.getModelSize(defaultPath);
              console.log(`✅ Successfully copied model to: ${defaultPath}`);
              console.log(`   Size: ${this.formatBytes(size)}`);
              this.modelPath = defaultPath;
              return true;
            } else {
              console.error('❌ Copy failed - file not found at destination');
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Could not access: ${sourcePath}`);
          // Try next path
          continue;
        }
      }

      console.log('ℹ️  Model not found in Downloads folder');
      console.log('   Checked paths:');
      possiblePaths.forEach(path => console.log(`   - ${path}`));
      return false;
    } catch (error) {
      console.error('Failed to copy from Downloads:', error);
      return false;
    }
  }

  /**
   * Get model path (download if needed)
   * Checks for manual model first, then Downloads folder, then downloads if not found
   */
  static async getModelPath(config: GemmaModelConfig = {}): Promise<string> {
    // Check cached path first
    if (this.modelPath) {
      const exists = await RNFS.exists(this.modelPath);
      if (exists) {
        console.log('✅ Using cached model path:', this.modelPath);
        return this.modelPath;
      }
    }

    // Check default location for manually placed model
    const defaultPath = this.getDefaultModelPath();
    const defaultExists = await RNFS.exists(defaultPath);

    if (defaultExists) {
      console.log('✅ Found manually placed model at:', defaultPath);
      const size = await this.getModelSize(defaultPath);
      console.log(`   Size: ${this.formatBytes(size)}`);
      this.modelPath = defaultPath;
      return defaultPath;
    }

    // On Android, check Downloads folder
    if (Platform.OS === 'android') {
      const copied = await this.copyFromDownloads();
      if (copied) {
        const size = await this.getModelSize(defaultPath);
        console.log(`   Size: ${this.formatBytes(size)}`);
        return defaultPath;
      }
    }

    // Model not found, download it
    console.log('📥 Model not found locally, starting download...');
    console.log(`   Expected location: ${defaultPath}`);
    console.log('   To use manual model, place file at the path above');
    return await this.downloadModel(config);
  }

  /**
   * Check if model exists locally
   */
  static async modelExists(modelPath?: string): Promise<boolean> {
    const path = modelPath || this.modelPath;
    if (!path) return false;
    return await RNFS.exists(path);
  }

  /**
   * Delete downloaded model
   */
  static async deleteModel(): Promise<void> {
    if (this.modelPath) {
      try {
        await RNFS.unlink(this.modelPath);
        this.modelPath = null;
        console.log('Model deleted successfully');
      } catch (error) {
        console.error('Failed to delete model:', error);
      }
    }
  }

  /**
   * Get model size
   */
  static async getModelSize(modelPath?: string): Promise<number> {
    const path = modelPath || this.modelPath;
    if (!path) return 0;

    try {
      const stat = await RNFS.stat(path);
      return stat.size || 0;
    } catch (error) {
      console.error('Failed to get model size:', error);
      return 0;
    }
  }
}
