# Gemma 3N Model Setup Guide

This guide will help you set up and use the Gemma 3N model in your React Native Finance Tracker app.

## Overview

Gemma 3N is a quantized version of Google's Gemma model optimized for mobile devices. It uses `react-native-llm-mediapipe` for efficient on-device inference.

## Installation Steps

### Step 1: Install Dependencies

```bash
npm install react-native-llm-mediapipe react-native-fs react-native-keychain
# or
yarn add react-native-llm-mediapipe react-native-fs react-native-keychain
```

### Step 2: Install iOS Pods

```bash
cd ios
pod install
cd ..
```

### Step 3: Android Configuration

For Android, the library should auto-link. If you encounter issues, check:

1. **android/build.gradle**:

   ```gradle
   buildscript {
       ext {
           minSdkVersion = 24  // Ensure minimum SDK is 24+
       }
   }
   ```

2. **android/app/build.gradle**:
   ```gradle
   android {
       defaultConfig {
           minSdkVersion 24
       }
   }
   ```

### Step 4: Model Download

The model will be automatically downloaded on first use, or you can pre-download it:

```typescript
import { GemmaModelService } from './src/ai/utils/GemmaModelService';

// Download model
const modelPath = await GemmaModelService.downloadModel({
  modelName: 'gemma-3n-E4B-it-int4.task',
});
```

**Model Details:**

- **Source**: HuggingFace (MrZeggers/gemma-3n-mobile)
- **Size**: ~2.4 GB (quantized INT4)
- **Format**: MediaPipe Task format (.task)
- **Optimization**: Optimized for mobile inference

## Usage

### Automatic Model Loading

The engine automatically downloads and loads the model:

```typescript
import { EngineFactory } from './src/ai/engines/EngineFactory';

// Create and initialize engine (model downloads automatically)
const engine = await EngineFactory.createAndInitialize('local');

// Use for chat
const response = await engine.chat({
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Manual Model Management

```typescript
import { GemmaModelService } from './src/ai/utils/GemmaModelService';

// Check if model exists
const exists = await GemmaModelService.modelExists();

// Get model path (downloads if needed)
const path = await GemmaModelService.getModelPath();

// Get model size
const size = await GemmaModelService.getModelSize();

// Delete model (to free up space)
await GemmaModelService.deleteModel();
```

## Model Storage

- **iOS**: `Documents/gemma-3n-E4B-it-int4.task`
- **Android**: `/data/data/com.financetracker/files/gemma-3n-E4B-it-int4.task`

The model is stored locally on the device and persists between app sessions.

## Performance Tips

1. **First Load**: The first inference may be slower as the model initializes
2. **Memory**: Ensure device has sufficient RAM (recommended 4GB+)
3. **Storage**: Model requires ~2.4 GB of storage space
4. **Battery**: On-device inference uses battery; consider optimizing inference frequency

## Troubleshooting

### Model Download Fails

**Issue**: Network error or insufficient storage

**Solution**:

- Check internet connection
- Ensure device has >3GB free storage
- Try downloading manually and placing in app directory

### Model Loading Fails

**Issue**: Native module not linked

**Solution**:

```bash
# iOS
cd ios && pod install && cd ..

# Android - rebuild
cd android && ./gradlew clean && cd ..
```

### Inference Errors

**Issue**: Model not loaded or memory issues

**Solution**:

- Check if model exists: `await GemmaModelService.modelExists()`
- Verify model loaded: `TFLiteModule.isModelLoaded()`
- Close other apps to free memory

## Customization

### Use Custom Model Path

```typescript
const engine = await EngineFactory.createAndInitialize('local', {
  modelPath: '/path/to/custom/model.task',
});
```

### Adjust Generation Parameters

The engine uses these defaults:

- `maxTokens`: 500
- `temperature`: 0.7
- `topP`: 0.9
- `topK`: 40

You can customize in `LocalLLMEngine.processWithGemmaModel()`.

## Integration with Chat Feature

The chat feature automatically uses Gemma 3N:

```typescript
// In src/features/chat/ai-integration.ts
// The QueryEngine automatically initializes with Gemma 3N
const { sendMessage } = useChatAI();
await sendMessage('Hello!');
```

## Model Updates

To update the model:

1. Delete old model: `await GemmaModelService.deleteModel()`
2. Download new version: `await GemmaModelService.downloadModel()`

## Security Considerations

- Model files are stored locally on device
- No data is sent to external servers
- All inference happens on-device
- Consider encrypting model files for production (see ModelDecryptor)

## Next Steps

1. ✅ Install dependencies
2. ✅ Run `pod install` (iOS)
3. ✅ Test model download
4. ✅ Test chat functionality
5. ✅ Optimize for production (encryption, caching, etc.)

## Support

For issues with:

- **react-native-llm-mediapipe**: Check [library documentation](https://github.com/your-repo/react-native-llm-mediapipe)
- **Model download**: Verify HuggingFace access
- **Integration**: Check engine initialization logs

## Model License

Gemma models are subject to Google's Gemma Terms of Use. Ensure compliance before using in production.

