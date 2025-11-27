@echo off
echo Building Android APK using Docker...
echo This will take 10-15 minutes on first run
echo.

REM Build Docker image
docker build -f Dockerfile.android -t stockpoint-android .

REM Run container and copy APK
docker create --name stockpoint-build stockpoint-android
docker cp stockpoint-build:/output/app-debug.apk ./stockpoint-debug.apk
docker rm stockpoint-build

echo.
echo ========================================
echo APK built successfully!
echo Location: stockpoint-debug.apk
echo ========================================
pause
