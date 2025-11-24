# TFLite Integration Guide

This guide explains how to integrate actual TensorFlow Lite model loading for the Gemma 3B model.

## Prerequisites

### Required Dependencies

Install the following packages:

```bash
npm install react-native-fs react-native-keychain
# or
yarn add react-native-fs react-native-keychain
```

For iOS:
```bash
cd ios && pod install && cd ..
```

### TFLite Native Module Options

You have three options for TFLite integration:

#### Option 1: react-native-fast-tflite (Recommended)
```bash
npm install react-native-fast-tflite
cd ios && pod install && cd ..
```

#### Option 2: Custom Native Module
Create native modules for iOS (Swift) and Android (Kotlin) that wrap TensorFlow Lite.

#### Option 3: TensorFlow.js (Alternative)
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install react-native-fs react-native-keychain
```

### Step 2: Link Native Modules

#### iOS
```bash
cd ios
pod install
cd ..
```

#### Android
The modules should auto-link. If not, add to `android/settings.gradle`:
```gradle
include ':react-native-fs'
project(':react-native-fs').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-fs/android')
```

### Step 3: Update TFLiteModule.ts

If using `react-native-fast-tflite`, update `src/ai/utils/TFLiteModule.ts`:

```typescript
import { TFLite } from 'react-native-fast-tflite';

export class TFLiteModule {
  static async loadModel(modelPath: string): Promise<TFLiteModel> {
    const interpreter = await TFLite.loadModel(modelPath);
    // ... rest of implementation
  }
}
```

### Step 4: Prepare Gemma 3B Model

1. **Convert Gemma 3B to TFLite**:
   - Use TensorFlow Lite Converter
   - Quantize model for mobile (INT8 recommended)
   - Model should be optimized for inference

2. **Encrypt Model** (Optional but recommended):
   ```typescript
   import { AES256Encryption } from './src/security/encryption/AES256Encryption';
   import { KeychainManager } from './src/security/keychain/KeychainManager';
   
   // Generate and store key
   const key = AES256Encryption.generateKey();
   await KeychainManager.storeKey(key, 'model_key_gemma-3b');
   
   // Encrypt model
   const modelBuffer = await readModelFile('gemma-3b.tflite');
   const { encrypted, iv } = await AES256Encryption.encrypt(modelBuffer, key);
   
   // Save encrypted model with IV prepended
   await saveEncryptedModel(encrypted, iv, 'gemma-3b.tflite.encrypted');
   ```

3. **Place Model**:
   - Encrypted: `src/assets/models_encrypted/gemma-3b.tflite.encrypted`
   - Unencrypted: `src/assets/models/gemma-3b.tflite`

### Step 5: Configure Model Path

Update `EngineFactory.ts` or pass model path:

```typescript
const engine = await EngineFactory.createAndInitialize('local', {
  modelPath: 'assets/models_encrypted/gemma-3b.tflite.encrypted',
});
```

### Step 6: Implement Tokenizer

Replace placeholder tokenizer in `LocalLLMEngine.ts` with actual Gemma tokenizer:

```typescript
import { Tokenizer } from '@huggingface/tokenizers';

private tokenizer: Tokenizer;

async initialize() {
  // Load Gemma tokenizer
  this.tokenizer = await Tokenizer.fromPretrained('google/gemma-2b');
  // ... rest of initialization
}

private tokenize(text: string): number[] {
  return this.tokenizer.encode(text).ids;
}

private detokenize(ids: Int32Array): string {
  return this.tokenizer.decode(Array.from(ids));
}
```

## Model Format

### Input Format
- **Shape**: `[1, max_seq_length]` (e.g., `[1, 512]`)
- **Type**: `INT32` (token IDs)
- **Padding**: Use tokenizer pad token ID

### Output Format
- **Shape**: `[1, max_seq_length, vocab_size]`
- **Type**: `FLOAT32` (logits)
- **Decoding**: Use greedy or beam search

## Testing

1. **Test Model Loading**:
   ```typescript
   const loader = new TFLiteLoader();
   const model = await loader.loadModel('assets/models/gemma-3b.tflite');
   console.log('Model loaded:', model);
   ```

2. **Test Decryption**:
   ```typescript
   const decryptor = new ModelDecryptor();
   const decrypted = await decryptor.decryptModel(
     'assets/models_encrypted/gemma-3b.tflite.encrypted',
     'gemma-3b'
   );
   ```

3. **Test Inference**:
   ```typescript
   const engine = await EngineFactory.createAndInitialize('local');
   const response = await engine.chat({
     messages: [{ role: 'user', content: 'Hello!' }]
   });
   ```

## Troubleshooting

### Model Not Loading
- Check file path is correct
- Verify model file exists in bundle/assets
- Check file permissions

### Decryption Fails
- Verify encryption key is stored in keychain
- Check IV is correctly prepended to encrypted data
- Verify key length is 32 bytes (256 bits)

### Inference Errors
- Check input tensor shape matches model expectations
- Verify tokenization matches model's tokenizer
- Check output tensor shape and type

### Performance Issues
- Use quantized models (INT8)
- Enable GPU acceleration if available
- Consider model pruning for smaller size

## Native Module Implementation

If creating custom native module, see:
- iOS: `ios/TFLiteModule.swift`
- Android: `android/app/src/main/java/com/financetracker/TFLiteModule.kt`

## Security Best Practices

1. **Encrypt Models**: Always encrypt sensitive models
2. **Key Storage**: Use keychain for encryption keys
3. **Temporary Files**: Clean up decrypted temporary files
4. **Model Validation**: Verify model integrity before loading
5. **Access Control**: Restrict model access to authorized users

## Next Steps

1. Install `react-native-fast-tflite` or implement native module
2. Convert Gemma 3B to TFLite format
3. Implement proper tokenizer
4. Test end-to-end inference
5. Optimize for production (quantization, pruning)


