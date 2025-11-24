#!/bin/bash
# Copy Gemma 3N model from Downloads to iOS Simulator or Android device

set -e

SOURCE="$HOME/Downloads/gemma-3n-E4B-it-int4.task"
PLATFORM="${1:-ios}"  # Default to iOS

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 Copying Gemma 3N Model"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if source file exists
if [ ! -f "$SOURCE" ]; then
    echo "❌ File not found at: $SOURCE"
    echo ""
    echo "Please ensure:"
    echo "  1. File is downloaded to Downloads folder"
    echo "  2. File name is: gemma-3n-E4B-it-int4.task"
    exit 1
fi

echo "✅ Source file found: $SOURCE"
echo "   Size: $(ls -lh "$SOURCE" | awk '{print $5}')"
echo ""

if [ "$PLATFORM" = "ios" ]; then
    echo "📱 Platform: iOS Simulator"
    echo ""
    
    # Check if simulator is running
    if ! xcrun simctl list devices | grep -q "Booted"; then
        echo "⚠️  No simulator is currently booted"
        echo "   Please start iOS Simulator first"
        exit 1
    fi
    
    # Get simulator Documents path
    SIMULATOR_PATH=$(xcrun simctl get_app_container booted com.financetracker data 2>/dev/null)
    
    if [ -z "$SIMULATOR_PATH" ]; then
        echo "❌ Could not find app container"
        echo ""
        echo "Please ensure:"
        echo "  1. iOS Simulator is running"
        echo "  2. App is installed (run: npm run ios)"
        echo "  3. Bundle ID is: com.financetracker"
        exit 1
    fi
    
    DEST="$SIMULATOR_PATH/Documents/gemma-3n-E4B-it-int4.task"
    
    echo "📍 Destination: $DEST"
    echo ""
    echo "📋 Copying file..."
    cp "$SOURCE" "$DEST"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Model copied successfully!"
        echo "   Destination: $DEST"
        echo "   Size: $(ls -lh "$DEST" | awk '{print $5}')"
        echo ""
        echo "🔄 Please restart your app to use the model"
    else
        echo "❌ Failed to copy file"
        exit 1
    fi
    
elif [ "$PLATFORM" = "android" ]; then
    echo "📱 Platform: Android"
    echo ""
    
    # Check if device is connected
    if ! adb devices | grep -q "device$"; then
        echo "⚠️  No Android device connected"
        echo "   Please connect device or start emulator"
        exit 1
    fi
    
    echo "📍 Pushing to device..."
    echo ""
    
    # Push to sdcard first
    adb push "$SOURCE" /sdcard/gemma-3n-E4B-it-int4.task
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to push file to device"
        exit 1
    fi
    
    # Copy to app directory
    echo "📋 Copying to app directory..."
    adb shell run-as com.financetracker cp /sdcard/gemma-3n-E4B-it-int4.task files/ 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Could not copy to app directory (may need debug build)"
        echo "   File is at: /sdcard/gemma-3n-E4B-it-int4.task"
        echo "   You may need to copy manually using file manager"
    else
        # Clean up sdcard
        adb shell rm /sdcard/gemma-3n-E4B-it-int4.task
        
        echo ""
        echo "✅ Model copied successfully!"
        echo "   Location: /data/data/com.financetracker/files/gemma-3n-E4B-it-int4.task"
        echo ""
        echo "🔄 Please restart your app to use the model"
    fi
else
    echo "❌ Invalid platform: $PLATFORM"
    echo "   Usage: ./copy-model.sh [ios|android]"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


