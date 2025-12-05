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
import { InputSanitizer } from '../../modules/genai/safety';

// Configuration: Change this to use a different model
const MODEL_CONFIG = {
  // Model filename (must be a .gguf file)
  // Place your .gguf model file in:
  // - Android: android/app/src/main/assets/models/
  // - iOS: Add to Xcode project in the models folder
  filename: 'qwen2-0_5b-instruct-q5_k_m.gguf',
  // Alternative: 'gemma-2b-it-q4_k_m.gguf' (if you have a GGUF version)
};

const Chat = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ModelContext | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const flatListRef = useRef<FlatList<Message>>(null);

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

        // Initialize model using the service
        const modelContext = await modelService.initializeModel({
          model: modelPath,
          use_mlock: false, // Set to false for Android to avoid permission issues
          n_ctx: 2048,
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

  // Helper function to format transactions for AI context
  const formatTransactionsForAI = (transactions: Transaction[]): string => {
    if (transactions.length === 0) {
      return 'No transactions available.';
    }

    let formattedData = `User's Financial Transactions (${transactions.length} total):\n\n`;

    // Calculate summary statistics
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    formattedData += `Summary:\n`;
    formattedData += `- Total Income: $${income.toFixed(2)}\n`;
    formattedData += `- Total Expenses: $${expenses.toFixed(2)}\n`;
    formattedData += `- Balance: $${balance.toFixed(2)}\n\n`;

    formattedData += `Recent Transactions:\n`;
    transactions.slice(0, 20).forEach((transaction, index) => {
      const sign = transaction.type === 'income' ? '+' : '-';
      formattedData += `${index + 1}. ${transaction.name} (${
        transaction.type
      }): ${sign}$${transaction.amount.toFixed(2)}`;
      if (transaction.description) {
        formattedData += ` - ${transaction.description}`;
      }
      formattedData += ` [Date: ${transaction.date}]\n`;
    });

    if (transactions.length > 20) {
      formattedData += `\n... and ${
        transactions.length - 20
      } more transactions.\n`;
    }
    console.log('formattedData', formattedData);
    return formattedData;
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !context || isLoading) {
      return;
    }

    // Sanitize user input for security (prevents prompt injection & malicious requests)
    const { sanitized, isBlocked, reason } = InputSanitizer.sanitize(userInput);

    if (isBlocked) {
      setError(
        reason || 'Your message could not be processed for security reasons.',
      );
      setUserInput('');
      return;
    }

    const userMessage = sanitized;
    setUserInput('');
    setIsLoading(true);
    setError(null);

    // Add user message to conversation
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Fetch transactions from SQLite
      const transactions = await getTransactions();
      const transactionsContext = formatTransactionsForAI(transactions);

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

      // Build messages array with system message including transaction data
      const messagesForCompletion = [
        {
          role: 'system' as const,
          content: `You are a helpful financial assistant. You have access to the user's transaction data and can help them understand their finances, answer questions about their spending, income, and provide financial insights.

${transactionsContext}

Please answer the user's questions based on this data. Be concise, helpful, and provide specific numbers when relevant.`,
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

      const msgResult = await context.completion(
        {
          messages: messagesForCompletion,
          n_predict: 200,
          stop: stopWords,
        },
        (data: { token: string }) => {
          // This is a partial completion callback
          const { token } = data;
          console.log('Token received:', token);
        },
      );

      console.log('Completion result:', msgResult);

      // Add assistant response to conversation
      const assistantMessage: Message = {
        role: 'assistant',
        content: msgResult.text,
      };
      setMessages(prev => [...prev, assistantMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating response:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate response',
      );
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isInitializing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Initializing AI model...</Text>
        </View>
      ) : (
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
                {isLoading && (
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#666" />
                    <Text style={styles.loadingMessageText}>Thinking...</Text>
                  </View>
                )}
                {error && (
                  <View style={styles.errorBubble}>
                    <Text style={styles.errorText}>Error: {error}</Text>
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
      )}
    </View>
  );
};

export default Chat;
