# iOS App Setup Guide for WineSeller

## ✅ Completed Steps

1. ✅ Installed Capacitor dependencies
2. ✅ Built React app for production
3. ✅ Added iOS platform
4. ✅ Configured iOS app settings
5. ✅ Added necessary permissions

## 📱 App Information

- **App Name**: WineSeller
- **Bundle ID**: com.wineseller.app
- **Version**: 1.0.0
- **Build Number**: 1

## ⚠️ Prerequisites

### Required Hardware & Software:
1. **Mac Computer** (macOS 12.0 or later recommended)
2. **Xcode** (latest version from Mac App Store)
3. **Apple Developer Account** ($99/year)
4. **CocoaPods** (for dependency management)

### Install CocoaPods:
```bash
sudo gem install cocoapods
```

## 🎨 Step 1: Create App Icons

### Required Icon Sizes for iOS:
You need app icons in multiple sizes. Use these tools to generate all sizes from a single 1024x1024px image:

**Recommended Tools**:
- [App Icon Generator](https://www.appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Icon Set Creator](https://apps.apple.com/app/icon-set-creator/id939343785) (Mac App)

### Icon Sizes Needed:
- **App Store**: 1024x1024px (required for submission)
- **iPhone**: 180x180, 120x120, 87x87, 80x80, 60x60, 58x58, 40x40
- **iPad**: 167x167, 152x152, 76x76, 40x40, 29x29
- **Settings**: 58x58, 87x87

### Add Icons to Xcode:
1. Open Xcode project:
   ```bash
   npx cap open ios
   ```
2. In Xcode, navigate to: `App > App > Assets.xcassets > AppIcon`
3. Drag and drop your generated icons into the appropriate slots
4. Or use the Asset Catalog to import all icons at once

## 🎬 Step 2: Create Launch Screen (Splash Screen)

### Option 1: Using Storyboard (Default)
1. In Xcode, open `App > App > Base.lproj > LaunchScreen.storyboard`
2. Customize the launch screen using Interface Builder
3. Add your logo and brand colors

### Option 2: Using Images
1. Create launch images in required sizes:
   - iPhone: 1242x2688, 1125x2436, 828x1792, 750x1334
   - iPad: 2048x2732, 1668x2388, 1536x2048
2. Add to `Assets.xcassets > LaunchImage`

## 🔧 Step 3: Configure Xcode Project

### Open Project in Xcode:
```bash
npx cap open ios
```

### Update Project Settings:
1. **Select App target** in Xcode
2. **General Tab**:
   - Display Name: `WineSeller`
   - Bundle Identifier: `com.wineseller.app`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: iOS 13.0 or higher

3. **Signing & Capabilities**:
   - Select your Team (Apple Developer Account)
   - Enable "Automatically manage signing"
   - Verify Bundle Identifier is unique

4. **Info Tab**:
   - Verify all permission descriptions are present
   - Customize as needed

## 🏃 Step 4: Test Your App

### Test on iOS Simulator:
1. In Xcode, select a simulator (iPhone 14, iPhone 15, etc.)
2. Click the "Play" button (▶️) or press `Cmd + R`
3. Wait for the app to build and launch

### Test on Physical Device:
1. Connect your iPhone/iPad via USB
2. Trust the computer on your device
3. In Xcode, select your device from the device list
4. Click "Play" to build and run
5. On first run, go to Settings > General > VPN & Device Management
6. Trust your developer certificate

## 📦 Step 5: Prepare for App Store Submission

### Create App Store Connect Account:
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer account
3. Accept agreements if prompted

### Create App in App Store Connect:
1. Click "My Apps" > "+" > "New App"
2. Fill in details:
   - **Platform**: iOS
   - **Name**: WineSeller
   - **Primary Language**: English
   - **Bundle ID**: com.wineseller.app
   - **SKU**: wineseller-001 (unique identifier)
   - **User Access**: Full Access

### Required Assets for App Store:

#### App Icon:
- **1024x1024px** PNG (no transparency, no rounded corners)

#### Screenshots (Required):
You need screenshots for different device sizes:

**iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max):
- 1290x2796px (portrait) or 2796x1290px (landscape)
- Minimum: 2 screenshots, Maximum: 10

**iPhone 6.5" Display** (iPhone 11 Pro Max, XS Max):
- 1242x2688px (portrait) or 2688x1242px (landscape)
- Minimum: 2 screenshots, Maximum: 10

**iPhone 5.5" Display** (iPhone 8 Plus):
- 1242x2208px (portrait) or 2208x1242px (landscape)
- Minimum: 2 screenshots, Maximum: 10

