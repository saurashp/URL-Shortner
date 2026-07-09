import express from 'express';
import {
  getAdminStats,
  listAllUrls,
  toggleUrlStatus,
  deleteSuspiciousUrl,
  listAllUsers,
  toggleUserStatus,
  deleteUser
} from '../controllers/admin.controller.js';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// Apply auth and isAdmin globally to all administration endpoints
router.use(auth);
router.use(isAdmin);

// --- URL Management ---
// Route to fetch dashboard counts and analytics
router.get('/stats', getAdminStats);

// Route to view all shortened URL documents
router.get('/urls', listAllUrls);

// Route to enable/disable URL redirection (status check toggle)
router.patch('/urls/:code/status', toggleUrlStatus);

// Route to delete a suspicious URL mapping (purges analytics)
router.delete('/urls/:code', deleteSuspiciousUrl);

// --- User Management ---
// Route to list all platform registered users with URLs & click telemetry counts
router.get('/users', listAllUsers);

// Route to enable/disable a user account
router.patch('/users/:id/status', toggleUserStatus);

// Route to delete a user account and all their data
router.delete('/users/:id', deleteUser);

export default router;
