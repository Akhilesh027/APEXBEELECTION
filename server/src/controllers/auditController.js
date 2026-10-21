import { AuditLog } from '../models/AuditLog.js';

// @desc    Get Audit Logs with Advanced Filters (IP, Role, Action, Actor)
// @route   GET /api/audit
// @access  Private (SUPER_ADMIN only)
export const getAuditLogs = async (req, res) => {
  try {
    const {
      role,
      actionType,
      ipAddress,
      search,
      page = 1,
      limit = 30,
    } = req.query;

    const filter = {};

    if (role && role !== 'ALL') {
      filter.actorRole = role;
    }

    if (actionType && actionType !== 'ALL') {
      filter.actionType = actionType;
    }

    if (ipAddress && ipAddress.trim() !== '') {
      filter.ipAddress = new RegExp(ipAddress.trim(), 'i');
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { actorName: regex },
        { actorEmail: regex },
        { details: regex },
        { ipAddress: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('actorId', 'fullName email role status');

    res.json({
      success: true,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Telemetry & IP Analytics Overview
// @route   GET /api/audit/analytics
// @access  Private (SUPER_ADMIN only)
export const getAuditAnalytics = async (req, res) => {
  try {
    const totalActions = await AuditLog.countDocuments();
    
    // Group actions by role
    const actionsByRole = await AuditLog.aggregate([
      { $group: { _id: '$actorRole', count: { $sum: 1 } } },
    ]);

    // Top active IP addresses
    const topIps = await AuditLog.aggregate([
      { $group: { _id: '$ipAddress', count: { $sum: 1 }, lastSeen: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Actions by type
    const actionsByType = await AuditLog.aggregate([
      { $group: { _id: '$actionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Activity in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const actionsLast24h = await AuditLog.countDocuments({ createdAt: { $gte: oneDayAgo } });

    res.json({
      success: true,
      totalActions,
      actionsLast24h,
      actionsByRole,
      topIps,
      actionsByType,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
