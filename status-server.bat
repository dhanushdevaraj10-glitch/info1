@echo off
REM EduIF Server Status Script
REM This script shows the current server status

echo Checking EduIF Server Status...
echo.
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" list
echo.
echo View logs:
echo.
echo To see real-time logs, run:
echo   node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" logs EduIF
echo.
pause
