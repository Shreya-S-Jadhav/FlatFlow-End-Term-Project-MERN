import User from '../models/User.js';
import Flat from '../models/Flat.js';
import { generateToken, clearTokenCookie } from '../utils/generateToken.js';

// @desc    Authenticate user & get token cookie
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly select password field to verify hash
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('flat');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Contact the society administrator.',
      });
    }

    // Generate JWT and set HttpOnly cookie
    generateToken(res, user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        flat: user.flat,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new resident account
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, flatId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    let flat = null;
    if (flatId) {
      flat = await Flat.findById(flatId);
      if (flat) {
        flat.status = 'occupied';
        await flat.save();
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'resident',
      flat: flat ? flat._id : null,
      phone: phone ? phone.trim() : '',
      status: 'active',
    });

    if (user.flat) {
      await user.populate('flat');
    }

    generateToken(res, user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        flat: user.flat,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public flat list for resident registration
// @route   GET /api/auth/flats
// @access  Public
export const getPublicFlats = async (req, res, next) => {
  try {
    const flats = await Flat.find().sort({ wing: 1, flatNumber: 1 });
    return res.status(200).json({
      success: true,
      flats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Initial admin bootstrap (Only works if 0 admins exist)
// @route   POST /api/auth/bootstrap-admin
// @access  Public (Self-locking)
export const bootstrapAdmin = async (req, res, next) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'System administrator already exists. Use standard login or contact existing admin.',
      });
    }

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required to initialize the administrator.',
      });
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      phone: phone || '',
      status: 'active',
    });

    generateToken(res, admin._id, admin.role);

    return res.status(201).json({
      success: true,
      message: 'Master administrator account initialized successfully.',
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
