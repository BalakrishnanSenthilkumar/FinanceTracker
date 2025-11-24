// On-device LLM engine using Gemma 3N model via react-native-llm-mediapipe

import { BaseAIEngine } from './BaseAIEngine';
import { AIRequest, AIResponse, AIEngineConfig } from '../types/engine.types';
import { ModelType } from '../types/model.types';
import { TFLiteModule } from '../utils/TFLiteModule';
import { GemmaModelService } from '../utils/GemmaModelService';
import { GemmaTokenizer } from '../utils/GemmaTokenizer';
import { DownloadProgress } from '../types/engine.types';

export class LocalLLMEngine extends BaseAIEngine {
  private modelLoaded: boolean = false;
  private modelActuallyLoaded: boolean = false; // Track if model is actually loaded and ready
  private modelType: ModelType = 'gemma-3b';
  private modelPath?: string;
  private modelName: string = 'gemma-3n';
  private tokenizer: GemmaTokenizer;
  private useLLMMediaPipe: boolean = false;
  private onDownloadProgress?: (progress: DownloadProgress) => void;

  constructor(config: AIEngineConfig = {}) {
    super(config);
    this.modelType = (
      config.modelPath?.includes('gemma') ? 'gemma-3b' : 'phi-3'
    ) as ModelType;
    this.modelPath = config.modelPath;
    this.modelName =
      config.modelPath
        ?.split('/')
        .pop()
        ?.replace(/\.(tflite|task)$/, '') || 'gemma-3n';
    this.tokenizer = new GemmaTokenizer();
    this.onDownloadProgress = config.onDownloadProgress;
  }

