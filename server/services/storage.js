import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generates realistic starter courses and study sessions for any user
export const createStarterPackForUser = (userId) => {
  const today = new Date();
  const formatDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const subjects = [
    {
      id: `sub-${uuidv4().slice(0, 8)}`,
      userId,
      name: 'Algorithms & Data Structures',
      code: 'CS301',
      color: '#6366f1',
      difficulty: 4,
      priority: 'high',
      targetGrade: 'A',
      topics: [
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Dynamic Programming & Memoization', estimatedHours: 3, completed: true },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Graph Algorithms (Dijkstra & A*)', estimatedHours: 4, completed: true },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Minimum Spanning Trees & Disjoint Sets', estimatedHours: 3, completed: false },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'NP-Completeness & Approximation', estimatedHours: 2, completed: false }
      ],
      notes: 'Focus on recursive implementations and runtime proofs.',
      createdAt: new Date().toISOString()
    },
    {
      id: `sub-${uuidv4().slice(0, 8)}`,
      userId,
      name: 'Multivariable Calculus',
      code: 'MATH220',
      color: '#ec4899',
      difficulty: 4,
      priority: 'medium',
      targetGrade: 'A-',
      topics: [
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Partial Derivatives & Chain Rule', estimatedHours: 2, completed: true },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Double & Triple Integrals in Polar Coordinates', estimatedHours: 3, completed: false },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Vector Fields & Green Theorem', estimatedHours: 4, completed: false }
      ],
      notes: 'Practice problem sets on Greens and Stokes theorem.',
      createdAt: new Date().toISOString()
    },
    {
      id: `sub-${uuidv4().slice(0, 8)}`,
      userId,
      name: 'Database Systems & Architecture',
      code: 'CS412',
      color: '#10b981',
      difficulty: 3,
      priority: 'urgent',
      targetGrade: 'A+',
      topics: [
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'B-Tree Indexing & Query Optimization', estimatedHours: 3, completed: true },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'ACID Transactions & 2-Phase Locking', estimatedHours: 3, completed: true },
        { id: `top-${uuidv4().slice(0, 6)}`, title: 'Distributed Consensus & Sharding', estimatedHours: 4, completed: false }
      ],
      notes: 'Midterm exam is worth 35% of total grade.',
      createdAt: new Date().toISOString()
    }
  ];

  const deadlines = [
    {
      id: `dead-${uuidv4().slice(0, 8)}`,
      userId,
      title: 'Database Architecture Midterm',
      subjectId: subjects[2].id,
      type: 'exam',
      dueDate: formatDate(3),
      weight: 35,
      priority: 'urgent',
      completed: false,
      notes: 'Covers Indexing, Query Optimization, and Concurrency.'
    },
    {
      id: `dead-${uuidv4().slice(0, 8)}`,
      userId,
      title: 'Algorithms Assignment: Graphs & MST',
      subjectId: subjects[0].id,
      type: 'assignment',
      dueDate: formatDate(5),
      weight: 15,
      priority: 'high',
      completed: false,
      notes: 'Implement Kruskals and Prims in Python.'
    },
    {
      id: `dead-${uuidv4().slice(0, 8)}`,
      userId,
      title: 'Calculus Quiz: Vector Fields',
      subjectId: subjects[1].id,
      type: 'quiz',
      dueDate: formatDate(7),
      weight: 10,
      priority: 'medium',
      completed: false,
      notes: 'Review exercises 14.1-14.4.'
    }
  ];

  const availability = {
    id: `avail-${userId}`,
    userId,
    weeklyHours: {
      monday: 3.5,
      tuesday: 3.0,
      wednesday: 4.0,
      thursday: 3.5,
      friday: 2.5,
      saturday: 6.0,
      sunday: 5.0
    },
    preferredTimeslot: 'evening',
    preferredSessionMinutes: 45,
    breakMinutes: 15,
    maxDailyHours: 8,
    bufferDaysBeforeExam: 1
  };

  const sessions = [
    {
      id: `sess-${uuidv4().slice(0, 8)}`,
      userId,
      subjectId: subjects[2].id,
      deadlineId: deadlines[0].id,
      topic: 'B-Tree Indexing & Query Optimization Review',
      date: formatDate(0),
      startTime: '16:00',
      endTime: '16:45',
      durationMinutes: 45,
      sessionType: 'review',
      completed: true,
      actualMinutesStudied: 45,
      notes: 'Reviewed composite index order and clustered vs unclustered trees.'
    },
    {
      id: `sess-${uuidv4().slice(0, 8)}`,
      userId,
      subjectId: subjects[0].id,
      deadlineId: deadlines[1].id,
      topic: 'Minimum Spanning Trees: Kruskals Algorithm',
      date: formatDate(0),
      startTime: '17:00',
      endTime: '17:45',
      durationMinutes: 45,
      sessionType: 'learn',
      completed: false,
      actualMinutesStudied: 0,
      notes: 'Focus on Union-Find rank and path compression optimizations.'
    },
    {
      id: `sess-${uuidv4().slice(0, 8)}`,
      userId,
      subjectId: subjects[2].id,
      deadlineId: deadlines[0].id,
      topic: 'ACID Transactions & 2-Phase Locking Practice',
      date: formatDate(1),
      startTime: '18:00',
      endTime: '18:45',
      durationMinutes: 45,
      sessionType: 'practice',
      completed: false,
      actualMinutesStudied: 0,
      notes: 'Solved deadlock detection problem sets.'
    }
  ];

  return { subjects, deadlines, availability, sessions };
};

