import { create } from 'zustand';
import type { Message as ExecutorchMessage } from 'react-native-executorch';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokensPerSecond?: number;
  timeToFirstToken?: number;
}

interface PerformanceMetrics {
  tokenCount: number;
  firstTokenTime: number;
}

interface LLMStore {
  // Model state
  isModelLoaded: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Model info
  currentModelPath: string | null;

  // Chat messages
  messages: ChatMessage[];

  // Performance tracking
  performance: PerformanceMetrics;

  // Actions
  loadModel: (
    modelPath: string,
    tokenizerPath: string,
    tokenizerConfigPath?: string,
  ) => Promise<void>;
  sendMessage: (content: string, systemPrompt?: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  interruptGeneration: () => void;
  setError: (error: string | null) => void;
  resetPerformance: () => void;
}

const calculatePerformanceMetrics = (
  startTime: number,
  endTime: number,
  firstTokenTime: number,
  tokenCount: number,
) => {
  const totalTime = endTime - startTime;
  const timeToFirstToken = firstTokenTime
    ? firstTokenTime - startTime
    : totalTime;
  const timeAfterFirst = Math.max(1, totalTime - timeToFirstToken);
  const tokensPerSecond = tokenCount / (timeAfterFirst / 1000);

  return {
    totalTime,
    timeToFirstToken,
    tokensPerSecond,
  };
};

export const useLLMStore = create<LLMStore>((set, get) => ({
  isModelLoaded: false,
  isLoading: false,
  isGenerating: false,
  error: null,
  currentModelPath: null,
  messages: [],
  performance: {
    tokenCount: 0,
    firstTokenTime: 0,
  },

  loadModel: async (
    modelPath: string,
    tokenizerPath: string,
    tokenizerConfigPath?: string,
  ) => {
    try {
      set({ isLoading: true, error: null });

      // Lazy import to avoid initialization errors
      const { llmService } = await import('../modules/genai');

      await llmService.loadModel({
        modelSource: modelPath,
        tokenizerSource: tokenizerPath,
        tokenizerConfigSource: tokenizerConfigPath,
      });

      // Set up token callback for streaming
      llmService.setTokenCallback((token: string) => {
        const state = get();
        const isFirstToken = state.performance.tokenCount === 0;

        // Update performance metrics
        set({
          performance: {
            tokenCount: state.performance.tokenCount + 1,
            firstTokenTime: isFirstToken
              ? performance.now()
              : state.performance.firstTokenTime,
          },
        });

        // Update last message with new token
        set(state => ({
          messages: state.messages.map((msg, index) =>
            index === state.messages.length - 1
              ? { ...msg, content: msg.content + token }
              : msg,
          ),
        }));
      });

      set({
        isModelLoaded: true,
        isLoading: false,
        currentModelPath: modelPath,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load model';
      set({
        isLoading: false,
        isModelLoaded: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  sendMessage: async (content: string, systemPrompt?: string) => {
    const state = get();

    if (!state.isModelLoaded) {
      set({ error: 'Model not loaded' });
      return;
    }

    if (state.isGenerating) {
      set({ error: 'Already generating response' });
      return;
    }

    try {
      // Lazy import to avoid initialization errors
      const { llmService } = await import('../modules/genai');

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      // Add placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      set(state => ({
        messages: [...state.messages, userMessage, assistantMessage],
        isGenerating: true,
        error: null,
        performance: { tokenCount: 0, firstTokenTime: 0 },
      }));

      // Prepare messages for generation
      const messagesToSend: ExecutorchMessage[] = [];

      if (systemPrompt) {
        messagesToSend.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // Get conversation history (last 6 messages to fit context window)
      const conversationHistory = state.messages.slice(-6);
      conversationHistory.forEach(msg => {
        if (msg.role !== 'system') {
          messagesToSend.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });

      // Add current user message
      messagesToSend.push({
        role: 'user',
        content,
      });

      const startTime = performance.now();

      // Generate response (will stream via token callback)
      const finalResponse = await llmService.generate(messagesToSend);

      const endTime = performance.now();

      // Calculate final performance metrics
      if (finalResponse) {
        const { tokenCount, firstTokenTime } = get().performance;
        const { timeToFirstToken, tokensPerSecond } =
          calculatePerformanceMetrics(
            startTime,
            endTime,
            firstTokenTime,
            tokenCount,
          );

        // Update last message with performance metrics
        set(state => ({
          messages: state.messages.map((msg, index) =>
            index === state.messages.length - 1
              ? {
                  ...msg,
                  timeToFirstToken,
                  tokensPerSecond,
                }
              : msg,
          ),
          isGenerating: false,
        }));
      } else {
        set({ isGenerating: false });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Generation failed';
      set({
        error: errorMessage,
        isGenerating: false,
      });
    }
  },

  addMessage: message => {
    set(state => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Date.now().toString() + Math.random(),
          timestamp: Date.now(),
        },
      ],
    }));
  },

  updateLastMessage: (content: string) => {
    set(state => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1].content = content;
      }
      return { messages };
    });
  },

  clearMessages: () => {
    set({ messages: [], error: null });
  },

  interruptGeneration: async () => {
    if (get().isGenerating) {
      try {
        const { llmService } = await import('../modules/genai');
        llmService.interrupt();
      } catch (error) {
        console.error('Failed to interrupt:', error);
      }
      set({ isGenerating: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  resetPerformance: () => {
    set({
      performance: {
        tokenCount: 0,
        firstTokenTime: 0,
      },
    });
  },
}));
