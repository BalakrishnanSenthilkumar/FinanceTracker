// TFLite native module wrapper for React Native
// Supports react-native-llm-mediapipe for Gemma 3N models

import { NativeModules } from 'react-native';

export interface TFLiteInterpreter {
  allocateTensors(): void;
  getInputTensor(index: number): TFLiteTensor;
  getOutputTensor(index: number): TFLiteTensor;
  invoke(): void;
  resizeInputTensor(index: number, shape: number[]): void;
}

export interface TFLiteTensor {
  dataSync(): Float32Array | Int32Array | Uint8Array;
  data(): Promise<Float32Array | Int32Array | Uint8Array>;
  shape(): number[];
  dtype(): string;
}

export interface TFLiteModel {
  interpreter: TFLiteInterpreter;
  inputShape: number[];
  outputShape: number[];
}

/**
 * LLM Inference Interface (for react-native-llm-mediapipe)
 */
export interface LLMInference {
  loadModel(modelPath: string): Promise<void>;
  generateResponse(prompt: string, options?: GenerateOptions): Promise<string>;
  isModelLoaded(): boolean;
  unloadModel(): void;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

/**
 * TFLite Module Interface
 * Supports both TFLite and react-native-llm-mediapipe
 */
export class TFLiteModule {
  private static llmInference: LLMInference | null = null;
  private static useLLMMediaPipe: boolean = false;

  /**
   * Initialize with react-native-llm-mediapipe
   */
  static async initializeLLMMediaPipe(): Promise<void> {
    try {
      // Try NativeModules first (common for React Native native modules)
      const nativeModuleNames = [
        'LlmMediapipe',
        'LLMMediapipe',
        'LlmInference',
        'LLMInference',
        'ReactNativeLlmMediapipe',
      ];

      for (const moduleName of nativeModuleNames) {
        if (NativeModules[moduleName]) {
          console.log(`✅ Found native module: ${moduleName}`);
          const nativeModule = NativeModules[moduleName];
          console.log('Native module methods:', Object.keys(nativeModule));

          // Check if it has the required methods
          if (
            typeof nativeModule.loadModel === 'function' &&
            typeof nativeModule.generateResponse === 'function'
          ) {
            this.llmInference = nativeModule as LLMInference;
            this.useLLMMediaPipe = true;
            console.log(
              '✅ react-native-llm-mediapipe initialized via NativeModules',
            );
            return;
          }
        }
      }

      // Try require() approach
      const LLMModule = require('react-native-llm-mediapipe');

      console.log('🔍 Checking react-native-llm-mediapipe exports...');
      console.log('Module keys:', Object.keys(LLMModule));

      // Check for different possible exports
      let inferenceInstance: any = null;

      // Try different export patterns
      if (LLMModule.LlmInference) {
        // If it's a class, instantiate it
        console.log('Found LlmInference class');
        inferenceInstance = new LLMModule.LlmInference();
      } else if (LLMModule.default && typeof LLMModule.default === 'function') {
        // If default is a constructor
        console.log('Found default constructor');
        inferenceInstance = new LLMModule.default();
      } else if (LLMModule.default && typeof LLMModule.default === 'object') {
        // If default is an object with methods
        console.log('Found default object');
        inferenceInstance = LLMModule.default;
      } else if (typeof LLMModule === 'object' && LLMModule.loadModel) {
        // Module exports methods directly
        console.log('Found direct method exports');
        inferenceInstance = LLMModule;
      } else if (
        LLMModule.LlmInference &&
        typeof LLMModule.LlmInference === 'object'
      ) {
        // Static object (not a class)
        console.log('Found LlmInference static object');
        inferenceInstance = LLMModule.LlmInference;
      }

      // Verify the instance has required methods
      if (inferenceInstance) {
        const hasLoadModel = typeof inferenceInstance.loadModel === 'function';
        const hasGenerateResponse =
          typeof inferenceInstance.generateResponse === 'function';
        const hasIsModelLoaded =
          typeof inferenceInstance.isModelLoaded === 'function';

        console.log('Method check:', {
          loadModel: hasLoadModel,
          generateResponse: hasGenerateResponse,
          isModelLoaded: hasIsModelLoaded,
        });

        if (hasLoadModel && hasGenerateResponse) {
          this.llmInference = inferenceInstance as LLMInference;
          this.useLLMMediaPipe = true;
          console.log('✅ react-native-llm-mediapipe initialized successfully');
        } else {
          console.warn(
            '⚠️  react-native-llm-mediapipe found but missing required methods',
          );
          console.warn('Available methods:', Object.keys(inferenceInstance));
          this.useLLMMediaPipe = false;
        }
      } else {
        console.warn('⚠️  Could not find valid LLM inference instance');
        console.warn(
          'Module structure:',
          JSON.stringify(Object.keys(LLMModule), null, 2),
        );
        console.warn(
          'Available NativeModules:',
          Object.keys(NativeModules).filter(
            k =>
              k.toLowerCase().includes('llm') ||
              k.toLowerCase().includes('mediapipe'),
          ),
        );
        this.useLLMMediaPipe = false;
      }
    } catch (error) {
      console.warn('❌ react-native-llm-mediapipe not available:', error);
      console.warn(
        'Available NativeModules:',
        Object.keys(NativeModules).filter(
          k =>
            k.toLowerCase().includes('llm') ||
            k.toLowerCase().includes('mediapipe'),
        ),
      );
      this.useLLMMediaPipe = false;
    }
  }

