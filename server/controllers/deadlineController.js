import { v4 as uuidv4 } from 'uuid';
import { storage } from '../services/storage.js';

export const getDeadlines = (req, res) => {
  try {
    const userId = req.user.id;
    const deadlines = storage.getDeadlines(userId);
    deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    res.json({ success: true, count: deadlines.length, data: deadlines });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createDeadline = (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subjectId, type, dueDate, weight, priority, notes } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ success: false, error: 'Title and due date are required' });
    }

    const newDeadline = {
      id: `dead-${uuidv4().slice(0, 8)}`,
      userId,
      title,
      subjectId: subjectId || '',
      type: type || 'exam',
      dueDate,
      weight: Number(weight) || 20,
      priority: priority || 'high',
      completed: false,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const saved = storage.createDeadline(userId, newDeadline);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateDeadline = (req, res) => {
  try {
    const userId = req.user.id;
    const updated = storage.updateDeadline(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Deadline not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteDeadline = (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = storage.deleteDeadline(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Deadline not found' });
    }
    res.json({ success: true, message: 'Deadline removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleDeadline = (req, res) => {
  try {
    const userId = req.user.id;
    const deadline = storage.getDeadlines(userId).find(d => d.id === req.params.id);
    if (!deadline) {
      return res.status(404).json({ success: false, error: 'Deadline not found' });
    }
    const updated = storage.updateDeadline(userId, req.params.id, { completed: !deadline.completed });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
