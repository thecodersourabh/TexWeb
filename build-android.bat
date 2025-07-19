@echo off
echo Building for Android...
set CAPACITOR_PLATFORM=android
npm run build
npx cap sync
npx cap open android
echo Android build complete!
