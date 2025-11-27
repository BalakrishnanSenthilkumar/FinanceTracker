/**
 * Shared types for the AI module
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ModelConfig {
  filename: string;
}

