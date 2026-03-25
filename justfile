export JAVA_HOME  := env_var_or_default("JAVA_HOME",  env_var('HOME') + "/jdk21")
export ANDROID_HOME := env_var_or_default("ANDROID_HOME", env_var('HOME') + "/android-sdk")

JDK_URL  := "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jdk_x64_linux_hotspot_21.0.6_7.tar.gz"
SDK_URL  := "https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip"
APK      := "android/app/build/outputs/apk/debug/app-debug.apk"
AAB      := "android/app/build/outputs/bundle/release/app-release.aab"
KEYSTORE := env_var_or_default("KEYSTORE_PATH", "liveby.keystore")

# List available recipes
default:
    @just --list

# ── Dev ───────────────────────────────────────────────────────────────────────

# Start Next.js dev server
dev:
    npm run dev

# ── Build pipeline ────────────────────────────────────────────────────────────

# Build Next.js static export
build:
    npm run build

# Propagate appName + appId from lib/config.ts into Android native files
native-config:
    node scripts/sync-native-config.mjs

# Sync web assets into Android + iOS
sync: build native-config
    npx cap sync android
    npx cap sync ios

# Full Android APK build (setup → build → sync → gradle)
apk: setup sync
    ./android/gradlew -p android assembleDebug
    @echo ""
    @echo "✅  APK ready: {{APK}}"

# Install APK on connected Android device via adb
install: apk
    adb install -r {{APK}}
    @echo "✅  Installed on device"

# ── Release (Google Play) ─────────────────────────────────────────────────────

# Generate a signing keystore (run once, keep the file safe!)
keystore:
    #!/usr/bin/env bash
    if [ -f "{{KEYSTORE}}" ]; then
        echo "✓ Keystore already exists at {{KEYSTORE}}"
        exit 0
    fi
    echo "→ Generating release keystore..."
    $JAVA_HOME/bin/keytool -genkey -v \
        -keystore {{KEYSTORE}} \
        -alias liveby \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000
    echo ""
    echo "✅  Keystore saved to {{KEYSTORE}}"
    echo "⚠️   Back this file up somewhere safe - you cannot re-upload to Play Store without it."

# Build signed release AAB for Google Play upload
aab: setup sync keystore
    #!/usr/bin/env bash
    echo "→ Building release AAB..."
    export KEYSTORE_PATH="$(pwd)/{{KEYSTORE}}"
    read -p "Keystore password: " KEYSTORE_PASS
    read -p "Key password: "      KEY_PASS
    export KEYSTORE_PASS KEY_ALIAS="liveby" KEY_PASS
    ./android/gradlew -p android bundleRelease
    echo ""
    echo "✅  AAB ready: {{AAB}}"
    echo "→  Upload this file at: https://play.google.com/console"

# ── iOS (requires macOS + Xcode) ─────────────────────────────────────────────

# Sync web assets into iOS and open Xcode
ios: sync
    @echo "→ Opening Xcode - build and run from there"
    npx cap open ios

# Build for iOS Simulator (no signing required)
ios-sim:
    ./build-ios.sh --simulator

# Build for connected real device
ios-device:
    ./build-ios.sh --device

# Export signed IPA for Ad Hoc / App Store distribution
ios-ipa:
    ./build-ios.sh --ipa

# Install on connected iPhone (real device, requires ios-deploy)
ios-install:
    ./build-ios.sh --device

# ── Setup ─────────────────────────────────────────────────────────────────────

# Install JDK 21 + Android SDK (skips if already present)
setup: _jdk _sdk

_jdk:
    #!/usr/bin/env bash
    if [ -f "$JAVA_HOME/bin/javac" ]; then
        echo "✓ JDK 21 already installed"
        exit 0
    fi
    echo "→ Downloading JDK 21..."
    mkdir -p "$JAVA_HOME"
    curl -L "{{JDK_URL}}" -o /tmp/jdk21.tar.gz
    tar -xzf /tmp/jdk21.tar.gz -C "$JAVA_HOME" --strip-components=1
    rm /tmp/jdk21.tar.gz
    echo "✓ JDK 21 installed"

_sdk:
    #!/usr/bin/env bash
    if [ -d "$ANDROID_HOME/platforms/android-35" ]; then
        echo "✓ Android SDK already installed"
        exit 0
    fi
    if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
        echo "→ Downloading Android command-line tools..."
        mkdir -p "$ANDROID_HOME/cmdline-tools"
        curl -o /tmp/cmdline-tools.zip "{{SDK_URL}}"
        unzip -q /tmp/cmdline-tools.zip -d "$ANDROID_HOME/cmdline-tools"
        mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
        rm /tmp/cmdline-tools.zip
    fi
    export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
    echo "→ Installing Android SDK components..."
    yes | sdkmanager --licenses > /dev/null 2>&1
    sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.1"
    echo "✓ Android SDK installed"

# ── Misc ──────────────────────────────────────────────────────────────────────

# Install npm dependencies
deps:
    npm install

# Clean all build artifacts
clean:
    rm -rf .next out
    rm -rf android/app/build android/build android/.gradle
    rm -rf ios/build
    @echo "✓ Cleaned"

# Regenerate all app icons from logo.svg + score variants
icons:
    node scripts/generate-icons.mjs
    node scripts/generate-score-icons.mjs

# Type-check TypeScript
typecheck:
    npx tsc --noEmit
