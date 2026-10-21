import express from 'express';
import {
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All user management routes strictly require SUPER_ADMIN role
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id/status')
  .patch(updateUserStatus);

router.route('/:id')
  .delete(deleteUser);

export default router;
