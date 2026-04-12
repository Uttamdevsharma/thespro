import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.error('User not found for token id:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      console.log('User populated in protect middleware:', req.user.email);

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      res.status(401).json({ message: 'Not authorized, token failed', detail: error.message });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('Authorizing roles. User role:', req.user.role, 'Required roles:', roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

const committee = authorizeRoles('committee');

export { protect, authorizeRoles, committee };