@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
echo Building Android APK v1.6.3...
cd /d C:\Users\kr577\Documents\Dev\Wedding-web-\admin-app\android
call gradlew.bat assembleDebug
pause
