@echo off
REM EduIF Server Restart Script
REM This script restarts the EduIF server

echo Restarting EduIF Server...
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" restart EduIF
echo.
echo Server restarted.
echo.
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" list
pause
