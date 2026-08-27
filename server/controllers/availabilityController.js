import { storage } from '../services/storage.js';

export const getAvailability = (req, res) => {
  try {
    const availability = storage.getAvailability();
    res.json({ success: true, data: availability });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAvailability = (req, res) => {
  try {
    const updated = storage.updateAvailability(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
