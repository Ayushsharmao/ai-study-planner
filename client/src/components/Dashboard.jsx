import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  CalendarDays, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  BookOpen
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
  const completedToday = todaySessions.filter(s => s.completed).length;

  const handleCheckboxClick = async (sessionId, e) => {
    e.stopPropagation();
    await onToggleSession(sessionId);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  const getSubjectColor = (subId) => {
    const sub = subjects.find(s => s.id === subId);
    return sub ? sub.color : '#4f46e5';
  };

  const getSubjectName = (subId) => {
    const sub = subjects.find(s => s.id === subId);
    return sub ? sub.name : 'General';
  };

  return (
    <div className="dashboard-view">
      {/* Top Banner / Student Briefing */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Today's Overview</h1>
          <p>
            You have {todaySessions.length} study session{todaySessions.length === 1 ? '' : 's'} scheduled for today. 
            Keep your momentum going across your priority courses.
          </p>
        </div>

        <div className="hero-actions">
          <button 
            id="btn-hero-generate" 
            className="btn btn-primary" 
            onClick={onGenerateSchedule}
            disabled={isGenerating}
          >
            <Sparkles size={15} />
            <span>{isGenerating ? 'Planning...' : 'Auto-Plan Schedule'}</span>
          </button>

          <button 
            id="btn-hero-rebalance" 
            className="btn btn-secondary" 
            onClick={onRebalanceSchedule}
            title="Redistribute missed sessions across upcoming available study slots"
          >
            <RefreshCw size={15} />
            <span>Rebalance</span>
          </button>
        </div>
      </section>

      {/* 4 Clean Metric Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
            <Calendar size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {completedToday} of {todaySessions.length}
            </div>
            <div className="metric-label">Completed Today</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success)' }}>
            <Clock size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {summary.totalActualHours || 0}h
            </div>
            <div className="metric-label">{summary.totalPlannedHours || 0}h planned this week</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--color-warning-subtle)', color: 'var(--color-warning)' }}>
            <CalendarDays size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {summary.streak || 0} Days
            </div>
            <div className="metric-label">Daily Study Streak</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--color-info-subtle)', color: 'var(--color-info)' }}>
            <BookOpen size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">
              {summary.completionRate || 0}%
            </div>
            <div className="metric-label">Schedule Completion</div>
          </div>
        </div>
      </section>

      {/* Two Column Workspace */}
      <div className="dashboard-grid">
        {/* Left: Today's Study Agenda */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Today's Sessions</span>
              </h2>
              <div className="card-subtitle">
                {todaySessions.length} block{todaySessions.length === 1 ? '' : 's'} assigned to today
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onNavigateToSchedule}
            >
              <span>Weekly Calendar</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="session-list">
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>No sessions scheduled for today.</p>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ marginTop: '12px' }} 
                  onClick={onGenerateSchedule}
                >
                  Plan Next Sessions
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
                  >
                    <div className="session-left">
                      <div 
                        id={`check-session-${session.id}`}
                        className={`session-checkbox ${session.completed ? 'checked' : ''}`}
                        onClick={(e) => handleCheckboxClick(session.id, e)}
                        title={session.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {session.completed && <CheckCircle2 size={13} />}
                      </div>

                      <div className="session-details">
                        <div className="session-subject-tag" style={{ color: subColor }}>
                          <span>{subName}</span>
                          <span>•</span>
                          <span>{session.startTime} - {session.endTime} ({session.durationMinutes}m)</span>
                        </div>
                        <div className="session-title">{session.topic}</div>
                        <div className="session-meta">
                          <span className="session-type-badge">
                            {session.sessionType.replace('_', ' ')}
                          </span>
                          {session.notes && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              {session.notes.slice(0, 55)}...
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
                          title="Start Focus Timer"
                        >
                          <Play size={12} />
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

        {/* Right Column: Deadlines & Strategic Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Upcoming Deadlines */}
          <section className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <AlertCircle size={18} style={{ color: 'var(--color-warning)' }} />
                  <span>Upcoming Deadlines</span>
                </h3>
                <div className="card-subtitle">Exams & milestones</div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onNavigateToDeadlines}
              >
                <span>All Deadlines</span>
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
                        <span>Due {deadline.dueDate}</span>
                        <span>•</span>
                        <span>{deadline.weight}% weight</span>
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

          {/* Clean Study Strategy Note */}
          <section className="card" style={{ background: 'var(--bg-surface-raised)' }}>
            <div className="card-header" style={{ marginBottom: '10px' }}>
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                <span>Study Strategy</span>
              </h3>
            </div>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>•</span>
                <span>Active recall sessions are interleaved before major exam dates.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>•</span>
                <span>Missed a study block? Click <strong>Rebalance</strong> to adjust future slots automatically.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
