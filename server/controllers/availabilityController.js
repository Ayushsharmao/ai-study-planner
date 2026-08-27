import { storage } from '../services/storage.js';

export const getAvailability = (req, res) => {
  try {
    const userId = req.user.id;
    const availability = storage.getAvailability(userId);
    res.json({ success: true, data: availability });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAvailability = (req, res) => {
  try {
    const userId = req.user.id;
    const updated = storage.updateAvailability(userId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
