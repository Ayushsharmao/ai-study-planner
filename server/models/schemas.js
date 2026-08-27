import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

export const SiteSettingsSchema = new mongoose.Schema({
  id: { type: String, default: 'global_settings' },
  siteName: { type: String, default: 'StudyMind AI' },
  announcementText: { type: String, default: '🚀 Welcome to StudyMind AI! Optimize your upcoming finals with adaptive spaced repetition.' },
  announcementActive: { type: Boolean, default: true },
  defaultSessionDuration: { type: Number, default: 45 },
  defaultBreakDuration: { type: Number, default: 15 },
  maxDailyHoursCap: { type: Number, default: 8 },
  allowRegistration: { type: Boolean, default: true },
  aiEngineModel: { type: String, default: 'Gemini Flash & Heuristic Optimizer' }
});

export const SubjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  difficulty: { type: Number, default: 3, min: 1, max: 5 },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  targetGrade: { type: String, default: 'A' },
  topics: [{
    id: { type: String },
    title: { type: String, required: true },
    estimatedHours: { type: Number, default: 2 },
    completed: { type: Boolean, default: false }
  }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const DeadlineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  subjectId: { type: String, required: true },
  type: { type: String, enum: ['exam', 'assignment', 'quiz', 'project', 'presentation'], default: 'exam' },
  dueDate: { type: String, required: true }, // YYYY-MM-DD
  weight: { type: Number, default: 20 },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'high' },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const AvailabilitySchema = new mongoose.Schema({
  id: { type: String, default: 'default_availability' },
  userId: { type: String, required: true, index: true },
  weeklyHours: {
    monday: { type: Number, default: 3 },
    tuesday: { type: Number, default: 3 },
    wednesday: { type: Number, default: 4 },
    thursday: { type: Number, default: 3 },
    friday: { type: Number, default: 2 },
    saturday: { type: Number, default: 6 },
    sunday: { type: Number, default: 5 }
  },
  preferredTimeslot: { type: String, enum: ['morning', 'afternoon', 'evening', 'flexible'], default: 'evening' },
  preferredSessionMinutes: { type: Number, default: 45 },
  breakMinutes: { type: Number, default: 15 },
  maxDailyHours: { type: Number, default: 8 },
  bufferDaysBeforeExam: { type: Number, default: 1 }
});

export const StudySessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  subjectId: { type: String, required: true },
  deadlineId: { type: String, default: null },
  topic: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, default: '18:00' },
  endTime: { type: String, default: '18:45' },
  durationMinutes: { type: Number, default: 45 },
  sessionType: { 
    type: String, 
    enum: ['learn', 'practice', 'review', 'mock_exam', 'revision'], 
    default: 'learn' 
  },
  completed: { type: Boolean, default: false },
  actualMinutesStudied: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