  /**
   * Load model directly from path (simplified, no initialization checks)
   */
  static async loadModelDirect(modelPath: string): Promise<TFLiteModel> {
    console.log(`📥 Loading model directly from: ${modelPath}`);

    // Try to find and use the native module directly
    try {
      // Try NativeModules first
      const nativeModuleNames = [
        'LlmMediapipe',
        'LLMMediapipe',
        'LlmInference',
        'LLMInference',
        'ReactNativeLlmMediapipe',
      ];

      for (const moduleName of nativeModuleNames) {
        if (NativeModules[moduleName]) {
          const nativeModule = NativeModules[moduleName];
          if (
            typeof nativeModule.loadModel === 'function' &&
            typeof nativeModule.generateResponse === 'function'
          ) {
            console.log(`✅ Using native module: ${moduleName}`);
            await nativeModule.loadModel(modelPath);
            this.llmInference = nativeModule as LLMInference;
            this.useLLMMediaPipe = true;
            console.log('✅ Model loaded directly via native module');

            return {
              interpreter: this.createLLMInterpreterWrapper(),
              inputShape: [1, 512],
              outputShape: [1, 512],
            };
          }
        }
      }

      // Try require() approach
      const LLMModule = require('react-native-llm-mediapipe');
      let inferenceInstance: any = null;

      // Try different export patterns
      if (LLMModule.LlmInference) {
        inferenceInstance = new LLMModule.LlmInference();
      } else if (LLMModule.default && typeof LLMModule.default === 'function') {
        inferenceInstance = new LLMModule.default();
      } else if (LLMModule.default && typeof LLMModule.default === 'object') {
        inferenceInstance = LLMModule.default;
      } else if (typeof LLMModule === 'object' && LLMModule.loadModel) {
        inferenceInstance = LLMModule;
      } else if (
        LLMModule.LlmInference &&
        typeof LLMModule.LlmInference === 'object'
      ) {
        inferenceInstance = LLMModule.LlmInference;
      }

      if (
        inferenceInstance &&
        typeof inferenceInstance.loadModel === 'function'
      ) {
        await inferenceInstance.loadModel(modelPath);
        this.llmInference = inferenceInstance as LLMInference;
        this.useLLMMediaPipe = true;
        console.log('✅ Model loaded directly via require()');

        return {
          interpreter: this.createLLMInterpreterWrapper(),
          inputShape: [1, 512],
          outputShape: [1, 512],
        };
      }
    } catch (error) {
      console.error('❌ Direct model loading failed:', error);
      throw new Error(
        `Failed to load model directly: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    throw new Error(
      'Could not find react-native-llm-mediapipe module. Please ensure it is installed and linked.',
    );
  }

  /**
   * Load a model (supports both TFLite and LLM MediaPipe)
   */
  static async loadModel(modelPath: string): Promise<TFLiteModel> {
    // Try direct loading first (simpler approach)
    try {
      return await this.loadModelDirect(modelPath);
    } catch {
      console.log('Direct loading failed, trying initialized module...');
    }

    // Try LLM MediaPipe if initialized (for Gemma 3N)
    if (this.useLLMMediaPipe && this.llmInference) {
      try {
        // Double-check that loadModel exists before calling
        if (typeof this.llmInference.loadModel !== 'function') {
          throw new Error(
            `loadModel is not a function. Available methods: ${Object.keys(
              this.llmInference,
            ).join(', ')}`,
          );
        }

        console.log(`📥 Loading model from: ${modelPath}`);
        await this.llmInference.loadModel(modelPath);
        console.log('✅ Model loaded via react-native-llm-mediapipe');

        // Return a wrapper that works with our interface
        return {
          interpreter: this.createLLMInterpreterWrapper(),
          inputShape: [1, 512], // Placeholder
          outputShape: [1, 512], // Placeholder
        };
      } catch (error) {
        console.error('❌ Failed to load model via LLM MediaPipe:', error);
        console.error('llmInference object:', this.llmInference);
        console.error(
          'Available methods:',
          this.llmInference ? Object.keys(this.llmInference) : 'null',
        );
        throw error;
      }
    }

    // Fallback to TFLite (if native module available)
    throw new Error(
      'TFLite native module not found. Please install react-native-llm-mediapipe or react-native-fast-tflite.',
    );
  }

  /**
   * Generate response using LLM MediaPipe
   */
  static async generateResponse(
    prompt: string,
    options: GenerateOptions = {},
  ): Promise<string> {
    if (!this.useLLMMediaPipe || !this.llmInference) {
      throw new Error(
        'LLM inference not available. Module not initialized or model not loaded.',
      );
    }

    // Check if model is loaded (with fallback if method doesn't exist)
    let modelLoaded = false;
    if (typeof this.llmInference.isModelLoaded === 'function') {
      try {
        modelLoaded = this.llmInference.isModelLoaded();
      } catch (error) {
        console.warn('Error checking model loaded status:', error);
        // If we have llmInference, assume it's loaded
        modelLoaded = true;
      }
    } else {
      // If isModelLoaded doesn't exist, assume model is loaded if we have llmInference
      modelLoaded = true;
    }

    if (!modelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    // Verify generateResponse method exists
    if (typeof this.llmInference.generateResponse !== 'function') {
      throw new Error(
        `generateResponse is not a function. Available methods: ${Object.keys(
          this.llmInference,
        ).join(', ')}`,
      );
    }

    console.log('🤖 Generating response with model...');
    console.log(`   Prompt length: ${prompt.length} characters`);
    console.log(`   Options:`, {
      maxTokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
      topP: options.topP || 0.9,
      topK: options.topK || 40,
    });

    try {
      const response = await this.llmInference.generateResponse(prompt, {
        maxTokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.9,
        topK: options.topK || 40,
      });

      console.log(`✅ Generated response (${response.length} characters)`);
      return response;
    } catch (error) {
      console.error('❌ Error generating response:', error);
      throw new Error(
        `Failed to generate response: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Create a wrapper interpreter for LLM MediaPipe
   */
  private static createLLMInterpreterWrapper(): TFLiteInterpreter {
    return {
      allocateTensors: () => {
        // No-op for LLM MediaPipe
      },
      getInputTensor: (_index: number) => {
        throw new Error('Use generateResponse() instead of tensor operations');
      },
      getOutputTensor: (_index: number) => {
        throw new Error('Use generateResponse() instead of tensor operations');
      },
      invoke: () => {
        throw new Error('Use generateResponse() instead of invoke()');
      },
      resizeInputTensor: (_index: number, _shape: number[]) => {
        // No-op
      },
    };
  }

  /**
   * Load a TFLite model from buffer (for decrypted models)
   */
  static async loadModelFromBuffer(_buffer: ArrayBuffer): Promise<TFLiteModel> {
    throw new Error(
      'Buffer loading not supported. Use loadModel() with file path.',
    );
  }

  /**
   * Check if TFLite/LLM is available
   */
  static isAvailable(): boolean {
    return this.useLLMMediaPipe && this.llmInference !== null;
  }

  /**
   * Check if model is loaded
   */
  static isModelLoaded(): boolean {
    if (!this.llmInference) {
      return false;
    }

    // Try to call isModelLoaded if it exists
    if (typeof this.llmInference.isModelLoaded === 'function') {
      try {
        return this.llmInference.isModelLoaded();
      } catch (error) {
        console.warn('Error checking model loaded status:', error);
        // If method exists, assume model is loaded
        return true;
      }
    }

    // If isModelLoaded doesn't exist but we have llmInference, assume loaded
    return this.llmInference !== null;
  }

  /**
   * Unload model
   */
  static unloadModel(): void {
    this.llmInference?.unloadModel();
  }
}
