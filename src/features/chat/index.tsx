import {
  Text,
  View,
  ActivityIndicator,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from '../../shared/components';
import { useEffect, useState } from 'react';
import { container, ServiceIdentifiers } from '../../shared/di/Container';
import { IModelService } from '../../modules/genai/interfaces/IModelService';
import { ModelContext } from '../../modules/genai/interfaces/IModelService';
import { Message } from '../../modules/genai/types';
import { styles } from './styles';

// Configuration: Change this to use a different model
const MODEL_CONFIG = {
  // Model filename (must be a .gguf file)
  // Place your .gguf model file in:
  // - Android: android/app/src/main/assets/models/
  // - iOS: Add to Xcode project in the models folder
  //   filename: 'qwen2-0_5b-instruct-q5_k_m.gguf',
  filename: 'gemma-3n-E2B-it-Q4_0.gguf',
  //   filename: 'Phi-3-mini-4k-instruct-q4.gguf',
  //   filename: 'llama3-70b-8192.gguf',
  // Alternative: 'gemma-2b-it-q4_k_m.gguf' (if you have a GGUF version)
};

const Chat = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ModelContext | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

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

  const sendMessage = async () => {
    if (!userInput.trim() || !context || isLoading) {
      return;
    }

    const userMessage = userInput.trim();
    setUserInput('');
    setIsLoading(true);
    setError(null);

    // Add user message to conversation
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
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

      // Build messages array with system message and conversation history
      const messagesForCompletion = [
        {
          role: 'system' as const,
          content:
            'This is a conversation between user and assistant, a friendly chatbot.',
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
    <SafeAreaView style={styles.container}>
      {isInitializing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Initializing AI model...</Text>
        </View>
      ) : (
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Start a conversation with the AI assistant
                  </Text>
                </View>
              )}
              {messages.map((message, index) => (
                <View
                  key={index}
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
              ))}
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
            </ScrollView>
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
    </SafeAreaView>
  );
};

export default Chat;
