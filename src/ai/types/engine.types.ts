// Engine interface types

export interface DownloadProgress {
  bytesWritten: number;
  contentLength: number;
  progress: number; // 0-100
  speed: number; // bytes per second
  eta: number; // estimated seconds remaining
}

export interface AIEngineConfig {
  modelPath?: string;
  apiKey?: string;
  apiUrl?: string;
  temperature?: number;
  maxTokens?: number;
  onDownloadProgress?: (progress: DownloadProgress) => void;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
  latency?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}
