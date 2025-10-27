# 📱 Get APK to Install on Your Android Phone

## ✅ Yes! You can get an APK without Android Studio

Since Android Studio won't open on your laptop, here are **3 easy ways** to get an APK file for your phone:

---

## 🚀 Method 1: Build APK Using Batch File (EASIEST)

### Step 1: Double-click the Build Script

Navigate to your android folder and double-click:
```
android\build-apk-auto.bat
```

Full path:
```
C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android\build-apk-auto.bat
```

### Step 2: Wait for Build

- **First time**: 10-20 minutes (downloads dependencies)
- **Next times**: 2-5 minutes

You'll see a command window with build progress.

### Step 3: Get Your APK

When done, a folder will open with your APK file:
```
app-debug.apk
```

Full path:
```
C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🔧 Method 2: Build Using Command Prompt

### Step 1: Open Command Prompt

1. Press `Win + R`
2. Type `cmd`
3. Press Enter

### Step 2: Navigate to Android Folder

```cmd
cd "C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android"
```

### Step 3: Build APK

```cmd
gradlew.bat assembleDebug
```

### Step 4: Wait and Get APK

After build completes, your APK is at:
```
app\build\outputs\apk\debug\app-debug.apk
```

---

## 📲 Install APK on Your Android Phone

### Step 1: Transfer APK to Phone

Choose one method:

**A. USB Cable** (Fastest):
1. Connect phone to laptop with USB cable
2. Copy `app-debug.apk` to phone's **Downloads** folder
3. Disconnect phone

**B. Google Drive**:
1. Upload `app-debug.apk` to Google Drive
2. Open Google Drive on your phone
3. Download the APK

**C. WhatsApp/Telegram**:
1. Send `app-debug.apk` to yourself
2. Download on your phone

**D. Email**:
1. Email the APK to yourself
2. Download on your phone

### Step 2: Enable Installation from Unknown Sources

On your Android phone:

**For Android 8.0 and above**:
1. Go to **Settings**
2. Go to **Apps** or **Applications**
3. Tap the **3 dots** (menu) or **Special access**
4. Tap **Install unknown apps**
5. Select your **File Manager** or **Chrome** (whichever you'll use to open the APK)
6. Enable **Allow from this source**

**For Android 7.0 and below**:
1. Go to **Settings**
2. Go to **Security**
3. Enable **Unknown sources**
4. Tap **OK** to confirm

### Step 3: Install the APK

1. Open your **File Manager** or **Downloads** app
2. Find `app-debug.apk`
3. Tap on it
4. Tap **Install**
5. Wait for installation (10-30 seconds)
6. Tap **Open** to launch your WineSeller app!

### Step 4: Enjoy Your App! 🎉

Your WineSeller app is now installed on your phone!

---

## 🔍 Finding Your APK

If you can't find the APK after building:

### Windows File Explorer:
1. Open File Explorer
2. Navigate to:
   ```
   C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep\android\app\build\outputs\apk\debug
   ```
3. Look for `app-debug.apk`

### Or Search:
1. Press `Win + S`
2. Search for: `app-debug.apk`
3. Look in the android folder results

---

## ⚠️ Troubleshooting

### Build Fails

**Error: "gradlew.bat is not recognized"**
- Use Command Prompt (cmd), NOT PowerShell
- Make sure you're in the android folder

**Error: "JAVA_HOME not set"**
- Java 11 is already installed on your system
- Try running Command Prompt as Administrator

**Error: "SDK location not found"**
- You don't need Android SDK for debug builds
- The build should work without Android Studio

**Build takes forever**
- First build downloads ~500MB of dependencies
- This is normal, be patient
- Subsequent builds will be much faster

### Can't Install APK on Phone

**Error: "App not installed"**
- Make sure "Unknown sources" is enabled
- Try restarting your phone
- Re-download the APK (might be corrupted)

**Error: "Parse error"**
- APK file is corrupted
- Rebuild the APK
- Try a different transfer method

**Can't find APK file on phone**
- Check Downloads folder
- Use a file manager app
- Try transferring again

---

## 📊 APK File Information

**File Name**: `app-debug.apk`
**File Size**: ~10-50 MB (varies)
**Type**: Debug APK (for testing)
**Signed**: Yes (debug signature)
**Installable**: Yes, on any Android device

---

## 🔄 Updating Your App

When you make changes to your website and want a new APK:

### Step 1: Build Web App
```cmd
cd "C:\Users\SHREYAS M\Downloads\wineseller_website_frontend-Deep\wineseller_website_frontend-Deep"
npm run build
```

### Step 2: Sync to Android
```cmd
npx cap sync android
```

### Step 3: Build New APK
```cmd
cd android
gradlew.bat assembleDebug
```

### Step 4: Install New Version
- Transfer new APK to phone
- Install (will update existing app)

---

## 🎯 Quick Summary

1. **Build APK**: Double-click `android\build-apk-auto.bat`
2. **Wait**: 10-20 minutes (first time)
3. **Find APK**: `android\app\build\outputs\apk\debug\app-debug.apk`
4. **Transfer**: Copy to phone (USB/Drive/Email)
5. **Enable**: Unknown sources in phone settings
6. **Install**: Tap APK file on phone
7. **Done**: Your app is ready!

---

## 💡 Pro Tips

1. **Keep the APK**: Save it somewhere safe for backup
2. **Share with friends**: They can install it too (for testing)
3. **Test thoroughly**: Debug APKs are for testing, not production
4. **For Play Store**: You'll need a release APK (different process)

---

## 🆘 Still Having Issues?

### Option 1: Try Online Build Service
- Upload your code to GitHub
- Use GitHub Actions to build APK
- Download from artifacts

### Option 2: Use Another Computer
- Copy the project folder to another PC
- Install Android Studio there
- Build APK

### Option 3: Ask for Help
- Share the exact error message
- Check BUILD_APK_WITHOUT_ANDROID_STUDIO.md
- Search the error on Google/Stack Overflow

---

## ✅ Checklist

Before building:
- [ ] Java is installed (check: `java -version`)
- [ ] You're in the android folder
- [ ] Internet connection is active

For installation:
- [ ] APK file transferred to phone
- [ ] Unknown sources enabled
- [ ] Enough storage space on phone (50+ MB)

---

## 📞 Quick Reference

**Build Command**:
```cmd
cd android
gradlew.bat assembleDebug
```

**APK Location**:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Transfer Methods**:
- USB cable
- Google Drive
- Email
- WhatsApp

**Phone Settings**:
Settings > Security > Unknown sources (Enable)

---

**You're all set! Build your APK and install it on your phone! 📱🚀**
