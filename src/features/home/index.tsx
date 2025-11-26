import {
  Text,
  View,
  ActivityIndicator,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { initLlama } from 'llama.rn';
import { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Configuration: Change this to use a different model
const MODEL_CONFIG = {
  // Model filename (must be a .gguf file)
  // Place your .gguf model file in:
  // - Android: android/app/src/main/assets/models/
  // - iOS: Add to Xcode project in the models folder
  filename: 'qwen2-0_5b-instruct-q5_k_m.gguf',
  // Alternative: 'gemma-2b-it-q4_k_m.gguf' (if you have a GGUF version)
};

const Home = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const initializeModel = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        let modelPath: string;
        const modelFilename = MODEL_CONFIG.filename;

        if (Platform.OS === 'android') {
          // For Android, we need to copy the asset to a writable location first
          const assetPath = `models/${modelFilename}`;
          const destPath = `${RNFS.DocumentDirectoryPath}/${modelFilename}`;

          // Check if file already exists
          const fileExists = await RNFS.exists(destPath);

          if (!fileExists) {
            console.log('Copying model from assets to:', destPath);
            // Copy from assets to documents directory
            await RNFS.copyFileAssets(assetPath, destPath);
            console.log('Model copied successfully');
          } else {
            console.log('Model already exists at:', destPath);
          }

          modelPath = destPath;
        } else {
          // For iOS, use the path directly from bundle
          modelPath = `models/${modelFilename}`;
        }

        console.log('Initializing llama with model path:', modelPath);

        const llamaContext = await initLlama({
          model: modelPath,
          use_mlock: false, // Set to false for Android to avoid permission issues
          n_ctx: 2048,
          n_gpu_layers: 0, // Set to 0 for Android (no GPU layers on most Android devices)
          // embedding: true, // use embedding
        });

        console.log('Model initialized successfully');
        setContext(llamaContext);
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
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#000000',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingMessageText: {
    color: '#666',
    fontSize: 14,
  },
  errorBubble: {
    alignSelf: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '90%',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F5F5F5',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Home;
