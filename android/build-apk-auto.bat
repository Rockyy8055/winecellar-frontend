@echo off
echo ========================================
echo WineSeller Android APK Builder
echo ========================================
echo.
echo Building APK... Please wait...
echo This may take 10-20 minutes on first run.
echo.

cd /d "%~dp0"
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK Location:
    echo %CD%\app\build\outputs\apk\debug\app-debug.apk
    echo.
    start "" "%CD%\app\build\outputs\apk\debug"
) else (
    echo.
    echo BUILD FAILED! Check errors above.
    echo.
)
