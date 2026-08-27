import { v4 as uuidv4 } from 'uuid';
import { storage } from '../services/storage.js';

export const getSubjects = (req, res) => {
  try {
    const userId = req.user.id;
    const subjects = storage.getSubjects(userId);
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSubjectById = (req, res) => {
  try {
    const userId = req.user.id;
    const subject = storage.getSubjectById(userId, req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createSubject = (req, res) => {
  try {
    const userId = req.user.id;
    const { name, code, color, difficulty, priority, targetGrade, topics, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Subject name is required' });
    }

    const formattedTopics = Array.isArray(topics) 
      ? topics.map(t => typeof t === 'string' ? { id: uuidv4().slice(0, 8), title: t, completed: false } : t)
      : [];

    const newSubject = {
      id: `sub-${uuidv4().slice(0, 8)}`,
      userId,
      name,
      code: code || '',
      color: color || '#6366f1',
      difficulty: Number(difficulty) || 3,
      priority: priority || 'medium',
      targetGrade: targetGrade || 'A',
      topics: formattedTopics,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const saved = storage.createSubject(userId, newSubject);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSubject = (req, res) => {
  try {
    const userId = req.user.id;
    const updated = storage.updateSubject(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteSubject = (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = storage.deleteSubject(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject and associated deadlines removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
