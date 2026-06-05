const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT access token.
 * Expiry is controlled via JWT_EXPIRE in .env (e.g. "7d").
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/** Strips HTML/script tags to prevent stored XSS */
const sanitize = (str) => (typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim() : str);

/** POST /api/auth/register */
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role, phone,
      age, gender, address, medicalHistory,
      specialization, qualification, experience, hospital, consultationFee
    } = req.body;

    // --- Input validation ---
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, password, role, and phone are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be patient or doctor.' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // --- Build user object with sanitized inputs ---
    const userData = {
      name: sanitize(name),
      email: email.toLowerCase(),
      password,
      role,
      phone: sanitize(phone)
    };

    if (role === 'patient') {
      Object.assign(userData, {
        age: age ? Number(age) : undefined,
        gender,
        address: sanitize(address),
        medicalHistory: sanitize(medicalHistory)
      });
    } else if (role === 'doctor') {
      Object.assign(userData, {
        specialization: sanitize(specialization),
        qualification: sanitize(qualification),
        experience: experience ? Number(experience) : undefined,
        hospital: sanitize(hospital),
        consultationFee: consultationFee ? Number(consultationFee) : undefined
      });
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/auth/login */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Select password explicitly since it's excluded by default in some schemas
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      // Generic message — don't reveal whether email exists
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/auth/admin-login */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (String(user.role).toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin accounts can sign in here.' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/auth/me — returns current authenticated user */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PUT /api/auth/profile — update profile (no password change here) */
exports.updateProfile = async (req, res) => {
  try {
    // Prevent role/password escalation via this endpoint
    const { password, role, isApproved, isDisabled, patientId, ...allowedUpdates } = req.body;

    // Sanitize string fields
    Object.keys(allowedUpdates).forEach((key) => {
      if (typeof allowedUpdates[key] === 'string') {
        allowedUpdates[key] = sanitize(allowedUpdates[key]);
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedUpdates },
      { new: true, runValidators: false }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
