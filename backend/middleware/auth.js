const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    return next();
  } catch (error) {
    return next();
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: `Access denied. Allowed roles: ${roles.join(', ')}` });
  }
};

const adminOnly = authorizeRoles('admin');
const doctorOnly = authorizeRoles('doctor', 'admin');
const doctorOrAdmin = doctorOnly;

const requireDoctorProfile = async (req, res, next) => {
  try {
    if (req.user?.role === 'admin') {
      return next();
    }
    const doctor = await Doctor.findOne({ user: req.user?._id });
    if (!doctor) {
      return res.status(403).json({ message: 'Doctor profile not found for this account' });
    }
    req.doctorProfile = doctor;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  protect,
  optionalProtect,
  authorizeRoles,
  adminOnly,
  doctorOnly,
  doctorOrAdmin,
  requireDoctorProfile,
};
