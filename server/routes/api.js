import express from 'express';
import * as subjectCtrl from '../controllers/subjectController.js';
import * as deadlineCtrl from '../controllers/deadlineController.js';
import * as availCtrl from '../controllers/availabilityController.js';
import * as scheduleCtrl from '../controllers/scheduleController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import { storage } from '../services/storage.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: 'active' });
});

// Reset to seed data
router.post('/reset', (req, res) => {
  const data = storage.resetToDefault();
  res.json({ success: true, message: 'Database reset to initial demo data', data });
});

// Subjects
router.get('/subjects', subjectCtrl.getSubjects);
router.get('/subjects/:id', subjectCtrl.getSubjectById);
router.post('/subjects', subjectCtrl.createSubject);
router.put('/subjects/:id', subjectCtrl.updateSubject);
router.delete('/subjects/:id', subjectCtrl.deleteSubject);

// Deadlines
router.get('/deadlines', deadlineCtrl.getDeadlines);
router.post('/deadlines', deadlineCtrl.createDeadline);
router.put('/deadlines/:id', deadlineCtrl.updateDeadline);
router.delete('/deadlines/:id', deadlineCtrl.deleteDeadline);
router.patch('/deadlines/:id/toggle', deadlineCtrl.toggleDeadline);

// Availability
router.get('/availability', availCtrl.getAvailability);
router.put('/availability', availCtrl.updateAvailability);

// Schedule
router.get('/schedule', scheduleCtrl.getSchedule);
router.post('/schedule/generate', scheduleCtrl.generateSchedule);
router.post('/schedule/rebalance', scheduleCtrl.rebalanceSchedule);
router.patch('/schedule/:id/toggle', scheduleCtrl.toggleSession);
router.put('/schedule/:id', scheduleCtrl.updateSession);
router.delete('/schedule/:id', scheduleCtrl.deleteSession);

// Analytics
router.get('/analytics', analyticsCtrl.getAnalytics);

export default router;
