import { storage } from '../services/storage.js';

export const getUsers = (req, res) => {
  try {
    const users = storage.getUsers().map(u => {
      const subjects = storage.getSubjects(u.id);
      const deadlines = storage.getDeadlines(u.id);
      const sessions = storage.getSessions(u.id);
      const completedSessions = sessions.filter(s => s.completed);
      const totalHours = completedSessions.reduce((sum, s) => sum + (s.actualMinutesStudied || s.durationMinutes || 0), 0) / 60;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        subjectsCount: subjects.length,
        deadlinesCount: deadlines.length,
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        hoursStudied: parseFloat(totalHours.toFixed(1))
      };
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateUserRole = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const updated = storage.updateUserRole(id, role);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: { id: updated.id, name: updated.name, role: updated.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own admin account.' });
    }

    storage.deleteUser(id);
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSiteSettings = (req, res) => {
  try {
    const settings = storage.getSiteSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSiteSettings = (req, res) => {
  try {
    const updated = storage.updateSiteSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPlatformStats = (req, res) => {
  try {
    const users = storage.getUsers();
    const settings = storage.getSiteSettings();
    
    // Aggregates across all users
    let totalSubjects = 0;
    let totalDeadlines = 0;
    let totalSessions = 0;
    let totalMinutesStudied = 0;

    users.forEach(u => {
      totalSubjects += storage.getSubjects(u.id).length;
      totalDeadlines += storage.getDeadlines(u.id).length;
      const sess = storage.getSessions(u.id);
      totalSessions += sess.length;
      sess.filter(s => s.completed).forEach(s => {
        totalMinutesStudied += (s.actualMinutesStudied || s.durationMinutes || 0);
      });
    });

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalSubjects,
        totalDeadlines,
        totalSessions,
        totalHoursStudied: parseFloat((totalMinutesStudied / 60).toFixed(1)),
        serverUptime: Math.floor(process.uptime()),
        settings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
