# 🖥️ Self-Hosted Deployment Guide (Your Own Server)

Complete setup for deploying EduIF on your own Windows or Linux server.

---

## 📋 OPTION 1: WINDOWS SERVER (Your Current PC)

### ✅ This is EASIEST - Use What You Have Now!

Your Windows PC is already running the server. To make it permanent:

---

## 🔧 Step 1: Setup Windows Server (Permanent)

### A. Install Node.js Service (Keeps Running)

**Option 1: Using PM2 (Recommended)**

```powershell
# Install PM2 globally
npm install -g pm2

# Navigate to project
cd "c:\Users\dhanush\OneDrive\Documents\New folder\info1"

# Start your app with PM2
pm2 start server.js --name "EduIF"

# Make it autostart on reboot
pm2 startup windows

# Save configuration
pm2 save

# Check status
pm2 list
pm2 logs EduIF
```

**Option 2: Using NSSM (Non-Sucking Service Manager)**

```powershell
# Download NSSM from https://nssm.cc/download
# Extract to C:\nssm-2.24\win64\

# Open PowerShell as Administrator
cd C:\nssm-2.24\win64\

# Install service
.\nssm install EduIF "C:\Program Files\nodejs\node.exe" "c:\Users\dhanush\OneDrive\Documents\New folder\info1\server.js"

# Start service
.\nssm start EduIF

# Check status
.\nssm status EduIF
```

---

## 🌐 Step 2: Setup Network Access

### A. Get Your PC's IP Address

```powershell
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

### B. Open Port 3000 in Windows Firewall

```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="EduIF" dir=in action=allow protocol=tcp localport=3000
```

Or manually:
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP → 3000 → Allow

### C. Test Access

**From Another PC on Same Network:**
```
http://[your-pc-ip]:3000
Example: http://192.168.1.100:3000
```

---

## 🔐 Step 3: Setup HTTPS (SSL Certificate)

### Option A: Free SSL with Let's Encrypt (Requires Domain)

**1. Install Certbot:**
```powershell
# Download from https://chocolatey.org/
choco install certbot -y

# Or use Git Bash / WSL
```

**2. Create SSL Certificate:**
```bash
certbot certonly --standalone -d your-domain.com
```

**3. Update server.js:**

Add at the top:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('C:/path/to/privkey.pem'),
  cert: fs.readFileSync('C:/path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### Option B: Self-Signed Certificate (No Domain Needed)

```powershell
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Or use PowerShell
$cert = New-SelfSignedCertificate -CertStoreLocation Cert:\CurrentUser\My -DnsName "localhost"
```

---

## 🗺️ Step 4: Setup Custom Domain (Optional)

### A. Buy a Domain
- Namecheap.com
- GoDaddy.com
- Domain.com
- Cloudflare.com

### B. Point Domain to Your Server

**1. Get Your Public IP:**
```powershell
Invoke-WebRequest -Uri "https://api.ipify.org?format=json" | Select-Object Content
```

**2. Update DNS Settings:**
In domain registrar:
```
Type: A Record
Name: @
Value: your-public-ip
TTL: 3600
```

**3. Test:**
```
http://yourdomain.com:3000
```

---

## 🔧 Step 5: Use Nginx Reverse Proxy (Optional but Recommended)

### A. Install Nginx on Windows

**Option 1: Download & Run**
```
1. Download from http://nginx.org/en/download.html
2. Extract to C:\nginx\
3. Run: C:\nginx\nginx.exe
```

**Option 2: Chocolatey**
```powershell
choco install nginx -y
```

### B. Configure Nginx

Edit `C:\nginx\conf\nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Enable compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### C. Restart Nginx

```powershell
# Stop
taskkill /F /IM nginx.exe

# Start
cd C:\nginx
start nginx.exe

# Check status
netstat -ano | findstr :80
```

---

## 📊 Step 6: Database Setup (Production)

### Replace JSON Files with Database

### Option A: SQLite (Easiest)

```bash
npm install sqlite3 better-sqlite3
```

Create `db.js`:
```javascript
const Database = require('better-sqlite3');
const db = new Database('data/eduif.db');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    email TEXT,
    name TEXT,
    loginAttempts INTEGER,
    locked BOOLEAN
  )
`);

module.exports = db;
```

### Option B: MongoDB (Cloud)

```bash
npm install mongoose
```

In server.js:
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

### Option C: PostgreSQL (Powerful)

```bash
npm install pg
```

---

## 🔐 Step 7: Security Hardening

### A. Update Environment Variables

Create `.env`:
```
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secret-key-12345
ENCRYPTION_KEY=your-32-character-encryption-key
DB_URL=your-database-url
ADMIN_EMAIL=your-email@example.com
```

Install dotenv:
```bash
npm install dotenv
```

### B. Install Security Middleware

```bash
npm install helmet express-rate-limit cors
```

Update server.js:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

### C. Update server.js

```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true,        // HTTPS only
    httpOnly: true,      // No JavaScript access
    maxAge: 1000 * 60 * 60 * 24  // 24 hours
  }
}));
```

---

## 📝 Step 8: Logging & Monitoring

### A. Setup File Logging

Create `utils/fileLogger.js`:
```javascript
const fs = require('fs');
const path = require('path');

