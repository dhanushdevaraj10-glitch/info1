# 🚀 EduIF Deployment Guide

## Deployment Overview

Your EduIF system can be deployed to various platforms. Here are the best options:

---

## 1️⃣ LOCAL DEPLOYMENT (Current Setup)

**Status**: ✅ Already running  
**URL**: http://localhost:3000

### To Keep Running:
```powershell
# Start server
npm start

# Or run in background
npm start &
```

---

## 2️⃣ HEROKU DEPLOYMENT (Easiest Cloud Option)

### Prerequisites:
- Heroku account (free tier available)
- Git installed
- Heroku CLI installed

### Steps:

**1. Add Procfile:**
```powershell
echo "web: node server.js" > Procfile
```

**2. Add .gitignore:**
Already created ✅

**3. Initialize Git:**
```powershell
git init
git add .
git commit -m "Initial EduIF deployment"
```

**4. Login to Heroku:**
```powershell
heroku login
```

**5. Create Heroku App:**
```powershell
heroku create your-app-name
```

**6. Deploy:**
```powershell
git push heroku main
```

**7. Open Your App:**
```powershell
heroku open
```

**URL**: `https://your-app-name.herokuapp.com`

---

## 3️⃣ AWS DEPLOYMENT

### Option A: AWS Elastic Beanstalk (Easiest)

**1. Install AWS CLI:**
```powershell
# Download and install from aws.amazon.com
```

**2. Configure AWS:**
```powershell
aws configure
# Enter: Access Key, Secret Key, Region, Output format
```

**3. Initialize Elastic Beanstalk:**
```powershell
eb init -p node.js-20 eduif --region us-east-1
```

**4. Create Environment:**
```powershell
eb create eduif-env
```

**5. Deploy:**
```powershell
eb deploy
```

**6. Open App:**
```powershell
eb open
```

**URL**: Your Elastic Beanstalk domain

---

## Option B: AWS EC2 (More Control)

**1. Launch EC2 Instance:**
- Choose: Ubuntu 20.04 LTS or Windows Server
- Instance type: t3.micro (free tier eligible)
- Security: Open ports 80, 443, 3000

**2. Connect to Instance & Install Node.js:**
```bash
sudo apt update
sudo apt install nodejs npm -y
```

**3. Upload Project:**
```bash
# Using WinSCP or SCP
scp -r info1 ubuntu@your-instance-ip:/home/ubuntu/
```

**4. Install Dependencies:**
```bash
cd /home/ubuntu/info1
npm install
```

**5. Run with PM2 (Process Manager):**
```bash
sudo npm install -g pm2

pm2 start server.js --name "eduif"
pm2 startup
pm2 save
```

**6. Setup Nginx Reverse Proxy:**
```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/eduif`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/eduif /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**URL**: http://your-domain.com

---

## 4️⃣ DIGITALOCEAN DEPLOYMENT

**1. Create Droplet:**
- Size: $4-6/month (512MB RAM)
- OS: Ubuntu 20.04
- Region: Nearest to users

**2. SSH into Droplet:**
```bash
ssh root@your-droplet-ip
```

**3. Setup Server:**
```bash
apt update && apt upgrade -y
apt install nodejs npm nginx git -y
```

**4. Clone/Upload Project:**
```bash
git clone your-repo/eduif.git
cd eduif
npm install
```

**5. Install PM2:**
```bash
npm install -g pm2
pm2 start server.js --name "eduif"
pm2 startup
pm2 save
```

