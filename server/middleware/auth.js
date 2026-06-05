const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies JWT from Authorization header.
 * Attaches the authenticated user to req.user.
 * Distinguishes between expired tokens and invalid tokens
 * so the client can handle each case appropriately.
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', expired: true });
      }
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

/**
 * authorize — role-based access control.
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const normalizedRoles = roles.map((r) => String(r).toLowerCase());
    const userRole = String(req.user.role || '').toLowerCase();
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`
      });
    }
    next();
  };
};
