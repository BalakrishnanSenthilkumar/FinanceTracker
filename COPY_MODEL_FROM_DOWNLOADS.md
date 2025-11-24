# Copy Model from Downloads Folder

## 🚀 Quick Start for Android Phone Users

**If you downloaded the model directly on your Android phone:**

1. ✅ Make sure the file `gemma-3n-E4B-it-int4.task` is in your **Downloads** folder
2. ✅ Open the Finance Tracker app
3. ✅ The app will **automatically detect and copy** the model from Downloads!
4. ✅ No manual steps needed - just open the app and it will work

**The app checks these locations automatically:**

- `/sdcard/Download/gemma-3n-E4B-it-int4.task`
- `/storage/emulated/0/Download/gemma-3n-E4B-it-int4.task`
- `/storage/emulated/0/Downloads/gemma-3n-E4B-it-int4.task`

**Note:** Make sure the file name is exactly `gemma-3n-E4B-it-int4.task` (case-sensitive)

**Troubleshooting:**

- If the app doesn't find the model, check the console logs - it will show which paths it checked
- Make sure the file is in Downloads (not in a subfolder)
- On some Android versions, you may need to grant storage permissions to the app
- If automatic copy fails, you can use ADB method below

---

## 📍 Your Current File Location (For Mac/Computer Users)

Your model file is currently at:

```
/Users/balakrishnan/Downloads/gemma-3n-E4B-it-int4.task
```

## 🔍 Step 1: Get the Exact File Path

### Option A: Using Terminal

```bash
# Get the full path to your downloaded file
cd ~/Downloads
pwd
# Output: /Users/balakrishnan/Downloads

# Check if file exists
ls -lh gemma-3n-E4B-it-int4.task
# This will show the file with its size
```

### Option B: Using Finder

1. Open Finder
2. Go to Downloads folder
3. Right-click on `gemma-3n-E4B-it-int4.task`
4. Hold Option key and right-click → "Copy as Pathname"
5. Or drag file to Terminal to see path

## 📱 Step 2: Find Where App Expects the Model

### For iOS Simulator

**Method 1: Run app and check logs**

1. Run your app: `npm run ios`
2. Check console logs - it will show the path like:
   ```
   📁 Model Storage Path
   Documents Directory: /Users/balakrishnan/Library/Developer/CoreSimulator/Devices/.../Documents
   Model Path: /Users/balakrishnan/Library/Developer/CoreSimulator/Devices/.../Documents/gemma-3n-E4B-it-int4.task
   ```

**Method 2: Use Terminal to find simulator path**

```bash
# List all simulators
xcrun simctl list devices

# Get app container path (replace DEVICE_ID and APP_ID)
xcrun simctl get_app_container booted com.financetracker data

# Or find Documents directory
xcrun simctl get_app_container booted com.financetracker data | xargs -I {} echo "{}/Documents"
```

### For Android

**Method 1: Run app and check logs**

1. Run your app: `npm run android`
2. Check console logs - it will show the path like:
   ```
   📁 Model Storage Path
   Documents Directory: /data/data/com.financetracker/files
   Model Path: /data/data/com.financetracker/files/gemma-3n-E4B-it-int4.task
   ```

**Method 2: Use ADB**

```bash
# Push file directly to device
adb push ~/Downloads/gemma-3n-E4B-it-int4.task /sdcard/
adb shell run-as com.financetracker cp /sdcard/gemma-3n-E4B-it-int4.task files/
```

## 🚀 Step 3: Copy File to App Location

### iOS Simulator - Quick Copy Script

Create a script to copy the file:

```bash
#!/bin/bash
# copy-model.sh

# Source file (your Downloads folder)
SOURCE="$HOME/Downloads/gemma-3n-E4B-it-int4.task"

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
    echo "❌ File not found at: $SOURCE"
    echo "Please check the file name and location"
    exit 1
fi

# Get simulator Documents path
SIMULATOR_PATH=$(xcrun simctl get_app_container booted com.financetracker data 2>/dev/null)

if [ -z "$SIMULATOR_PATH" ]; then
    echo "❌ Could not find simulator path"
    echo "Make sure:"
    echo "  1. iOS Simulator is running"
    echo "  2. App is installed"
    echo "  3. Bundle ID is: com.financetracker"
    exit 1
fi

DEST="$SIMULATOR_PATH/Documents/gemma-3n-E4B-it-int4.task"

# Copy file
echo "📥 Copying model file..."
echo "From: $SOURCE"
echo "To: $DEST"
cp "$SOURCE" "$DEST"

if [ $? -eq 0 ]; then
    echo "✅ Model copied successfully!"
    echo "File size: $(ls -lh "$DEST" | awk '{print $5}')"
else
    echo "❌ Failed to copy file"
    exit 1
fi
```

**Run the script:**

```bash
chmod +x copy-model.sh
./copy-model.sh
```

