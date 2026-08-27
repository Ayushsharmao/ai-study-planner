import { storage } from '../services/storage.js';
import { generateSchedule as runScheduler, rebalanceSchedule as runRebalancer } from '../services/aiScheduler.js';

export const getSchedule = (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, subjectId } = req.query;
    let sessions = storage.getSessions(userId);

    if (startDate) {
      sessions = sessions.filter(s => s.date >= startDate);
    }
    if (endDate) {
      sessions = sessions.filter(s => s.date <= endDate);
    }
    if (subjectId) {
      sessions = sessions.filter(s => s.subjectId === subjectId);
    }

    sessions.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const generateSchedule = (req, res) => {
  try {
    const userId = req.user.id;
    const subjects = storage.getSubjects(userId);
    const deadlines = storage.getDeadlines(userId);
    const availability = storage.getAvailability(userId);

    const { daysAhead = 14, preserveCompleted = true } = req.body;

    const { sessions: generatedSessions, insights } = runScheduler({
      subjects,
      deadlines,
      availability,
      startDate: new Date(),
      daysAhead: Number(daysAhead)
    });

    let finalSessions = generatedSessions;
    if (preserveCompleted) {
      const existingCompleted = storage.getSessions(userId).filter(s => s.completed);
      finalSessions = [...existingCompleted, ...generatedSessions];
    }

    storage.setSessions(userId, finalSessions);

    res.json({
      success: true,
      count: finalSessions.length,
      insights,
      data: finalSessions
    });
  } catch (err) {
    console.error('Schedule generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleSession = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { actualMinutesStudied } = req.body;
    const session = storage.getSessions(userId).find(s => s.id === id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const completed = !session.completed;
    const updates = {
      completed,
      actualMinutesStudied: completed 
        ? (actualMinutesStudied !== undefined ? Number(actualMinutesStudied) : session.durationMinutes) 
        : 0
    };

    const updated = storage.updateSession(userId, id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSession = (req, res) => {
  try {
    const userId = req.user.id;
    const updated = storage.updateSession(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteSession = (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = storage.deleteSession(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const rebalanceSchedule = (req, res) => {
  try {
    const userId = req.user.id;
    const subjects = storage.getSubjects(userId);
    const deadlines = storage.getDeadlines(userId);
    const availability = storage.getAvailability(userId);
    const existingSessions = storage.getSessions(userId);

    const result = runRebalancer({
      existingSessions,
      subjects,
      deadlines,
      availability
    });

    storage.setSessions(userId, result.sessions);

    res.json({
      success: true,
      rebalancedCount: result.rebalancedCount,
      message: result.message,
      data: result.sessions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
