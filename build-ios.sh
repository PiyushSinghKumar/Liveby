#!/usr/bin/env bash
set -euo pipefail

# ─── Liveby - iOS build script ───────────────────────────────────────────────
# Run from the project root: ./build-ios.sh [--simulator|--device|--ipa]
#
# Modes:
#   (default)    Build for iOS Simulator - no signing required
#   --simulator  Same as default
#   --device     Build for a connected real device (requires signing)
#   --ipa        Export a signed IPA for Ad Hoc / App Store distribution
#
# Requirements (macOS only):
#   Xcode          - install from App Store or xcode-select --install
#   CocoaPods      - auto-installed via Homebrew if missing
#   xcpretty       - auto-installed via gem if missing (optional, prettifies output)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:---simulator}"
PROJECT="ios/App/App.xcodeproj"
SCHEME="App"
BUILD_DIR="ios/build"
IPA_DIR="ios/ipa"
EXPORT_OPTIONS="ios/ExportOptions.plist"

# ─── 1. macOS guard ──────────────────────────────────────────────────────────
if [[ "$(uname)" != "Darwin" ]]; then
  echo "❌  iOS builds require macOS. This script cannot run on $(uname)."
  exit 1
fi

# ─── 2. Xcode ────────────────────────────────────────────────────────────────
if ! command -v xcodebuild &>/dev/null; then
  echo "❌  xcodebuild not found."
  echo "   Install Xcode from the App Store, then run:"
  echo "   sudo xcode-select --switch /Applications/Xcode.app"
  exit 1
fi
XCODE_VER=$(xcodebuild -version | head -1)
echo "✓ $XCODE_VER"

# ─── 3. CocoaPods ────────────────────────────────────────────────────────────
if ! command -v pod &>/dev/null; then
  echo "→ CocoaPods not found - installing via Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo "❌  Homebrew not found. Install from https://brew.sh then re-run."
    exit 1
  fi
  brew install cocoapods
fi
echo "✓ CocoaPods $(pod --version)"

# ─── 4. xcpretty (optional) ──────────────────────────────────────────────────
XCPRETTY=""
if ! command -v xcpretty &>/dev/null; then
  echo "→ Installing xcpretty for readable build output..."
  gem install xcpretty --quiet && XCPRETTY="| xcpretty" || true
else
  XCPRETTY="| xcpretty"
fi

# ─── 5. npm install ──────────────────────────────────────────────────────────
echo "→ Installing npm dependencies..."
npm install --silent

# ─── 6. Next.js static export ────────────────────────────────────────────────
echo "→ Building Next.js static export..."
npm run build

# ─── 7. Capacitor sync ───────────────────────────────────────────────────────
echo "→ Syncing Capacitor..."
npx cap sync ios

# ─── 8. CocoaPods install ────────────────────────────────────────────────────
echo "→ Installing CocoaPods dependencies..."
(cd ios/App && pod install --silent)
echo "✓ Pods installed"

# ─── 9. Build ────────────────────────────────────────────────────────────────
mkdir -p "$BUILD_DIR"

if [[ "$MODE" == "--simulator" || "$MODE" == "-s" ]]; then
  echo ""
  echo "→ Building for iOS Simulator..."
  eval xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath "$BUILD_DIR" \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    "$XCPRETTY"

  APP=$(find "$BUILD_DIR" -name "*.app" -path "*/iphonesimulator*" | head -1)
  echo ""
  echo "✅  Simulator build ready:"
  echo "   $APP"
  echo ""
  echo "   To run in simulator:"
  echo "   xcrun simctl install booted \"$APP\""
  echo "   xcrun simctl launch booted com.liveby.app"

elif [[ "$MODE" == "--device" || "$MODE" == "-d" ]]; then
  echo ""
  echo "→ Building for real device (requires valid signing identity)..."
  eval xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration Debug \
    -sdk iphoneos \
    -derivedDataPath "$BUILD_DIR" \
    "$XCPRETTY"

  APP=$(find "$BUILD_DIR" -name "*.app" -path "*/iphoneos*" | head -1)
  echo ""
  echo "✅  Device build ready: $APP"
  echo ""
  if command -v ios-deploy &>/dev/null; then
    echo "→ Installing on connected iPhone..."
    ios-deploy --bundle "$APP"
    echo "✅  Installed"
  else
    echo "   To install on device: npm install -g ios-deploy && ios-deploy --bundle \"$APP\""
  fi

elif [[ "$MODE" == "--ipa" || "$MODE" == "-i" ]]; then
  echo ""
  echo "→ Building release IPA..."

  # Generate ExportOptions.plist if missing
  if [ ! -f "$EXPORT_OPTIONS" ]; then
    echo "→ Creating ExportOptions.plist (ad-hoc)..."
    mkdir -p "$(dirname "$EXPORT_OPTIONS")"
    cat > "$EXPORT_OPTIONS" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
</dict>
</plist>
PLIST
    echo "⚠️   Edit ios/ExportOptions.plist and set your teamID before running --ipa again."
    exit 1
  fi

  eval xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration Release \
    -sdk iphoneos \
    -archivePath "$BUILD_DIR/Liveby.xcarchive" \
    archive \
    "$XCPRETTY"

  mkdir -p "$IPA_DIR"
  eval xcodebuild \
    -exportArchive \
    -archivePath "$BUILD_DIR/Liveby.xcarchive" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -exportPath "$IPA_DIR" \
    "$XCPRETTY"

  IPA=$(find "$IPA_DIR" -name "*.ipa" | head -1)
  echo ""
  echo "✅  IPA ready: $IPA"
  echo "   Share via AirDrop, Diawi, or upload to App Store Connect."

else
  echo "❌  Unknown mode: $MODE"
  echo "   Usage: ./build-ios.sh [--simulator|--device|--ipa]"
  exit 1
fi
