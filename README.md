# 🍷 WineSeller - Premium Wine Marketplace

A full-featured wine e-commerce platform built with React, now available as a **website**, **Android app**, and **iOS app**!

## 📱 Mobile Apps Available

This project has been converted into native mobile applications for both Android and iOS platforms using Capacitor.

### 🚀 Quick Start for Mobile Apps

**See detailed guides**:
- 📖 [Complete Mobile App Guide](./MOBILE_APP_GUIDE.md) - Overview and workflow
- 🤖 [Android Setup Guide](./ANDROID_APP_SETUP.md) - Play Store submission
- 🍎 [iOS Setup Guide](./IOS_APP_SETUP.md) - App Store submission
- ⚡ [Quick Reference](./QUICK_REFERENCE.md) - Essential commands

---

## 🌐 Web Application

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run mobile:sync`

Builds the web app and syncs it to both Android and iOS platforms.\
Use this after making changes to deploy to mobile apps.

```bash
npm run mobile:sync
```

### Mobile Commands

```bash
# Sync to mobile platforms
npx cap sync

# Open Android in Android Studio
npx cap open android

# Open iOS in Xcode (Mac only)
npx cap open ios
```

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## 📱 Mobile App Development

### Project Structure

```
wineseller_website_frontend-Deep/
├── src/                    # React source code
├── build/                  # Production web build
├── android/                # Android native project
├── ios/                    # iOS native project
├── capacitor.config.json   # Capacitor configuration
└── [Guides]               # Detailed setup guides
```

### Mobile App Information

- **App Name**: WineSeller
- **Package ID**: com.wineseller.app
- **Android Version**: 1.0.0 (Build 1)
- **iOS Version**: 1.0.0 (Build 1)

### Development Workflow

1. **Make changes** to your React code in `src/`
2. **Build** the web app: `npm run build`
3. **Sync** to mobile: `npx cap sync`
4. **Test** in Android Studio or Xcode
5. **Deploy** updates to app stores

### Store Submission

#### Android (Google Play Store)
- **Requirements**: Android Studio, Google Play Developer account ($25)
- **Guide**: [ANDROID_APP_SETUP.md](./ANDROID_APP_SETUP.md)
- **Build Command**: `cd android && ./gradlew bundleRelease`
- **Review Time**: 1-7 days

#### iOS (Apple App Store)
- **Requirements**: Mac, Xcode, Apple Developer account ($99/year)
- **Guide**: [IOS_APP_SETUP.md](./IOS_APP_SETUP.md)
- **Build**: Archive in Xcode
- **Review Time**: 1-2 days

### Quick Commands Reference

```bash
# Development
npm start                    # Run web app locally
npm run build               # Build for production

# Mobile
npx cap sync                # Sync to both platforms
npx cap sync android        # Sync to Android only
npx cap sync ios            # Sync to iOS only
npx cap open android        # Open in Android Studio
npx cap open ios            # Open in Xcode

# Release
cd android && ./gradlew bundleRelease  # Build Android AAB
# iOS: Use Xcode Archive
```

### Resources

- 📖 [Complete Mobile Guide](./MOBILE_APP_GUIDE.md)
- 🤖 [Android Setup](./ANDROID_APP_SETUP.md)
- 🍎 [iOS Setup](./IOS_APP_SETUP.md)
- ⚡ [Quick Reference](./QUICK_REFERENCE.md)
- 📚 [Capacitor Docs](https://capacitorjs.com/docs)

---

## 🎉 Features

- ✅ Responsive web design
- ✅ Native Android app
- ✅ Native iOS app
- ✅ E-commerce functionality
- ✅ Payment integration (PayPal, Stripe)
- ✅ Multi-language support (i18next)
- ✅ Redux state management
- ✅ Smooth animations (Framer Motion)
- ✅ Modern UI with Bootstrap

---

## 📞 Support

For mobile app development questions:
- Check the detailed guides in the project root
- Visit [Capacitor Documentation](https://capacitorjs.com/docs)
- Join [Capacitor Discord](https://discord.com/invite/UPYYRhtyzp)

For React/web questions:
- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
