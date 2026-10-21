import express from 'express';
import { getAuditLogs, getAuditAnalytics } from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Audit logs are exclusively accessible to Super Admin
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/', getAuditLogs);
router.get('/analytics', getAuditAnalytics);

export default router;
