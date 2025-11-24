// Query processing with registered processors - registerProcessor() extension point

import { QueryProcessor } from '../processors/QueryProcessor';
import { BaseAIEngine } from '../engines/BaseAIEngine';
import { EngineFactory } from '../engines/EngineFactory';
import { ProcessResult } from '../types/processor.types';

type ProcessorRegistry = Map<string, QueryProcessor>;

export class QueryEngine {
  private static processors: ProcessorRegistry = new Map();
  private static defaultEngine: BaseAIEngine | null = null;

  /**
   * Register a processor for a specific query type
   */
  static registerProcessor(name: string, processor: QueryProcessor): void {
    this.processors.set(name, processor);
  }

  /**
   * Get a registered processor
   */
  static getProcessor(name: string): QueryProcessor | undefined {
    return this.processors.get(name);
  }

  /**
   * Initialize default chat processor with Gemma 3N
   */
  static async initializeDefault(
    onDownloadProgress?: (progress: any) => void,
  ): Promise<void> {
    if (!this.defaultEngine) {
      this.defaultEngine = await EngineFactory.createAndInitialize('local', {
        onDownloadProgress,
      });
    }

    const processor = new QueryProcessor(this.defaultEngine);
    this.registerProcessor('chat', processor);
  }

  /**
   * Process a query using the default chat processor
   */
  static async processQuery(query: string): Promise<ProcessResult> {
    const processor = this.getProcessor('chat');

    if (!processor) {
      // Auto-initialize if not already done
      await this.initializeDefault();
      const defaultProcessor = this.getProcessor('chat');
      if (!defaultProcessor) {
        throw new Error('Failed to initialize chat processor');
      }
      return defaultProcessor.process(query);
    }

    return processor.process(query);
  }

  /**
   * Clear conversation history for a processor
   */
  static clearHistory(processorName: string = 'chat'): void {
    const processor = this.getProcessor(processorName);
    if (processor) {
      processor.clearHistory();
    }
  }
}
