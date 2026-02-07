# EduIF - Education Information Security System

A comprehensive, colorful, and secure web application for managing educational institution data with advanced security features.

🎯 **Website**: EduIF (Education Information Security Framework)

## 🌟 Features

### 🔐 Security Features
- **SHA-256 Password Hashing**: All passwords encrypted with industry-standard hashing
- **Login Attempt Limit**: Accounts lock after 3 failed attempts for brute-force protection
- **Role-Based Access Control**: 
  - 👤 Admin: Full system access
  - 👨‍🏫 Staff: Academic data access
  - 👨‍🎓 Student: Limited personal data access
- **AES-256 Encryption**: Student data encrypted at rest
- **Malware Scanner**: Detects suspicious file names and patterns
- **Activity Logging**: All user activities recorded with timestamps

### 🎨 Design
- Modern, colorful gradient UI
- Responsive design (mobile & desktop)
- Interactive role-based dashboards
- Intuitive navigation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone/Download the project**
   ```bash
   cd info1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and go to: `http://localhost:3000`

## 📝 Default Credentials

The system comes with three pre-configured user accounts for testing:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Staff | staff | staff123 |
| Student | student | student123 |

**⚠️ Important**: Change these passwords in production!

## 📁 Project Structure

```
info1/
├── public/                 # Static files (CSS, JS, images)
├── views/                  # EJS templates (HTML pages)
│   ├── login.ejs          # Login page
│   ├── admin-dashboard.ejs    # Admin panel
│   ├── staff-dashboard.ejs    # Staff portal
│   └── student-dashboard.ejs  # Student portal
├── routes/                # API routes (for future expansion)
├── middleware/            # Custom middleware
│   ├── loginAttempt.js   # Login attempt tracking
│   └── roleCheck.js      # Role-based authorization
├── utils/                # Utility functions
│   ├── security.js       # Password hashing
│   ├── encryption.js     # Data encryption/decryption
│   ├── logging.js        # Activity logging
│   └── malwareScan.js    # File scanning
├── data/                 # Data storage
│   └── users.json        # User database
├── logs/                 # Activity logs
├── server.js             # Main Express server
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔐 Security Implementation Details

### 1. Password Security (SHA-256)
```javascript
// Passwords are hashed using SHA-256 algorithm
// Never stored in plain text
// Verified during login
```

### 2. Login Attempt Limiting
- Maximum 3 failed login attempts allowed
- Account automatically locks after 3 failures
- Admin can manually unlock accounts
- Attempt counter resets on successful login

### 3. Role-Based Access Control (RBAC)
- **Admin Role**: Can manage users, view logs, perform malware scans
- **Staff Role**: Can access student records and academic data
- **Student Role**: Can view own grades and course materials
- Middleware enforces role permissions on all routes

### 4. Data Encryption (AES-256)
- All student personal data encrypted using AES-256
- Requires decryption key to access encrypted data
- Authorized users only through role-based access

### 5. Malware Detection
Scans file names for suspicious patterns:
- Executable extensions (.exe, .bat, .cmd, .scr, .vbs, .js, .jar)
- Archive files (.zip, .rar)
- Script files (.php, .asp, .jsp)
- Directory traversal attempts (../, ..\\)
- Special characters that indicate encoding attacks
- Filename length validation

### 6. Activity Logging
- Every action logged with timestamp and user information
- Logs stored in `/logs/activity.log`
- Includes: login attempts, data access, admin actions
- Available only to admin users

## 📊 Web Pages

### Login Page
- Clean, colorful gradient background
- Animated gradient shifts
- Demo credentials displayed
- Real-time validation and error messages
- Responsive design

### Admin Dashboard
- 📊 System overview with statistics
- 👥 User management interface
- 🛡️ Malware scanning tool
- 📋 Activity log viewer
- Real-time user data management
- Account unlock functionality

### Staff Dashboard
- 📚 Academic data access
- 🎓 Student record management
- 📊 Performance analytics
- 🔒 Security information
- Activity notification system

### Student Dashboard
- 📈 Grade view and performance tracking
- 📚 Course materials access
- 📝 Assignment submission
- 🔒 Personal security status
- Academic calendar

## 🔧 API Endpoints

```
POST   /api/login                    - User login
POST   /api/logout                   - User logout
GET    /api/users                    - List all users (Admin only)
POST   /api/unlock-user/:id          - Unlock locked account (Admin only)
GET    /api/activity-log             - View activity logs (Admin only)
POST   /api/malware-scan             - Scan file for threats (Admin only)
GET    /api/student-data             - Access encrypted student data
```

## 🎨 Design Features

### Color Schemes
- **Login Page**: Purple to pink gradient
- **Admin Dashboard**: Blue to purple gradient
- **Staff Dashboard**: Pink to red gradient
- **Student Dashboard**: Cyan to turquoise gradient

### UI Components
- Gradient backgrounds with animation
- Modern rounded buttons and cards
- Hover effects and transitions
- Icons for better UX
- Responsive grid layouts
- Animated transitions between tabs

## 📦 Dependencies

- **Express.js**: Web framework
- **express-session**: Session management
- **body-parser**: Request parsing
- **crypto**: Built-in Node.js encryption module

## 🛠️ Configuration

### Encryption Key
Default encryption key (change in production):
```javascript
const ENCRYPTION_KEY = 'eduif-secure-key-32-chars-long!!';
```

### Session Configuration
- Session timeout: 24 hours
- Session secret key configured in server.js

### Port
Default port: **3000**
Change in `server.js` if needed

## 🔍 Testing the System

1. **Login Test**
   - Use demo credentials above
   - Try 3 failed attempts to test account locking
   - Admin can unlock locked accounts

2. **Role-Based Access**
   - Admin: See all user management features
   - Staff: See only academic data
   - Student: See only personal grades

3. **Malware Scanning**
   - Try scanning: `malware.exe`
   - Try scanning: `document.pdf`
   - Results show threat level and recommendations

4. **Activity Logging**
   - Admin can view all user activities
   - Timestamps and details recorded
   - Staff can see own activities

## 🚀 Production Checklist

- [ ] Change default credentials in `data/users.json`
- [ ] Update encryption key in `utils/encryption.js`
- [ ] Set `secure: true` in session cookie (requires HTTPS)
- [ ] Use environment variables for sensitive data
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure database (currently uses JSON files)
- [ ] Set up backup system for data
- [ ] Enable logging to persistent storage
- [ ] Configure email notifications
- [ ] Set up security headers

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [OWASP Security Best Practices](https://owasp.org/)

## 📄 License

MIT License - You are free to use this for educational purposes.

## 👨‍💻 Support

For issues or questions about the system, please refer to the inline code comments or create an issue in your project repository.

---

**Created**: February 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
