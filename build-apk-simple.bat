@echo off
echo ========================================
echo StockPoint APK Builder (Auto-Install)
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java not found. Downloading portable JDK...
    echo.

    REM Download portable JDK
    curl -L "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.zip" -o jdk.zip

    echo Extracting JDK...
    powershell -command "Expand-Archive -Path jdk.zip -DestinationPath .\jdk -Force"

    set "JAVA_HOME=%CD%\jdk\jdk-17.0.9+9"
    set "PATH=%JAVA_HOME%\bin;%PATH%"

    echo Java installed!
    echo.
) else (
    echo Java found!
    echo.
)

echo Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)

echo.
echo Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Building APK (this takes 2-5 minutes)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: APK build failed!
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo SUCCESS! APK built!
echo ========================================
echo.
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Copy this file to your Android device to install.
echo.
pause
