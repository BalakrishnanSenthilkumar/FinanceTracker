# AI Chat Feature - Complete Setup Guide

This implementation is based on the **private-mind** project and uses the proper `react-native-executorch` library (v0.5.6).

## ✅ What's Been Implemented

### 1. **LLM Service** (`src/modules/genai/LLMService.ts`)
- Proper wrapper around `react-native-executorch`'s `LLMModule`
- Model loading with tokenizer support
- Token streaming callback support
- Generation and interruption capabilities

### 2. **LLM Store** (`src/store/llmStore.ts`)
- Zustand state management
- Chat message management
- Performance metrics tracking (tokens/sec, time to first token)
- Automatic token streaming and message updates

### 3. **UI Components**
- `MessageBubble`: Chat message display
- `ChatInput`: Text input with send button
- `AIChatScreen`: Full chat interface with model initialization

### 4. **Navigation**
- AI Chat tab added to bottom navigation

## 📦 Dependencies Installed

```json
{
  "@dr.pogodin/react-native-fs": "^2.35.1",
  "react-native-executorch": "0.5.6",
  "zustand": "^5.0.2"
}
```

## 🚀 Setup Instructions

### Step 1: Prepare Model Files

You need three files for the Gemma model:

1. **Model file**: `gemma-3n-E4B-it-int4.task`
2. **Tokenizer**: `tokenizer.bin`
3. **Tokenizer config**: `tokenizer_config.json`

#### For iOS:

1. Open Xcode:
```bash
cd ios
open FinanceTracker.xcworkspace
```

2. Create a `models` folder in the project
3. Add all three files to the project:
   - Right-click on `FinanceTracker` in Xcode
   - Select "Add Files to FinanceTracker..."
   - Select all three model files
   - ✅ Check "Copy items if needed"
   - ✅ Check "FinanceTracker" target
   - Click "Add"

#### For Android:

1. Create the assets folder structure:
```bash
mkdir -p android/app/src/main/assets/models
```

2. Copy model files:
```bash
cp src/core/assets/models/gemma-3n-E4B-it-int4.task android/app/src/main/assets/models/
cp src/core/assets/models/tokenizer.bin android/app/src/main/assets/models/
cp src/core/assets/models/tokenizer_config.json android/app/src/main/assets/models/
```

### Step 2: Link Native Modules

#### iOS:
```bash
cd ios
pod install
cd ..
```

#### Android:
Auto-linking should work. If you have issues:
```bash
cd android
./gradlew clean
cd ..
```

### Step 3: Run the App

#### iOS:
```bash
yarn ios
# or
npx react-native run-ios
```

#### Android:
```bash
yarn android
# or
npx react-native run-android
```

## 🎯 How It Works

### Model Loading Flow

```typescript
// 1. Service creates LLMModule instance
const llmInstance = new LLMModule();

// 2. Load model with tokenizer
await llmInstance.load({
  modelSource: '/path/to/model.task',
  tokenizerSource: '/path/to/tokenizer.bin',
  tokenizerConfigSource: '/path/to/tokenizer_config.json',
});

// 3. Set up streaming callback
llmInstance.setTokenCallback({
  tokenCallback: (token) => {
    // Update UI with each token
  },
});

// 4. Generate response
const response = await llmInstance.generate([
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello!' },
]);
```

### Message Flow

```
User Input → sendMessage() → LLMStore
  ↓
Add user message to messages array
  ↓
Add empty assistant message placeholder
  ↓
Call llmService.generate() with conversation history
  ↓
Token Callback fires for each token
  ↓
Update last message content with new tokens
  ↓
Calculate performance metrics on completion
  ↓
Update message with tokensPerSecond & timeToFirstToken
```

## 📝 File Structure

```
src/
├── modules/
│   └── genai/
│       ├── LLMService.ts        # LLMModule wrapper
│       └── index.ts
├── store/
│   └── llmStore.ts              # Zustand store
├── features/
│   └── ai-assistant/
│       └── index.tsx            # Main chat screen
├── shared/
│   └── components/
│       ├── MessageBubble.tsx
│       ├── ChatInput.tsx
│       └── index.ts
└── types/
    └── react-native-executorch.d.ts  # TypeScript definitions
```

## 🔧 Configuration

### Adjust Model Paths

Edit `src/features/ai-assistant/index.tsx`:

