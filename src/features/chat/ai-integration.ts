// AI integration point for chat - connects to QueryEngine and QueryProcessor

import { QueryEngine } from '../../ai/extensions/QueryEngine';
import { ProcessResult } from '../../ai/types/processor.types';
import { DownloadProgress } from '../../ai/types/engine.types';
import { useEffect, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  loading?: boolean;
}

// DownloadProgress is imported from engine.types

export const useChatAI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);

  useEffect(() => {
    // Initialize QueryEngine on mount
    const init = async () => {
      try {
        // Initialize with progress callback
        await QueryEngine.initializeDefault(progress => {
          setDownloadProgress(progress);
        });

        setDownloadProgress(null);
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize AI engine:', error);
        setDownloadProgress(null);
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isProcessing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      loading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);
    setIsProcessing(true);

    try {
      // Process query
      const result: ProcessResult = await QueryEngine.processQuery(content);

      // Remove loading message and add response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.loading);
        if (result.success && result.data) {
          return [
            ...withoutLoading,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: result.data.response,
              timestamp: Date.now(),
            },
          ];
        } else {
          return [
            ...withoutLoading,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'Sorry, I encountered an error. Please try again.',
              timestamp: Date.now(),
            },
          ];
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.loading);
        return [
          ...withoutLoading,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: Date.now(),
          },
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    QueryEngine.clearHistory('chat');
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isInitializing,
    isProcessing,
    downloadProgress,
  };
};
