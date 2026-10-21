import { AuditLog } from '../models/AuditLog.js';

// Helper to extract clean IP address
export const extractClientIp = (req) => {
  let ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Normalize local loopback addresses
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1 (Localhost)';
  }

  return ip;
};

// Simple User Agent parser helper
export const parseUserAgent = (uaString = '') => {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (/mobile/i.test(uaString)) device = 'Mobile';
  else if (/tablet|ipad/i.test(uaString)) device = 'Tablet';

  if (/chrome|crios/i.test(uaString) && !/edg/i.test(uaString)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(uaString)) browser = 'Firefox';
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = 'Safari';
  else if (/edg/i.test(uaString)) browser = 'Edge';

  if (/windows/i.test(uaString)) os = 'Windows';
  else if (/android/i.test(uaString)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
  else if (/linux/i.test(uaString)) os = 'Linux';

  return { browser, os, device };
};

// Core audit recorder
export const recordAuditLog = async ({
  req,
  actor,
  actionType,
  targetEntity,
  targetId = null,
  details,
  changesDiff = {},
}) => {
  try {
    const user = actor || req.user;
    if (!user) return null;

    const ipAddress = extractClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Direct API Call';
    const deviceInfo = parseUserAgent(userAgent);

    const logEntry = new AuditLog({
      actorId: user._id,
      actorName: user.fullName,
      actorEmail: user.email,
      actorRole: user.role,
      actionType,
      targetEntity,
      targetId: targetId ? targetId.toString() : null,
      details,
      changesDiff,
      ipAddress,
      userAgent,
      deviceInfo,
      location: {
        city: ipAddress.includes('127.0.0.1') ? 'Local Workstation' : 'Regional Network',
        region: 'State Operations',
        country: 'IN',
      },
    });

    await logEntry.save();
    return logEntry;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
    return null;
  }
};
