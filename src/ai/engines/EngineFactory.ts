// Factory for creating engine instances (switches between CloudAIEngine and LocalLLMEngine)

import { BaseAIEngine } from './BaseAIEngine';
import { LocalLLMEngine } from './LocalLLMEngine';
import { AIEngineConfig } from '../types/engine.types';

export type EngineType = 'local' | 'cloud';

export class EngineFactory {
  /**
   * Create an AI engine instance
   * @param type - 'local' for on-device, 'cloud' for cloud-based
   * @param config - Engine configuration
   */
  static create(
    type: EngineType = 'local',
    config: AIEngineConfig = {},
  ): BaseAIEngine {
    switch (type) {
      case 'local':
        // Default to Gemma 3N model (auto-downloads if path not specified)
        return new LocalLLMEngine({
          ...config,
          // modelPath will be auto-determined if not provided
          // Gemma 3N will be downloaded automatically
        });

      case 'cloud':
        // CloudAIEngine would be implemented here
        throw new Error('CloudAIEngine not yet implemented');

      default:
        throw new Error(`Unknown engine type: ${type}`);
    }
  }

  /**
   * Initialize engine with default Gemma 3B model
   */
  static async createAndInitialize(
    type: EngineType = 'local',
    config: AIEngineConfig = {},
  ): Promise<BaseAIEngine> {
    const engine = this.create(type, config);
    await engine.initialize();
    return engine;
  }
}
