@echo off
echo ========================================
echo Installing Android SDK 33
echo ========================================
echo.
echo This will download and install Android SDK Platform 33
echo Required for building your app
echo.

set ANDROID_SDK_ROOT=C:\Users\SHREYAS M\AppData\Local\Android\Sdk

echo Checking if SDK Manager exists...
if exist "%ANDROID_SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo SDK Manager found!
    echo.
    echo Installing Android SDK Platform 33...
    "%ANDROID_SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-33"
    "%ANDROID_SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;33.0.0"
    echo.
    echo Installation complete!
) else (
    echo SDK Manager not found.
    echo.
    echo You need to install Android Command Line Tools first.
    echo.
    echo Please follow these steps:
    echo 1. Go to: https://developer.android.com/studio#command-tools
    echo 2. Download "Command line tools only" for Windows
    echo 3. Extract to: %ANDROID_SDK_ROOT%\cmdline-tools\latest
    echo 4. Run this script again
)

echo.
pause