function logToFile(message) {
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

module.exports = { logToFile };
```

### B. Monitor with PM2

```powershell
# View logs
pm2 logs EduIF

# Monitor in real-time
pm2 monit

# Get stats
pm2 info EduIF
```

---

## 💾 Step 9: Backup Strategy

### A. Automated Daily Backups

Create backup script `backup.js`:
```javascript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function backup() {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupDir = `backups/backup-${timestamp}`;

  // Create backup directory
  exec(`xcopy "data" "${backupDir}\data" /E /I /Y`, (err) => {
    if (err) console.error('Backup failed:', err);
    else console.log('Backup completed:', backupDir);
  });
}

// Run daily at 2 AM
const schedule = require('node-schedule');
schedule.scheduleJob('0 2 * * *', backup);
```

### B. Manual Backup Command

```powershell
# Backup data folder
Copy-Item -Path "c:\Users\dhanush\OneDrive\Documents\New folder\info1\data" `
          -Destination "C:\Backups\data-backup-$(Get-Date -Format 'yyyy-MM-dd')" -Recurse
```

---

## 👁️ Step 10: Monitoring & Uptime

### A. PM2 Plus (Free Web Dashboard)

```powershell
# Create account at pm2.io
pm2 install pm2-auto-pull

# Link PM2 to account
pm2 link [secret-key] [public-key]

# View on pm2.io
```

### B. Uptime Monitoring

**Use free services:**
- Uptimerobot.com (monitors if site is up)
- Pingdom.com
- Statuscake.com

Create account and monitor: `http://yourdomain.com:3000`

---

## 🚨 Step 11: Error Handling & Recovery

### A. Auto-Restart on Crash

With PM2:
```powershell
pm2 start server.js --name "EduIF" --watch --ignore-watch "logs" --max-memory-restart 300M
```

### B. Health Check Endpoint

Add to server.js:
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime() 
  });
});
```

Check with:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health"
```

---

## ✅ PRODUCTION DEPLOYMENT CHECKLIST

```
Security:
☐ Change default passwords
☐ Update encryption key
☐ Enable HTTPS/SSL
☐ Install security headers (Helmet.js)
☐ Set up firewall rules
☐ Enable rate limiting
☐ Use environment variables for secrets
☐ Change session secret key

Performance:
☐ Enable gzip compression
☐ Setup caching
☐ Optimize database queries
☐ Use reverse proxy (Nginx)
☐ Enable minification

Monitoring:
☐ Setup logging
☐ Enable uptime monitoring
☐ Setup error tracking
☐ Configure alerts
☐ Monitor disk space

Backups:
☐ Daily automated backups
☐ Test backup restoration
☐ Store backups offsite
☐ Document recovery procedure

Configuration:
☐ Environment variables set
☐ Database configured
☐ Domain pointing to server
☐ SSL certificate installed
☐ Firewall rules configured
```

---

## 🔧 TROUBLESHOOTING

### Issue: Port Already in Use
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID [PID] /F
```

### Issue: Service Won't Start
```powershell
# Check PM2 logs
pm2 logs

# Restart PM2
pm2 kill
pm2 start server.js
```

### Issue: SSL Certificate Error
```powershell
# Regenerate certificate
certbot renew

# Or use self-signed
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### Issue: Can't Access From Other PC
```powershell
# 1. Check Windows Firewall
netsh advfirewall firewall show rule name="EduIF"

# 2. Check server is running
Get-Process node

# 3. Check your PC IP
ipconfig

# 4. Test from cmd
curl http://[your-ip]:3000
```

---

## 📊 FINAL SETUP SUMMARY

| Component | Setup | Status |
|-----------|-------|--------|
| **Node.js** | ✅ Installed | Running |
| **Application** | ✅ Created | Ready |
| **Service (PM2)** | 📝 To setup | Follow Step 1 |
| **Firewall** | 📝 To configure | Follow Step 2 |
| **Domain** | 📝 Optional | Follow Step 4 |
| **HTTPS** | 📝 Optional | Follow Step 3 |
| **Nginx** | 📝 Optional | Follow Step 5 |
| **Database** | 📝 For production | Follow Step 6 |
| **Security** | 📝 Important | Follow Step 7 |
| **Monitoring** | 📝 Recommended | Follow Step 10 |

---

## 🚀 DEPLOYMENT WORKFLOW

```powershell
# 1. Make changes to code
# ... edit files ...

# 2. Test locally
npm start

# 3. Deploy to server (PM2 auto-reloads)
pm2 reload EduIF

# 4. Monitor
pm2 logs EduIF

# 5. Backup
# ... runs automatically with scheduled backup ...
```

---

## 📞 QUICK COMMANDS

```powershell
# Start/Stop/Restart Service
pm2 start EduIF
pm2 stop EduIF
pm2 restart EduIF

# View Status
pm2 list
pm2 logs EduIF
pm2 info EduIF

# Manage Nginx
nginx -s stop
start nginx.exe
nginx -s reload

# Firewall
netsh advfirewall firewall show rule name="EduIF"

# Backup
Copy-Item -Path "data" -Destination "backup-$((Get-Date).ToString('yyyy-MM-dd'))" -Recurse
```

---

## ✨ YOUR SELF-HOSTED SERVER IS NOW READY!

**Next Steps:**
1. ✅ Run PM2 commands from Step 1
2. ✅ Configure Firewall from Step 2
3. ✅ (Optional) Add domain from Step 4
4. ✅ Setup monitoring from Step 10

**Your EduIF is now:**
- 🔒 Secure
- 🚀 Always running
- 📊 Monitored
- 💾 Backed up
- ⚡ Fast

Need help with any specific step? Let me know! 🎯
