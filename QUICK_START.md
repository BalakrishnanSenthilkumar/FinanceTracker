# AI Chat - Quick Start Guide

## ✅ What's Done

- ✅ Dependencies installed (`react-native-executorch`, `@dr.pogodin/react-native-fs`, `zustand`)
- ✅ LLM Service implemented (based on private-mind)
- ✅ LLM Store with Zustand
- ✅ Chat UI components
- ✅ AI Chat screen with streaming responses
- ✅ Navigation setup

## 🚀 Next Steps (Required)

### 1️⃣ Prepare Model Files

You need these 3 files:

- `gemma-3n-E4B-it-int4.task` (the model)
- `tokenizer.bin` (tokenizer)
- `tokenizer_config.json` (config)

**Where to get them?**

- Check the private-mind project: `/Users/techjays/Documents/private-mind/assets/models/`
- Or download from Hugging Face (Gemma model)

### 2️⃣ iOS Setup

```bash
cd ios
open FinanceTracker.xcworkspace
```

In Xcode:

1. Create "models" folder in project
2. Add all 3 model files
3. ✅ Check "Copy items if needed"
4. ✅ Select "FinanceTracker" target

Then:

```bash
pod install
```

### 3️⃣ Android Setup

```bash
# Create directory
mkdir -p android/app/src/main/assets/models

# Copy model files
cp /path/to/gemma-3n-E4B-it-int4.task android/app/src/main/assets/models/
cp /path/to/tokenizer.bin android/app/src/main/assets/models/
cp /path/to/tokenizer_config.json android/app/src/main/assets/models/
```

### 4️⃣ Run the App

**iOS:**

```bash
yarn ios
```

**Android:**

```bash
yarn android
```

## 📱 Testing

1. Open the app
2. Navigate to "AI Chat" tab (bottom navigation)
3. Wait for "Online" status (10-30 seconds first time)
4. Type a message and send!

## 🎯 Implementation Details

### Based on private-mind project:

- Uses `LLMModule` from `react-native-executorch`
- Proper tokenizer loading
- Token streaming callbacks
- Performance metrics tracking

### Key Files:

```
src/
├── modules/genai/LLMService.ts       # Core AI service
├── store/llmStore.ts                 # State management
├── features/ai-assistant/index.tsx   # Chat UI
└── types/react-native-executorch.d.ts # TypeScript types
```

## ⚡ Quick Commands

```bash
# Install dependencies
yarn install

# iOS setup
cd ios && pod install && cd ..

# Android clean build
cd android && ./gradlew clean && cd ..

# Start Metro with cache clear
yarn start --reset-cache

# Run iOS
yarn ios

# Run Android
yarn android

# View logs
npx react-native log-ios     # iOS logs
npx react-native log-android  # Android logs
```

## 🐛 Common Issues

### "Model files not found"

➡️ Check file paths in Xcode (iOS) or assets folder (Android)

### Metro bundler error

➡️ `yarn start --reset-cache`

### Build fails

➡️ iOS: `cd ios && pod deintegrate && pod install && cd ..`
➡️ Android: `cd android && ./gradlew clean && cd ..`

## 📚 Documentation

- `COMPLETE_SETUP_GUIDE.md` - Detailed setup instructions
- `AI_CHAT_USAGE.md` - Usage examples

## 🎉 Success Indicators

✅ App builds without errors  
✅ AI Chat tab visible in navigation  
✅ Shows "Initializing..." then "Online" status  
✅ Can send messages and get responses  
✅ Tokens stream in real-time

## 🆘 Need Help?

1. Check `COMPLETE_SETUP_GUIDE.md` for detailed troubleshooting
2. View console logs for errors
3. Verify model files are correctly placed
4. Ensure you're testing on a device with 2GB+ RAM

---

**Ready to test?** Follow steps 1-4 above! 🚀
