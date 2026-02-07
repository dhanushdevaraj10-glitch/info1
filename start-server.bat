@echo off
REM EduIF Server Startup Script
REM This script starts the EduIF server with PM2 on Windows

echo ========================================
echo Starting EduIF Server with PM2
echo ========================================

REM Navigate to project directory
cd /d "c:\Users\dhanush\OneDrive\Documents\New folder\info1"

REM Check if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo PM2 not found in PATH
    echo Installing PM2...
    npm install -g pm2
)

REM Start server with PM2
echo Starting EduIF with PM2...
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" start server.js --name "EduIF"

REM Save PM2 configuration
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" save

REM Show status
echo.
echo ========================================
echo EduIF Server Started Successfully!
echo ========================================
echo.
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" list

echo.
echo URL: http://localhost:3000
echo.
pause
