import {
  Text,
  View,
  ActivityIndicator,
  Platform,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { container, ServiceIdentifiers } from '../../shared/di/Container';
import { IModelService } from '../../modules/genai/interfaces/IModelService';
import { ModelContext } from '../../modules/genai/interfaces/IModelService';
import { Message } from '../../modules/genai/types';
import { styles } from './styles';
import { getTransactions } from '../../shared/db/transactionsDB';
import { Transaction } from '../../shared/atoms/transactions';
import { InputSanitizer, TopicFilter } from '../../modules/genai/safety';
import { useFeatureFlag } from '../../core/config/featureFlags';
import { performanceMonitor } from '../../shared/utils/performanceMonitor';

// Configuration: Change this to use a different model
const MODEL_CONFIG = {
  // Model filename (must be a .gguf file)
  // Place your .gguf model file in:
  // - Android: android/app/src/main/assets/models/
  // - iOS: Add to Xcode project in the models folder
  filename: 'qwen2.5-1.5b-instruct-q5_k_m.gguf',
  // Alternative: 'gemma-2b-it-q4_k_m.gguf' (if you have a GGUF version)
};

const Chat = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ModelContext | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  // Cache for transaction data to avoid repeated database queries
  const transactionsCacheRef = useRef<{
    data: Transaction[];
    timestamp: number;
  } | null>(null);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Feature flags - reactive, will re-render if flags change at runtime
  const { isEnabled } = useFeatureFlag();

  useEffect(() => {
    const initializeModel = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Resolve ModelService from DI container
        const modelService = container.resolve<IModelService>(
          ServiceIdentifiers.ModelService,
        );

        // Get model path (handles platform-specific logic)
        const modelPath = await modelService.getModelPath(
          MODEL_CONFIG.filename,
        );

        console.log('Initializing model with path:', modelPath);

        // Initialize model using the service with optimized parameters
        const modelContext = await modelService.initializeModel({
          model: modelPath,
          use_mlock: false, // Set to false for Android to avoid permission issues
          n_ctx: 4096, // Larger context for raw transaction data (1.5B can handle this)
          n_gpu_layers: 0, // Set to 0 for Android (no GPU layers on most Android devices)
          // embedding: true, // use embedding
        });

        console.log('Model initialized successfully');
        setContext(modelContext);
        setIsInitializing(false);
      } catch (err) {
        console.error('Error initializing model:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to initialize model',
        );
        setIsInitializing(false);
      }
    };

    initializeModel();
  }, []);

  // Helper function to format transactions for AI context - RAW DATA APPROACH
  const formatTransactionsForAI = (transactions: Transaction[]): string => {
    if (transactions.length === 0) {
      return 'No transactions available.';
    }

    const now = new Date();
    const todayDateString = now.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Sort transactions by date (most recent first)
    const sortedTransactions = [...transactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Limit to most recent 50 transactions to fit in context window
    // Model will filter and calculate based on user's query
    const maxTransactions = Math.min(100, sortedTransactions.length);
    const recentTransactions = sortedTransactions.slice(0, maxTransactions);

    let formattedData = `TRANSACTION DATA (Current Date: ${todayDateString}):\n\n`;
    formattedData += `Total Transactions in Database: ${transactions.length}\n`;
    formattedData += `Showing Most Recent: ${recentTransactions.length}\n\n`;

    // Format as simple table - let the AI do the filtering and calculations
    formattedData += `DATE | TYPE | NAME | AMOUNT | DESCRIPTION\n`;
    formattedData += `${'='.repeat(80)}\n`;

    recentTransactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const type = transaction.type.toUpperCase();
      const name = transaction.name;
      const amount = `₹${transaction.amount.toFixed(2)}`;
      const desc = transaction.description || '-';

      formattedData += `${date} | ${type} | ${name} | ${amount} | ${desc}\n`;
    });

    if (transactions.length > maxTransactions) {
      formattedData += `\n... and ${
        transactions.length - maxTransactions
      } older transactions (not shown to save space)\n`;
    }

    console.log('Raw transaction data sent to model:', formattedData);
    return formattedData;
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !context || isLoading) {
      return;
    }

    let userMessage = userInput.trim();

    // Sanitize user input for security (prevents prompt injection & malicious requests)
    // Only runs if inputSanitization feature flag is enabled
    if (isEnabled('aiSafety.inputSanitization')) {
      const { sanitized, isBlocked, reason } =
        InputSanitizer.sanitize(userInput);

      if (isBlocked) {
        // Log blocked input in dev mode for debugging
        if (isEnabled('debug.logBlockedInputs')) {
          console.warn('[InputSanitizer] Blocked input:', userInput, reason);
        }
        setError(
          reason || 'Your message could not be processed for security reasons.',
        );
        setUserInput('');
        return;
      }

      userMessage = sanitized;
    }

    // Filter topic to ensure only finance-related questions are processed
    // Only runs if topicFiltering feature flag is enabled
    if (isEnabled('aiSafety.topicFiltering')) {
      const topicResult = TopicFilter.filter(userMessage);
      if (!topicResult.isAllowed) {
        setUserInput('');

        // Add user message to show what they asked
        const newUserMessage: Message = { role: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMessage]);

        // Add assistant response with suggested/contextual response
        if (topicResult.suggestedResponse) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: topicResult.suggestedResponse,
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
        return;
      }
    }

    setUserInput('');
    setIsLoading(true);
    setError(null);

    // Add user message to conversation
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Fetch transactions from SQLite (with caching for performance)
      performanceMonitor.start('fetch-transactions');
      let transactions: Transaction[];
      const now = Date.now();

      if (
        transactionsCacheRef.current &&
        now - transactionsCacheRef.current.timestamp < CACHE_DURATION
      ) {
        // Use cached data
        transactions = transactionsCacheRef.current.data;
        console.log('[Performance] Using cached transaction data');
      } else {
        // Fetch fresh data and cache it
        transactions = await getTransactions();
        transactionsCacheRef.current = {
          data: transactions,
          timestamp: now,
        };
        console.log('[Performance] Fetched fresh transaction data');
      }
      performanceMonitor.end('fetch-transactions');

      performanceMonitor.start('format-context');
      const transactionsContext = formatTransactionsForAI(transactions);
      performanceMonitor.end('format-context');

      const stopWords = [
        '</s>',
        '<|end|>',
        '<|eot_id|>',
        '<|end_of_text|>',
        '<|im_end|>',
        '<|EOT|>',
        '<|END_OF_TURN_TOKEN|>',
        '<|end_of_turn|>',
        '<|endoftext|>',
      ];

      // Build messages array with STRICT finance-only system prompt
      const messagesForCompletion = [
        {
          role: 'system' as const,
          content: TopicFilter.getFinanceSystemPrompt(transactionsContext),
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage,
        },
      ];

      // Enable streaming for better UX
      setIsStreaming(true);
      setStreamingResponse('');

      // Optimized completion parameters for quality and performance
      performanceMonitor.start('ai-completion');
      const msgResult = await context.completion(
        {
          messages: messagesForCompletion,
          n_predict: 250, // Enough tokens for model to calculate and explain
          stop: stopWords,
        },
        (data: { token: string }) => {
          // Streaming callback - show tokens as they arrive (real-time response)
          const { token } = data;

          // Update streaming response in real-time
          setStreamingResponse(prev => {
            const newText = prev + token;
            // Auto-scroll as content streams in
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
            return newText;
          });
        },
      );
      performanceMonitor.end('ai-completion');

      // Clear streaming state
      setIsStreaming(false);
      setStreamingResponse('');

      console.log('Completion result:', msgResult);

      // Validate and clean the response
      let responseText = msgResult.text.trim();

      // Remove any incomplete sentences at the end
      if (responseText && !responseText.match(/[.!?]$/)) {
        const lastSentence = responseText.lastIndexOf('.');
        if (lastSentence > 0) {
          responseText = responseText.substring(0, lastSentence + 1);
        }
      }

      // Add assistant response to conversation
      const assistantMessage: Message = {
        role: 'assistant',
        content:
          responseText ||
          'I apologize, I could not generate a proper response. Please try again.',
      };
      setMessages(prev => [...prev, assistantMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsLoading(false);
    } catch (err) {
      console.error('[Error] Failed to generate response:', err);

      // Clean up streaming state
      setIsStreaming(false);
      setStreamingResponse('');

      // Provide user-friendly error messages with actionable suggestions
      let errorMessage = 'Failed to generate response. ';

      if (err instanceof Error) {
        // Check for specific error types
        if (
          err.message.includes('out of memory') ||
          err.message.includes('memory')
        ) {
          errorMessage +=
            'The AI model ran out of memory. Try asking a simpler question or clear chat history.';
        } else if (err.message.includes('timeout')) {
          errorMessage += 'The request timed out. Please try again.';
        } else if (
          err.message.includes('model not loaded') ||
          err.message.includes('context')
        ) {
          errorMessage =
            'AI model error. Please restart the app and try again.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'An unexpected error occurred. Please try again.';
      }

      setError(errorMessage);
      setIsLoading(false);

      // Remove the failed user message to allow retry
      setMessages(prev => prev.slice(0, -1));

      // Clear error after 8 seconds to give user time to read
      setTimeout(() => setError(null), 8000);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setStreamingResponse('');
    setIsStreaming(false);
    // Clear transaction cache to force fresh data on next query
    transactionsCacheRef.current = null;
  };
  console.log('messages', messages);
  return (
    <View style={styles.container}>
      {isInitializing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Initializing AI model...</Text>
        </View>
      ) : (
        <>
          {/* Header with Clear Chat button */}
          {messages.length > 0 && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <TouchableOpacity
                onPress={handleClearChat}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear Chat</Text>
              </TouchableOpacity>
            </View>
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={styles.keyboardAvoidingView}
          >
            <FlatList
              ref={flatListRef as any}
              data={messages}
              keyExtractor={(item, index) => `message-${index}`}
              onContentSizeChange={() => {
                if (messages.length > 0) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
              onLayout={() => {
                if (messages.length > 0) {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }
              }}
              renderItem={({ item: message }) => (
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? styles.userMessage
                      : styles.assistantMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user'
                        ? styles.userMessageText
                        : styles.assistantMessageText,
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Ask me about your finances! I can help you analyze your
                    transactions, spending patterns, and financial health.
                  </Text>
                </View>
              }
              ListFooterComponent={
                <>
                  {isStreaming && streamingResponse && (
                    <View
                      style={[styles.messageBubble, styles.assistantMessage]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          styles.assistantMessageText,
                        ]}
                      >
                        {streamingResponse}
                      </Text>
                      <View style={styles.streamingIndicator}>
                        <ActivityIndicator size="small" color="#4A90E2" />
                      </View>
                    </View>
                  )}
                  {isLoading && (
                    <View style={styles.loadingBubble}>
                      <ActivityIndicator size="small" color="#666" />
                      <Text style={styles.loadingMessageText}>Thinking...</Text>
                    </View>
                  )}
                  {error && (
                    <View style={styles.errorBubble}>
                      <Text style={styles.errorText}>{error}</Text>
                      <TouchableOpacity
                        onPress={() => setError(null)}
                        style={styles.dismissError}
                      >
                        <Text style={styles.dismissErrorText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              }
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                multiline
                editable={!isLoading}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!userInput.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!userInput.trim() || isLoading}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </View>
  );
};
export default Chat;