  async initialize(): Promise<void> {
    try {
      console.log(`Initializing ${this.modelType} model...`);

      // Initialize LLM MediaPipe if available
      await TFLiteModule.initializeLLMMediaPipe();
      this.useLLMMediaPipe = TFLiteModule.isAvailable();

      // Get model path first (download if needed)
      // This should happen regardless of LLM MediaPipe availability
      let modelPath = this.modelPath;

      if (!modelPath) {
        console.log(
          '🔍 No model path specified, checking for existing model...',
        );
        const exists = await GemmaModelService.modelExists();
        if (!exists) {
          console.log('📥 Model not found, starting download...');
          modelPath = await GemmaModelService.downloadModel({
            modelName: 'gemma-3n-E4B-it-int4.task',
            onProgress: progress => {
              // Log progress updates
              if (progress.progress % 10 < 0.1) {
                console.log(
                  `📊 Download: ${progress.progress.toFixed(1)}% (${(
                    (progress.progress / 100) *
                    2.4
                  ).toFixed(2)} GB / 2.4 GB)`,
                );
              }
              // Call user-provided progress callback
              if (this.onDownloadProgress) {
                this.onDownloadProgress(progress);
              }
            },
          });
        } else {
          console.log('✅ Model found locally');
          modelPath = await GemmaModelService.getModelPath({
            modelName: 'gemma-3n-E4B-it-int4.task',
          });
        }
      } else {
        // Check if model exists, download if not
        const exists = await GemmaModelService.modelExists(modelPath);
        if (!exists) {
          console.log('📥 Model not found locally, starting download...');
          modelPath = await GemmaModelService.downloadModel({
            modelName:
              modelPath.split('/').pop() || 'gemma-3n-E4B-it-int4.task',
            onProgress: progress => {
              if (progress.progress % 10 < 0.1) {
                console.log(
                  `📊 Download: ${progress.progress.toFixed(1)}% (${(
                    (progress.progress / 100) *
                    2.4
                  ).toFixed(2)} GB / 2.4 GB)`,
                );
              }
              // Call user-provided progress callback
              if (this.onDownloadProgress) {
                this.onDownloadProgress(progress);
              }
            },
          });
        } else {
          console.log('✅ Model found at specified path');
        }
      }

      this.modelPath = modelPath;
      console.log(`📁 Model path: ${modelPath}`);

      // Try to load model directly (bypasses initialization checks)
      let modelLoadSuccess = false;
      try {
        console.log('🔄 Attempting direct model load...');
        await TFLiteModule.loadModelDirect(modelPath);
        this.useLLMMediaPipe = TFLiteModule.isAvailable();
        const isLoaded = TFLiteModule.isModelLoaded();
        if (isLoaded) {
          this.modelActuallyLoaded = true;
          modelLoadSuccess = true;
          console.log(
            '✅ Gemma 3N model loaded successfully and ready for inference',
          );
        } else {
          console.warn('⚠️  Model loaded but isModelLoaded() returned false');
        }
      } catch (loadError) {
        console.warn(
          '⚠️  Direct model load failed, trying initialized module...',
        );
        console.warn('Error:', loadError);

        // Try initialized module as fallback
        if (this.useLLMMediaPipe) {
          try {
            await TFLiteModule.loadModel(modelPath);
            const isLoaded = TFLiteModule.isModelLoaded();
            if (isLoaded) {
              this.modelActuallyLoaded = true;
              modelLoadSuccess = true;
              console.log('✅ Model loaded via initialized module and ready');
            }
          } catch (initError) {
            console.error('❌ Failed to load model:', initError);
            console.warn('⚠️  Model loading failed - will use demo mode');
          }
        } else {
          console.warn('⚠️  LLM MediaPipe not available');
          console.warn('   This could mean:');
          console.warn('   1. react-native-llm-mediapipe is not installed');
          console.warn('   2. Native module is not linked properly');
          console.warn(
            '   3. App needs to be rebuilt after installing the package',
          );
          console.warn(`   Model is available at: ${modelPath}`);
          console.warn(
            '   To fix: Run "npm install react-native-llm-mediapipe" and rebuild the app',
          );
        }
      }

      if (!modelLoadSuccess) {
        console.error(
          '❌ CRITICAL: Model failed to load. Chat will use demo mode.',
        );
        console.error('   Check console logs above for details.');
        this.modelActuallyLoaded = false;
      }

      // Initialize tokenizer
      await this.tokenizer.initialize();

      this.modelLoaded = true;
      console.log('✅ Local LLM engine initialized (may be in demo mode)');
    } catch (error) {
      console.error('❌ Failed to initialize local LLM:', error);
      // Fallback to demo mode if model loading fails
      if (
        error instanceof Error &&
        (error.message.includes('not found') ||
          error.message.includes('not available'))
      ) {
        console.warn('⚠️  Model loading failed, using demo mode');
        this.modelLoaded = true; // Allow demo mode
      } else {
        throw error;
      }
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    if (!this.isReady()) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    const startTime = Date.now();

    // Check if model is actually loaded and ready
    const modelReady =
      this.modelActuallyLoaded &&
      this.useLLMMediaPipe &&
      TFLiteModule.isAvailable() &&
      TFLiteModule.isModelLoaded();

    console.log('🔍 Model status check:', {
      modelActuallyLoaded: this.modelActuallyLoaded,
      useLLMMediaPipe: this.useLLMMediaPipe,
      isAvailable: TFLiteModule.isAvailable(),
      isModelLoaded: TFLiteModule.isModelLoaded(),
      modelReady,
    });

    if (!modelReady) {
      console.warn('⚠️  Model not ready - using demo mode');
      console.warn(
        '   To fix: Ensure react-native-llm-mediapipe is properly installed and linked',
      );
    }

    try {
      // Extract user message and build prompt from conversation history
      const userMessage =
        request.messages[request.messages.length - 1]?.content || '';
      const prompt = this.buildPrompt(request.messages);

      // Process with Gemma 3N model if available and ready
      let response: string;
      if (modelReady) {
        console.log('🤖 Using real Gemma 3N model for inference...');
        try {
          response = await this.processWithGemmaModel(prompt, request);
          console.log('✅ Got real response from model');
        } catch (modelError) {
          console.error('❌ Model inference failed:', modelError);
          console.warn('⚠️  Falling back to demo mode');
          response = await this.processWithModel(userMessage, request.messages);
        }
      } else {
        // Fallback to demo mode
        console.warn('⚠️  Using demo mode - model not ready');
        response = await this.processWithModel(userMessage, request.messages);
      }

      const latency = Date.now() - startTime;

      return {
        content: response,
        model: this.modelType,
        latency,
      };
    } catch (error) {
      console.error('❌ Error processing chat request:', error);
      // Fallback to demo mode on error
      const userMessage =
        request.messages[request.messages.length - 1]?.content || '';
      const response = await this.processWithModel(
        userMessage,
        request.messages,
      );
      return {
        content: response,
        model: this.modelType,
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Process message using Gemma 3N via LLM MediaPipe
   */
  private async processWithGemmaModel(
    prompt: string,
    request: AIRequest,
  ): Promise<string> {
    try {
      // Use LLM MediaPipe to generate response
      const response = await TFLiteModule.generateResponse(prompt, {
        maxTokens: request.maxTokens || 500,
        temperature: request.temperature || 0.7,
        topP: 0.9,
        topK: 40,
      });

      return response.trim();
    } catch (error) {
      console.error('Gemma model inference error:', error);
      throw error;
    }
  }

  /**
   * Build prompt from conversation history
   */
  private buildPrompt(messages: any[]): string {
    // Filter out system message and build user/assistant conversation
    const conversation = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        }
        return '';
      })
      .join('\n');

    // Get system message if available
    const systemMessage = messages.find(msg => msg.role === 'system');
    const systemPrompt = systemMessage
      ? `${systemMessage.content}\n\n`
      : 'You are a helpful finance assistant. Help users manage their finances, track expenses, set budgets, and answer questions about their financial data.\n\n';

    return `${systemPrompt}${conversation}\nAssistant:`;
  }

  /**
   * Fallback demo mode processing
   */
  private async processWithModel(
    userMessage: string,
    _conversationHistory: any[],
  ): Promise<string> {
    // Simple rule-based response for demo
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your finance assistant powered by Gemma 3N. How can I help you with your finances today?";
    }

    if (lowerMessage.includes('expense') || lowerMessage.includes('spending')) {
      return 'I can help you track expenses. Would you like to add a new expense or view your spending history?';
    }

    if (lowerMessage.includes('budget')) {
      return "Let's work on your budget! I can help you set monthly budgets and track your progress.";
    }

    if (lowerMessage.includes('income') || lowerMessage.includes('salary')) {
      return 'I can help you track your income sources. Would you like to add income or view your income history?';
    }

    // Default response
    return `I understand you're asking about: "${userMessage}". As your finance assistant powered by Gemma 3N, I'm here to help you manage your finances better. Could you provide more details about what you'd like to know?`;
  }