```typescript
const MODEL_FILENAME = 'your-model-name.task';
const TOKENIZER_FILENAME = 'tokenizer.bin';
const TOKENIZER_CONFIG_FILENAME = 'tokenizer_config.json';
```

### Change System Prompt

Edit the `SYSTEM_PROMPT` constant:

```typescript
const SYSTEM_PROMPT = `Your custom system prompt here...`;
```

### Adjust Context Window

In `src/store/llmStore.ts`, change the slice size:

```typescript
// Get last N messages (currently 6)
const conversationHistory = state.messages.slice(-6);
```

## 🎨 Customization

### Change UI Colors

Edit styles in `src/features/ai-assistant/index.tsx`:

```typescript
const styles = StyleSheet.create({
  // Your custom styles
});
```

### Add Custom Message Types

Update `ChatMessage` interface in `src/store/llmStore.ts`:

```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokensPerSecond?: number;
  timeToFirstToken?: number;
  // Add your custom fields here
}
```

## 🐛 Troubleshooting

### Issue: "Model files not found"

**Solution:**
- Verify files are in the correct location
- iOS: Check Xcode project for the files
- Android: Check `android/app/src/main/assets/models/`

### Issue: Metro bundler error

**Solution:**
```bash
# Clear cache and restart
yarn start --reset-cache
```

### Issue: Android build fails

**Solution:**
```bash
cd android
./gradlew clean
cd ..
yarn android
```

### Issue: iOS build fails

**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
yarn ios
```

### Issue: "Cannot find module 'react-native-executorch'"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
# Rebuild iOS
cd ios && pod install && cd ..
```

### Issue: Slow generation or crashes

**Possible causes:**
1. Insufficient RAM (need 2GB+)
2. Model file corrupted
3. Wrong model format

**Solution:**
- Test on a physical device (better performance than simulator)
- Verify model file integrity
- Ensure using the correct `.task` format for executorch

## 📊 Performance Expectations

### Device Requirements
- **Minimum**: 2GB RAM, iOS 13+ / Android 7+
- **Recommended**: 4GB RAM, iOS 14+ / Android 10+

### Expected Performance
- **Initialization**: 10-30 seconds (first time)
- **Time to first token**: 1-3 seconds
- **Tokens per second**: 5-15 (device dependent)
- **Memory usage**: 500MB - 1.5GB

## 🔐 Privacy Features

✅ **100% On-Device Processing**
- No internet connection required
- No data sent to servers
- All processing happens locally
- Model doesn't learn from conversations

## 📚 Key Differences from Initial Implementation

### What Changed:

1. ✅ **Using proper `LLMModule` from `react-native-executorch`**
   - Old: Custom native module wrapper
   - New: Direct use of official LLMModule

2. ✅ **Correct tokenizer loading**
   - Old: No tokenizer support
   - New: Separate tokenizer and config files

3. ✅ **Token streaming callback**
   - Old: Manual event emitter setup
   - New: Built-in `setTokenCallback` method

4. ✅ **File system handling**
   - Old: react-native-fs
   - New: @dr.pogodin/react-native-fs (more actively maintained)

5. ✅ **Message format**
   - Old: Custom format
   - New: Standard Executorch message format

## 🎯 Next Steps

1. ✅ Install dependencies (Done)
2. ⬜ Add model files to iOS/Android
3. ⬜ Link native modules (`pod install` for iOS)
4. ⬜ Build and run the app
5. ⬜ Test the chat feature

## 📖 Additional Resources

- [React Native Executorch GitHub](https://github.com/pytorch/executorch)
- [Private Mind Project](https://github.com/private-mind/private-mind) - Reference implementation
- [ExecuTorch Documentation](https://pytorch.org/executorch/)

## 💡 Tips

1. **First run takes longer** - Model loading and file copying
2. **Test on real device** - Better performance than simulator
3. **Monitor memory** - Close other apps when using AI
4. **Check console logs** - Helpful debugging information
5. **Use smaller prompts first** - Test with simple messages

## 🆘 Need Help?

1. Check console logs: 
   - iOS: `npx react-native log-ios`
   - Android: `npx react-native log-android`

2. Verify file paths are correct
3. Ensure model files are not corrupted
4. Test with a simple message first

---

**Implementation based on**: private-mind project  
**Version**: 1.0.0  
**Last updated**: November 2025

