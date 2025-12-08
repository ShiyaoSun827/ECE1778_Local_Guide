#!/bin/bash

# Script to build APK using EAS Build
# This script will guide you through the process

echo "🚀 Starting APK build process..."
echo ""

# Check if EAS CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to frontend directory
cd "$(dirname "$0")"

# Step 1: Initialize EAS project (if not already done)
echo "📦 Step 1: Initializing EAS project..."
echo "   (If prompted, answer 'y' to create a new project)"
npx eas-cli init

# Step 2: Build APK
echo ""
echo "🔨 Step 2: Building APK..."
echo "   This will take several minutes. The build runs on Expo's servers."
npx eas-cli build --platform android --profile preview

echo ""
echo "✅ Build process completed!"
echo "   Once the build finishes, you can download the APK from:"
echo "   https://expo.dev/accounts/ming6237/projects/local-guide/builds"
echo ""
echo "   Or run: npx eas-cli build:list"

