import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ScheduleView from './components/ScheduleView';
import SubjectManager from './components/SubjectManager';
import DeadlineManager from './components/DeadlineManager';
import AvailabilitySettings from './components/AvailabilitySettings';
import AnalyticsView from './components/AnalyticsView';
import PomodoroTimer from './components/PomodoroTimer';
import QuickAddModal from './components/QuickAddModal';
import * as api from './services/api';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');

  // Core data states
  const [subjects, setSubjects] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals & Timers
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeSessionForTimer, setActiveSessionForTimer] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Load all initial data from backend
  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, deads, avail, sess, anlys] = await Promise.all([
        api.getSubjects(),
        api.getDeadlines(),
        api.getAvailability(),
        api.getSchedule(),
        api.getAnalytics()
      ]);

      setSubjects(subs || []);
      setDeadlines(deads || []);
      setAvailability(avail || null);
      setSessions(sess || []);
      setAnalytics(anlys || null);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('⚠️ Could not connect to API server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Session actions
  const handleToggleSession = async (sessionId, actualMinutes) => {
    try {
      const updated = await api.toggleSession(sessionId, actualMinutes);
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
      // Refresh analytics
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (err) {
      console.error(err);
      showToast(`Error updating session: ${err.message}`);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
      showToast('Session removed from schedule');
    } catch (err) {
      console.error(err);
      showToast(`Error deleting session: ${err.message}`);
    }
  };

  // Schedule AI Generation
  const handleGenerateSchedule = async () => {
    try {
      setIsGenerating(true);
      const res = await api.generateSchedule({ daysAhead: 14, preserveCompleted: true });
      setSessions(res.data);
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      showToast(`✨ Generated ${res.count} optimized study sessions with spaced repetition!`);
    } catch (err) {
      console.error(err);
      showToast(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Smart Rebalance
  const handleRebalanceSchedule = async () => {
    try {
      const res = await api.rebalanceSchedule();
      setSessions(res.data);
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      showToast(`⚡ ${res.message || 'Smart rebalance complete!'}`);
    } catch (err) {
      console.error(err);
      showToast(`Rebalance failed: ${err.message}`);
    }
  };

  // Subject actions
  const handleCreateSubject = async (subjectData) => {
    try {
      const created = await api.createSubject(subjectData);
      setSubjects(prev => [...prev, created]);
      showToast(`Subject "${created.name}" created!`);
      // Update analytics
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (err) {
      showToast(`Error creating subject: ${err.message}`);
    }
  };

  const handleUpdateSubject = async (id, updates) => {
    try {
      const updated = await api.updateSubject(id, updates);
      setSubjects(prev => prev.map(s => s.id === id ? updated : s));
      showToast(`Subject updated!`);
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (err) {
      showToast(`Error updating subject: ${err.message}`);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure? This will remove associated deadlines and scheduled sessions.')) return;
    try {
      await api.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      setDeadlines(prev => prev.filter(d => d.subjectId !== id));
      setSessions(prev => prev.filter(s => s.subjectId !== id));
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
      showToast('Subject deleted');
    } catch (err) {
      showToast(`Error deleting subject: ${err.message}`);
    }
  };

  // Deadline actions
  const handleCreateDeadline = async (deadlineData) => {
    try {
      const created = await api.createDeadline(deadlineData);
      setDeadlines(prev => [...prev, created]);
      showToast(`Deadline "${created.title}" added!`);
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (err) {
      showToast(`Error creating deadline: ${err.message}`);
    }
  };

  const handleUpdateDeadline = async (id, updates) => {
    try {
      const updated = await api.updateDeadline(id, updates);
      setDeadlines(prev => prev.map(d => d.id === id ? updated : d));
      showToast('Deadline updated');
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (err) {
      showToast(`Error updating deadline: ${err.message}`);
    }
  };

  const handleToggleDeadline = async (id) => {
    try {
      const updated = await api.toggleDeadline(id);
      setDeadlines(prev => prev.map(d => d.id === id ? updated : d));
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
    } catch (err) {
      showToast(`Error toggling deadline: ${err.message}`);
    }
  };

  const handleDeleteDeadline = async (id) => {
    if (!window.confirm('Delete this deadline?')) return;
    try {
      await api.deleteDeadline(id);
      setDeadlines(prev => prev.filter(d => d.id !== id));
      const newAnalytics = await api.getAnalytics();
      setAnalytics(newAnalytics);
      showToast('Deadline deleted');
    } catch (err) {
      showToast(`Error deleting deadline: ${err.message}`);
    }
  };

  // Availability actions
  const handleSaveAvailability = async (newAvailability) => {
    try {
      const updated = await api.updateAvailability(newAvailability);
      setAvailability(updated);
      showToast('Study hours and pacing preferences saved!');
    } catch (err) {
      showToast(`Error saving availability: ${err.message}`);
    }
  };

  // Pomodoro timer launcher
  const handleStartFocus = (session) => {
    setActiveSessionForTimer(session || null);
    setIsTimerOpen(true);
  };

  const handleSessionCompletedInTimer = async (sessionId, minutesSpent) => {
    await handleToggleSession(sessionId, minutesSpent);
    showToast(`🎯 Logged ${minutesSpent}m focus study session!`);
  };

  // Filter today's sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);

  return (
    <div className="app-layout">
      {/* Navigation */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        setTheme={setTheme}
        stats={analytics?.summary}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenTimer={() => {
          setActiveSessionForTimer(null);
          setIsTimerOpen(true);
        }}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-secondary)',
          color: 'var(--text-main)',
          padding: '14px 22px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--accent-primary)',
          boxShadow: 'var(--shadow-lg), 0 0 20px rgba(99, 102, 241, 0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUp 0.3s ease'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🧠</div>
            <h2>Loading your study plan...</h2>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard 
                stats={analytics}
                todaySessions={todaySessions}
                deadlines={deadlines}
                subjects={subjects}
                onToggleSession={handleToggleSession}
                onStartFocus={handleStartFocus}
                onGenerateSchedule={handleGenerateSchedule}
                onRebalanceSchedule={handleRebalanceSchedule}
                onNavigateToSchedule={() => setCurrentTab('schedule')}
                onNavigateToDeadlines={() => setCurrentTab('deadlines')}
                isGenerating={isGenerating}
              />
            )}

            {currentTab === 'schedule' && (
              <ScheduleView 
                sessions={sessions}
                subjects={subjects}
                deadlines={deadlines}
                availability={availability}
                onToggleSession={handleToggleSession}
                onDeleteSession={handleDeleteSession}
                onStartFocus={handleStartFocus}
                onGenerateSchedule={handleGenerateSchedule}
                onRebalanceSchedule={handleRebalanceSchedule}
                isGenerating={isGenerating}
              />
            )}

            {currentTab === 'subjects' && (
              <SubjectManager 
                subjects={subjects}
                onCreateSubject={handleCreateSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            )}

            {currentTab === 'deadlines' && (
              <DeadlineManager 
                deadlines={deadlines}
                subjects={subjects}
                onCreateDeadline={handleCreateDeadline}
                onUpdateDeadline={handleUpdateDeadline}
                onDeleteDeadline={handleDeleteDeadline}
                onToggleDeadline={handleToggleDeadline}
              />
            )}

            {currentTab === 'availability' && (
              <AvailabilitySettings 
                availability={availability}
                onSaveAvailability={handleSaveAvailability}
                onRegenerateAfterSave={handleGenerateSchedule}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView 
                analytics={analytics}
                subjects={subjects}
                deadlines={deadlines}
              />
            )}
          </>
        )}
      </main>

      {/* Focus Pomodoro Timer Modal */}
      <PomodoroTimer 
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        activeSession={activeSessionForTimer}
        onSessionCompleted={handleSessionCompletedInTimer}
      />

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        subjects={subjects}
        onCreateSubject={handleCreateSubject}
        onCreateDeadline={handleCreateDeadline}
      />
    </div>
  );
}
