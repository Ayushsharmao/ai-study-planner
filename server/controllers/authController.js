import bcrypt from 'bcryptjs';
import { storage } from '../services/storage.js';
import { generateToken } from '../middleware/auth.js';
import { sendOtpEmail } from '../services/emailService.js';

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

// 1. Send OTP for Registration
export const sendRegistrationOtp = async (req, res) => {
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

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const parsedAge = age ? parseInt(age, 10) : 20;

    // Store pending registration with 10-minute expiry
    storage.setOtp(cleanEmail, {
      otp,
      name: name.trim(),
      email: cleanEmail,
      age: parsedAge,
      passwordHash
    });

    // Send email via Nodemailer
    const emailResult = await sendOtpEmail(cleanEmail, otp, name.trim());

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      fallbackOtp: emailResult.fallbackOtp || null
    });
  } catch (err) {
    console.error('sendRegistrationOtp error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Verify OTP & Finalize Registration
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit verification code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = storage.getOtp(cleanEmail);

    if (!pending) {
      return res.status(400).json({ success: false, error: 'Verification code expired or not found. Please request a new code.' });
    }

    if (pending.otp.trim() !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your email and try again.' });
    }

    // OTP Verified! Create user account
    const isAdminEmail = cleanEmail === 'ayushsharma222004@gmail.com';
    const role = isAdminEmail ? 'admin' : 'student';

    const newUser = storage.createUser({
      name: pending.name,
      email: cleanEmail,
      age: pending.age,
      passwordHash: pending.passwordHash,
      authProvider: 'email',
      emailVerified: true,
      role
    });

    // Clear OTP
    storage.deleteOtp(cleanEmail);

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
        emailVerified: true,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('verifyRegistrationOtp error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = storage.getOtp(cleanEmail);

    if (!pending) {
      return res.status(400).json({ success: false, error: 'No pending registration session found. Please re-enter your details.' });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = newOtp;
    storage.setOtp(cleanEmail, pending);

    const emailResult = await sendOtpEmail(cleanEmail, newOtp, pending.name);

    res.json({
      success: true,
      message: `A new verification code has been sent to ${cleanEmail}.`,
      fallbackOtp: emailResult.fallbackOtp || null
    });
  } catch (err) {
    console.error('resendOtp error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Direct register fallback (if needed)
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

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const isAdminEmail = cleanEmail === 'ayushsharma222004@gmail.com';
    const role = isAdminEmail ? 'admin' : 'student';
    const parsedAge = age ? parseInt(age, 10) : 20;

    const newUser = storage.createUser({
      name: name.trim(),
      email: cleanEmail,
      age: parsedAge,
      passwordHash,
      authProvider: 'email',
      emailVerified: true,
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
        emailVerified: true,
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
        emailVerified: user.emailVerified !== undefined ? user.emailVerified : true,
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
      // Auto-register new Google user (Google emails are inherently verified)
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
        emailVerified: true,
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
        emailVerified: true,
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
        emailVerified: user.emailVerified !== undefined ? user.emailVerified : true,
        picture: user.picture || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
