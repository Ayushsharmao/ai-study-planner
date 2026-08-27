import bcrypt from 'bcryptjs';
import { storage } from '../services/storage.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = storage.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Designated master admin
    const isAdminEmail = cleanEmail === 'ayushsharma222004@gmail.com';
    const role = isAdminEmail ? 'admin' : 'student';

    const parsedAge = age ? parseInt(age, 10) : 20;

    const newUser = storage.createUser({
      name: name.trim(),
      email: cleanEmail,
      age: parsedAge,
      passwordHash,
      role
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = storage.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, age } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required for Google Sign-In' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = storage.getUserByEmail(cleanEmail);

    if (!user) {
      // Auto-register via Google
      const salt = bcrypt.genSaltSync(10);
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = bcrypt.hashSync(randomPassword, salt);
      const isAdmin = cleanEmail === 'ayushsharma222004@gmail.com';

      user = storage.createUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        age: age ? parseInt(age, 10) : 20,
        passwordHash,
        role: isAdmin ? 'admin' : 'student'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
