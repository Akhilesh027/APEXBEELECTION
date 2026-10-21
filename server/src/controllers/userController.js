import { User } from '../models/User.js';
import { recordAuditLog } from '../middleware/auditLogger.js';

// @desc    Get all users (Admins & Viewers)
// @route   GET /api/users
// @access  Private (SUPER_ADMIN only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create an Admin or Viewer
// @route   POST /api/users
// @access  Private (SUPER_ADMIN only)
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, assignedConstituency } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, and role',
      });
    }

    if (!['ADMIN', 'VIEWER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin can only create ADMIN or VIEWER roles',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      assignedConstituency: assignedConstituency || 'ALL',
      createdBy: req.user._id,
    });

    // Record audit log
    await recordAuditLog({
      req,
      actionType: 'USER_CREATE',
      targetEntity: 'USER',
      targetId: newUser._id,
      details: `Super Admin created a new ${role} account: ${fullName} (${email})`,
      changesDiff: {
        createdUser: {
          id: newUser._id,
          fullName,
          email,
          role,
          assignedConstituency: newUser.assignedConstituency,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `New ${role} created successfully`,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        assignedConstituency: newUser.assignedConstituency,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle User Status (ACTIVE / SUSPENDED)
// @route   PATCH /api/users/:id/status
// @access  Private (SUPER_ADMIN only)
export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot suspend Super Admin account' });
    }

    const previousStatus = user.status;
    const newStatus = req.body.status || (previousStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    user.status = newStatus;
    await user.save();

    await recordAuditLog({
      req,
      actionType: 'USER_STATUS_CHANGE',
      targetEntity: 'USER',
      targetId: user._id,
      details: `Status of ${user.fullName} (${user.role}) changed from ${previousStatus} to ${newStatus}`,
      changesDiff: { previousStatus, newStatus },
    });

    res.json({
      success: true,
      message: `User status changed to ${newStatus}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a User
// @route   DELETE /api/users/:id
// @access  Private (SUPER_ADMIN only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot delete Super Admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      req,
      actionType: 'USER_DELETE',
      targetEntity: 'USER',
      targetId: req.params.id,
      details: `Super Admin deleted ${user.role} user: ${user.fullName} (${user.email})`,
      changesDiff: { deletedUser: { fullName: user.fullName, email: user.email, role: user.role } },
    });

    res.json({ success: true, message: 'User account removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
