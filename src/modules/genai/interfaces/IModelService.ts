/**
 * Interface for AI model operations
 * Abstracts model initialization and inference to allow for different model backends
 */

export interface ModelConfig {
  model: string;
  use_mlock?: boolean;
  n_ctx?: number;
  n_gpu_layers?: number;
  embedding?: boolean;
}

export interface CompletionConfig {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  n_predict?: number;
  stop?: string[];
}

export interface CompletionResult {
  text: string;
}

export interface TokenCallback {
  (data: { token: string }): void;
}

export interface ModelContext {
  completion(
    config: CompletionConfig,
    callback?: TokenCallback,
  ): Promise<CompletionResult>;
}

/**
 * Interface for AI model service
 * Provides abstraction over model initialization and inference operations
 */
export interface IModelService {
  /**
   * Initialize the AI model with the given configuration
   * @param config Model configuration
   * @returns Promise that resolves to a model context
   */
  initializeModel(config: ModelConfig): Promise<ModelContext>;

  /**
   * Get the model path for the current platform
   * @param filename Model filename
   * @returns Promise that resolves to the full model path
   */
  getModelPath(filename: string): Promise<string>;
}

