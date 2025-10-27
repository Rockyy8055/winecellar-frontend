# 🔧 Build APK Without Android Studio

## Method 1: Using Command Line (Gradle)

Since Android Studio won't open on your laptop, you can build the APK directly using Gradle from the command line.

### Step 1: Open Command Prompt (Not PowerShell)

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project's android folder:
   ```cmd
   cd "C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android"
   ```

### Step 2: Build Debug APK

Run this command:
```cmd
gradlew.bat assembleDebug
```

**Wait**: This will take 5-10 minutes the first time (downloads dependencies)

### Step 3: Find Your APK

After successful build, your APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

Full path:
```
C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## Method 2: Using Online Build Services

If the command line method doesn't work, you can use online build services:

### Option A: Expo EAS Build (Free Tier Available)
1. Sign up at https://expo.dev/
2. Install EAS CLI: `npm install -g eas-cli`
3. Follow their Capacitor integration guide

### Option B: Codemagic (Free Tier Available)
1. Sign up at https://codemagic.io/
2. Connect your repository
3. Configure Android build
4. Download APK

### Option C: GitHub Actions (Free)
1. Push your code to GitHub
2. Set up GitHub Actions workflow
3. Build APK in the cloud
4. Download from Actions artifacts

---

## Method 3: Install APK on Your Phone

### Step 1: Transfer APK to Phone

**Option A - USB Cable**:
1. Connect phone to laptop via USB
2. Copy `app-debug.apk` to phone's Downloads folder

**Option B - Google Drive/Dropbox**:
1. Upload `app-debug.apk` to Google Drive
2. Download on your phone

**Option C - Email**:
1. Email the APK to yourself
2. Download on phone

### Step 2: Enable Unknown Sources

On your Android phone:
1. Go to **Settings**
2. Go to **Security** or **Privacy**
3. Enable **Install from Unknown Sources** or **Install Unknown Apps**
4. Allow your file manager or browser to install apps

### Step 3: Install APK

1. Open the APK file on your phone
2. Tap **Install**
3. Wait for installation
4. Tap **Open** to launch your app!

---

## Troubleshooting

### Issue: "gradlew.bat is not recognized"

**Solution 1**: Use Command Prompt (cmd), not PowerShell
```cmd
cd android
gradlew.bat assembleDebug
```

**Solution 2**: Use full path
```cmd
cd "C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android"
.\gradlew.bat assembleDebug
```

### Issue: Build fails with Java error

**Solution**: Make sure Java 11 or higher is installed
```cmd
java -version
```

If not installed, download from: https://www.oracle.com/java/technologies/downloads/

### Issue: "ANDROID_HOME not set"

**Solution**: Set environment variable
```cmd
set ANDROID_HOME=C:\Users\SHREYAS M\AppData\Local\Android\Sdk
gradlew.bat assembleDebug
```

### Issue: Build takes too long

**Solution**: This is normal for first build (downloads dependencies)
- First build: 10-20 minutes
- Subsequent builds: 2-5 minutes

### Issue: Can't install APK on phone

**Solution**: 
1. Make sure "Install from Unknown Sources" is enabled
2. Try a different file transfer method
3. Check if APK file is corrupted (re-download)

---

## Quick Build Script

Create a file called `build-apk.bat` in your android folder with this content:

```batch
@echo off
echo Building WineSeller Android APK...
echo This may take 10-20 minutes on first run...
echo.

cd /d "%~dp0"
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Your APK is ready at:
    echo app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Transfer this file to your Android phone and install it!
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
    pause
)
```

Then just double-click `build-apk.bat` to build!

---

## Alternative: Use APK Builder Online

If nothing works, you can use online APK builders:

1. **ApkOnline** - https://www.apkonline.net/
2. **AppGyver** - https://www.appgyver.com/
3. **BuildFire** - https://buildfire.com/

However, these may have limitations or require subscriptions.

---

## Best Solution: Fix Android Studio

If you want to fix Android Studio instead:

### Common Android Studio Issues:

**Issue: Won't start/crashes**
- Increase RAM allocation in `studio.vmoptions`
- Update graphics drivers
- Run as administrator

**Issue: Too slow**
- Disable unnecessary plugins
- Increase heap size
- Use SSD for Android SDK

**Issue: Gradle sync fails**
- Clear Gradle cache: Delete `.gradle` folder
- Invalidate caches: File > Invalidate Caches / Restart

---

## Summary

**Easiest Method**: 
1. Open Command Prompt (cmd)
2. Navigate to android folder
3. Run: `gradlew.bat assembleDebug`
4. Transfer APK to phone
5. Install and enjoy!

**APK Location**: 
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**File Size**: ~10-50 MB (depending on your app)

---

## Important Notes

⚠️ **Debug APK vs Release APK**:
- **Debug APK**: For testing only, larger size, not optimized
- **Release APK**: For Play Store, smaller, optimized, requires signing

⚠️ **Security**:
- Debug APKs are not signed for production
- Don't distribute debug APKs publicly
- Use release builds for Play Store

⚠️ **Updates**:
- After making changes to your website:
  ```bash
  npm run build
  npx cap sync android
  cd android
  gradlew.bat assembleDebug
  ```

---

## Need Help?

If you're still having issues:
1. Check error messages carefully
2. Make sure Java is installed
3. Try restarting your computer
4. Consider using online build services
5. Ask for help with specific error messages

---

**Good luck! You'll have your APK ready soon! 📱🚀**
