# 🚀 EduIF Quick Start Guide

## Installation (One-Time Setup)

```powershell
# 1. Navigate to project folder
cd "c:\Users\dhanush\OneDrive\Documents\New folder\info1"

# 2. Install dependencies (already done)
npm install

# 3. Start the server
npm start
```

**That's it!** The server will start on http://localhost:3000

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| 👤 Admin | admin | admin123 |
| 👨‍🏫 Staff | staff | staff123 |
| 👨‍🎓 Student | student | student123 |

---

## 🎯 What to Try First

### As Admin:
1. Click "User Management" tab
2. See all users and their lock status
3. Go to "Malware Scan" tab
4. Try scanning: `malware.exe` or `document.pdf`
5. Check "Activity Logs" tab for all system events

### As Staff:
1. See student academic records
2. View course materials
3. Check security features overview
4. See your activity traces

### As Student:
1. View your grades and GPA
2. See enrolled courses
3. Check your security status
4. View your schedule

---

## 🔐 Test Feature: Login Attempt Limiting

1. Go to login (or logout first)
2. Try wrong password 3 times
3. Account locks automatically
4. Login as admin
5. Go to "User Management"
6. Find locked user and click "Unlock"

---

## 🛡️ Test Feature: Malware Scanner

Try these filenames in Malware Scan tab:
- ✅ `document.pdf` → SAFE
- ✅ `image.jpg` → SAFE
- ❌ `malware.exe` → HIGH THREAT
- ❌ `virus.bat` → HIGH THREAT
- ❌ `../../etc/passwd` → MEDIUM THREAT

---

## 📁 Project Location

```
c:\Users\dhanush\OneDrive\Documents\New folder\info1\
```

---

## 🎨 Features at a Glance

✅ SHA-256 Password Hashing
✅ 3-Strike Login Lock System
✅ Role-Based Access Control
✅ AES-256 Data Encryption
✅ Malware File Detection
✅ Complete Activity Logging
✅ Beautiful Colorful UI
✅ Responsive Design
✅ Professional Dashboards

---

## 📞 Troubleshooting

**Server won't start?**
- Make sure Node.js is installed: `node --version`
- Check port 3000 is free
- Try running server again

**Can't login?**
- Use exact credentials from table above
- Check username and password spelling
- Clear browser cache if needed

**Port 3000 already in use?**
- Find process using port 3000
- Kill it or change port in server.js

---

**Server Ready**: Type `npm start` when ready!
**Date Created**: February 7, 2026
**Version**: 1.0.0
