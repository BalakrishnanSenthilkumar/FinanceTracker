# Quick Start: Gemma 3N Integration

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install react-native-llm-mediapipe react-native-fs react-native-keychain
cd ios && pod install && cd ..
```

### Step 2: Run the App

```bash
npm start
npm run ios  # or npm run android
```

### Step 3: Test Chat Feature

1. Open the app
2. Navigate to Home screen
3. Tap "Chat with AI Assistant"
4. The model will automatically download on first use (~2.4 GB)
5. Start chatting!

## 📋 What Was Implemented

✅ **GemmaTokenizer** - Tokenization service for Gemma models
✅ **GemmaModelService** - Automatic model download and management
✅ **TFLiteModule** - Integration with react-native-llm-mediapipe
✅ **LocalLLMEngine** - Updated to use Gemma 3N
✅ **Automatic Model Download** - Downloads model on first use
✅ **Fallback Mode** - Works even if model not available

## 🎯 How It Works

1. **First Launch**: App checks for Gemma 3N model
2. **Auto Download**: If not found, downloads from HuggingFace
3. **Model Loading**: Loads model via react-native-llm-mediapipe
4. **Chat Ready**: Model ready for inference
5. **Inference**: Processes chat messages using Gemma 3N

## 🔧 Configuration

### Use Custom Model Path

```typescript
const engine = await EngineFactory.createAndInitialize('local', {
  modelPath: '/custom/path/to/model.task',
});
```

### Pre-download Model

```typescript
import { GemmaModelService } from './src/ai/utils/GemmaModelService';

// Download before first use
await GemmaModelService.downloadModel();
```

## 📱 Model Storage

- **iOS**: `Documents/gemma-3n-E4B-it-int4.task`
- **Android**: App's files directory
- **Size**: ~2.4 GB
- **Format**: MediaPipe Task format

## ⚠️ Important Notes

1. **First Download**: Takes time (~2.4 GB download)
2. **Storage**: Ensure device has >3GB free space
3. **Memory**: Recommended 4GB+ RAM for smooth operation
4. **Network**: Requires internet for initial download

## 🐛 Troubleshooting

### Model Not Downloading

```typescript
// Check manually
import { GemmaModelService } from './src/ai/utils/GemmaModelService';
const exists = await GemmaModelService.modelExists();
console.log('Model exists:', exists);
```

### Model Not Loading

```typescript
// Check if LLM MediaPipe is available
import { TFLiteModule } from './src/ai/utils/TFLiteModule';
await TFLiteModule.initializeLLMMediaPipe();
console.log('Available:', TFLiteModule.isAvailable());
```

### Clear and Re-download

```typescript
import { GemmaModelService } from './src/ai/utils/GemmaModelService';
await GemmaModelService.deleteModel();
await GemmaModelService.downloadModel();
```

## 📚 Next Steps

1. ✅ Test chat functionality
2. ✅ Customize system prompt
3. ✅ Add conversation persistence
4. ✅ Optimize for production
5. ✅ Add model encryption (optional)

## 🎉 You're Ready!

The Gemma 3N model is now integrated. The chat feature will automatically use it once the model is downloaded. Enjoy your AI-powered finance assistant!

