@echo off
echo ========================================
echo WineSeller Android APK Builder
echo ========================================
echo.
echo This will build a debug APK that you can install on your Android phone.
echo First build may take 10-20 minutes (downloads dependencies).
echo.
echo Press any key to start building...
pause > nul
echo.
echo Building APK...
echo.

cd /d "%~dp0"
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL! 🎉
    echo ========================================
    echo.
    echo Your APK is ready at:
    echo %CD%\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Next steps:
    echo 1. Transfer app-debug.apk to your Android phone
    echo 2. Enable "Install from Unknown Sources" in phone settings
    echo 3. Open the APK file on your phone
    echo 4. Tap Install
    echo 5. Enjoy your WineSeller app!
    echo.
    echo Opening APK folder...
    start "" "%CD%\app\build\outputs\apk\debug"
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED! ❌
    echo ========================================
    echo.
    echo Common solutions:
    echo 1. Make sure Java is installed: java -version
    echo 2. Check your internet connection
    echo 3. Try running as Administrator
    echo 4. See BUILD_APK_WITHOUT_ANDROID_STUDIO.md for help
    echo.
)

echo.
echo Press any key to exit...
pause > nul
