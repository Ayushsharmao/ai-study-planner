import bcrypt from 'bcryptjs';
import { storage } from '../services/storage.js';
import { generateToken } from '../middleware/auth.js';

function decodeGoogleJwt(credential) {
  try {
    if (!credential || typeof credential !== 'string') return null;
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

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
      authProvider: 'email',
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
        role: newUser.role,
        authProvider: newUser.authProvider,
        createdAt: newUser.createdAt
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

    storage.updateUserLastLogin(user.id);
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        authProvider: user.authProvider || 'email',
        picture: user.picture || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, email, name, picture, age } = req.body;
    let userEmail = email;
    let userName = name;
    let userPicture = picture || '';

    // If official Google Identity Services credential was passed, decode it
    if (credential) {
      const decoded = decodeGoogleJwt(credential);
      if (decoded && decoded.email) {
        userEmail = decoded.email;
        userName = decoded.name || decoded.given_name || userEmail.split('@')[0];
        userPicture = decoded.picture || '';
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Valid Google email is required' });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    let user = storage.getUserByEmail(cleanEmail);

    if (!user) {
      // Auto-register new Google user with private starter course pack
      const salt = bcrypt.genSaltSync(10);
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = bcrypt.hashSync(randomPassword, salt);
      const isAdmin = cleanEmail === 'ayushsharma222004@gmail.com';

      user = storage.createUser({
        name: userName || cleanEmail.split('@')[0],
        email: cleanEmail,
        age: age ? parseInt(age, 10) : 20,
        passwordHash,
        authProvider: 'google',
        picture: userPicture,
        role: isAdmin ? 'admin' : 'student'
      });
    } else {
      if (userPicture && !user.picture) user.picture = userPicture;
      storage.updateUserLastLogin(user.id);
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
        role: user.role,
        authProvider: user.authProvider || 'google',
        picture: user.picture || '',
        createdAt: user.createdAt
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
        authProvider: user.authProvider || 'email',
        picture: user.picture || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
