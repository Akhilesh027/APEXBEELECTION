import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { extractClientIp, recordAuditLog } from '../middleware/auditLogger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};

// @desc    Authenticate User & Login
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact the Super Admin.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const ipAddress = extractClientIp(req);
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    user.lastLoginLocation = ipAddress.includes('127.0.0.1') ? 'Local Workstation' : 'Regional Gateway';
    await user.save();

    // Log the successful login with full IP and device telemetry
    await recordAuditLog({
      req,
      actor: user,
      actionType: 'LOGIN',
      targetEntity: 'AUTH',
      targetId: user._id,
      details: `User logged in successfully from IP: ${ipAddress} as ${user.role}`,
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        assignedConstituency: user.assignedConstituency,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};
