# AI Chat Feature - Quick Usage Guide

## 🚀 Getting Started

### Installation

Run the setup script:
```bash
./install-setup.sh
```

Or manually install:
```bash
npm install
cd ios && pod install && cd ..
```

### Model Setup

The Gemma model is located at: `src/core/assets/models/gemma-3n-E4B-it-int4.task`

#### iOS:
1. Open `ios/FinanceTracker.xcworkspace` in Xcode
2. Drag the model file into the project
3. Ensure "Copy items if needed" is checked
4. Select target: FinanceTracker

#### Android:
Model is automatically copied to assets by the setup script. If needed manually:
```bash
mkdir -p android/app/src/main/assets/models
cp src/core/assets/models/gemma-3n-E4B-it-int4.task android/app/src/main/assets/models/
```

## 💬 Using the AI Chat

### 1. Launch the App
```bash
# iOS
npm run ios

# Android
npm run android
```

### 2. Navigate to AI Chat Tab
Tap on the **"AI Chat"** tab in the bottom navigation

### 3. Wait for Initialization
- The app will display "Initializing..." while loading the model
- Once ready, you'll see "Online" status with a green dot
- This may take 10-30 seconds on first load

### 4. Start Chatting
Type your message and tap the send button (↑)

## 📝 Example Conversations

### Financial Advice
```
User: How much should I save each month?
AI: Generally, it's recommended to save at least 20% of your income...
```

### Expense Tracking
```
User: Help me categorize my spending
AI: I can help you organize expenses into categories like groceries, utilities...
```

### Budgeting
```
User: Create a budget plan for $3000 monthly income
AI: Here's a suggested budget breakdown...
```

## ⚙️ Features

### ✅ What You Can Do

- **Ask Questions**: Get financial advice and guidance
- **Real-time Responses**: Streaming text generation
- **Chat History**: View entire conversation
- **Clear Chat**: Reset conversation anytime
- **Offline AI**: Runs completely on-device, no internet needed

### 🎨 UI Elements

- **Message Bubbles**: 
  - Blue bubbles = Your messages
  - White bubbles = AI responses
  - Gray system messages = Status updates

- **Status Indicator**:
  - 🟢 Green = AI is ready
  - 🔴 Red = AI is offline/error
  - Loading spinner = Initializing

- **Input Field**:
  - Disabled while AI is thinking
  - Shows contextual placeholder text
  - Multi-line support for longer messages

## 🔧 Configuration

### Adjust AI Behavior

Edit `src/features/ai-assistant/index.tsx`:

```typescript
// System Prompt - Change AI personality
const SYSTEM_PROMPT = `You are a helpful AI financial assistant...`;

// Generation Settings
temperature: 0.7,  // 0.0-1.0 (creativity)
maxTokens: 512,    // Response length
```

### Temperature Guide
- **0.0-0.3**: Very focused and deterministic
- **0.4-0.7**: Balanced (recommended)
- **0.8-1.0**: More creative and varied

## 🐛 Common Issues

### Issue: "Initializing..." Stuck
**Fix**: 
- Wait 30 seconds
- Check console for errors
- Restart the app
- Verify model file exists

### Issue: Slow Responses
**Fix**:
- Test on physical device (faster than simulator)
- Reduce `maxTokens` to 256
- Close other apps

### Issue: App Crashes
**Fix**:
- Check available RAM (need 2GB+)
- Reduce model quality settings
- Clean build and reinstall

### Issue: "Model not initialized"
**Fix**:
- Wait for "Online" status
- Check model path in code
- Verify model file was copied correctly

## 📊 Performance

### Expected Performance
- **Initialization**: 10-30 seconds
- **Response Time**: 1-5 seconds for short answers
- **Tokens/Second**: 5-15 tokens (device dependent)
- **Memory Usage**: 500MB - 1GB

### Device Requirements
- **Minimum**: 2GB RAM, iOS 13+ / Android 7+
- **Recommended**: 4GB RAM, iOS 14+ / Android 10+
- **Storage**: 200MB for model file

## 🔐 Privacy & Security

✅ **100% On-Device**
- No data sent to servers
- No internet connection required
- All processing happens locally
- Chat history stays on device

✅ **Data Protection**
- Messages not stored permanently (currently)
- Model doesn't learn from conversations
- No user data collection

## 🎯 Best Practices

### Do's ✅
- Ask specific financial questions
- Provide context in your questions
- Use clear, concise language
- Wait for complete responses
- Clear chat for new topics

### Don'ts ❌
- Don't share sensitive financial data (though it's private)
- Don't interrupt generation mid-response
- Don't expect real-time market data
- Don't rely solely on AI for critical decisions

## 🚀 Advanced Usage

### Custom System Prompts

Create specialized assistants:

```typescript
// Budget Coach
const SYSTEM_PROMPT = `You are a strict budget coach...`;

// Investment Advisor
const SYSTEM_PROMPT = `You are a conservative investment advisor...`;

// Debt Manager
const SYSTEM_PROMPT = `You help users manage and eliminate debt...`;
```

### Integration Ideas

Integrate with your app features:

```typescript
// Add expense data to prompt
const prompt = `Based on my expenses: ${expenseData}, what should I optimize?`;

// Use AI suggestions in app
const suggestion = await executorchService.generate({
  prompt: `Categorize this expense: ${description}`,
});
```

## 📱 Screenshots & Walkthrough

### Navigation Flow
```
Login Screen → HomeTab → AI Chat Tab → Chat Interface
```

### Chat Interface
```
┌─────────────────────────┐
│ AI Assistant            │
│ 🟢 Online      [Clear]  │
├─────────────────────────┤
│                         │
│  Hello! How can I       │
│  help with your         │
│  finances?              │
│  ╰─ 2:30 PM            │
│                         │
│            What's a     │
│            good budget? │
│            ╰─ 2:31 PM  │
│                         │
│  A good budget follows  │
│  the 50/30/20 rule...   │
│  ╰─ 2:31 PM            │
│                         │
├─────────────────────────┤
│ Type a message...    ↑  │
└─────────────────────────┘
```

## 🛠️ Code Structure

```
AI Chat Feature
├── ExecutorchService     → AI model management
├── LLM Store            → State management
├── AI Chat Screen       → Main UI
├── MessageBubble        → Message display
└── ChatInput            → Text input
```

## 📚 Additional Resources

- [ExecutorCH Docs](https://pytorch.org/executorch/)
- [Gemma Model Info](https://ai.google.dev/gemma)
- [React Native Docs](https://reactnative.dev/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

## 🆘 Support

If you encounter issues:

1. Check console logs: `npx react-native log-ios` or `npx react-native log-android`
2. Review `SETUP_AI_CHAT.md` for detailed setup
3. Check the troubleshooting section above
4. Verify all dependencies are installed

## 🎉 What's Next?

Potential enhancements:
- [ ] Persistent chat history
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Integration with expense data
- [ ] Suggested prompts
- [ ] Export conversations
- [ ] Custom themes

---

**Happy Chatting!** 🤖💬

