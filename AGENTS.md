# AGENTS.md

## Cursor Cloud specific instructions

Ortak Hesap (splitIt) is a bare React Native (0.77) bill-splitting app for Android/iOS.

- Install: `npm install`. Type-check: `npx tsc --noEmit` (passes).
- Running the app requires Android Studio / Xcode (native builds) plus a Metro bundler (`npm start`); it cannot be run end-to-end headlessly in the cloud VM. Use type-check for validation here.
