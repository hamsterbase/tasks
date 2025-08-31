# Android Build Instructions

This document outlines the steps to build the Android application from source.

## Prerequisites

Ensure you have the following tools installed:

- Node.js and pnpm
- Android development environment
- Capacitor CLI

## Build Process

### 1. Install Dependencies

```bash
pnpm i
```

### 1.1 Build Frontend Assets

```bash
pnpm run web:build
```

### 2. Sync Android Project

Generate the Android build scripts:

```bash
npx cap sync android
```

### 3. Configure Version

Update the version information in `android/version`:

```
versionCode 2025082701
versionName 2025.08.2701
```

### 4. Configure Release Signing

Create or update `android/release.properties` with your signing configuration:

```properties
RELEASE_STORE_FILE=../release.keystore

# Keystore password
RELEASE_STORE_PASSWORD=your_keystore_password

# Key alias name
RELEASE_KEY_ALIAS=your_key_alias

# Key password
RELEASE_KEY_PASSWORD=your_key_password
```

### 5. Add Release Keystore

Place your release keystore file at `android/release.keystore`.

### 6. Build Release APK

Navigate to the android directory and build the release APK:

```bash
cd android
./gradlew assembleRelease
```

### 7. Output Location

The generated APK will be available at:

```
android/app/build/outputs/apk/release/hamsterbase-tasks-2025.08.2701.apk
```

## Notes

- Ensure all signing credentials are properly configured before building
- The version name follows the format: YYYY.MM.DDXX
- Keep your keystore and passwords secure and never commit them to version control
