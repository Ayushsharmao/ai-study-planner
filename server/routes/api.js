import express from 'express';
import * as authCtrl from '../controllers/authController.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as subjectCtrl from '../controllers/subjectController.js';
import * as deadlineCtrl from '../controllers/deadlineController.js';
import * as availCtrl from '../controllers/availabilityController.js';
import * as scheduleCtrl from '../controllers/scheduleController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { storage } from '../services/storage.js';

const router = express.Router();

// Health check (public)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: 'active' });
});

// Public site announcement & settings
router.get('/public-settings', (req, res) => {
  const settings = storage.getSiteSettings();
  res.json({
    success: true,
    data: {
      siteName: settings.siteName,
      announcementText: settings.announcementText,
      announcementActive: settings.announcementActive,
      allowRegistration: settings.allowRegistration
    }
  });
});

// Auth Routes (public)
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/google', authCtrl.googleAuth);
router.get('/auth/me', requireAuth, authCtrl.getMe);

// Admin Routes (protected: requireAuth + requireAdmin)
router.get('/admin/stats', requireAuth, requireAdmin, adminCtrl.getPlatformStats);
router.get('/admin/users', requireAuth, requireAdmin, adminCtrl.getUsers);
router.patch('/admin/users/:id/role', requireAuth, requireAdmin, adminCtrl.updateUserRole);
router.delete('/admin/users/:id', requireAuth, requireAdmin, adminCtrl.deleteUser);
router.get('/admin/settings', requireAuth, requireAdmin, adminCtrl.getSiteSettings);
router.put('/admin/settings', requireAuth, requireAdmin, adminCtrl.updateSiteSettings);

// Student Data Routes (protected: requireAuth)
// Subjects
router.get('/subjects', requireAuth, subjectCtrl.getSubjects);
router.get('/subjects/:id', requireAuth, subjectCtrl.getSubjectById);
router.post('/subjects', requireAuth, subjectCtrl.createSubject);
router.put('/subjects/:id', requireAuth, subjectCtrl.updateSubject);
router.delete('/subjects/:id', requireAuth, subjectCtrl.deleteSubject);

// Deadlines
router.get('/deadlines', requireAuth, deadlineCtrl.getDeadlines);
router.post('/deadlines', requireAuth, deadlineCtrl.createDeadline);
router.put('/deadlines/:id', requireAuth, deadlineCtrl.updateDeadline);
router.delete('/deadlines/:id', requireAuth, deadlineCtrl.deleteDeadline);
router.patch('/deadlines/:id/toggle', requireAuth, deadlineCtrl.toggleDeadline);

// Availability
router.get('/availability', requireAuth, availCtrl.getAvailability);
router.put('/availability', requireAuth, availCtrl.updateAvailability);

// Schedule
router.get('/schedule', requireAuth, scheduleCtrl.getSchedule);
router.post('/schedule/generate', requireAuth, scheduleCtrl.generateSchedule);
router.post('/schedule/rebalance', requireAuth, scheduleCtrl.rebalanceSchedule);
router.patch('/schedule/:id/toggle', requireAuth, scheduleCtrl.toggleSession);
router.put('/schedule/:id', requireAuth, scheduleCtrl.updateSession);
router.delete('/schedule/:id', requireAuth, scheduleCtrl.deleteSession);

// Analytics
router.get('/analytics', requireAuth, analyticsCtrl.getAnalytics);

export default router;
