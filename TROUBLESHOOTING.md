# 🐛 Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "Cannot read property 'RNEDirectory' of undefined"

**Cause**: Native module `react-native-executorch` is not linked.

**Solution**:

#### iOS:
```bash
# Stop Metro bundler (Ctrl+C)

# Install pods
export LANG=en_US.UTF-8
cd ios
pod install
cd ..

# Clean and rebuild
yarn ios
```

#### Android:
```bash
# Stop Metro bundler (Ctrl+C)

# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
yarn android
```

#### If still not working:
```bash
# Complete clean
rm -rf node_modules yarn.lock ios/Pods ios/Podfile.lock
yarn install
cd ios && pod install && cd ..

# Rebuild
yarn ios
```

---

### ❌ Error: "Model download failed"

**Possible Causes**:
1. No internet connection
2. Insufficient storage space
3. Network timeout

**Solution**:
1. Check internet connection (WiFi recommended)
2. Ensure at least 3GB free storage
3. Try again - download will resume

---

### ❌ Error: "Model not loaded"

**Cause**: Download not complete or model failed to load into memory.

**Solution**:
1. Wait for download to reach 100%
2. Check console logs for specific error
3. Restart the app
4. Try downloading again

---

### ❌ App crashes during download

**Cause**: Insufficient RAM or storage.

**Solution**:
1. Close other apps
2. Ensure 2GB+ free RAM
3. Ensure 3GB+ free storage
4. Try smaller model (Qwen 0.6B instead of LLaMA 1B)

---

### ❌ Slow or no response generation

**Possible Causes**:
1. First message (model warmup)
2. Testing on simulator
3. Low device resources

**Solution**:
1. First message is slower - normal
2. Test on physical device (much faster)
3. Close other apps
4. Wait 5-10 seconds for warmup

---

### ❌ CocoaPods encoding error

**Error**: `Unicode Normalization not appropriate for ASCII-8BIT`

**Solution**:
```bash
export LANG=en_US.UTF-8
cd ios
pod install
cd ..
```

Or add to `~/.zshrc` or `~/.bash_profile`:
```bash
export LANG=en_US.UTF-8
```

---

### ❌ Build failed after installing dependencies

**iOS:**
```bash
cd ios
pod deintegrate
pod install
cd ..
yarn ios
```

**Android:**
```bash
cd android
./gradlew clean
./gradlew --stop
cd ..
yarn android
```

---

### ❌ Metro bundler cache issues

**Solution**:
```bash
# Clear Metro cache
yarn start --reset-cache

# In a new terminal
yarn ios
# or
yarn android
```

---

### ❌ "Invariant Violation: Native module cannot be null"

**Cause**: Native modules not properly linked.

**Solution**:
```bash
# Complete rebuild
rm -rf node_modules yarn.lock
yarn install

# iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Android
cd android
./gradlew clean
cd ..

# Rebuild
yarn ios  # or yarn android
```

---

## 📊 Performance Issues

### Model loads slowly
- **Normal**: 10-30 seconds on first load
- **Try**: Test on physical device
- **Check**: Console logs for errors

### Generation is slow
- **Normal**: First message takes longer (warmup)
- **Expected**: 5-15 tokens/second on device
- **Try**: Close other apps, free up RAM

### App uses too much memory
- **Expected**: 500MB - 1.5GB during generation
- **Try**: Smaller model (Qwen 0.6B)
- **Check**: Close other apps

---

## 🔍 Debugging Tips

### View Logs

**iOS:**
```bash
npx react-native log-ios
```

**Android:**
```bash
npx react-native log-android
```

### Check Native Module Status

Add to your code:
```typescript
import { NativeModules } from 'react-native';

console.log('Executorch Module:', NativeModules.RnExecutorch);
```

If `undefined`, native module is not linked.

### Verify Model Download

Check console for:
```
✅ LLaMA 3.2 - 1B - SpinQuant downloaded successfully
```

### Check Storage Space

**iOS:**
- Settings → General → iPhone Storage

**Android:**
- Settings → Storage

Need at least 3GB free.

---

## 🆘 Still Having Issues?

### Before asking for help:

1. ✅ Run `yarn install`
2. ✅ Run `cd ios && pod install && cd ..` (iOS)
3. ✅ Rebuild app (`yarn ios` or `yarn android`)
4. ✅ Restart Metro bundler
5. ✅ Check device storage (3GB+ free)
6. ✅ Test on physical device
7. ✅ Check console logs

### Provide this info:

- Platform (iOS/Android)
- Device/Simulator
- React Native version
- Error message (full)
- Console logs
- Steps to reproduce

---

## ✅ Verification Checklist

After fixing issues:

- [ ] App builds without errors
- [ ] AI Chat tab visible
- [ ] Model download starts
- [ ] Progress bar shows correctly
- [ ] Model loads after download
- [ ] Can send messages
- [ ] Responses appear
- [ ] No console errors

---

## 📚 Related Documentation

- [FINAL_SETUP.md](./FINAL_SETUP.md) - Setup instructions
- [README_AI_CHAT.md](./README_AI_CHAT.md) - Complete guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference

---

**Most Common Solution**: Rebuild the app after installing dependencies!

```bash
cd ios && pod install && cd .. && yarn ios
```


