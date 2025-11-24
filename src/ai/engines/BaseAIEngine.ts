// Abstract base class for all AI engines

import { AIRequest, AIResponse, AIEngineConfig } from '../types/engine.types';

export abstract class BaseAIEngine {
  protected config: AIEngineConfig;

  constructor(config: AIEngineConfig = {}) {
    this.config = config;
  }

  /**
   * Initialize the engine (load model, connect to API, etc.)
   */
  abstract initialize(): Promise<void>;

  /**
   * Process a chat request and return response
   */
  abstract chat(request: AIRequest): Promise<AIResponse>;

  /**
   * Check if engine is ready to process requests
   */
  abstract isReady(): boolean;

  /**
   * Cleanup resources
   */
  abstract dispose(): Promise<void>;

  /**
   * Get engine type identifier
   */
  abstract getType(): string;
}
