import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { SubjectSchema, DeadlineSchema, AvailabilitySchema, StudySessionSchema } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data for realistic experience
const getInitialSeedData = () => {
  const today = new Date();
  const formatDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  return {
    subjects: [
      {
        id: 'sub-1',
        name: 'Algorithms & Data Structures',
        code: 'CS301',
        color: '#6366f1', // Indigo
        difficulty: 4,
        priority: 'high',
        targetGrade: 'A',
        topics: [
          { id: 't1', title: 'Dynamic Programming & Memoization', estimatedHours: 3, completed: true },
          { id: 't2', title: 'Graph Algorithms (Dijkstra & A*)', estimatedHours: 4, completed: true },
          { id: 't3', title: 'Minimum Spanning Trees & Disjoint Sets', estimatedHours: 3, completed: false },
          { id: 't4', title: 'NP-Completeness & Approximation', estimatedHours: 2, completed: false }
        ],
        notes: 'Prof. Miller emphasizes runtime proofs and recursive implementations.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub-2',
        name: 'Multivariable Calculus',
        code: 'MATH220',
        color: '#ec4899', // Pink / Rose
        difficulty: 4,
        priority: 'medium',
        targetGrade: 'A-',
        topics: [
          { id: 't5', title: 'Partial Derivatives & Chain Rule', estimatedHours: 2, completed: true },
          { id: 't6', title: 'Double & Triple Integrals in Polar Coordinates', estimatedHours: 3, completed: false },
          { id: 't7', title: 'Vector Fields & Green Theorem', estimatedHours: 4, completed: false },
          { id: 't8', title: 'Stokes Theorem & Divergence Theorem', estimatedHours: 3, completed: false }
        ],
        notes: 'Practice problem sets on Stokes Theorem before quiz.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub-3',
        name: 'Database Systems & Architecture',
        code: 'CS412',
        color: '#10b981', // Emerald
        difficulty: 3,
        priority: 'urgent',
        targetGrade: 'A+',
        topics: [
          { id: 't9', title: 'B-Tree Indexing & Query Optimization', estimatedHours: 3, completed: true },
          { id: 't10', title: 'ACID Transactions & 2-Phase Locking', estimatedHours: 3, completed: true },
          { id: 't11', title: 'Distributed Consensuses & NoSQL Sharding', estimatedHours: 4, completed: false }
        ],
        notes: 'Midterm exam is worth 35% of the total semester grade!',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub-4',
        name: 'Physics: Electromagnetism',
        code: 'PHYS204',
        color: '#f59e0b', // Amber
        difficulty: 5,
        priority: 'high',
        targetGrade: 'B+',
        topics: [
          { id: 't12', title: 'Gauss Law & Electric Flux', estimatedHours: 3, completed: true },
          { id: 't13', title: 'Magnetic Dipoles & Ampere Law', estimatedHours: 4, completed: false },
          { id: 't14', title: 'Faraday Induction & Maxwell Equations', estimatedHours: 5, completed: false }
        ],
        notes: 'High difficulty. Needs extra spaced repetition sessions.',
        createdAt: new Date().toISOString()
      }
    ],
    deadlines: [
      {
        id: 'dead-1',
        title: 'Database Architecture Midterm Exam',
        subjectId: 'sub-3',
        type: 'exam',
        dueDate: formatDate(3), // 3 days from now
        weight: 35,
        priority: 'urgent',
        completed: false,
        notes: 'Covers Indexing, Query Processing, and Concurrency Control.'
      },
      {
        id: 'dead-2',
        title: 'Algorithms Homework 4: Graphs & MST',
        subjectId: 'sub-1',
        type: 'assignment',
        dueDate: formatDate(5), // 5 days from now
        weight: 15,
        priority: 'high',
        completed: false,
        notes: 'Implement Kruskals and Prims in Python.'
      },
      {
        id: 'dead-3',
        title: 'Calculus Quiz: Vector Fields',
        subjectId: 'sub-2',
        type: 'quiz',
        dueDate: formatDate(7), // 7 days from now
        weight: 10,
        priority: 'medium',
        completed: false,
        notes: 'Review Greens theorem exercises 14.1-14.4.'
      },
      {
        id: 'dead-4',
        title: 'Physics Midterm II',
        subjectId: 'sub-4',
        type: 'exam',
        dueDate: formatDate(10), // 10 days from now
        weight: 30,
        priority: 'high',
        completed: false,
        notes: 'Formula sheet allowed (1 double-sided page).'
      }
    ],
    availability: {
      id: 'default_availability',
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
    },
    sessions: [
      {
        id: 'sess-1',
        subjectId: 'sub-3',
        deadlineId: 'dead-1',
        topic: 'B-Tree Indexing & Query Optimization Review',
        date: formatDate(0), // Today
        startTime: '16:00',
        endTime: '16:45',
        durationMinutes: 45,
        sessionType: 'review',
        completed: true,
        actualMinutesStudied: 45,
        notes: 'Reviewed composite index order and clustered vs unclustered trees.'
      },
      {
        id: 'sess-2',
        subjectId: 'sub-3',
        deadlineId: 'dead-1',
        topic: 'ACID Transactions & 2-Phase Locking Practice',
        date: formatDate(0), // Today
        startTime: '17:00',
        endTime: '17:45',
        durationMinutes: 45,
        sessionType: 'practice',
        completed: true,
        actualMinutesStudied: 50,
        notes: 'Solved deadlock detection problem sets.'
      },
      {
        id: 'sess-3',
        subjectId: 'sub-1',
        deadlineId: 'dead-2',
        topic: 'Minimum Spanning Trees: Kruskals Algorithm',
        date: formatDate(0), // Today
        startTime: '18:00',
        endTime: '18:45',
        durationMinutes: 45,
        sessionType: 'learn',
        completed: false,
        actualMinutesStudied: 0,
        notes: 'Focus on Union-Find rank and path compression optimizations.'
      },
      {
        id: 'sess-4',
        subjectId: 'sub-3',
        deadlineId: 'dead-1',
        topic: 'Distributed Consensus & Midterm Mock Exam',
        date: formatDate(1), // Tomorrow
        startTime: '15:00',
        endTime: '16:15',
        durationMinutes: 75,
        sessionType: 'mock_exam',
        completed: false,
        actualMinutesStudied: 0,
        notes: 'Simulate full 75 min exam under timed conditions.'
      },
      {
        id: 'sess-5',
        subjectId: 'sub-2',
        deadlineId: 'dead-3',
        topic: 'Double Integrals in Polar Coordinates',
        date: formatDate(1),
        startTime: '17:00',
        endTime: '17:45',
        durationMinutes: 45,
        sessionType: 'practice',
        completed: false,
        actualMinutesStudied: 0,
        notes: 'Jacobian determinant conversions.'
      },
      {
        id: 'sess-6',
        subjectId: 'sub-4',
        deadlineId: 'dead-4',
        topic: 'Magnetic Dipoles & Ampere Law Fundamentals',
        date: formatDate(2),
        startTime: '16:30',
        endTime: '17:15',
        durationMinutes: 45,
        sessionType: 'learn',
        completed: false,
        actualMinutesStudied: 0,
        notes: 'Line integrals around closed loops.'
      }
    ]
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

  // Subjects
  getSubjects() {
    return this.memoryData.subjects || [];
  }

  getSubjectById(id) {
    return this.getSubjects().find(s => s.id === id);
  }

  createSubject(subject) {
    this.memoryData.subjects.push(subject);
    this.save();
    return subject;
  }

  updateSubject(id, updates) {
    const idx = this.memoryData.subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.memoryData.subjects[idx] = { ...this.memoryData.subjects[idx], ...updates };
      this.save();
      return this.memoryData.subjects[idx];
    }
    return null;
  }

  deleteSubject(id) {
    this.memoryData.subjects = this.memoryData.subjects.filter(s => s.id !== id);
    // Also remove associated deadlines and sessions
    this.memoryData.deadlines = this.memoryData.deadlines.filter(d => d.subjectId !== id);
    this.memoryData.sessions = this.memoryData.sessions.filter(s => s.subjectId !== id);
    this.save();
    return true;
  }

  // Deadlines
  getDeadlines() {
    return this.memoryData.deadlines || [];
  }

  createDeadline(deadline) {
    this.memoryData.deadlines.push(deadline);
    this.save();
    return deadline;
  }

  updateDeadline(id, updates) {
    const idx = this.memoryData.deadlines.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.memoryData.deadlines[idx] = { ...this.memoryData.deadlines[idx], ...updates };
      this.save();
      return this.memoryData.deadlines[idx];
    }
    return null;
  }

  deleteDeadline(id) {
    this.memoryData.deadlines = this.memoryData.deadlines.filter(d => d.id !== id);
    // Clean up session associations
    this.memoryData.sessions = this.memoryData.sessions.map(s => {
      if (s.deadlineId === id) {
        return { ...s, deadlineId: null };
      }
      return s;
    });
    this.save();
    return true;
  }

  // Availability
  getAvailability() {
    return this.memoryData.availability;
  }

  updateAvailability(updates) {
    this.memoryData.availability = { ...this.memoryData.availability, ...updates };
    this.save();
    return this.memoryData.availability;
  }

  // Sessions
  getSessions() {
    return this.memoryData.sessions || [];
  }

  setSessions(sessions) {
    this.memoryData.sessions = sessions;
    this.save();
    return this.memoryData.sessions;
  }

  createSession(session) {
    this.memoryData.sessions.push(session);
    this.save();
    return session;
  }

  updateSession(id, updates) {
    const idx = this.memoryData.sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.memoryData.sessions[idx] = { ...this.memoryData.sessions[idx], ...updates };
      this.save();
      return this.memoryData.sessions[idx];
    }
    return null;
  }

  deleteSession(id) {
    this.memoryData.sessions = this.memoryData.sessions.filter(s => s.id !== id);
    this.save();
    return true;
  }

  resetToDefault() {
    const initial = getInitialSeedData();
    this.memoryData = initial;
    this.save();
    return initial;
  }
}

export const storage = new StorageService();
