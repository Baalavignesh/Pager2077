#!/bin/bash

# iOS Build Script for TestFlight
# Run this script from the frontend directory after making changes

set -e

echo "🔧 Starting iOS build process..."

# Increment build number in app.json
echo "📝 Note: Remember to increment buildNumber in app.json before uploading to TestFlight"

# Run expo prebuild with clean
echo "🧹 Running expo prebuild --clean..."
echo "Y" | npx expo prebuild --clean

# Open Xcode workspace
echo "🚀 Opening Xcode..."
open ios/Pager2077.xcworkspace

echo ""
echo "✅ Build prep complete!"
echo ""
echo "Next steps in Xcode:"
echo "  1. Select 'Pager2077' target"
echo "  2. Verify build number is incremented (General tab)"
echo "  3. Product → Archive"
echo "  4. Distribute App → TestFlight & App Store"
echo ""
