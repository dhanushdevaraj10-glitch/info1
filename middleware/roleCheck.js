// Middleware for role-based access control
const roleCheck = {
  requireLogin: (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  },

  requireRole: (requiredRole) => {
    return (req, res, next) => {
      if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const roleHierarchy = {
        'admin': ['admin', 'staff', 'student'],
        'staff': ['staff', 'student'],
        'student': ['student']
      };

      const allowedRoles = roleHierarchy[req.session.user.role] || [];

      if (!allowedRoles.includes(requiredRole)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      next();
    };
  }
};

module.exports = roleCheck;
