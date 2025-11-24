import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLLMStore } from '../../store/llmStore';
import { useModelStore, ModelDownloadState } from '../../store/modelStore';
import { MessageBubble, ChatInput } from '../../shared/components';
import {
  getDefaultModel,
  type ModelConfig,
} from '../../constants/default-models';

const SYSTEM_PROMPT = `You are a helpful AI financial assistant. You help users track their expenses, provide financial advice, and answer questions about personal finance. Be concise, friendly, and accurate in your responses.`;

const AIChatScreen: React.FC = () => {
  // Check if native module is available
  const [nativeModuleAvailable, setNativeModuleAvailable] = useState(false);
  const [_nativeModuleError, _setNativeModuleError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Check native module on mount
    const checkNativeModule = async () => {
      try {
        // Try to import and use the module - this will fail if not linked
        // The module auto-installs when imported, so we just need to check if import succeeds
        await import('react-native-executorch');

        console.log('🔍 Checking native module...');
        console.log('Platform:', Platform.OS);
        console.log('✅ react-native-executorch imported successfully');

        // If import succeeds, the module is available
        // The module auto-installs JSI bindings when imported
        console.log('✅ react-native-executorch module available');
        setNativeModuleAvailable(true);
        _setNativeModuleError(null);
      } catch (importError) {
        console.error(
          '❌ Failed to import react-native-executorch:',
          importError,
        );
        const errorMsg =
          Platform.OS === 'ios'
            ? 'Native module not linked. Please rebuild:\n\ncd ios && pod install && cd .. && yarn ios'
            : 'Native module not linked. Please rebuild:\n\ncd android && ./gradlew clean && cd .. && yarn android';
        _setNativeModuleError(errorMsg);
        setNativeModuleAvailable(false);
      }
    };

    // Small delay to ensure native modules are loaded
    const timer = setTimeout(checkNativeModule, 100);
    return () => clearTimeout(timer);
  }, []);
  const {
    messages,
    isModelLoaded,
    isLoading,
    isGenerating,
    error,
    loadModel,
    sendMessage,
    clearMessages,
    addMessage,
    interruptGeneration,
  } = useLLMStore();

  const { downloadModel, isModelDownloaded, getDownloadProgress } =
    useModelStore();

  const flatListRef = useRef<FlatList>(null);
  const [currentModel, setCurrentModel] = useState<ModelConfig>(
    getDefaultModel(),
  );
  const [initializationStep, setInitializationStep] = useState<string>('');

  useEffect(() => {
    if (nativeModuleAvailable) {
      initializeModel();
    }

    return () => {
      // Cleanup is handled by the service
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeModuleAvailable]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeModel = async () => {
    // Don't initialize if native module is not available
    if (!nativeModuleAvailable) {
      console.error('Cannot initialize: Native module not available');
      return;
    }

    try {
      const model = getDefaultModel();
      setCurrentModel(model);

      console.log('🔍 Checking if model is downloaded:', model.id);

      // Check if model is already downloaded
      const isDownloaded = isModelDownloaded(model.id);
      console.log('📦 Model downloaded?', isDownloaded);

      if (!isDownloaded) {
        console.log('⬇️ Model not downloaded, showing prompt...');
        setInitializationStep('');

        // Show download prompt
        setTimeout(() => {
          Alert.alert(
            'Download Model',
            `${model.modelName} (${model.modelSize.toFixed(
              2,
            )} GB) needs to be downloaded. This is a one-time download.\n\nThe model will be downloaded from Hugging Face and cached on your device.`,
            [
              {
                text: 'Download',
                onPress: async () => {
                  try {
                    console.log('⬇️ Starting download...');
                    setInitializationStep(`Downloading ${model.modelName}...`);
                    await downloadModel(model);
                    console.log('✅ Download complete');
                    await loadModelAfterDownload(model);
                  } catch (downloadError) {
                    console.error('❌ Download error:', downloadError);
                    const errorMsg =
                      downloadError instanceof Error
                        ? downloadError.message
                        : 'Download failed';
                    Alert.alert('Download Error', errorMsg);
                    setInitializationStep('');
                  }
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  console.log('❌ Download cancelled');
                  addMessage({
                    role: 'system',
                    content:
                      '⚠️ Model download cancelled. Tap here to restart and download the model.',
                  });
                  setInitializationStep('');
                },
              },
            ],
          );
        }, 500);
      } else {
        console.log('✅ Model already downloaded, loading...');
        await loadModelAfterDownload(model);
      }
    } catch (initError) {
      const errorMessage =
        initError instanceof Error
          ? initError.message
          : 'Unknown error occurred';
      console.error('Model initialization failed:', initError);
      setInitializationStep('');
      Alert.alert(
        'Initialization Error',
        `Failed to initialize AI model: ${errorMessage}`,
        [
          { text: 'Retry', onPress: () => initializeModel() },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  const loadModelAfterDownload = async (model: ModelConfig) => {
    try {
      setInitializationStep(`Loading ${model.modelName}...`);

      await loadModel(
        model.modelPath,
        model.tokenizerPath,
        model.tokenizerConfigPath,
      );

      setInitializationStep('');

      addMessage({
        role: 'system',
        content: `🤖 ${model.modelName} is ready! How can I help you with your finances today?`,
      });
    } catch (loadError) {
      throw loadError;
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!isModelLoaded || isGenerating || !content.trim()) {
        return;
      }

      try {
        await sendMessage(content, SYSTEM_PROMPT);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        Alert.alert('Error', `Failed to generate response: ${errorMessage}`);
      }
    },
    [isModelLoaded, isGenerating, sendMessage],
  );

  const handleClearChat = useCallback(() => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear all messages?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearMessages();
          addMessage({
            role: 'system',
            content: '🤖 Chat cleared. How can I help you?',
          });
        },
      },
    ]);
  }, [clearMessages, addMessage]);

  const handleStopGeneration = useCallback(() => {
    if (isGenerating) {
      interruptGeneration();
    }
  }, [isGenerating, interruptGeneration]);

  const getDownloadProgressText = () => {
    const progress = getDownloadProgress(currentModel.id);
    if (!progress) return null;

    if (progress.status === ModelDownloadState.Downloading) {
      const percent = Math.floor(progress.progress * 100);
      return `Downloading: ${percent}%`;
    }

    return null;
  };

  const renderHeader = () => {
    const downloadProgressText = getDownloadProgressText();

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Financial Assistant</Text>
          <View style={styles.statusContainer}>
            {isLoading || downloadProgressText ? (
              <>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.statusText}>
                  {downloadProgressText ||
                    initializationStep ||
                    'Initializing...'}
                </Text>
              </>
            ) : isModelLoaded ? (
              <>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  Online • {currentModel.modelName}
                </Text>
              </>
            ) : (
              <>
                <View style={[styles.statusDot, styles.statusDotOffline]} />
                <Text style={styles.statusText}>Offline</Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          {isGenerating && (
            <TouchableOpacity
              onPress={handleStopGeneration}
              style={styles.stopButton}
            >
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
          {messages.length > 1 && !isGenerating && (
            <TouchableOpacity
              onPress={handleClearChat}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    const downloadProgressText = getDownloadProgressText();
    const progress = getDownloadProgress(currentModel.id);

    return (
      <View style={styles.emptyContainer}>
        {isLoading || downloadProgressText ? (
          <>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.emptyText}>
              {downloadProgressText || 'Loading AI model...'}
            </Text>
            {progress && progress.status === ModelDownloadState.Downloading && (
              <>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${progress.progress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.emptySubtext}>
                  {currentModel.modelSize.toFixed(2)} GB • This may take a few
                  minutes
                </Text>
              </>
            )}
            {!downloadProgressText && (
              <Text style={styles.emptySubtext}>This may take a moment</Text>
            )}
          </>
        ) : error ? (
          <>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.emptyText}>Error loading model</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={initializeModel}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : !isModelLoaded && messages.length === 0 ? (
          <>
            <Text style={styles.emptyEmoji}>📥</Text>
            <Text style={styles.emptyText}>Ready to Download</Text>
            <Text style={styles.emptySubtext}>
              Tap the button below to download the AI model
            </Text>
            <TouchableOpacity
              onPress={initializeModel}
              style={styles.downloadButtonLarge}
            >
              <Text style={styles.downloadButtonText}>Download Model</Text>
              <Text style={styles.downloadButtonSubtext}>
                {currentModel.modelSize.toFixed(2)} GB • One-time download
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>Start a conversation</Text>
            <Text style={styles.emptySubtext}>
              Ask me anything about your finances!
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      {messages.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {error && messages.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      <ChatInput
        onSend={handleSendMessage}
        disabled={!isModelLoaded || isGenerating || isLoading}
        placeholder={
          isGenerating
            ? 'AI is thinking...'
            : !isModelLoaded
            ? 'Initializing...'
            : 'Ask about your finances...'
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  statusDotOffline: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stopButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FF9500',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#FF3B30',
  },
  errorBannerText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  instructionsBox: {
    backgroundColor: '#F2F2F7',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    width: '90%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'Courier',
  },
  downloadButtonLarge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    minWidth: 250,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});

export default AIChatScreen;