const getInitialSeedData = () => {
  const adminSalt = bcrypt.genSaltSync(10);
  const studentSalt = bcrypt.genSaltSync(10);

  const adminUser = {
    id: 'usr-admin-1',
    name: 'Ayush Sharma',
    email: 'ayushsharma222004@gmail.com',
    age: 21,
    passwordHash: bcrypt.hashSync('Ayush@JM1', adminSalt),
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  const demoStudent = {
    id: 'usr-student-1',
    name: 'Alex Rivera',
    email: 'alex@student.com',
    passwordHash: bcrypt.hashSync('student123', studentSalt),
    role: 'student',
    createdAt: new Date().toISOString()
  };

  const adminPack = createStarterPackForUser(adminUser.id);
  const studentPack = createStarterPackForUser(demoStudent.id);

  return {
    users: [adminUser, demoStudent],
    siteSettings: {
      id: 'global_settings',
      siteName: 'StudyMind AI',
      announcementText: '🚀 Welcome to StudyMind AI! Optimize your study schedule with adaptive spaced repetition.',
      announcementActive: true,
      defaultSessionDuration: 45,
      defaultBreakDuration: 15,
      maxDailyHoursCap: 8,
      allowRegistration: true,
      aiEngineModel: 'Gemini Flash & Spaced-Repetition Optimizer'
    },
    subjects: [...adminPack.subjects, ...studentPack.subjects],
    deadlines: [...adminPack.deadlines, ...studentPack.deadlines],
    availabilities: [adminPack.availability, studentPack.availability],
    sessions: [...adminPack.sessions, ...studentPack.sessions]
  };
};

class StorageService {
  constructor() {
    this.memoryData = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      this.memoryData = initial;
    } else {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.memoryData = JSON.parse(raw);
        // Ensure collections exist
        if (!this.memoryData.users) {
          const initial = getInitialSeedData();
          this.memoryData = initial;
          this.save();
        } else {
          // Guarantee requested admin account exists and has password Ayush@JM1
          const adminEmail = 'ayushsharma222004@gmail.com';
          const existing = this.memoryData.users.find(u => u.email.toLowerCase() === adminEmail);
          const salt = bcrypt.genSaltSync(10);
          if (!existing) {
            const newAdmin = {
              id: 'usr-admin-ayush',
              name: 'Ayush Sharma',
              email: adminEmail,
              age: 21,
              passwordHash: bcrypt.hashSync('Ayush@JM1', salt),
              role: 'admin',
              createdAt: new Date().toISOString()
            };
            this.memoryData.users.unshift(newAdmin);
            const starterPack = createStarterPackForUser(newAdmin.id);
            this.memoryData.subjects.push(...starterPack.subjects);
            this.memoryData.deadlines.push(...starterPack.deadlines);
            if (!this.memoryData.availabilities) this.memoryData.availabilities = [];
            this.memoryData.availabilities.push(starterPack.availability);
            this.memoryData.sessions.push(...starterPack.sessions);
            this.save();
          } else {
            existing.passwordHash = bcrypt.hashSync('Ayush@JM1', salt);
            existing.role = 'admin';
            existing.name = 'Ayush Sharma';
            this.save();
          }
        }
      } catch (err) {
        console.error('Error reading storage, resetting to seed data:', err);
        const initial = getInitialSeedData();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        this.memoryData = initial;
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist data:', err);
    }
  }

  // --- Users ---
  getUsers() {
    return this.memoryData.users || [];
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    if (!email) return null;
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const isSpecialAdmin = userData.email.toLowerCase() === 'ayushsharma222004@gmail.com';
    const newUser = {
      id: userData.id || `usr-${uuidv4().slice(0, 8)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      age: userData.age ? Number(userData.age) : 20,
      passwordHash: userData.passwordHash,
      role: isSpecialAdmin ? 'admin' : (userData.role || 'student'),
      authProvider: userData.authProvider || 'email',
      picture: userData.picture || '',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.memoryData.users.push(newUser);

    // Auto-create starter study pack for this new user
    const starterPack = createStarterPackForUser(newUser.id);
    this.memoryData.subjects.push(...starterPack.subjects);
    this.memoryData.deadlines.push(...starterPack.deadlines);
    this.memoryData.availabilities.push(starterPack.availability);
    this.memoryData.sessions.push(...starterPack.sessions);

    this.save();
    return newUser;
  }

  updateUserLastLogin(userId) {
    const user = this.getUserById(userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.save();
    }
    return user;
  }

  deleteUser(userId) {
    this.memoryData.users = this.memoryData.users.filter(u => u.id !== userId);
    this.memoryData.subjects = this.memoryData.subjects.filter(s => s.userId !== userId);
    this.memoryData.deadlines = this.memoryData.deadlines.filter(d => d.userId !== userId);
    this.memoryData.availabilities = (this.memoryData.availabilities || []).filter(a => a.userId !== userId);
    this.memoryData.sessions = this.memoryData.sessions.filter(s => s.userId !== userId);
    this.save();
    return true;
  }

  updateUserRole(userId, newRole) {
    const u = this.getUserById(userId);
    if (u) {
      u.role = newRole;
      this.save();
      return u;
    }
    return null;
  }

  // --- Site Settings ---
  getSiteSettings() {
    if (!this.memoryData.siteSettings) {
      this.memoryData.siteSettings = {
        id: 'global_settings',
        siteName: 'StudyMind AI',
        announcementText: '🚀 Welcome to StudyMind AI! Spaced repetition scheduler active.',
        announcementActive: true,
        defaultSessionDuration: 45,
        defaultBreakDuration: 15,
        maxDailyHoursCap: 8,
        allowRegistration: true,
        aiEngineModel: 'Gemini Flash & Heuristic Optimizer'
      };
      this.save();
    }
    return this.memoryData.siteSettings;
  }

  updateSiteSettings(updates) {
    this.memoryData.siteSettings = { ...this.getSiteSettings(), ...updates };
    this.save();
    return this.memoryData.siteSettings;
  }

  // --- Subjects (Scoped by userId) ---
  getSubjects(userId) {
    return (this.memoryData.subjects || []).filter(s => s.userId === userId);
  }

  getSubjectById(userId, id) {
    return this.getSubjects(userId).find(s => s.id === id);
  }

  createSubject(userId, subject) {
    const item = { ...subject, userId };
    this.memoryData.subjects.push(item);
    this.save();
    return item;
  }

  updateSubject(userId, id, updates) {
    const idx = this.memoryData.subjects.findIndex(s => s.id === id && s.userId === userId);
    if (idx !== -1) {
      this.memoryData.subjects[idx] = { ...this.memoryData.subjects[idx], ...updates };
      this.save();
      return this.memoryData.subjects[idx];
    }
    return null;
  }

  deleteSubject(userId, id) {
    this.memoryData.subjects = this.memoryData.subjects.filter(s => !(s.id === id && s.userId === userId));
    this.memoryData.deadlines = this.memoryData.deadlines.filter(d => !(d.subjectId === id && d.userId === userId));
    this.memoryData.sessions = this.memoryData.sessions.filter(s => !(s.subjectId === id && s.userId === userId));
    this.save();
    return true;
  }

  // --- Deadlines (Scoped by userId) ---
  getDeadlines(userId) {
    return (this.memoryData.deadlines || []).filter(d => d.userId === userId);
  }

  createDeadline(userId, deadline) {
    const item = { ...deadline, userId };
    this.memoryData.deadlines.push(item);
    this.save();
    return item;
  }

  updateDeadline(userId, id, updates) {
    const idx = this.memoryData.deadlines.findIndex(d => d.id === id && d.userId === userId);
    if (idx !== -1) {
      this.memoryData.deadlines[idx] = { ...this.memoryData.deadlines[idx], ...updates };
      this.save();
      return this.memoryData.deadlines[idx];
    }
    return null;
  }

  deleteDeadline(userId, id) {
    this.memoryData.deadlines = this.memoryData.deadlines.filter(d => !(d.id === id && d.userId === userId));
    this.memoryData.sessions = this.memoryData.sessions.map(s => {
      if (s.deadlineId === id && s.userId === userId) {
        return { ...s, deadlineId: null };
      }
      return s;
    });
    this.save();
    return true;
  }

  // --- Availability (Scoped by userId) ---
  getAvailability(userId) {
    let avail = (this.memoryData.availabilities || []).find(a => a.userId === userId);
    if (!avail) {
      avail = {
        id: `avail-${userId}`,
        userId,
        weeklyHours: {
          monday: 3.5,
          tuesday: 3.0,
          wednesday: 4.0,
          thursday: 3.5,
          friday: 2.5,
          saturday: 6.0,
          sunday: 5.0
        },
        preferredTimeslot: 'evening',
        preferredSessionMinutes: 45,
        breakMinutes: 15,
        maxDailyHours: 8,
        bufferDaysBeforeExam: 1
      };
      if (!this.memoryData.availabilities) this.memoryData.availabilities = [];
      this.memoryData.availabilities.push(avail);
      this.save();
    }
    return avail;
  }

  updateAvailability(userId, updates) {
    const idx = (this.memoryData.availabilities || []).findIndex(a => a.userId === userId);
    if (idx !== -1) {
      this.memoryData.availabilities[idx] = { ...this.memoryData.availabilities[idx], ...updates };
    } else {
      if (!this.memoryData.availabilities) this.memoryData.availabilities = [];
      this.memoryData.availabilities.push({ id: `avail-${userId}`, userId, ...updates });
    }
    this.save();
    return this.getAvailability(userId);
  }

  // --- Sessions (Scoped by userId) ---
  getSessions(userId) {
    return (this.memoryData.sessions || []).filter(s => s.userId === userId);
  }

  setSessions(userId, sessions) {
    // Keep other users' sessions and replace only this user's sessions
    const otherUsersSessions = (this.memoryData.sessions || []).filter(s => s.userId !== userId);
    const stampedSessions = sessions.map(s => ({ ...s, userId }));
    this.memoryData.sessions = [...otherUsersSessions, ...stampedSessions];
    this.save();
    return stampedSessions;
  }

  createSession(userId, session) {
    const item = { ...session, userId };
    this.memoryData.sessions.push(item);
    this.save();
    return item;
  }

  updateSession(userId, id, updates) {
    const idx = this.memoryData.sessions.findIndex(s => s.id === id && s.userId === userId);
    if (idx !== -1) {
      this.memoryData.sessions[idx] = { ...this.memoryData.sessions[idx], ...updates };
      this.save();
      return this.memoryData.sessions[idx];
    }
    return null;
  }

  deleteSession(userId, id) {
    this.memoryData.sessions = this.memoryData.sessions.filter(s => !(s.id === id && s.userId === userId));
    this.save();
    return true;
  }
}

export const storage = new StorageService();
