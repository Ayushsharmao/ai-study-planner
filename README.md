# 🧠 StudyMind AI — Intelligent Study Planner & Schedule Optimizer

A full-stack, AI-powered study schedule generator and progress tracker. Students define subjects, curriculum topics, exam deadlines, and daily available study hours; the app creates an adaptive, spaced-repetition study schedule, tracks consistency streaks, and provides an embedded Pomodoro focus timer.

---

## 🌟 Key Features

1. **AI Study Schedule Generator**:
   - **Urgency & Difficulty Balancing**: Weights upcoming exam deadlines and subject difficulty (1-5 scale).
   - **Spaced Repetition & Active Recall**: Interleaves *Learn*, *Practice*, *Review*, and *Mock Exam* sessions.
   - **Smart Rebalance**: Missed a session? One-click rebalance redistributes uncompleted topics across future days without disrupting completed work.
2. **Interactive Schedule Views**:
   - **Weekly Calendar Grid**: Day-by-day time blocks with subject color accents and daily study budget indicators.
   - **Daily Agenda Checklist**: Interactive checkboxes with confetti animations and direct focus launcher.
3. **Embedded Pomodoro Focus Timer**:
   - Customizable presets (25m Focus, 45m Deep, 5m/15m Break).
   - Animated circular SVG countdown ring.
   - Synthesized soothing chime tones via Web Audio API (zero external sound dependencies).
   - One-click "Complete & Log Task" directly updates your study progress and analytics.
4. **Subject Catalog & Syllabus Breakdown**:
   - Color tag selector, difficulty ratings, priority badges, target grade goals.
   - Interactive topic/chapter checklists with quick-add feature.
5. **Deadlines & Milestone Tracker**:
   - Days-remaining countdown badges with automatic urgency alerts (urgent red for $\le 3$ days, warning amber for $\le 7$ days).
   - Tracks exam weights (%) and allowed study materials.
6. **Study Hours & Pacing Settings**:
   - Interactive daily sliders (Monday–Sunday) with real-time weekly budget calculations.
   - Presets for *Light* (15h/w), *Balanced* (27h/w), and *Exam Crunch* (39h/w).
7. **Performance & Workload Analytics**:
   - Consistency streak tracker.
   - Planned vs. actual study hours comparison.
   - Per-subject syllabus completion bars.
   - Exam preparedness score gauges.
8. **Ultra-Modern Glassmorphism UI**:
   - Deep obsidian/indigo dark theme + high-contrast light theme toggle.
   - Fluid typography (Outfit & Plus Jakarta Sans).
   - Fully responsive for desktop, tablet, and mobile.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 / Vite, Vanilla CSS Design System (no Tailwind dependency), Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express REST API, CORS, dotenv.
- **Database**: MongoDB with Mongoose + Automatic Resilient Persistent Storage fallback (`server/data/store.json`) for instant zero-configuration local usage.
- **AI Engine**: Algorithmic Spaced-Repetition Scheduler + optional Gemini API integration.

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+ and npm installed.

### 1. Install Dependencies
```bash
# In the project root:
npm run install:all
```
*(or run `npm install` inside both `client/` and `server/`)*

### 2. Start the Application
Open two terminal windows:

**Terminal 1 — Backend Server (Port 5000):**
```bash
npm run dev:server
```

**Terminal 2 — Frontend App (Port 3000):**
```bash
npm run dev:client
```

Open your browser and visit: **`http://localhost:3000`**

---

## ☁️ Cloud Deployment Guide

The app is ready to be deployed to any cloud hosting provider.

### Option A: Unified Full-Stack Deployment on Render or Railway (Recommended)

Because Express is already configured to serve the built Vite client from `client/dist`, you can deploy the entire app as a **single service**!

1. **Push your repository to GitHub**.
2. **On Render (render.com)**:
   - Click **New Web Service** and connect your repo.
   - **Build Command**:
     ```bash
     npm run install:all && npm run build:client
     ```
   - **Start Command**:
     ```bash
     node server/server.js
     ```
   - **Environment Variables** (Optional):
     - `PORT`: `5000` (or leave default assigned by Render)
     - `MONGODB_URI`: Your MongoDB Atlas connection string (if using MongoDB Atlas)
     - `NODE_ENV`: `production`

---

### Option B: Split Deployment (Vercel Frontend + Render Backend)

#### 1. Deploy the Backend to Render or Railway
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node server.js`
- Copy your deployed backend URL (e.g. `https://study-planner-api.onrender.com`).

#### 2. Deploy the Frontend to Vercel (vercel.com)
- Root Directory: `client`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Set Environment Variable:
  - `VITE_API_URL`: `https://study-planner-api.onrender.com` (your backend URL)

---

## 🗄️ MongoDB Atlas Setup (Optional)
If you want to use cloud-hosted MongoDB instead of the automatic local persistent JSON storage:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** and create a user.
3. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
4. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/studyplanner?retryWrites=true&w=majority`
5. Set `MONGODB_URI` in your `server/.env` or deployment settings.
