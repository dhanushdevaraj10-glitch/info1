const fs = require('fs');
const path = require('path');

// Middleware to track login attempts
const loginAttempt = (req, res, next) => {
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  
  const { username } = req.body;
  
  if (username && fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const user = users.find(u => u.username === username);
    
    if (user && user.locked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is locked due to multiple failed login attempts. Please contact administrator.' 
      });
    }
  }
  
  next();
};

module.exports = loginAttempt;
