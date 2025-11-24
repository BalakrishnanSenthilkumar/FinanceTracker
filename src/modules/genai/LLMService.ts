import {
  LLMModule,
  type Message as ExecutorchMessage,
  ETInstallerNativeModule,
} from 'react-native-executorch';
import { TurboModuleRegistry, Platform } from 'react-native';

export interface ModelConfig {
  modelSource: string;
  tokenizerSource: string;
  tokenizerConfigSource?: string;
}

export interface GenerationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class LLMService {
  private llmInstance: LLMModule | null = null;
  private isModelLoaded = false;
  private currentModelPath: string | null = null;

  constructor() {
    try {
      // Check if TurboModule (ETInstaller) exists
      // react-native-executorch uses TurboModules (New Architecture)
      const etInstaller = ETInstallerNativeModule;

      if (!etInstaller) {
        const platform = Platform.OS;
        const errorMsg =
          `react-native-executorch native module not found!\n\n` +
          `Please rebuild the app:\n` +
          `iOS: cd ios && pod install && cd .. && yarn ios\n` +
          `Android: cd android && ./gradlew clean && cd .. && yarn android\n\n` +
          `Note: This module requires New Architecture (TurboModules).`;

        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      // Install JSI bindings (required for react-native-executorch)
      try {
        etInstaller.install();
        console.log('✅ ETInstaller installed successfully');
      } catch (installError) {
        console.warn(
          '⚠️ ETInstaller.install() failed (may already be installed):',
          installError,
        );
      }

      this.llmInstance = new LLMModule();
      console.log('✅ LLMModule initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LLMModule:', error);
      throw error;
    }
  }

  /**
   * Load the AI model with tokenizer
   */
  async loadModel(config: ModelConfig): Promise<void> {
    if (!this.llmInstance) {
      throw new Error('LLMModule not initialized. Please rebuild the app.');
    }

    try {
      // Don't reload if same model is already loaded
      if (this.isModelLoaded && this.currentModelPath === config.modelSource) {
        console.log('Model already loaded');
        return;
      }

      // Unload previous model if exists
      if (this.isModelLoaded) {
        this.llmInstance.delete();
      }

      console.log('Loading model:', config.modelSource);

      await this.llmInstance.load({
        modelSource: config.modelSource,
        tokenizerSource: config.tokenizerSource,
        tokenizerConfigSource: config.tokenizerConfigSource,
      });

      this.isModelLoaded = true;
      this.currentModelPath = config.modelSource;
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
      this.isModelLoaded = false;
      this.currentModelPath = null;
      throw error;
    }
  }

  /**
   * Set up token callback for streaming responses
   */
  setTokenCallback(callback: (token: string) => void): void {
    if (!this.llmInstance) {
      throw new Error('LLMModule not initialized');
    }

    if (!this.isModelLoaded) {
      console.warn('Model not loaded, cannot set token callback');
      return;
    }

    this.llmInstance.setTokenCallback({
      tokenCallback: callback,
    });
  }

  /**
   * Generate response from messages
   */
  async generate(messages: ExecutorchMessage[]): Promise<string | null> {
    if (!this.llmInstance) {
      throw new Error('LLMModule not initialized');
    }

    if (!this.isModelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      const response = await this.llmInstance.generate(messages);
      return response;
    } catch (error) {
      console.error('Generation failed:', error);
      throw error;
    }
  }

  /**
   * Interrupt ongoing generation
   */
  interrupt(): void {
    if (this.llmInstance && this.isModelLoaded) {
      this.llmInstance.interrupt();
    }
  }

  /**
   * Unload the model and free resources
   */
  unload(): void {
    if (this.llmInstance && this.isModelLoaded) {
      this.llmInstance.delete();
      this.isModelLoaded = false;
      this.currentModelPath = null;
      console.log('Model unloaded');
    }
  }

  /**
   * Check if model is loaded
   */
  isReady(): boolean {
    return this.isModelLoaded;
  }

  /**
   * Get current model path
   */
  getCurrentModelPath(): string | null {
    return this.currentModelPath;
  }
}

// Export singleton instance
export const llmService = new LLMService();
export default llmService;
