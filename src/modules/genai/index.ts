/**
 * AI Module Entry Point
 * Exports all public interfaces and types for the AI module
 */

export { IModelService } from './interfaces/IModelService';
export type {
  ModelConfig,
  CompletionConfig,
  CompletionResult,
  ModelContext,
  TokenCallback,
} from './interfaces/IModelService';
export { LlamaModelService } from './implementations/LlamaModelService';
export type { Message } from './types';