**iPad Pro (6th Gen) 12.9" Display**:
- 2048x2732px (portrait) or 2732x2048px (landscape)
- Minimum: 2 screenshots, Maximum: 10

**iPad Pro (2nd Gen) 12.9" Display**:
- 2048x2732px (portrait) or 2732x2048px (landscape)
- Minimum: 2 screenshots, Maximum: 10

#### App Preview Videos (Optional):
- 15-30 seconds
- Same sizes as screenshots
- MP4 or MOV format

#### App Description:

**Promotional Text** (170 characters max):
```
Discover premium wines from around the world. Shop, explore, and enjoy exceptional wines delivered to your door. Download WineSeller today!
```

**Description** (4000 characters max):
```
WineSeller - Your Premium Wine Marketplace

Discover, explore, and purchase the finest wines from around the world with WineSeller. Our curated selection features premium wines from renowned vineyards and hidden gems waiting to be discovered.

🍷 FEATURES

EXTENSIVE WINE COLLECTION
Browse thousands of wines from various regions including France, Italy, Spain, California, and more. From bold reds to crisp whites, sparkling champagnes to sweet dessert wines.

ADVANCED SEARCH & FILTERS
Find your perfect wine with our powerful search and filtering system:
• Filter by wine type, region, vintage, and price
• Sort by ratings, popularity, or price
• Save your favorite wines for later
• Get personalized recommendations

SEAMLESS SHOPPING EXPERIENCE
• Easy-to-use interface designed for wine lovers
• Secure checkout with multiple payment options
• PayPal and Stripe integration
• Save multiple delivery addresses
• Quick reorder from purchase history

EXPERT REVIEWS & RATINGS
• Detailed tasting notes for each wine
• Professional ratings and reviews
• Customer reviews and ratings
• Food pairing suggestions
• Serving temperature recommendations

FAST & RELIABLE DELIVERY
• Track your orders in real-time
• Flexible delivery options
• Secure packaging to protect your wines
• Delivery notifications

GIFT OPTIONS
• Perfect for wine enthusiasts
• Gift wrapping available
• Personalized gift messages
• Gift cards available

ACCOUNT FEATURES
• Manage your profile and preferences
• View order history
• Track deliveries
• Wishlist management
• Exclusive member offers

Whether you're a seasoned wine connoisseur or just beginning your wine journey, WineSeller makes it easy to discover and enjoy exceptional wines. Our commitment to quality, selection, and customer service ensures you'll find the perfect bottle for any occasion.

Download WineSeller now and start your wine adventure today!

ABOUT US
WineSeller is dedicated to bringing the world's finest wines to your fingertips. We partner with trusted vineyards and distributors to ensure authenticity and quality in every bottle.

SUPPORT
Have questions? Our customer support team is here to help. Contact us through the app or visit our website.

Note: You must be of legal drinking age to purchase alcohol. Please drink responsibly.
```

**Keywords** (100 characters max, comma-separated):
```
wine,wines,wine shop,wine store,wine delivery,buy wine,red wine,white wine,champagne,wine app
```

**Support URL**: Your website URL
**Marketing URL**: Your website URL (optional)

#### Privacy Policy:
- **Required**: Must have a privacy policy URL
- Host on your website or use a generator
- Must cover data collection, usage, and sharing

#### App Review Information:
- Contact information for App Review team
- Demo account credentials (if app requires login)
- Notes for reviewers about testing the app

#### Age Rating:
Complete the age rating questionnaire:
- **Alcohol, Tobacco, or Drug Use**: Frequent/Intense (wine sales)
- Set appropriate age rating (17+ recommended for alcohol)

## 🔑 Step 6: Archive and Upload to App Store

### Create Archive:
1. In Xcode, select "Any iOS Device (arm64)" as the build destination
2. Go to **Product** > **Archive**
3. Wait for the archive to complete (this may take several minutes)

### Upload to App Store Connect:
1. When archive completes, the Organizer window opens
2. Select your archive
3. Click **Distribute App**
4. Select **App Store Connect**
5. Click **Upload**
6. Select distribution options:
   - ✅ Upload your app's symbols
   - ✅ Manage Version and Build Number (Xcode managed)
7. Select signing method:
   - Choose **Automatically manage signing**
8. Review app information
9. Click **Upload**
10. Wait for upload to complete

### Submit for Review:
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Click on the version (1.0.0)
4. Complete all required information:
   - App Information
   - Pricing and Availability
   - App Privacy
   - Screenshots and descriptions
