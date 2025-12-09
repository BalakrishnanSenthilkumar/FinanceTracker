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

    // Get current date info for filtering
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1); // Tomorrow at midnight

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper to check if date falls in range
    const isToday = (dateStr: string) => {
      const date = new Date(dateStr);
      // Check if date is within today's range (today midnight to tomorrow midnight)
      return date >= todayStart && date < todayEnd;
    };
    const isThisWeek = (dateStr: string) => {
      const date = new Date(dateStr);
      return date >= weekStart && date < todayEnd;
    };
    const isThisMonth = (dateStr: string) => {
      const date = new Date(dateStr);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return date >= monthStart && date < monthEnd;
    };

    // Filter transactions by time period
    const todayTransactions = transactions.filter(t => isToday(t.date));
    const weekTransactions = transactions.filter(t => isThisWeek(t.date));
    const monthTransactions = transactions.filter(t => isThisMonth(t.date));

    // Calculate today's statistics
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const todayExpenses = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate this week's statistics
    const weekIncome = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const weekExpenses = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate this month's statistics
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate all-time statistics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    // Group transactions by date for easy date-specific queries
    const transactionsByDate = new Map<string, Transaction[]>();
    transactions.forEach(transaction => {
      const dateKey = new Date(transaction.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!transactionsByDate.has(dateKey)) {
        transactionsByDate.set(dateKey, []);
      }
      transactionsByDate.get(dateKey)!.push(transaction);
    });

    let formattedData = `User's Financial Data (Today's Date: ${now.toLocaleDateString(
      'en-IN',
      { year: 'numeric', month: 'long', day: 'numeric' },
    )}):\n\n`;

    // TODAY's summary (most important for "today" questions)
    formattedData += `=== TODAY'S SUMMARY (USE THIS FOR "TODAY" QUESTIONS ONLY) ===\n`;
    formattedData += `- Today's Income: ₹${todayIncome.toFixed(2)}\n`;
    formattedData += `- Today's Expenses: ₹${todayExpenses.toFixed(2)}\n`;
    formattedData += `- Today's Net: ₹${(todayIncome - todayExpenses).toFixed(
      2,
    )}\n`;
    formattedData += `- Transactions Today: ${todayTransactions.length}\n\n`;

    // This week's summary
    formattedData += `=== THIS WEEK'S SUMMARY (USE THIS FOR "THIS WEEK" QUESTIONS) ===\n`;
    formattedData += `- This Week's Income: ₹${weekIncome.toFixed(2)}\n`;
    formattedData += `- This Week's Expenses: ₹${weekExpenses.toFixed(2)}\n`;
    formattedData += `- This Week's Net: ₹${(weekIncome - weekExpenses).toFixed(
      2,
    )}\n\n`;

    // This month's summary
    formattedData += `=== THIS MONTH'S SUMMARY (USE THIS FOR "THIS MONTH" QUESTIONS) ===\n`;
    formattedData += `- This Month's Income: ₹${monthIncome.toFixed(2)}\n`;
    formattedData += `- This Month's Expenses: ₹${monthExpenses.toFixed(2)}\n`;
    formattedData += `- This Month's Net: ₹${(
      monthIncome - monthExpenses
    ).toFixed(2)}\n\n`;

    // All-time totals
    formattedData += `=== ALL-TIME TOTALS (USE THIS FOR "TOTAL" QUESTIONS) ===\n`;
    formattedData += `- All-Time Total Income: ₹${totalIncome.toFixed(2)}\n`;
    formattedData += `- All-Time Total Expenses: ₹${totalExpenses.toFixed(
      2,
    )}\n`;
    formattedData += `- All-Time Current Balance: ₹${totalBalance.toFixed(
      2,
    )}\n`;
    formattedData += `- All-Time Total Transactions: ${transactions.length}\n\n`;

    // Transactions grouped by date (for easy date-specific queries)
    formattedData += `=== TRANSACTIONS BY DATE ===\n`;
    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(transactionsByDate.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    // Show last 30 days of transactions grouped by date
    sortedDates.slice(0, 30).forEach(dateKey => {
      const dateTransactions = transactionsByDate.get(dateKey)!;
      const dateIncome = dateTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const dateExpenses = dateTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      formattedData += `\n📅 ${dateKey}:\n`;
      formattedData += `   Income: ₹${dateIncome.toFixed(
        2,
      )} | Expenses: ₹${dateExpenses.toFixed(2)} | Net: ₹${(
        dateIncome - dateExpenses
      ).toFixed(2)}\n`;
      formattedData += `   Transactions:\n`;

      dateTransactions.forEach(transaction => {
        const sign = transaction.type === 'income' ? '+' : '-';
        formattedData += `   • ${transaction.name} (${
          transaction.type
        }): ${sign}₹${transaction.amount.toFixed(2)}`;
        if (transaction.description) {
          formattedData += ` - ${transaction.description}`;
        }
        formattedData += `\n`;
      });
    });

    if (sortedDates.length > 30) {
      formattedData += `\n... and ${
        sortedDates.length - 30
      } more dates with transactions.\n`;
    }

    console.log('formattedData', formattedData);
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
