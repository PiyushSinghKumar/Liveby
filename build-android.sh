#!/usr/bin/env bash
set -euo pipefail

# ─── Liveby — Android APK build script ───────────────────────────────────────
# Run from the project root: ./build-android.sh
# Produces: android/app/build/outputs/apk/debug/app-debug.apk

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

JDK_DIR="$HOME/jdk21"
ANDROID_SDK_DIR="$HOME/android-sdk"
SDK_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip"
JDK_URL="https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz"

# ─── 1. JDK 21 ───────────────────────────────────────────────────────────────
if [ ! -f "$JDK_DIR/bin/javac" ]; then
  echo "→ Downloading JDK 21..."
  mkdir -p "$JDK_DIR"
  curl -L "$JDK_URL" -o /tmp/jdk21.tar.gz
  tar -xzf /tmp/jdk21.tar.gz -C "$JDK_DIR" --strip-components=1
  rm /tmp/jdk21.tar.gz
  echo "✓ JDK 21 ready"
else
  echo "✓ JDK 21 already installed"
fi

export JAVA_HOME="$JDK_DIR"
export PATH="$JAVA_HOME/bin:$PATH"

# ─── 2. Android SDK ──────────────────────────────────────────────────────────
if [ ! -d "$ANDROID_SDK_DIR/cmdline-tools/latest" ]; then
  echo "→ Downloading Android command-line tools..."
  mkdir -p "$ANDROID_SDK_DIR/cmdline-tools"
  curl -o /tmp/cmdline-tools.zip "$SDK_TOOLS_URL"
  unzip -q /tmp/cmdline-tools.zip -d "$ANDROID_SDK_DIR/cmdline-tools"
  mv "$ANDROID_SDK_DIR/cmdline-tools/cmdline-tools" "$ANDROID_SDK_DIR/cmdline-tools/latest"
  rm /tmp/cmdline-tools.zip
  echo "✓ Command-line tools ready"
else
  echo "✓ Android command-line tools already installed"
fi

export ANDROID_HOME="$ANDROID_SDK_DIR"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

if [ ! -d "$ANDROID_HOME/platforms/android-35" ]; then
  echo "→ Installing Android SDK components (accepting licenses)..."
  yes | sdkmanager --licenses > /dev/null 2>&1
  sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.1"
  echo "✓ Android SDK components installed"
else
  echo "✓ Android SDK components already installed"
fi

# ─── 3. npm install ──────────────────────────────────────────────────────────
echo "→ Installing npm dependencies..."
npm install

# ─── 4. Build Next.js static export ─────────────────────────────────────────
echo "→ Building Next.js static export..."
npm run build

# ─── 5. Sync Capacitor ───────────────────────────────────────────────────────
echo "→ Syncing Capacitor..."
npx cap sync android

# ─── 6. Build APK ────────────────────────────────────────────────────────────
echo "→ Building Android APK..."
JAVA_HOME="$JDK_DIR" ANDROID_HOME="$ANDROID_SDK_DIR" ./android/gradlew -p android assembleDebug

APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK" ]; then
  echo ""
  echo "✅ APK built successfully:"
  echo "   $SCRIPT_DIR/$APK"
  echo ""
  echo "   Install on connected device:  adb install $APK"
  echo "   Or copy the APK to your phone and open it."
else
  echo "❌ APK not found — check build output above."
  exit 1
fi
