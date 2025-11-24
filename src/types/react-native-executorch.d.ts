/**
 * Type definitions for react-native-executorch v0.5.6
 */

declare module 'react-native-executorch' {
  export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface LoadModelConfig {
    modelSource: string;
    tokenizerSource: string;
    tokenizerConfigSource?: string;
  }

  export interface TokenCallbackConfig {
    tokenCallback: (token: string) => void;
  }

  export interface ModelSource {
    modelSource: string;
    tokenizerSource: string;
    tokenizerConfigSource: string;
  }

  export class LLMModule {
    constructor();

    /**
     * Load a model with tokenizer
     */
    load(config: LoadModelConfig): Promise<void>;

    /**
     * Set callback for streaming tokens
     */
    setTokenCallback(config: TokenCallbackConfig): void;

    /**
     * Generate response from messages
     */
    generate(messages: Message[]): Promise<string | null>;

    /**
     * Interrupt ongoing generation
     */
    interrupt(): void;

    /**
     * Delete/unload the model
     */
    delete(): void;
  }

  export class ResourceFetcher {
    /**
     * Fetch/download resources with progress callback
     */
    static fetch(
      progressCallback: (progress: number) => void,
      ...resourcePaths: string[]
    ): Promise<any>;

    /**
     * Cancel ongoing fetch
     */
    static cancelFetching(...resourcePaths: string[]): Promise<void>;

    /**
     * Delete downloaded resources
     */
    static deleteResources(...resourcePaths: string[]): Promise<void>;
  }

  // Predefined Models - LLaMA
  export const LLAMA3_2_1B: ModelSource;
  export const LLAMA3_2_1B_QLORA: ModelSource;
  export const LLAMA3_2_1B_SPINQUANT: ModelSource;
  export const LLAMA3_2_3B: ModelSource;
  export const LLAMA3_2_3B_QLORA: ModelSource;
  export const LLAMA3_2_3B_SPINQUANT: ModelSource;

  // Predefined Models - Qwen 3
  export const QWEN3_0_6B: ModelSource;
  export const QWEN3_0_6B_QUANTIZED: ModelSource;
  export const QWEN3_1_7B: ModelSource;
  export const QWEN3_1_7B_QUANTIZED: ModelSource;
  export const QWEN3_4B: ModelSource;
  export const QWEN3_4B_QUANTIZED: ModelSource;

  // Predefined Models - Qwen 2.5
  export const QWEN2_5_0_5B: ModelSource;
  export const QWEN2_5_0_5B_QUANTIZED: ModelSource;
  export const QWEN2_5_1_5B: ModelSource;
  export const QWEN2_5_1_5B_QUANTIZED: ModelSource;
  export const QWEN2_5_3B: ModelSource;
  export const QWEN2_5_3B_QUANTIZED: ModelSource;

  // Predefined Models - Hammer
  export const HAMMER2_1_0_5B: ModelSource;
  export const HAMMER2_1_0_5B_QUANTIZED: ModelSource;
  export const HAMMER2_1_1_5B: ModelSource;
  export const HAMMER2_1_1_5B_QUANTIZED: ModelSource;
  export const HAMMER2_1_3B: ModelSource;
  export const HAMMER2_1_3B_QUANTIZED: ModelSource;

  // Predefined Models - PHI
  export const PHI_4_MINI_4B: ModelSource;
  export const PHI_4_MINI_4B_QUANTIZED: ModelSource;
}
