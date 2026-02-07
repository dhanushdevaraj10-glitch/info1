@echo off
REM EduIF Server Stop Script
REM This script stops the EduIF server

echo Stopping EduIF Server...
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" stop EduIF
echo.
echo Server stopped.
pause
