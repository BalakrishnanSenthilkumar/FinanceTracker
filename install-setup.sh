#!/bin/bash

# AI Chat Feature Installation Script
# Run this script to install all dependencies and setup the project

echo "🤖 Setting up AI Chat Feature for FinanceTracker..."
echo ""

# Install npm packages
echo "📦 Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed. Please check the errors above."
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# iOS Setup
echo "📱 Setting up iOS..."
if [ -d "ios" ]; then
    cd ios
    echo "Installing iOS pods..."
    pod install
    cd ..
    echo "✅ iOS setup complete!"
else
    echo "⚠️  iOS directory not found. Skipping iOS setup."
fi

echo ""

# Android Setup
echo "🤖 Setting up Android..."
if [ -d "android/app/src/main" ]; then
    # Create assets directory for model
    mkdir -p android/app/src/main/assets/models
    
    # Copy model to Android assets if it exists
    if [ -f "src/core/assets/models/gemma-3n-E4B-it-int4.task" ]; then
        echo "Copying AI model to Android assets..."
        cp src/core/assets/models/gemma-3n-E4B-it-int4.task android/app/src/main/assets/models/
        echo "✅ Model copied to Android assets!"
    else
        echo "⚠️  Model file not found at src/core/assets/models/gemma-3n-E4B-it-int4.task"
        echo "   Please add the model file manually."
    fi
else
    echo "⚠️  Android directory structure not found. Skipping Android setup."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. For iOS: Open Xcode and add the model file to your bundle"
echo "   - Open: ios/FinanceTracker.xcworkspace"
echo "   - Add: src/core/assets/models/gemma-3n-E4B-it-int4.task"
echo ""
echo "2. Run the app:"
echo "   - iOS: npm run ios"
echo "   - Android: npm run android"
echo ""
echo "3. Navigate to the 'AI Chat' tab to test the feature"
echo ""
echo "📚 For detailed setup instructions, see SETUP_AI_CHAT.md"