### iOS Simulator - Manual Copy

```bash
# 1. Find your simulator's Documents directory
SIM_PATH=$(xcrun simctl get_app_container booted com.financetracker data)/Documents

# 2. Copy file
cp ~/Downloads/gemma-3n-E4B-it-int4.task "$SIM_PATH/"

# 3. Verify
ls -lh "$SIM_PATH/gemma-3n-E4B-it-int4.task"
```

### Android - Model Downloaded on Phone

**✅ EASIEST METHOD: Automatic Copy (Recommended)**

The app now automatically checks your Downloads folder! Just:

1. Download the model file (`gemma-3n-E4B-it-int4.task`) on your Android phone
2. Make sure it's in the Downloads folder
3. Open the Finance Tracker app
4. The app will automatically detect and copy it to the correct location

**Manual Method: Using ADB (if you have computer connected)**

```bash
# Method 1: Direct push (requires root or debug build)
adb push ~/Downloads/gemma-3n-E4B-it-int4.task /data/data/com.financetracker/files/

# Method 2: Via sdcard (works without root)
adb push ~/Downloads/gemma-3n-E4B-it-int4.task /sdcard/
adb shell run-as com.financetracker cp /sdcard/gemma-3n-E4B-it-int4.task files/
adb shell rm /sdcard/gemma-3n-E4B-it-int4.task
```

**Manual Method: Using File Manager App**

1. Install a file manager app (like "Files" or "ES File Explorer")
2. Navigate to `/sdcard/Download/` or `/storage/emulated/0/Download/`
3. Find `gemma-3n-E4B-it-int4.task`
4. Copy it to: `/data/data/com.financetracker/files/`
   - Note: This path requires root access or special permissions
   - **Better**: Just keep it in Downloads - the app will copy it automatically!

## ✅ Step 4: Verify File is in Place

### Check using code (add temporarily to your app)

```typescript
import RNFS from 'react-native-fs';
import { GemmaModelService } from './src/ai/utils/GemmaModelService';

// Check if model exists
const checkModel = async () => {
  const path = GemmaModelService.getDefaultModelPath();
  console.log('Expected path:', path);

  const exists = await RNFS.exists(path);
  console.log('Model exists:', exists);

  if (exists) {
    const stat = await RNFS.stat(path);
    console.log('File size:', stat.size, 'bytes');
    console.log(
      'File size (GB):',
      (stat.size / 1024 / 1024 / 1024).toFixed(2),
      'GB',
    );
  }
};

checkModel();
```

### Check using Terminal

**iOS:**

```bash
# Find and check file
SIM_PATH=$(xcrun simctl get_app_container booted com.financetracker data)/Documents
ls -lh "$SIM_PATH/gemma-3n-E4B-it-int4.task"
```

**Android:**

```bash
adb shell run-as com.financetracker ls -lh files/gemma-3n-E4B-it-int4.task
```

## 🎯 Quick Commands Summary

### iOS Simulator

```bash
# One-liner to copy from Downloads to simulator
cp ~/Downloads/gemma-3n-E4B-it-int4.task \
   "$(xcrun simctl get_app_container booted com.financetracker data)/Documents/"
```

### Android

```bash
# One-liner to copy from Downloads to Android device
adb push ~/Downloads/gemma-3n-E4B-it-int4.task /sdcard/ && \
adb shell run-as com.financetracker cp /sdcard/gemma-3n-E4B-it-int4.task files/ && \
adb shell rm /sdcard/gemma-3n-E4B-it-int4.task
```

## 🔄 Automatic Copy from Downloads (Already Implemented!)

The app now automatically checks and copies from Downloads folder! No code changes needed.

**How it works:**

- When the app starts, it checks for the model in Downloads folder
- If found, it automatically copies to the app's files directory
- Works on Android devices where you downloaded the model directly

**Supported Downloads paths:**

- `/sdcard/Download/gemma-3n-E4B-it-int4.task`
- `/storage/emulated/0/Download/gemma-3n-E4B-it-int4.task`
- `/storage/emulated/0/Downloads/gemma-3n-E4B-it-int4.task`
- System Downloads directory

**To use:**

1. Download `gemma-3n-E4B-it-int4.task` on your Android phone
2. Make sure it's in the Downloads folder
3. Open the Finance Tracker app
4. The app will automatically detect and copy it!

You can also manually trigger the copy:

```typescript
import { GemmaModelService } from './src/ai/utils/GemmaModelService';

// Manually copy from Downloads (Android only)
const copied = await GemmaModelService.copyFromDownloads();
if (copied) {
  console.log('✅ Model copied from Downloads!');
}
```

## 📝 Next Steps

1. ✅ Copy file to app's Documents directory
2. ✅ Restart app
3. ✅ Check logs - should see "✅ Found manually placed model"
4. ✅ Test chat feature - should work without download
