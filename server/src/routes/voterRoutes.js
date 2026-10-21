import express from 'express';
import {
  getVoters,
  getVoterById,
  createVoter,
  updateVoter,
  deleteVoter,
  bulkImportVoters,
  uploadVoterPhoto,
  getCloudinarySignature,
} from '../controllers/voterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Viewers, Admins, and Super Admins can list and view voter records
router.get('/', getVoters);
router.get('/cloudinary-sign', authorize('SUPER_ADMIN', 'ADMIN'), getCloudinarySignature);
router.get('/:id', getVoterById);

// Only Admins and Super Admins can add, edit, or upload voter photos
router.post('/upload-photo', authorize('SUPER_ADMIN', 'ADMIN'), uploadVoterPhoto);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createVoter);
router.post('/bulk-import', authorize('SUPER_ADMIN', 'ADMIN'), bulkImportVoters);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), updateVoter);

// Only Super Admin can delete voter records
router.delete('/:id', authorize('SUPER_ADMIN'), deleteVoter);

export default router;
