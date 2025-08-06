const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - requires valid JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
      const decoded = jwt.verify(token, secret);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          error: 'Not authorized, user not found'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          error: 'Account has been deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token'
        });
      }

      return res.status(401).json({
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Not authorized, no token provided'
    });
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authorized'
      });
    }

    // Allow if user is admin
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource && req.resource[resourceUserField] 
      ? req.resource[resourceUserField].toString() 
      : req.params.userId || req.body.userId;

    if (req.user._id.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Not authorized to access this resource'
    });
  };
};

// Middleware to check if user can access their own data
const authorizeSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Not authorized'
    });
  }

  // Allow if user is admin
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user is accessing their own data
  const requestedUserId = req.params.id || req.params.userId;
  
  if (req.user._id.toString() === requestedUserId) {
    return next();
  }

  return res.status(403).json({
    error: 'Not authorized to access this resource'
  });
};

// Middleware to generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Middleware to verify token without throwing error (for optional auth)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we don't throw error
      req.user = null;
    }
  }

  next();
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Not authorized'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Email verification required'
    });
  }

  next();
};

// Middleware to update user's last active date
const updateLastActive = async (req, res, next) => {
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        lastActiveDate: new Date()
      });
    } catch (error) {
      console.error('Error updating last active date:', error);
    }
  }
  next();
};

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  authorizeSelf,
  generateToken,
  optionalAuth,
  requireVerified,
  updateLastActive
}; 