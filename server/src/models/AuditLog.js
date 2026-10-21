import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    // Actor Information
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorEmail: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'],
      required: true,
      index: true,
    },
    // Action Type
    actionType: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_STATUS_CHANGE',
        'USER_DELETE',
        'VOTER_ADD',
        'VOTER_UPDATE',
        'VOTER_DELETE',
        'VOTER_SEARCH',
        'EXPORT_REPORT',
      ],
      required: true,
      index: true,
    },
    targetEntity: {
      type: String,
      enum: ['USER', 'VOTER', 'SYSTEM', 'AUTH'],
      required: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      required: true,
    },
    changesDiff: {
      previous: { type: mongoose.Schema.Types.Mixed, default: null },
      current: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    // Network & Telemetry (Track IP, Device, Location)
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    deviceInfo: {
      browser: { type: String, default: 'Unknown' },
      os: { type: String, default: 'Unknown' },
      device: { type: String, default: 'Desktop' },
    },
    location: {
      city: { type: String, default: 'Local/Internal' },
      region: { type: String, default: 'Local' },
      country: { type: String, default: 'IN' },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only immutable log
  }
);

// High-speed index on timestamp for live audit stream
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
