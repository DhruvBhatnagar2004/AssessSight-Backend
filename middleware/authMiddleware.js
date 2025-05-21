const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token, proceed as guest (some routes allow guests)
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      req.user = null;
      return next();
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;