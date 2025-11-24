# AI Chat Feature Setup Guide

## Overview
This guide will help you set up the AI Chat feature in your FinanceTracker app using `react-native-executorch` and the Gemma model.

## Prerequisites
- Node.js >= 20
- React Native 0.82.1
- iOS: Xcode 14+
- Android: Android Studio with API level 21+

## Installation Steps

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

The required packages have been added to `package.json`:
- `react-native-executorch` - For on-device AI inference
- `zustand` - For state management
- `react-native-fs` - For file system operations

### 2. Link Native Modules

#### For iOS:
```bash
cd ios
pod install
cd ..
```

#### For Android:
The modules should auto-link. If you encounter issues, run:
```bash
npx react-native link react-native-executorch
npx react-native link react-native-fs
```

### 3. Configure Native Files

#### iOS Configuration:

1. **Add model to bundle:**
   - Open Xcode: `open ios/FinanceTracker.xcworkspace`
   - Drag the model file from `src/core/assets/models/gemma-3n-E4B-it-int4.task` to the Xcode project
   - Make sure "Copy items if needed" is checked
   - Select target: FinanceTracker

2. **Update Info.plist** (if needed):
   Add the following if you need to access external files:
   ```xml
   <key>UIFileSharingEnabled</key>
   <true/>
   <key>LSSupportsOpeningDocumentsInPlace</key>
   <true/>
   ```

#### Android Configuration:

1. **Add model to assets:**
   - Create directory: `android/app/src/main/assets/models`
   - Copy `src/core/assets/models/gemma-3n-E4B-it-int4.task` to the assets folder

2. **Update AndroidManifest.xml:**
   Add permissions if needed:
   ```xml
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
   ```

### 4. Run the App

#### For iOS:
```bash
npm run ios
```

#### For Android:
```bash
npm run android
```

## Features

### ✅ What's Included

1. **AI Chat Screen**: Full-featured chat interface with the AI assistant
2. **Message Management**: Chat history with user and AI messages
3. **Streaming Responses**: Real-time token-by-token response generation
4. **State Management**: Zustand store for managing chat state
5. **Error Handling**: Comprehensive error handling and user feedback
6. **UI Components**: 
   - MessageBubble: Displays chat messages with timestamps
   - ChatInput: Text input with send button
7. **ExecutorchService**: Service layer for AI model interactions

### 🎯 How It Works

1. **Model Initialization**: When you navigate to the AI Chat tab, the model automatically loads
2. **Chat Interface**: Type your message and send it to the AI
3. **Streaming**: The AI response streams in real-time, token by token
4. **Context**: The system prompt ensures the AI acts as a financial assistant

### 📱 Navigation

The AI Chat feature has been added as a tab in the bottom navigation:
- **Home** - Dashboard
- **AI Chat** - AI Assistant (NEW!)
- **History** - Transaction history
- **Profile** - User profile

## Customization

### Change System Prompt

Edit the `SYSTEM_PROMPT` constant in `src/features/ai-assistant/index.tsx`:

```typescript
const SYSTEM_PROMPT = `Your custom system prompt here...`;
```

### Adjust Model Parameters

Modify generation settings in the `handleSendMessage` function:

```typescript
await executorchService.generateStream(
  {
    prompt: content,
    systemPrompt: SYSTEM_PROMPT,
    temperature: 0.7,  // 0.0 to 1.0 (higher = more creative)
    maxTokens: 512,    // Maximum response length
  },
  // ... handlers
);
```

### Styling

All styles are in the respective component files:
- `src/features/ai-assistant/index.tsx` - Main chat screen
- `src/shared/components/MessageBubble.tsx` - Message bubbles
- `src/shared/components/ChatInput.tsx` - Input field

## Troubleshooting

### Issue: Model not loading
**Solution**: 
- Verify model file exists in the correct location
- Check file permissions
- Review console logs for specific errors

### Issue: Slow responses
**Solution**:
- Reduce `maxTokens` parameter
- Test on a physical device (simulators are slower)
- Ensure model file is properly optimized

### Issue: App crashes on startup
**Solution**:
- Clean build: `cd ios && pod deintegrate && pod install`
- Android: `cd android && ./gradlew clean`
- Rebuild the app

### Issue: "Model not initialized" error
**Solution**:
- Wait for the initialization to complete (watch for "Online" status)
- Check that the model path is correct
- Restart the app

## Architecture

```
src/
├── features/
│   └── ai-assistant/
│       └── index.tsx           # Main chat screen
├── modules/
│   └── genai/
│       ├── ExecutorchService.ts # AI service layer
│       └── index.ts
├── shared/
│   └── components/
│       ├── MessageBubble.tsx   # Chat message component
│       ├── ChatInput.tsx       # Input component
│       └── index.ts
└── store/
    └── llmStore.ts            # Zustand state management
```

## API Reference

### ExecutorchService

```typescript
// Initialize model
await executorchService.initialize({
  modelPath: string,
  temperature?: number,
  maxTokens?: number,
});

// Generate response (non-streaming)
const response = await executorchService.generate({
  prompt: string,
  systemPrompt?: string,
  temperature?: number,
  maxTokens?: number,
});

// Generate response (streaming)
await executorchService.generateStream(
  config,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
);

// Stop generation
await executorchService.stopGeneration();

// Cleanup
await executorchService.cleanup();
```

### LLM Store (Zustand)

```typescript
const {
  messages,           // ChatMessage[]
  isModelReady,       // boolean
  isGenerating,       // boolean
  error,              // string | null
  addMessage,         // Add new message
  updateLastMessage,  // Update last assistant message
  clearMessages,      // Clear chat history
  sendMessage,        // Send user message
} = useLLMStore();
```

## Performance Tips

1. **Model Size**: The Gemma 3N model is optimized for mobile devices
2. **Memory**: Close other apps when running AI inference
3. **Battery**: AI processing is intensive - inform users about battery usage
4. **Testing**: Always test on real devices for accurate performance metrics

## Next Steps

- [ ] Add voice input/output
- [ ] Implement conversation history persistence
- [ ] Add multi-turn conversation context
- [ ] Integrate with finance tracking features
- [ ] Add suggested prompts/quick actions
- [ ] Implement RAG (Retrieval Augmented Generation) for finance data

## Support

For issues specific to:
- **react-native-executorch**: Check the [official documentation](https://github.com/pytorch/executorch)
- **General React Native**: [React Native docs](https://reactnative.dev/)
- **This implementation**: Review the code comments and architecture above

## License

This implementation follows the same license as your FinanceTracker project.

