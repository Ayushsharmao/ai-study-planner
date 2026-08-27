import { storage } from '../services/storage.js';
import { generateSchedule as runScheduler, rebalanceSchedule as runRebalancer } from '../services/aiScheduler.js';

export const getSchedule = (req, res) => {
  try {
    const { startDate, endDate, subjectId } = req.query;
    let sessions = storage.getSessions();

    if (startDate) {
      sessions = sessions.filter(s => s.date >= startDate);
    }
    if (endDate) {
      sessions = sessions.filter(s => s.date <= endDate);
    }
    if (subjectId) {
      sessions = sessions.filter(s => s.subjectId === subjectId);
    }

    // Sort by date, then by startTime
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
    const subjects = storage.getSubjects();
    const deadlines = storage.getDeadlines();
    const availability = storage.getAvailability();

    const { daysAhead = 14, preserveCompleted = true } = req.body;

    const { sessions: generatedSessions, insights } = runScheduler({
      subjects,
      deadlines,
      availability,
      startDate: new Date(),
      daysAhead: Number(daysAhead)
    });

    // If preserveCompleted is true, keep any sessions that are already marked completed
    let finalSessions = generatedSessions;
    if (preserveCompleted) {
      const existingCompleted = storage.getSessions().filter(s => s.completed);
      // Merge
      finalSessions = [...existingCompleted, ...generatedSessions];
    }

    storage.setSessions(finalSessions);

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
    const { id } = req.params;
    const { actualMinutesStudied } = req.body;
    const session = storage.getSessions().find(s => s.id === id);

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

    const updated = storage.updateSession(id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSession = (req, res) => {
  try {
    const updated = storage.updateSession(req.params.id, req.body);
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
    const deleted = storage.deleteSession(req.params.id);
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
    const subjects = storage.getSubjects();
    const deadlines = storage.getDeadlines();
    const availability = storage.getAvailability();
    const existingSessions = storage.getSessions();

    const result = runRebalancer({
      existingSessions,
      subjects,
      deadlines,
      availability
    });

    storage.setSessions(result.sessions);

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
