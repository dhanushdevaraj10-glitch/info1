# 🖥️ Windows Auto-Start Setup for EduIF

Your EduIF server is now running with PM2! Here's how to make it auto-start.

---

## ✅ Current Status

```
Server: ✅ RUNNING with PM2
Status: Online
Process: EduIF
Memory: Stable
Restarts: Auto-recovery enabled
```

Your server is at: **http://10.26.9.189:3000** or **http://localhost:3000**

---

## 🚀 Option 1: Windows Scheduled Task (Auto-Start on Reboot)

### Step 1: Create Batch File (Already Done ✅)

Check your project folder - you have these batch files:
- `start-server.bat` - Start the server
- `stop-server.bat` - Stop the server
- `restart-server.bat` - Restart the server
- `status-server.bat` - Check status

### Step 2: Setup Scheduled Task

**Method A: Windows GUI (Easiest)**

1. Open **Task Scheduler**
   - Press `Win + R`
   - Type: `tasksched.msc`
   - Press Enter

2. Click **Create Basic Task**

3. Fill in:
   - **Name**: `EduIF Server Startup`
   - **Description**: `Start EduIF server on Windows startup`

4. Click **Trigger** tab → **New...**
   - Select: **At startup**
   - Click OK

5. Click **Action** tab → **New...**
   - **Action**: Start a program
   - **Program**: 
     ```
     c:\Users\dhanush\OneDrive\Documents\New folder\info1\start-server.bat
     ```
   - **Start in**:
     ```
     c:\Users\dhanush\OneDrive\Documents\New folder\info1
     ```
   - Click OK

6. Click **Conditions** tab
   - Uncheck: "Start the task only if the computer is on AC power"
   - Check: "Wake the computer to run this task"
   - Click OK

7. Click **Finish**

**Method B: PowerShell Script (Advanced)**

```powershell
# Run as Administrator
$taskName = "EduIF Server Startup"
$taskPath = "c:\Users\dhanush\OneDrive\Documents\New folder\info1\start-server.bat"
$workDir = "c:\Users\dhanush\OneDrive\Documents\New folder\info1"

$action = New-ScheduledTaskAction -Execute $taskPath -WorkingDirectory $workDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "dhanush" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -TaskName $taskName -Description "Start EduIF server on Windows startup"
```

---

## 🔥 Option 2: Windows Firewall Setup

### Allow Network Access (Required for other computers to connect)

**Run as Administrator:**

```powershell
# Allow port 3000
netsh advfirewall firewall add rule name="EduIF Port 3000" dir=in action=allow protocol=tcp localport=3000 profile=any

# Allow port 80 (if using Nginx)
netsh advfirewall firewall add rule name="EduIF Port 80" dir=in action=allow protocol=tcp localport=80 profile=any

# Allow port 443 (if using HTTPS)
netsh advfirewall firewall add rule name="EduIF Port 443" dir=in action=allow protocol=tcp localport=443 profile=any
```

### Verify Rules Added

```powershell
netsh advfirewall firewall show rule name="EduIF*"
```

### Remove Rules (if needed)

```powershell
netsh advfirewall firewall delete rule name="EduIF Port 3000"
```

---

## 🌐 Access Your Server

### Local Access (Same PC)
```
Browser: http://localhost:3000
```

### Network Access (From Another PC)
```
Browser: http://10.26.9.189:3000
Replace IP with your actual IP from ipconfig
```

### Remote Access (From Internet - Optional)

**If you want to access from internet:**

1. Get your public IP: https://whatismyipaddress.com/
2. Setup port forwarding on your router (port 3000 → your PC)
3. Access: `http://your-public-ip:3000`

⚠️ **Security Warning**: Don't expose production servers without HTTPS!

---

## 📊 Server Management Commands

### Using Batch Files
```powershell
# Navigate to project folder
cd "c:\Users\dhanush\OneDrive\Documents\New folder\info1"

# Start server
.\start-server.bat

# Stop server
.\stop-server.bat

# Restart server
.\restart-server.bat

# Check status
.\status-server.bat
```

### Using PM2 Directly
```powershell
# View all processes
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" list

# View logs (real-time)
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" logs EduIF

# View detailed info
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" info EduIF

# Stop server
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" stop EduIF

# Start server
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" start EduIF

# Restart server
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" restart EduIF

# Kill all PM2 processes
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" kill
```

