# 🚀 Deploy EduIF to Vercel - Complete Guide

**Last Updated**: February 7, 2026  
**Difficulty**: Intermediate  
**Time Required**: 30 minutes  

---

## ⚠️ Important: Vercel Limitations for EduIF

Vercel is **serverless** (perfect for APIs & static sites) but **EduIF has challenges**:

| Feature | Serverless Issue | Solution |
|---------|------------------|----------|
| **File Storage** | Files don't persist between requests | Use MongoDB/PostgreSQL |
| **Sessions** | Session memory resets | Use session database |
| **Logs** | activity.log can't be saved to disk | Use database logging |
| **Always-On Server** | Vercel scales to zero when idle | Not ideal for persistent apps |

**Recommendation**: Use **Railway.app** or **Render.com** instead (better for Node.js servers)

But let's make Vercel work! 💪

---

## ✅ What You Need

1. **GitHub Account** → [Sign up free](https://github.com)
2. **Vercel Account** → [Sign up free](https://vercel.com)
3. **MongoDB Account** → [Sign up free](https://www.mongodb.com/cloud/atlas) (for data storage)
4. **Your Code** → EduIF project ready

---

## 🔧 Step 1: Prepare Your Code for Vercel

### 1.1 Create `vercel.json` Configuration File

Create file: `vercel.json` in your project root

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**What this does**:
- Tells Vercel to run Node.js
- Routes all requests to `server.js`
- Sets production environment

### 1.2 Update `package.json`

Make sure you have `engines` section:

```json
{
  "name": "eduif",
  "version": "1.0.0",
  "description": "Educational Institution Security Framework",
  "main": "server.js",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "express-session": "^1.17.3",
    "body-parser": "^1.20.2",
    "crypto": "^1.0.1",
    "mongodb": "^5.0.0"
  }
}
```

---

## 🗄️ Step 2: Setup MongoDB (For Data Storage)

Since Vercel is serverless, we need a **cloud database** instead of JSON files.

### 2.1 Create MongoDB Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Sign Up Free**
3. Create account
4. Verify email

### 2.2 Create Cluster

1. Click **Create Database**
2. Choose **Free Tier (M0)**
3. Select **AWS** or your preferred region
4. Click **Create**
5. Wait 3-5 minutes for cluster to be ready

### 2.3 Create Database User

1. In MongoDB Dashboard → **Database Access**
2. Click **Add New Database User**
3. **Username**: admin
4. **Password**: Create strong password (save it!)
5. **Built-in Role**: Atlas Admin
6. Click **Create Database User**

### 2.4 Get Connection String

1. Click **Clusters** → **Connect**
2. Choose **Drivers** → **Node.js**
3. Copy the connection string
4. Replace `<username>` and `<password>` with your credentials
5. It should look like:
```
mongodb+srv://admin:password@cluster.mongodb.net/eduif?retryWrites=true&w=majority
```

### 2.5 Allow Vercel IP

1. Go to **Network Access** in MongoDB
2. Click **Add IP Address**
3. Choose **Allow Access from Anywhere** (since Vercel IPs vary)
4. Click **Confirm**

---

## 📝 Step 3: Modify Server Code for MongoDB

### 3.1 Install MongoDB Package

```bash
npm install mongodb
```

### 3.2 Create `config/mongodb.js`

```javascript
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
let db = null;
let client = null;

async function connectDB() {
  if (db) return db;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('eduif');
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

async function getUsersCollection() {
  const database = await connectDB();
  return database.collection('users');
}

async function getLogsCollection() {
  const database = await connectDB();
  return database.collection('logs');
}

module.exports = {
  connectDB,
  getUsersCollection,
  getLogsCollection
};
```

### 3.3 Update `server.js` - Replace JSON with MongoDB

Replace the JSON file reading sections with MongoDB calls:

**FIND THIS (around line 50-80):**
```javascript
// Old way - reading users from JSON file
const usersFile = 'data/users.json';
let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  // ... rest of login code
});
```

**REPLACE WITH (using MongoDB):**
```javascript
const { connectDB, getUsersCollection } = require('./config/mongodb');
const { hashPassword, verifyPassword } = require('./utils/security');

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const usersCollection = await getUsersCollection();
    
    const user = await usersCollection.findOne({ username: username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      // Increment login attempts
      await usersCollection.updateOne(
        { username: username },
        { 
          $inc: { loginAttempts: 1 },
          $set: { locked: user.loginAttempts >= 2 }
        }
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset login attempts on successful login
    await usersCollection.updateOne(
      { username: username },
      { $set: { loginAttempts: 0, locked: false } }
    );
    
    req.session.user = user;
    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

### 3.4 Update Activity Logging for MongoDB

**FIND THIS:**
```javascript
function logActivity(username, action) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${username}: ${action}\n`;
  fs.appendFileSync('logs/activity.log', logEntry);
}
```

**REPLACE WITH:**
```javascript
async function logActivity(username, action) {
  try {
    const logsCollection = await getLogsCollection();
    await logsCollection.insertOne({
      timestamp: new Date(),
      username: username,
      action: action
    });
  } catch (error) {
    console.error('Logging error:', error);
  }
}
```

### 3.5 Update Endpoints Using Users Collection

Replace all sections where you read/write users.json with MongoDB calls.

**Example for `/api/users` endpoint:**

OLD:
```javascript
app.get('/api/users', requireRole('admin'), (req, res) => {
  res.json(users);
});
```

NEW:
```javascript
app.get('/api/users', requireRole('admin'), async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## 🔑 Step 4: Setup Environment Variables

### 4.1 Create `.env` File (for local testing)

```bash
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster.mongodb.net/eduif?retryWrites=true&w=majority
SESSION_SECRET=your-secret-key-here-make-it-random-12345
NODE_ENV=production
```

### 4.2 Update `server.js` to Use Environment Variables

Add at the top of server.js:

```javascript
require('dotenv').config();

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-default-secret';

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));
```

### 4.3 Install dotenv

```bash
npm install dotenv
```

---

## 📤 Step 5: Push Code to GitHub

### 5.1 Initialize Git Repository

```bash
cd "c:\Users\dhanush\OneDrive\Documents\New folder\info1"
git init
git config user.email "your@email.com"
git config user.name "Your Name"
```

### 5.2 Create `.gitignore`

Create file: `.gitignore`

```
node_modules/
.env
.env.local
logs/
.DS_Store
*.log
```

### 5.3 Commit and Push

```bash
git add .
git commit -m "Initial commit: EduIF ready for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/eduif.git
git push -u origin main
```

---

## 🌐 Step 6: Deploy to Vercel

### 6.1 Import Project to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Click **Import Git Repository**
4. Select your GitHub `eduif` repository
5. Click **Import**

### 6.2 Configure Environment Variables

1. In Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add:
   ```
   Name: MONGODB_URI
   Value: mongodb+srv://admin:password@cluster.mongodb.net/eduif?retryWrites=true&w=majority
   ```
4. Add:
   ```
   Name: SESSION_SECRET
   Value: your-random-secret-key-here
   ```
5. Add:
   ```
   Name: NODE_ENV
   Value: production
   ```
6. Click **Save**

### 6.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. Get your URL: `https://your-project.vercel.app`

---

## ✅ Step 7: Verify Deployment

### 7.1 Test Your App

```
https://your-project.vercel.app
```

### 7.2 Initialize MongoDB Data

On first visit, add these users to MongoDB:

```bash
# Use MongoDB Atlas UI or create script
# Database: eduif
# Collection: users

// Users to insert:
[
  {
    "username": "admin",
    "password": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    "role": "admin",
    "loginAttempts": 0,
    "locked": false
  },
  {
    "username": "staff",
    "password": "10176e7b7b24d317acfcf8d2064cfd2f24e154f7b5a96603077d5ef813d6a6b6",
    "role": "staff",
    "loginAttempts": 0,
    "locked": false
  },
  {
    "username": "student",
    "password": "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b",
    "role": "student",
    "loginAttempts": 0,
    "locked": false
  }
]
```

### 7.3 Test Login

- URL: `https://your-project.vercel.app`
- Username: `admin`
- Password: `admin123`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'dotenv'"

**Solution**:
```bash
npm install dotenv
git add package.json package-lock.json
git commit -m "Add dotenv"
git push
```

### Issue 2: MongoDB Connection Times Out

**Solution**:
1. Go to MongoDB Atlas → Network Access
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Confirm

### Issue 3: Sessions Not Working

**Solution** - Use MongoDB Session Store:

```bash
npm install connect-mongo
```

Update `server.js`:

```javascript
const MongoStore = require('connect-mongo');
const { MONGODB_URI } = process.env;

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: MONGODB_URI
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax'
  }
}));
```

### Issue 4: Build Fails

**Solution**:
```bash
# Check errors
npm run build

# or view Vercel logs
vercel logs --tail
```

### Issue 5: "PORT 3000 is required"

**Update server.js**:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📊 Vercel Deployment Checklist

- [ ] Created `vercel.json` configuration
- [ ] Installed MongoDB and created account
- [ ] Created cluster and user in MongoDB
- [ ] Obtained MongoDB connection string
- [ ] Allowed Vercel IP in MongoDB Network Access
- [ ] Installed `mongodb` package
- [ ] Created `config/mongodb.js`
- [ ] Updated `server.js` to use MongoDB
- [ ] Updated logging to use MongoDB
- [ ] Created `.env` file with variables
- [ ] Installed `dotenv` package
- [ ] Updated `.gitignore`
- [ ] Pushed code to GitHub
- [ ] Imported project in Vercel
- [ ] Set environment variables in Vercel
- [ ] Deployed to Vercel
- [ ] Verified deployment works
- [ ] Added users to MongoDB
- [ ] Tested login functionality
- [ ] Checked all dashboards work

---

## 🔄 Auto-Deploy on GitHub Push

Vercel automatically deploys when you push to GitHub! 

```bash
# Make changes
# Commit
git add .
git commit -m "Update: Add new feature"

# Push to GitHub
git push

# Vercel automatically deploys! ✨
```

---

## 📈 Monitor & Manage Deployment

### View Logs
```
Vercel Dashboard → Your Project → Functions → Logs
```

### View Deployments
```
Vercel Dashboard → Your Project → Deployments
```

### Rollback to Previous Version
```
Vercel Dashboard → Deployments → Click "..." → Promote to Production
```

### View Database
```
MongoDB Atlas → Clusters → Collections
```

---

## 🚀 Next Steps

### Optional: Add Custom Domain

1. In Vercel → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration steps

### Optional: Add HTTPS

- **Already included!** Vercel provides free HTTPS

### Optional: Setup Monitoring

1. Vercel → Settings → Analytics
2. Enable analytics
3. Monitor traffic and errors

### Optional: Database Backups

1. MongoDB Atlas → Backup
2. Enable automatic backups
3. Choose backup frequency (daily/weekly)

---

## Alternative: Use Railway or Render

If you prefer a simpler deployment:

### Railway.app (Recommended)
- Better for traditional Node.js servers
- File storage support
- Easy MongoDB integration
- Free tier: $5/month credit

### Render.com
- Simple deployment
- Web services (not serverless)
- Excellent for Node.js apps
- Free tier available

See **DEPLOYMENT_GUIDE.md** for Railway/Render instructions.

---

## 📞 Help & Support

**Vercel Issues**: https://vercel.com/help  
**MongoDB Issues**: https://docs.mongodb.com  
**GitHub Issues**: https://docs.github.com  

---

## ✨ Summary

Your EduIF app is now deployed on Vercel with:
- ✅ Cloud database (MongoDB)
- ✅ Auto-scaling infrastructure
- ✅ Free HTTPS
- ✅ Custom domain support
- ✅ Auto-deploy on push
- ✅ Production monitoring

**Your Vercel URL**: `https://your-project.vercel.app` 🎉

---

**Need help?** Check the troubleshooting section or contact Vercel support.
