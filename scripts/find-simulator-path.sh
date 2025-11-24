#!/bin/bash
# Find iOS Simulator Documents path for FinanceTracker app

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Finding iOS Simulator Documents Path"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if simulator is running
BOOTED_DEVICE=$(xcrun simctl list devices | grep "Booted" | head -1)

if [ -z "$BOOTED_DEVICE" ]; then
    echo "❌ No iOS Simulator is currently running"
    echo ""
    echo "Please:"
    echo "  1. Start iOS Simulator"
    echo "  2. Or run: npm run ios"
    echo ""
    exit 1
fi

echo "✅ Simulator is running"
echo ""

# Get app container path
APP_CONTAINER=$(xcrun simctl get_app_container booted com.financetracker data 2>/dev/null)

if [ -z "$APP_CONTAINER" ]; then
    echo "⚠️  App container not found"
    echo ""
    echo "This might mean:"
    echo "  1. App is not installed yet"
    echo "  2. Bundle ID is different"
    echo ""
    echo "Trying to find app..."
    
    # List all installed apps
    echo ""
    echo "Installed apps:"
    xcrun simctl listapps booted | grep -i "bundle" | head -5
    echo ""
    echo "Please install the app first: npm run ios"
    exit 1
fi

DOCUMENTS_PATH="$APP_CONTAINER/Documents"
MODEL_PATH="$DOCUMENTS_PATH/gemma-3n-E4B-it-int4.task"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Path Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "App Container:"
echo "  $APP_CONTAINER"
echo ""
echo "Documents Directory:"
echo "  $DOCUMENTS_PATH"
echo ""
echo "Model File Path:"
echo "  $MODEL_PATH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Copy Command"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To copy model from Downloads:"
echo ""
echo "  cp ~/Downloads/gemma-3n-E4B-it-int4.task \"$MODEL_PATH\""
echo ""
echo "Or use the copy script:"
echo "  npm run copy-model:ios"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if model already exists
if [ -f "$MODEL_PATH" ]; then
    FILE_SIZE=$(ls -lh "$MODEL_PATH" | awk '{print $5}')
    echo "✅ Model file already exists!"
    echo "   Size: $FILE_SIZE"
    echo "   Path: $MODEL_PATH"
    echo ""
else
    echo "❌ Model file not found"
    echo "   Expected at: $MODEL_PATH"
    echo ""
    echo "Copy the file using the command above"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


