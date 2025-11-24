# AI Chat Feature Implementation Guide

## Overview

The AI chat feature uses the Gemma 3B model running on-device via TensorFlow Lite. The implementation follows the established AI architecture pattern.

## Architecture Components

### 1. **Engine Layer** (`src/ai/engines/`)
- **BaseAIEngine**: Abstract base class defining the AI interface
- **LocalLLMEngine**: On-device AI using Gemma 3B TFLite model
- **EngineFactory**: Creates and manages engine instances

### 2. **Processor Layer** (`src/ai/processors/`)
- **QueryProcessor**: Handles chat queries and maintains conversation history

### 3. **Extension Layer** (`src/ai/extensions/`)
- **QueryEngine**: Manages query processors and provides extension points

### 4. **Feature Integration** (`src/features/chat/`)
- **ai-integration.ts**: `useChatAI` hook connects UI to AI
- **index.tsx**: Chat UI component with real chat-style interface

## How It Works

1. **Initialization**: When the chat screen loads, `QueryEngine.initializeDefault()` creates a LocalLLMEngine instance and loads the Gemma 3B model
2. **User Input**: User types a message and clicks send
3. **Processing**: `QueryProcessor` processes the message through the engine
4. **Response**: Engine returns AI-generated response
5. **Display**: Response is displayed in the chat UI

## Usage

### In Chat Screen
```typescript
import { useChatAI } from './ai-integration';

const ChatScreen = () => {
  const { messages, sendMessage, clearChat, isProcessing } = useChatAI();
  
  // Use messages to display chat
  // Call sendMessage() when user sends a message
  // Call clearChat() to reset conversation
};
```

### Adding to Other Features
```typescript
import { QueryEngine } from '../../ai/extensions/QueryEngine';

// Process a query
const result = await QueryEngine.processQuery("What's my spending this month?");
```

## Model Setup

### Current Implementation
- Uses placeholder/demo responses (rule-based)
- Ready for TFLite integration

### Production Setup (To Do)
1. **Add Gemma 3B Model**:
   - Place encrypted model file in `src/assets/models_encrypted/gemma-3b.tflite.encrypted`
   - Model will be decrypted at runtime using security module

2. **Integrate TFLite**:
   - Install `@tensorflow/tfjs-react-native` or native TFLite bindings
   - Update `LocalLLMEngine.processWithModel()` to use actual TFLite inference

3. **Model Loading**:
   - Decrypt model using `ModelDecryptor` from security module
   - Load into TFLite interpreter
   - Initialize model weights

## Navigation

The chat feature is accessible from:
- **Home Page**: Click "Chat with AI Assistant" button
- **Navigation**: Stack navigator routes to Chat screen

## Customization

### Change Model
```typescript
// In EngineFactory.create()
const engine = EngineFactory.create('local', {
  modelPath: 'assets/models_encrypted/your-model.tflite',
});
```

### Modify System Prompt
```typescript
// In QueryProcessor constructor
this.conversationHistory.push({
  role: 'system',
  content: 'Your custom system prompt here',
});
```

### Add Features
- Use `QueryEngine.registerProcessor()` to add custom processors
- Extend `QueryProcessor` for specialized chat behaviors

## Testing

1. Run the app: `npm start` then `npm run ios` or `npm run android`
2. Navigate to Home screen
3. Click "Chat with AI Assistant" button
4. Type messages and test the chat interface

## Next Steps

1. Integrate actual TFLite model loading
2. Add model encryption/decryption
3. Implement proper tokenization
4. Add conversation persistence
5. Add error handling and retry logic
6. Add typing indicators
7. Add message timestamps
8. Add conversation export


