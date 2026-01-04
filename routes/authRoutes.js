import express from 'express';
import {
  register,
  login,
  getMe,
  updatePassword,
  getAllUsers,
  updateUserRole,
  deleteUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

// Admin only routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;