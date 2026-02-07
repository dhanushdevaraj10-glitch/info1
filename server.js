const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Import custom utilities
const { hashPassword, verifyPassword } = require('./utils/security');
const { logActivity, getActivityLog } = require('./utils/logging');
const { encryptData, decryptData } = require('./utils/encryption');
const malwareScan = require('./utils/malwareScan');
const loginAttempt = require('./middleware/loginAttempt');
const roleCheck = require('./middleware/roleCheck');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: 'eduif-security-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Initialize data files
const usersFile = path.join(__dirname, 'data', 'users.json');
const logsFile = path.join(__dirname, 'logs', 'activity.log');

if (!fs.existsSync(usersFile)) {
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: hashPassword('admin123'),
      role: 'admin',
      email: 'admin@eduif.com',
      name: 'Administrator',
      loginAttempts: 0,
      locked: false
    },
    {
      id: 2,
      username: 'staff',
      password: hashPassword('staff123'),
      role: 'staff',
      email: 'staff@eduif.com',
      name: 'Staff Member',
      loginAttempts: 0,
      locked: false
    },
    {
      id: 3,
      username: 'student',
      password: hashPassword('student123'),
      role: 'student',
      email: 'student@eduif.com',
      name: 'Student User',
      loginAttempts: 0,
      locked: false
    }
  ];
  fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
}

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: null });
  }
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: null });
  }
});

app.post('/api/login', loginAttempt, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const user = users.find(u => u.username === username);

  if (!user) {
    logActivity(username, 'LOGIN_FAILED', 'User not found', logsFile);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.locked) {
    logActivity(username, 'LOGIN_BLOCKED', 'Account locked due to multiple failed attempts', logsFile);
    return res.status(403).json({ success: false, message: 'Account is locked. Contact administrator.' });
  }

  if (verifyPassword(password, user.password)) {
    // Reset login attempts on successful login
    user.loginAttempts = 0;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name
    };

    logActivity(username, 'LOGIN_SUCCESS', `User logged in as ${user.role}`, logsFile);
    return res.json({ success: true, message: 'Login successful', role: user.role });
  } else {
    // Increment failed attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    
    if (user.loginAttempts >= 3) {
      user.locked = true;
      logActivity(username, 'ACCOUNT_LOCKED', 'Account locked after 3 failed attempts', logsFile);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      return res.status(403).json({ success: false, message: 'Account locked after 3 failed attempts' });
    }

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    logActivity(username, 'LOGIN_FAILED', `Attempt ${user.loginAttempts}/3`, logsFile);
    return res.status(401).json({ 
      success: false, 
      message: `Invalid password. ${3 - user.loginAttempts} attempts remaining` 
    });
  }
});

app.get('/dashboard', roleCheck.requireLogin, (req, res) => {
  const role = req.session.user.role;
  logActivity(req.session.user.username, 'DASHBOARD_ACCESS', `Accessing ${role} dashboard`, logsFile);
  
  if (role === 'admin') {
    res.render('admin-dashboard', { user: req.session.user });
  } else if (role === 'staff') {
    res.render('staff-dashboard', { user: req.session.user });
  } else {
    res.render('student-dashboard', { user: req.session.user });
  }
});

// API Endpoints
app.get('/api/users', roleCheck.requireRole('admin'), (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  logActivity(req.session.user.username, 'VIEW_USERS', 'Admin viewed all users', logsFile);
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    email: u.email,
    locked: u.locked
  })));
});

app.post('/api/unlock-user/:id', roleCheck.requireRole('admin'), (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (user) {
    user.loginAttempts = 0;
    user.locked = false;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    logActivity(req.session.user.username, 'USER_UNLOCKED', `User ${user.username} unlocked by admin`, logsFile);
    res.json({ success: true, message: 'User unlocked' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

app.get('/api/activity-log', roleCheck.requireRole('admin'), (req, res) => {
  if (fs.existsSync(logsFile)) {
    const logs = fs.readFileSync(logsFile, 'utf8').split('\n').filter(l => l).map(l => JSON.parse(l));
    logActivity(req.session.user.username, 'VIEW_LOGS', 'Admin viewed activity logs', logsFile);
    res.json(logs.slice(-50)); // Last 50 activities
  } else {
    res.json([]);
  }
});

app.get('/api/student-data', roleCheck.requireLogin, (req, res) => {
  const studentDataFile = path.join(__dirname, 'data', 'student-data.json');
  
  logActivity(req.session.user.username, 'ACCESS_DATA', 'User accessed student data', logsFile);
  
  if (fs.existsSync(studentDataFile)) {
    const encryptedData = JSON.parse(fs.readFileSync(studentDataFile, 'utf8'));
    const decrypted = decryptData(encryptedData.data);
    res.json({ success: true, data: decrypted });
  } else {
    res.json({ success: false, message: 'No data found' });
  }
});

app.post('/api/malware-scan', roleCheck.requireRole('admin'), (req, res) => {
  const { filename } = req.body;
  const result = malwareScan(filename);
  logActivity(req.session.user.username, 'MALWARE_SCAN', `Scanned file: ${filename}`, logsFile);
  res.json(result);
});

app.post('/api/logout', (req, res) => {
  logActivity(req.session.user?.username || 'unknown', 'LOGOUT', 'User logged out', logsFile);
  req.session.destroy();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n✅ EduIF Security System running at http://localhost:${PORT}`);
  console.log(`🔐 Default Credentials:`);
  console.log(`   Admin: admin / admin123`);
  console.log(`   Staff: staff / staff123`);
  console.log(`   Student: student / student123\n`);
});
