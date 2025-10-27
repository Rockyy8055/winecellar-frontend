# Android App Setup Guide for WineSeller

## ✅ Completed Steps

1. ✅ Installed Capacitor dependencies
2. ✅ Built React app for production
3. ✅ Added Android platform
4. ✅ Configured Android app settings
5. ✅ Added necessary permissions

## 📱 App Information

- **App Name**: WineSeller
- **Package ID**: com.wineseller.app
- **Version Code**: 1
- **Version Name**: 1.0.0

## 🎨 Step 1: Create App Icons

### Required Icon Sizes for Android:
You need to create app icons in the following sizes and place them in the respective folders:

1. **Generate Icons**: Use one of these tools to generate all required sizes from a single 1024x1024px image:
   - [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
   - [App Icon Generator](https://www.appicon.co/)
   - [Icon Kitchen](https://icon.kitchen/)

2. **Icon Locations** (after generation, place them here):
   ```
   android/app/src/main/res/
   ├── mipmap-mdpi/ic_launcher.png (48x48)
   ├── mipmap-hdpi/ic_launcher.png (72x72)
   ├── mipmap-xhdpi/ic_launcher.png (96x96)
   ├── mipmap-xxhdpi/ic_launcher.png (144x144)
   ├── mipmap-xxxhdpi/ic_launcher.png (192x192)
   └── mipmap-xxxhdpi/ic_launcher_round.png (192x192 - rounded)
   ```

3. **Adaptive Icons** (Android 8.0+):
   - Create `ic_launcher_foreground.xml` and `ic_launcher_background.xml` in `res/drawable/`
   - Or use PNG files in the same mipmap folders

## 🎬 Step 2: Create Splash Screen

1. Create a splash screen image (2732x2732px recommended)
2. Place it in: `android/app/src/main/res/drawable/splash.png`
3. Update `android/app/src/main/res/values/styles.xml` if needed

## 🔧 Step 3: Install Android Studio

1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android SDK (API 33 or higher recommended)
3. Set up environment variables:
   - `ANDROID_HOME` = `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`
   - Add to PATH: `%ANDROID_HOME%\platform-tools`

## 🏃 Step 4: Test Your App

### Open in Android Studio:
```bash
npx cap open android
```

### Run on Emulator:
1. In Android Studio, click "Run" > "Run 'app'"
2. Select an emulator or connected device
3. Wait for the app to build and launch

### Run on Physical Device:
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Select your device in Android Studio and click Run

## 🔑 Step 5: Generate Signing Key for Play Store

### Create a Keystore:
```bash
cd android/app
keytool -genkey -v -keystore wineseller-release-key.keystore -alias wineseller -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT**: Save the keystore file and passwords securely! You'll need them for all future updates.

### Configure Signing:
1. Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=wineseller
storeFile=wineseller-release-key.keystore
```

2. Update `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 📦 Step 6: Build Release APK/AAB

### Build Android App Bundle (AAB) - Recommended for Play Store:
```bash
cd android
./gradlew bundleRelease
```

Output location: `android/app/build/outputs/bundle/release/app-release.aab`

### Build APK (for direct distribution):
```bash
cd android
./gradlew assembleRelease
```

Output location: `android/app/build/outputs/apk/release/app-release.apk`

## 🏪 Step 7: Prepare for Google Play Store

### Create Google Play Developer Account:
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete account setup

### Required Assets for Play Store:

#### App Icon:
- **512x512px** PNG (32-bit, no transparency)

#### Feature Graphic:
- **1024x500px** PNG or JPG

#### Screenshots (at least 2 required):
- **Phone**: 16:9 or 9:16 aspect ratio
  - Minimum: 320px
  - Maximum: 3840px
- **7-inch Tablet** (optional): Similar requirements
- **10-inch Tablet** (optional): Similar requirements

#### App Description:
- **Short description**: Max 80 characters
- **Full description**: Max 4000 characters

#### Example Short Description:
```
Discover premium wines with WineSeller - Your trusted online wine marketplace
```

#### Example Full Description:
```
WineSeller - Your Premium Wine Marketplace

Discover, explore, and purchase the finest wines from around the world with WineSeller. Our curated selection features premium wines from renowned vineyards and hidden gems waiting to be discovered.

Features:
🍷 Extensive Wine Collection - Browse thousands of wines from various regions
🔍 Advanced Search & Filters - Find your perfect wine by type, region, price, and rating
📱 Seamless Shopping Experience - Easy ordering and secure checkout
🚚 Fast Delivery - Get your wines delivered to your doorstep
⭐ Expert Reviews - Read detailed tasting notes and ratings
💳 Secure Payments - Multiple payment options including PayPal and Stripe
📦 Order Tracking - Track your orders in real-time
🎁 Gift Options - Perfect for wine lovers

Whether you're a wine connoisseur or just beginning your wine journey, WineSeller makes it easy to find and enjoy exceptional wines.

Download now and start exploring!
```

#### Privacy Policy:
- **Required**: You must have a privacy policy URL
- Host it on your website or use a privacy policy generator

#### Content Rating:
- Complete the content rating questionnaire in Play Console
- For a wine app, you'll need to indicate alcohol-related content

### App Categories:
- **Primary**: Shopping
- **Secondary**: Food & Drink

## 📤 Step 8: Upload to Play Store

1. **Create App in Play Console**:
   - Click "Create app"
   - Enter app name: "WineSeller"
   - Select default language
   - Choose app type: App
   - Select free or paid

2. **Complete Store Listing**:
   - Upload all required assets
   - Add descriptions
   - Set content rating
   - Add privacy policy URL

3. **Set Up App Content**:
   - Complete privacy policy
   - Ads declaration
   - Content rating
   - Target audience
   - News apps declaration (if applicable)

4. **Upload App Bundle**:
   - Go to "Production" > "Create new release"
   - Upload your AAB file
   - Add release notes
   - Review and rollout

5. **Pricing & Distribution**:
   - Select countries
   - Set pricing (free/paid)
   - Accept content guidelines

6. **Submit for Review**:
   - Review all sections
   - Click "Send for review"
   - Wait for approval (typically 1-7 days)

## 🔄 Updating Your App

When you make changes to your website:

1. Update version in `android/app/build.gradle`:
```gradle
versionCode 2  // Increment by 1
versionName "1.0.1"  // Update version name
```

2. Rebuild and sync:
```bash
npm run build
npx cap sync android
```

3. Build new release:
```bash
cd android
./gradlew bundleRelease
```

4. Upload to Play Console as a new release

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails**: Clean and rebuild
```bash
cd android
./gradlew clean
./gradlew build
```

2. **App crashes on startup**: Check `AndroidManifest.xml` permissions

3. **White screen**: Ensure `build/` folder has latest web assets
```bash
npm run build
npx cap sync android
```

4. **Signing errors**: Verify `key.properties` file exists and has correct paths

## 📞 Support

For issues specific to:
- **Capacitor**: [Capacitor Docs](https://capacitorjs.com/docs)
- **Android**: [Android Developer Docs](https://developer.android.com/docs)
- **Play Store**: [Play Console Help](https://support.google.com/googleplay/android-developer)

## ✅ Checklist Before Submission

- [ ] App icons created and placed in all required sizes
- [ ] Splash screen configured
- [ ] App tested on multiple devices/emulators
- [ ] All features working correctly
- [ ] Signing key generated and secured
- [ ] Release AAB built successfully
- [ ] All Play Store assets prepared (screenshots, graphics)
- [ ] Privacy policy created and hosted
- [ ] App descriptions written
- [ ] Content rating completed
- [ ] Google Play Developer account created
- [ ] App uploaded and submitted for review

---

**Next**: After Android app is live, proceed with iOS app setup (requires Mac with Xcode)
