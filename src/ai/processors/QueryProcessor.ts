// Natural language query processor

import { BaseAIEngine } from '../engines/BaseAIEngine';
import { AIRequest, AIMessage } from '../types/engine.types';
import { ProcessResult } from '../types/processor.types';

export class QueryProcessor {
  private engine: BaseAIEngine;
  private conversationHistory: AIMessage[] = [];

  constructor(engine: BaseAIEngine) {
    this.engine = engine;
    // Initialize with system message
    this.conversationHistory.push({
      role: 'system',
      content:
        'You are a helpful finance assistant. Help users manage their finances, track expenses, set budgets, and answer questions about their financial data.',
    });
  }

  /**
   * Process a user query and return response
   */
  async process(query: string): Promise<ProcessResult> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: query,
      });

      // Create request
      const request: AIRequest = {
        messages: this.conversationHistory,
        temperature: 0.7,
        maxTokens: 500,
      };

      // Get response from engine
      const response = await this.engine.chat(request);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return {
        success: true,
        data: {
          response: response.content,
          tokensUsed: response.tokensUsed,
          latency: response.latency,
        },
      };
    } catch (error) {
      console.error('QueryProcessor error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [
      {
        role: 'system',
        content:
          'You are a helpful finance assistant. Help users manage their finances, track expenses, set budgets, and answer questions about their financial data.',
      },
    ];
  }

  /**
   * Get conversation history
   */
  getHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }
}
