# 🔄 Rebuild Instructions

## ✅ Pods Installed - Now Rebuild

The native modules are now installed. **You MUST rebuild the app** to link them.

---

## 📱 iOS - Rebuild Now

### Option 1: Using Yarn (Recommended)
```bash
# Stop current Metro bundler (Ctrl+C if running)
yarn ios
```

### Option 2: Using Xcode
```bash
# Open Xcode
open ios/FinanceTracker.xcworkspace

# In Xcode:
# 1. Product → Clean Build Folder (Cmd+Shift+K)
# 2. Product → Build (Cmd+B)
# 3. Product → Run (Cmd+R)
```

---

## 🤖 Android - If Needed

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
yarn android
```

---

## 🔥 If You Get Any Errors

### Complete Clean Rebuild:

```bash
# 1. Stop Metro bundler (Ctrl+C)

# 2. Clean everything
rm -rf ios/build
rm -rf android/build android/app/build

# 3. Restart Metro with cache clear
yarn start --reset-cache

# 4. In NEW terminal, rebuild
yarn ios
# or
yarn android
```

---

## ✅ Success Indicators

After rebuild, you should see:

1. **App launches** ✅
2. **AI Chat tab visible** ✅
3. **Tapping AI Chat shows download prompt** ✅
4. **No more "RNEDirectory undefined" error** ✅

---

## 🎯 Next Steps After Rebuild

1. Open app
2. Navigate to **"AI Chat"** tab
3. Tap **"Download"** when prompted
4. Wait for model download (1.14 GB)
5. Start chatting!

---

## ⚠️ Important Notes

- **Metro bundler**: Will restart automatically
- **First build**: May take 2-5 minutes
- **Simulator**: Slower than real device
- **Model download**: Needs WiFi, takes 2-5 minutes

---

## 🐛 Still Getting Errors?

See **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for detailed solutions.

**Most common fix**: Complete clean rebuild
```bash
rm -rf node_modules yarn.lock ios/Pods ios/Podfile.lock
yarn install
cd ios && pod install && cd ..
yarn ios
```