**6. Setup SSL (Free with Let's Encrypt):**
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
```

**7. Configure Nginx:**
```bash
# (same as AWS EC2 section above)
```

**URL**: https://your-domain.com (with SSL!)

---

## 5️⃣ RAILWAY.APP (Modern & Easy)

**1. Go to railway.app**

**2. Login with GitHub**

**3. Create New Project**

**4. Connect GitHub Repository**

**5. Configure Environment Variables:**
```
NODE_ENV = production
PORT = 3000
```

**6. Deploy automatically on push!**

**URL**: Your Railway app URL (auto-assigned)

---

## 6️⃣ RENDER.COM (Free Option)

**1. Create Account at render.com**

**2. Connect GitHub**

**3. Create New Web Service**

**4. Select Node**

**5. Set:**
- Build: `npm install`
- Start: `npm start`

**6. Deploy!**

**URL**: Your Render domain (free with .onrender.com)

---

## 🔐 PRODUCTION SETUP CHECKLIST

Before deploying to production:

### Security
- [ ] Change default passwords in `data/users.json`
- [ ] Update encryption key in `utils/encryption.js`
- [ ] Enable HTTPS/SSL certificate
- [ ] Set `secure: true` in session cookie
- [ ] Set NODE_ENV=production
- [ ] Add HELMET.js for security headers
- [ ] Enable CORS properly
- [ ] Add rate limiting

### Configuration
- [ ] Use environment variables (.env file)
- [ ] Set up database (MongoDB, PostgreSQL)
- [ ] Configure email service
- [ ] Setup backup system
- [ ] Enable logging to persistent storage

### Performance
- [ ] Enable caching
- [ ] Minify CSS/JS
- [ ] Use CDN for assets
- [ ] Optimize images
- [ ] Enable gzip compression

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Enable uptime monitoring
- [ ] Setup performance monitoring
- [ ] Configure alerts

---

## 📝 ENVIRONMENT VARIABLES (.env)

Create `.env` file:
```
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-char-encryption-key
DB_HOST=your-database-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
ADMIN_EMAIL=admin@example.com
```

Update `server.js` to use:
```javascript
require('dotenv').config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const PORT = process.env.PORT || 3000;
```

Install dotenv:
```
npm install dotenv
```

---

## 📊 RECOMMENDED DEPLOYMENT STACK

**For Small Deployments:**
- Hosting: Railway.app or Render.com (free)
- Database: MongoDB Atlas (free tier)
- Status: ✅ Simple, no credit card needed

**For Medium Deployments:**
- Hosting: DigitalOcean ($5/month)
- Database: DigitalOcean Managed Database
- SSL: Let's Encrypt (free)
- Email: SendGrid (free tier)
- Monitoring: New Relic (free)

**For Enterprise:**
- Hosting: AWS ECS or Kubernetes
- Database: AWS RDS or PostgreSQL
- SSL: AWS Certificate Manager
- CDN: CloudFront or Cloudflare
- Monitoring: CloudWatch + DataDog

---

## 🔧 DATABASE MIGRATION

Current setup uses JSON files. For production, use a real database:

### MongoDB (Cloud)
**1. Create Atlas account** (free tier: 512MB)

**2. Install mongoose:**
```
npm install mongoose
```

**3. Update server.js:**
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  email: String,
  name: String,
  loginAttempts: Number,
  locked: Boolean
});

const User = mongoose.model('User', userSchema);
```

---

## 📈 SCALING

**Step 1: Load Balancing**
- Use AWS ELB or Nginx load balancer
- Deploy multiple instances
- Share sessions using Redis

**Step 2: Caching**
```javascript
npm install redis
```

**Step 3: Database Optimization**
- Add indexes
- Optimize queries
- Use connection pooling

---

## ⚠️ COMMON DEPLOYMENT ISSUES

### Issue: Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID [PID] /F
```

### Issue: Module Not Found in Production
```bash
# Install production dependencies only
npm install --production
```

### Issue: File Permissions
```bash
# Make files readable/writable
chmod -R 755 logs/
chmod -R 755 data/
```

### Issue: Database Connection Fails
```
- Check connection string
- Verify database credentials
- Check firewall rules
- Ensure database is running
```

---

## 📚 DEPLOYMENT COMMANDS SUMMARY

```bash
# Local Development
npm start

# Production Build
npm install --production

# Run with PM2
pm2 start server.js --name "eduif"
pm2 logs
pm2 stop eduif
pm2 restart eduif

# Heroku Deploy
git push heroku main

# AWS Deploy
eb deploy

# DigitalOcean Deploy
git push origin main
(auto-deploys if connected)
```

---

## 🌐 DOMAIN & DNS

1. **Buy Domain:**
   - Namehost.com
   - GoDaddy.com
   - Cloudflare.com

2. **Point to Your Server:**
   - Get your server IP/address
   - Update DNS A record
   - Wait for propagation (5-48 hours)

3. **Example DNS Setup:**
   ```
   Type: A
   Name: @
   Value: your-server-ip
   
   Type: CNAME
   Name: www
   Value: your-domain.com
   ```

---

## ✅ POST-DEPLOYMENT

**1. Test Login:**
- Visit your domain
- Login with admin/admin123
- Test all features

**2. Monitor Performance:**
- Check response times
- Monitor CPU/Memory
- Review error logs

**3. Setup Backups:**
- Daily database backups
- Weekly code backups
- Monthly archives

**4. Security Scan:**
- Run penetration testing
- Check SSL certificate
- Review security headers

---

## 📞 DEPLOYMENT SUPPORT

**Need Help?**

1. **Heroku Issues**: https://devcenter.heroku.com/
2. **AWS Issues**: https://docs.aws.amazon.com/
3. **DigitalOcean Issues**: https://docs.digitalocean.com/
4. **Node.js Issues**: https://nodejs.org/docs/

---

## 🎯 QUICKEST DEPLOYMENT (5 minutes)

**Best Option: Railway.app**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Deploy
railway up

# Done! Your app is live!
```

---

**Choose one deployment option above and let me know which one you want to use. I can help you set it up!**

**Recommended for beginners**: Railway.app or Render.com (easiest)  
**Recommended for more control**: DigitalOcean
**Recommended for enterprise**: AWS

Which would you like to deploy to? 🚀
