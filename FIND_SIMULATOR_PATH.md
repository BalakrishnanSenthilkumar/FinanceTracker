# Find iOS Simulator Documents Path

## 🚀 Quick Method

### Option 1: Use the Script (Easiest)

```bash
npm run find-sim-path
```

This will show you:
- ✅ Exact Documents directory path
- ✅ Full model file path
- ✅ Copy command ready to use
- ✅ Check if model already exists

### Option 2: Manual Terminal Commands

**Step 1: Make sure simulator is running**
```bash
# Start simulator or run app
npm run ios
```

**Step 2: Get the Documents path**
```bash
# Get app container path
xcrun simctl get_app_container booted com.financetracker data

# Get Documents directory
xcrun simctl get_app_container booted com.financetracker data | xargs -I {} echo "{}/Documents"
```

**Step 3: Copy model file**
```bash
# Copy from Downloads to simulator Documents
cp ~/Downloads/gemma-3n-E4B-it-int4.task \
   "$(xcrun simctl get_app_container booted com.financetracker data)/Documents/"
```

## 📍 Example Output

When you run `npm run find-sim-path`, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Finding iOS Simulator Documents Path
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Simulator is running

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Path Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

App Container:
  /Users/balakrishnan/Library/Developer/CoreSimulator/Devices/ABC123-DEF4-5678-9012-345678901234/data/Containers/Data/Application/XYZ789-ABC1-DEF2-3456-789012345678

Documents Directory:
  /Users/balakrishnan/Library/Developer/CoreSimulator/Devices/ABC123-DEF4-5678-9012-345678901234/data/Containers/Data/Application/XYZ789-ABC1-DEF2-3456-789012345678/Documents

Model File Path:
  /Users/balakrishnan/Library/Developer/CoreSimulator/Devices/ABC123-DEF4-5678-9012-345678901234/data/Containers/Data/Application/XYZ789-ABC1-DEF2-3456-789012345678/Documents/gemma-3n-E4B-it-int4.task

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Copy Command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To copy model from Downloads:

  cp ~/Downloads/gemma-3n-E4B-it-int4.task "/Users/balakrishnan/Library/Developer/CoreSimulator/Devices/ABC123-DEF4-5678-9012-345678901234/data/Containers/Data/Application/XYZ789-ABC1-DEF2-3456-789012345678/Documents/gemma-3n-E4B-it-int4.task"

Or use the copy script:
  npm run copy-model:ios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 Step-by-Step Instructions

### 1. Start iOS Simulator
```bash
npm run ios
# Wait for app to install and launch
```

### 2. Find the Path
```bash
npm run find-sim-path
```

### 3. Copy the Model File
```bash
# Option A: Use the automated script
npm run copy-model:ios

# Option B: Manual copy (use path from step 2)
cp ~/Downloads/gemma-3n-E4B-it-int4.task "/path/from/step/2/gemma-3n-E4B-it-int4.task"
```

### 4. Verify File is Copied
```bash
npm run find-sim-path
# Should show: ✅ Model file already exists!
```

### 5. Restart App
```bash
# Stop app (Cmd+C) and restart
npm run ios
```

## 🎯 One-Liner Commands

**Find path:**
```bash
xcrun simctl get_app_container booted com.financetracker data | xargs -I {} echo "{}/Documents"
```

**Copy file:**
```bash
cp ~/Downloads/gemma-3n-E4B-it-int4.task "$(xcrun simctl get_app_container booted com.financetracker data)/Documents/"
```

**Check if file exists:**
```bash
ls -lh "$(xcrun simctl get_app_container booted com.financetracker data)/Documents/gemma-3n-E4B-it-int4.task"
```

## ⚠️ Troubleshooting

### "App container not found"
- Make sure app is installed: `npm run ios`
- Check bundle ID matches: `com.financetracker`
- Verify simulator is booted

### "No simulator is running"
- Start simulator: `npm run ios`
- Or open Simulator app manually

### Path changes after restart
- Simulator paths can change between runs
- Always use `npm run find-sim-path` to get current path
- Or use the copy script which finds it automatically

## 📝 Notes

- The path includes device ID and app ID which change
- Always use the script to get current path
- File persists until you delete app or reset simulator
- Model file is ~2.4 GB, copy may take a moment


