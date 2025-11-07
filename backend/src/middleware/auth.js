/**
 * Authentication middleware
 * Validates JWT tokens and protects routes
 */

import jwt from 'jsonwebtoken';

/**
 * Verify JWT token and attach user info to request
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please login again.',
      });
    }
    
    return res.status(403).json({
      success: false,
      error: 'Invalid token. Please login again.',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }

  next();
}

/**
 * Check if authenticated user matches resource owner
 */
export function authorizeUser(req, res, next) {
  const userId = parseInt(req.params.userId, 10);
  
  if (!req.user || req.user.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own data.',
    });
  }

  next();
}

export default {
  authenticateToken,
  optionalAuth,
  authorizeUser,
};

