# Manual Model Download & Setup Guide

## 📥 Download the Model

### Official Google Sources

Google distributes Gemma 3N through official partner platforms:

**Official Google DeepMind Page:**

- **URL**: `https://deepmind.google/models/gemma/gemma-3n/`
- This is the official Google page with model information and download links

**Official Partner Platforms:**

1. **HuggingFace (Mobile-Optimized Version - Recommended)**

   - **URL**: `https://huggingface.co/MrZeggers/gemma-3n-mobile/resolve/main/gemma-3n-E4B-it-int4.task`
   - **Direct Download**: `https://huggingface.co/MrZeggers/gemma-3n-mobile/resolve/main/gemma-3n-E4B-it-int4.task`
   - **File Name**: `gemma-3n-E4B-it-int4.task`
   - **Size**: ~2.4 GB
   - **Format**: MediaPipe Task format (optimized for mobile)

2. **Kaggle (Official Google Repository)**

   - **Search**: `https://www.kaggle.com/models?search=gemma-3n`
   - Look for official Google/Gemma models

3. **HuggingFace (Official Google Repository)**
   - **Search**: `https://huggingface.co/models?search=google/gemma-3n`
   - Look for models from `google` organization

**Note**: The mobile-optimized `.task` format is available on HuggingFace. For other formats, check the official Google DeepMind page.

## 📁 Where to Store the Model

### For iOS Development (Simulator/Device)

**Option 1: Documents Directory (Recommended)**

```
/Users/YOUR_USERNAME/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Documents/gemma-3n-E4B-it-int4.task
```

**Option 2: Using Xcode**

1. Open your project in Xcode
2. Right-click on your project → "Add Files to [Project]"
3. Select the downloaded `.task` file
4. Make sure "Copy items if needed" is checked
5. Add to target: FinanceTracker

**Option 3: Programmatic Path (App will use this automatically)**
The app automatically uses:

```
[App Documents Directory]/gemma-3n-E4B-it-int4.task
```

### For Android Development

**Option 1: Using Android Studio**

1. Copy file to: `android/app/src/main/assets/gemma-3n-E4B-it-int4.task`
2. Or use: `android/app/src/main/res/raw/` (rename to `gemma_3n_e4b_it_int4.task`)

**Option 2: Using ADB (Recommended)**

```bash
adb push gemma-3n-E4B-it-int4.task /data/data/com.financetracker/files/gemma-3n-E4B-it-int4.task
```

**Option 3: Programmatic Path (App will use this automatically)**
The app automatically uses:

```
/data/data/com.financetracker/files/gemma-3n-E4B-it-int4.task
```

## 🔧 Quick Setup Steps

### Step 1: Download Model

**Official Google DeepMind Page:**
Visit `https://deepmind.google/models/gemma/gemma-3n/` for official download links and documentation.

**Direct Download (Mobile-Optimized):**

```bash
# Using curl (from official HuggingFace repository)
curl -L -o gemma-3n-E4B-it-int4.task \
  "https://huggingface.co/MrZeggers/gemma-3n-mobile/resolve/main/gemma-3n-E4B-it-int4.task"

# Or using wget
wget -O gemma-3n-E4B-it-int4.task \
  "https://huggingface.co/MrZeggers/gemma-3n-mobile/resolve/main/gemma-3n-E4B-it-int4.task"
```

**Alternative: Download from Browser**

1. Visit: `https://deepmind.google/models/gemma/gemma-3n/`
2. Follow links to official partner platforms (HuggingFace/Kaggle)
3. Download the mobile-optimized `.task` format

### Step 2: Get App Documents Path

**iOS:**

```typescript
// Run this in your app to get the path
import RNFS from 'react-native-fs';
console.log('Documents Path:', RNFS.DocumentDirectoryPath);
```

**Android:**

```typescript
// Run this in your app to get the path
import RNFS from 'react-native-fs';
console.log('Files Path:', RNFS.DocumentDirectoryPath);
```

### Step 3: Copy Model to Device

**iOS Simulator:**

```bash
# Find your app's Documents directory
xcrun simctl get_app_container booted com.financetracker data

# Copy file
cp gemma-3n-E4B-it-int4.task "/path/to/app/Documents/"
```

**Android:**

```bash
# Using ADB
adb push gemma-3n-E4B-it-int4.task /sdcard/
# Then move to app directory using file manager or code
```

## ✅ Verify Model is in Place

Add this code temporarily to check:

```typescript
import RNFS from 'react-native-fs';
import { GemmaModelService } from './src/ai/utils/GemmaModelService';

// Check if model exists
const exists = await GemmaModelService.modelExists();
console.log('Model exists:', exists);

if (exists) {
  const path = await GemmaModelService.getModelPath();
  console.log('Model path:', path);
  const size = await GemmaModelService.getModelSize();
  console.log('Model size:', size, 'bytes');
}
```

## 🚀 Using the Manual Model

Once the model is in place, the app will automatically detect and use it:

1. **No download needed** - App checks for existing model first
2. **Faster startup** - No download wait time
3. **Offline ready** - Works without internet

## 📝 Code Configuration

The app is already configured to:

1. Check for model in Documents directory first
2. Use manual model if found
3. Only download if model not found

No code changes needed! Just place the file in the correct location.

## 🔍 Troubleshooting

### Model Not Found

**Check the path:**

```typescript
import RNFS from 'react-native-fs';
console.log('Documents:', RNFS.DocumentDirectoryPath);
console.log('Files:', RNFS.DocumentDirectoryPath);
```

**List files in directory:**

```typescript
const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
console.log(
  'Files:',
  files.map(f => f.name),
);
```

### Wrong File Name

Make sure the file is named exactly: `gemma-3n-E4B-it-int4.task`

### Permission Issues

**iOS:** Make sure app has file access permissions
**Android:** Check storage permissions in AndroidManifest.xml

## 📱 Testing

1. Place model file in Documents directory
2. Restart app
3. Open chat screen
4. Should see: "✅ Model found locally" in logs
5. No download should occur
