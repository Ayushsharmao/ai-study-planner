import React from 'react';
import { 
  Sparkles, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Flame, 
  TrendingUp, 
  AlertCircle, 
  BookOpen, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ 
  stats, 
  todaySessions, 
  deadlines, 
  subjects, 
  onToggleSession, 
  onStartFocus, 
  onGenerateSchedule, 
  onRebalanceSchedule,
  onNavigateToSchedule,
  onNavigateToDeadlines,
  isGenerating
}) {
  const summary = stats?.summary || {};
  const readiness = stats?.summary ? Math.min(100, Math.round(stats.summary.completionRate * 0.5 + 50)) : 78;

  const handleCheckboxClick = async (sessionId, e) => {
    e.stopPropagation();
    await onToggleSession(sessionId);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const getSubjectColor = (subId) => {
    const sub = subjects.find(s => s.id === subId);
    return sub ? sub.color : '#6366f1';
  };

  const getSubjectName = (subId) => {
    const sub = subjects.find(s => s.id === subId);
    return sub ? sub.name : 'General';
  };

  return (
    <div className="dashboard-view">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <GraduationCap size={24} className="text-indigo" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
              Adaptive Learning Intelligence
            </span>
          </div>
          <h1>Optimize Your Study Flow with AI</h1>
          <p>
            Distribute complex subjects across peak cognitive hours, leverage spaced repetition, and stay ahead of critical exam deadlines effortlessly.
          </p>
        </div>

        <div className="hero-actions">
          <button 
            id="btn-hero-generate" 
            className="btn btn-primary btn-lg live-pulse" 
            onClick={onGenerateSchedule}
            disabled={isGenerating}
          >
            <Sparkles size={18} />
            <span>{isGenerating ? 'Synthesizing Plan...' : 'Generate AI Schedule'}</span>
          </button>

          <button 
            id="btn-hero-rebalance" 
            className="btn btn-secondary btn-lg" 
            onClick={onRebalanceSchedule}
            title="Missed sessions? Rebalance remaining topics across upcoming available hours"
          >
            <RefreshCw size={18} />
            <span>Smart Rebalance</span>
          </button>
        </div>
      </section>

      {/* 4 Metric Cards Strip */}
      <section className="metrics-grid">
        {/* Today's Progress */}
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {todaySessions.filter(s => s.completed).length} / {todaySessions.length}
            </div>
            <div className="metric-label">Today's Sessions Done</div>
          </div>
        </div>

        {/* Total Hours Studied */}
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Clock size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {summary.totalActualHours || 0}h
            </div>
            <div className="metric-label">Studied of {summary.totalPlannedHours || 0}h Planned</div>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Flame size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {summary.streak || 0} Days
            </div>
            <div className="metric-label">Consistency Streak</div>
          </div>
        </div>

        {/* Exam Readiness Index */}
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {readiness}%
            </div>
            <div className="metric-label">Exam Readiness Index</div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="dashboard-grid">
        {/* Left: Today's Agenda Checklist */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Clock size={20} className="text-indigo" />
                <span>Today's Study Agenda</span>
              </h2>
              <div className="card-subtitle">
                {todaySessions.length} sessions scheduled for today
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onNavigateToSchedule}
            >
              <span>Full Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="session-list">
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>All clear for today! No pending sessions.</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ marginTop: '14px' }} 
                  onClick={onGenerateSchedule}
                >
                  <Sparkles size={14} />
                  <span>Generate New Study Plan</span>
                </button>
              </div>
            ) : (
              todaySessions.map(session => {
                const subColor = getSubjectColor(session.subjectId);
                const subName = getSubjectName(session.subjectId);

                return (
                  <div 
                    key={session.id} 
                    className={`session-item ${session.completed ? 'completed' : ''}`}
                    style={{ '--item-color': subColor }}
                  >
                    <div className="session-left">
                      <div 
                        id={`check-session-${session.id}`}
                        className={`session-checkbox ${session.completed ? 'checked' : ''}`}
                        onClick={(e) => handleCheckboxClick(session.id, e)}
                        title={session.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {session.completed && <CheckCircle2 size={16} />}
                      </div>

                      <div className="session-details">
                        <div className="session-subject-tag" style={{ color: subColor }}>
                          <span>{subName}</span>
                          <span>•</span>
                          <span>{session.startTime} - {session.endTime} ({session.durationMinutes}m)</span>
                        </div>
                        <div className="session-title">{session.topic}</div>
                        <div className="session-meta">
                          <span className={`session-type-badge session-type-${session.sessionType}`}>
                            {session.sessionType.replace('_', ' ')}
                          </span>
                          {session.notes && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                              💡 {session.notes.slice(0, 50)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="session-actions">
                      {!session.completed && (
                        <button 
                          id={`btn-focus-${session.id}`}
                          className="btn btn-secondary btn-sm" 
                          onClick={() => onStartFocus(session)}
                          title="Start Focus Timer on this task"
                        >
                          <Play size={14} />
                          <span>Focus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Deadlines & AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Deadlines Widget */}
          <section className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                  <span>Upcoming Deadlines</span>
                </h3>
                <div className="card-subtitle">Exams & Assignments countdown</div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onNavigateToDeadlines}
              >
                <span>View All</span>
              </button>
            </div>

            <div className="deadline-list">
              {deadlines.slice(0, 4).map(deadline => {
                const today = new Date();
                const due = new Date(deadline.dueDate);
                const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                
                let countdownClass = 'countdown-safe';
                if (diffDays <= 3) countdownClass = 'countdown-urgent';
                else if (diffDays <= 7) countdownClass = 'countdown-warning';

                return (
                  <div key={deadline.id} className="deadline-item">
                    <div className="deadline-info">
                      <div className="deadline-title">{deadline.title}</div>
                      <div className="deadline-due">
                        <span>Due: {deadline.dueDate}</span>
                        <span>•</span>
                        <span>Weight: {deadline.weight}%</span>
                      </div>
                    </div>

                    <div className={`countdown-tag ${countdownClass}`}>
                      {diffDays <= 0 ? 'Due Today' : `${diffDays}d left`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Spaced-Repetition Insights Card */}
          <section className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem' }}>
                <Sparkles size={18} className="text-indigo" />
                <span>AI Study Recommendations</span>
              </h3>
            </div>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Spaced review checkpoints are active for difficult subjects (e.g. Physics & Algorithms).</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#6366f1', fontWeight: 'bold' }}>✓</span>
                <span>Active recall sessions are interleaved before mock exam simulations.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⚡</span>
                <span>Need to catch up? Use <strong>Smart Rebalance</strong> to redistribute missed topics without manual rescheduling.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
