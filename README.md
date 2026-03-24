# Liveby

Track your daily standards across Health, Relationship, Career & Money.

Built with Next.js + Capacitor. Runs as an Android APK or iOS app.

---

## Install on iPhone (Mac)

### Prerequisites
- Node.js 20+
- Xcode (from the App Store)
- CocoaPods: `sudo gem install cocoapods`

### Steps

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd standards
npm install

# 2. Build and open in Xcode
just ios
```

In Xcode:
- Select your iPhone from the device list at the top
- Hit **Run ▶**
- First time: go to **Settings → General → VPN & Device Management** on your iPhone and trust your developer certificate

### No `just` installed?

```bash
npm run build
npx cap sync ios
npx cap open ios
```

---

## Install on Android (Linux/Mac)

```bash
just install   # builds APK and installs via adb
```

Or just build the APK:

```bash
just apk
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Dev server

```bash
just dev       # http://localhost:3000
```

---

## All commands

```
just dev          Start Next.js dev server
just build        Build static export
just apk          Build Android APK
just install      Build + install APK on connected Android device
just ios          Build + open Xcode (Mac only)
just ios-build    Build iOS from command line (Mac only)
just ios-install  Install IPA on connected iPhone (Mac only)
just setup        Install JDK 21 + Android SDK
just clean        Remove build artifacts
just typecheck    TypeScript check
```

---

## Data

All data (checkins, affirmations) is stored locally on the device in `localStorage`. Nothing is sent to any server.