  isReady(): boolean {
    return this.modelLoaded;
  }

  /**
   * Check if the real model is loaded and ready for inference
   */
  isModelReady(): boolean {
    return (
      this.modelActuallyLoaded &&
      this.useLLMMediaPipe &&
      TFLiteModule.isAvailable() &&
      TFLiteModule.isModelLoaded()
    );
  }

  /**
   * Get model status for debugging
   */
  getModelStatus(): {
    initialized: boolean;
    modelActuallyLoaded: boolean;
    useLLMMediaPipe: boolean;
    moduleAvailable: boolean;
    modelLoaded: boolean;
    modelPath?: string;
  } {
    return {
      initialized: this.modelLoaded,
      modelActuallyLoaded: this.modelActuallyLoaded,
      useLLMMediaPipe: this.useLLMMediaPipe,
      moduleAvailable: TFLiteModule.isAvailable(),
      modelLoaded: TFLiteModule.isModelLoaded(),
      modelPath: this.modelPath,
    };
  }

  /**
   * Force reload the model
   */
  async reloadModel(): Promise<void> {
    if (!this.modelPath) {
      throw new Error('No model path available to reload');
    }

    console.log('🔄 Reloading model...');
    this.modelActuallyLoaded = false;

    try {
      await TFLiteModule.loadModelDirect(this.modelPath);
      this.useLLMMediaPipe = TFLiteModule.isAvailable();
      const isLoaded = TFLiteModule.isModelLoaded();
      if (isLoaded) {
        this.modelActuallyLoaded = true;
        console.log('✅ Model reloaded successfully');
      } else {
        throw new Error('Model loaded but isModelLoaded() returned false');
      }
    } catch (error) {
      console.error('❌ Failed to reload model:', error);
      throw error;
    }
  }

  async dispose(): Promise<void> {
    // Cleanup resources
    if (this.useLLMMediaPipe) {
      TFLiteModule.unloadModel();
    }
    this.modelLoaded = false;
    console.log('Local LLM engine disposed');
  }

  getType(): string {
    return 'local-llm-gemma';
  }
}