---

## 🔐 Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Full Access |
| staff | staff123 | Academic Data |
| student | student123 | Personal Data |

---

## 📝 Windows Services vs PM2

| Feature | PM2 | Windows Service |
|---------|-----|-----------------|
| Auto-restart crashes | ✅ Yes | ⚠️ Manual |
| Auto-start on reboot | ✅ Yes (with task) | ✅ Yes |
| Memory limit | ✅ Yes | ✅ Yes |
| Easy management | ✅ Very easy | ⚠️ Complex |
| Logging | ✅ Built-in | ⚠️ Need setup |
| **Recommendation** | ✅ **Use PM2** | ❌ Skip |

---

## 🆘 Troubleshooting

### Server Won't Start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If yes, kill the process
taskkill /PID [PID] /F

# Try starting again
.\start-server.bat
```

### Can't Access from Another PC
```powershell
# 1. Check server is running
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" list

# 2. Check firewall rules
netsh advfirewall firewall show rule name="EduIF*"

# 3. Check Windows Firewall is not blocking
# Windows Defender Firewall → Inbound Rules → Find "EduIF Port 3000"

# 4. Verify IP address
ipconfig

# 5. Test from command line
curl http://10.26.9.189:3000
```

### Batch Files Won't Run
```powershell
# Fix 1: Right-click batch file → Properties → Unblock → Apply → OK

# Fix 2: Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Fix 3: Use full path
cmd /c "c:\Users\dhanush\OneDrive\Documents\New folder\info1\start-server.bat"
```

### PM2 Not Found
```powershell
# Reinstall PM2
npm install -g pm2

# Verify installation
npm list -g pm2
```

---

## 📊 Monitoring Server Health

### Check Resource Usage
```powershell
# Real-time monitoring
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" monit
```

### Check Logs
```powershell
# Last 100 lines
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" logs EduIF --lines 100

# Tail logs (real-time)
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" logs EduIF
```

### Memory Issues
If server uses too much memory:
```powershell
# Set max memory limit (300MB)
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" delete EduIF
node "C:\Users\dhanush\AppData\Roaming\npm\node_modules\pm2\bin\pm2" start server.js --name "EduIF" --max-memory-restart 300M
```

---

## 💾 Backup Strategy

### Automated Daily Backup

Create `backup.bat`:
```batch
@echo off
REM Daily backup script

setlocal enabledelayedexpansion
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c_%%a_%%b)

echo Backing up EduIF data...
xcopy "c:\Users\dhanush\OneDrive\Documents\New folder\info1\data" "C:\Backups\data_!mydate!" /E /I /Y

echo Backing up logs...
xcopy "c:\Users\dhanush\OneDrive\Documents\New folder\info1\logs" "C:\Backups\logs_!mydate!" /E /I /Y

echo Backup completed: C:\Backups\data_!mydate!
echo.
pause
```

Schedule this with Task Scheduler (same as server startup):
1. Trigger: Daily at 2:00 AM
2. Action: Run the backup.bat script

---

## 🎯 Your Self-Hosted Setup Summary

✅ **Server**: Running with PM2  
✅ **Process Management**: PM2 handles crashes & restarts  
✅ **Auto-Recovery**: Enabled (auto-restart on crash)  
✅ **Logging**: Available via PM2  
✅ **Access**: Local (localhost:3000) + Network (10.26.9.189:3000)  

### Next Steps:
1. ✅ **Auto-Start**: Setup Windows Scheduled Task (see above)
2. ✅ **Firewall**: Add firewall rules (see above)
3. 📝 **Optional**: Setup HTTPS (see SELF_HOSTED_GUIDE.md)
4. 📝 **Optional**: Setup domain name (see SELF_HOSTED_GUIDE.md)
5. 📝 **Optional**: Setup backups (see Backup Strategy above)

---

## ✨ You're All Set!

Your EduIF server is now:
- 🟢 **Running** with PM2
- 📊 **Monitored** automatically
- 🔄 **Auto-restarts** on crash
- 📝 **Logging** all activities
- 🔒 **Secure** with auth

**Access it now**: http://localhost:3000 🚀