5. Select the build you just uploaded
6. Click **Add for Review**
7. Click **Submit for Review**

## 📋 App Store Review Process

### Timeline:
- **Initial Review**: 24-48 hours (typically)
- **Resubmission**: 24 hours (if rejected)

### Common Rejection Reasons:
1. **Incomplete Information**: Missing screenshots, descriptions
2. **Privacy Policy**: Missing or inadequate privacy policy
3. **Crashes**: App crashes during review
4. **Broken Links**: Non-functional features or links
5. **Age Rating**: Incorrect age rating for alcohol content
6. **Payment Issues**: Problems with in-app purchases or payments

### Tips for Approval:
- Test thoroughly before submission
- Provide clear demo account if login required
- Include detailed review notes
- Ensure all features work properly
- Have a comprehensive privacy policy
- Set correct age rating (17+ for alcohol)

## 🔄 Updating Your App

When you make changes to your website:

### 1. Update Version Numbers:
In Xcode, select the App target:
- **Version**: 1.0.1 (increment for minor updates)
- **Build**: 2 (increment for each upload)

### 2. Rebuild and Sync:
```bash
npm run build
npx cap sync ios
```

### 3. Create New Archive:
1. Open in Xcode: `npx cap open ios`
2. Product > Archive
3. Upload to App Store Connect

### 4. Submit Update:
1. In App Store Connect, create a new version
2. Add "What's New" release notes
3. Select the new build
4. Submit for review

## 🐛 Troubleshooting

### Build Fails:
```bash
# Clean build folder
cd ios/App
pod install
# Then rebuild in Xcode
```

### Signing Issues:
1. Verify Apple Developer account is active
2. Check Bundle ID is unique and matches App Store Connect
3. Regenerate provisioning profiles if needed

### White Screen on Launch:
```bash
# Ensure latest build
npm run build
npx cap sync ios
# Clean and rebuild in Xcode
```

### Pod Install Errors:
```bash
cd ios/App
pod repo update
pod install
```

## 📱 App Store Optimization (ASO)

### Best Practices:
1. **App Name**: Keep it clear and searchable (WineSeller)
2. **Keywords**: Use all 100 characters wisely
3. **Screenshots**: Show key features and benefits
4. **Description**: Front-load important information
5. **Reviews**: Encourage satisfied customers to leave reviews
6. **Updates**: Regular updates show active development
7. **Ratings**: Respond to user feedback

## 💰 Pricing & Distribution

### Pricing Options:
- **Free**: No cost to download
- **Paid**: One-time purchase price
- **In-App Purchases**: For premium features
- **Subscriptions**: Recurring revenue

### Distribution:
- Select countries/regions for availability
- Set pricing per region (auto-converted or manual)
- Choose availability date

## 📞 Support Resources

- **Capacitor iOS**: [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
- **Xcode**: [Xcode Documentation](https://developer.apple.com/xcode/)
- **App Store Connect**: [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- **Human Interface Guidelines**: [iOS HIG](https://developer.apple.com/design/human-interface-guidelines/ios)

## ✅ Pre-Submission Checklist

- [ ] App icons created (all sizes including 1024x1024)
- [ ] Launch screen configured
- [ ] App tested on multiple iOS versions
- [ ] App tested on iPhone and iPad
- [ ] All features working correctly
- [ ] No crashes or major bugs
- [ ] Privacy policy created and hosted
- [ ] Screenshots captured for all required sizes
- [ ] App description written
- [ ] Keywords optimized
- [ ] Age rating set correctly (17+ for alcohol)
- [ ] Support URL provided
- [ ] Apple Developer account active ($99/year)
- [ ] App created in App Store Connect
- [ ] Archive created successfully
- [ ] Build uploaded to App Store Connect
- [ ] All App Store Connect fields completed
- [ ] App submitted for review

## 🎉 After Approval

1. **Monitor Reviews**: Respond to user feedback
2. **Track Analytics**: Use App Store Connect analytics
3. **Plan Updates**: Regular updates improve rankings
4. **Marketing**: Promote your app
5. **Support**: Provide excellent customer support

---

**Note**: iOS app development requires a Mac. If you don't have one, consider:
- Using a Mac in the cloud (MacStadium, AWS EC2 Mac)
- Borrowing a Mac from a friend
- Using Expo or similar services that provide cloud builds
- Hiring an iOS developer to handle the submission

**Next Steps**: After both Android and iOS apps are live, monitor performance and user feedback to improve your apps!
