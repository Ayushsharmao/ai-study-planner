import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ListFilter, 
  Sparkles, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Play, 
  Clock, 
  Trash2,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ScheduleView({ 
  sessions, 
  subjects, 
  deadlines, 
  availability, 
  onToggleSession, 
  onDeleteSession, 
  onStartFocus, 
  onGenerateSchedule, 
  onRebalanceSchedule,
  isGenerating
}) {
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'agenda'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'incomplete' | 'completed'
  const [weekOffset, setWeekOffset] = useState(0);

  // Subject helper
  const getSubject = (id) => subjects.find(s => s.id === id) || { name: 'General', color: '#6366f1' };

  // Filtered sessions
  const filteredSessions = sessions.filter(s => {
    if (selectedSubject !== 'all' && s.subjectId !== selectedSubject) return false;
    if (statusFilter === 'completed' && !s.completed) return false;
    if (statusFilter === 'incomplete' && s.completed) return false;
    return true;
  });

  // Calculate current week days based on weekOffset
  const getDaysOfWeek = (offset) => {
    const curr = new Date();
    // Monday as start of week
    const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1 + (offset * 7)));
    firstDay.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const fullDayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      days.push({
        date: d,
        dateStr,
        dayName,
        fullDayName,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    return days;
  };

  const currentWeekDays = getDaysOfWeek(weekOffset);

  const handleToggle = async (sessionId) => {
    await onToggleSession(sessionId);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  // Group agenda sessions by date
  const agendaGrouped = {};
  filteredSessions.forEach(s => {
    if (!agendaGrouped[s.date]) {
      agendaGrouped[s.date] = [];
    }
    agendaGrouped[s.date].push(s);
  });

  return (
    <div className="schedule-view">
      {/* Top Controls Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Left: View Mode Toggle & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="timer-presets" style={{ margin: 0 }}>
              <button 
                id="btn-view-calendar"
                className={`preset-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Weekly Calendar
              </button>
              <button 
                id="btn-view-agenda"
                className={`preset-btn ${viewMode === 'agenda' ? 'active' : ''}`}
                onClick={() => setViewMode('agenda')}
              >
                Agenda List
              </button>
            </div>

            {/* Subject Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select 
                id="select-filter-subject"
                className="form-select" 
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">All Subjects ({subjects.length})</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select 
              id="select-filter-status"
              className="form-select" 
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="incomplete">Incomplete Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              id="btn-schedule-rebalance"
              className="btn btn-secondary btn-sm" 
              onClick={onRebalanceSchedule}
              title="Reschedule missed sessions"
            >
              <RefreshCw size={14} />
              <span>Smart Rebalance</span>
            </button>

            <button 
              id="btn-schedule-generate"
              className="btn btn-primary btn-sm" 
              onClick={onGenerateSchedule}
              disabled={isGenerating}
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: WEEKLY CALENDAR */}
      {viewMode === 'calendar' && (
        <div>
          {/* Week Navigator */}
          <div className="calendar-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                id="btn-prev-week"
                className="icon-btn" 
                onClick={() => setWeekOffset(weekOffset - 1)}
                title="Previous Week"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {currentWeekDays[0].displayDate} — {currentWeekDays[6].displayDate}
              </h2>
              <button 
                id="btn-next-week"
                className="icon-btn" 
                onClick={() => setWeekOffset(weekOffset + 1)}
                title="Next Week"
              >
                <ChevronRight size={18} />
              </button>
              {weekOffset !== 0 && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setWeekOffset(0)}
                >
                  This Week
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredSessions.length} scheduled sessions
            </div>
          </div>

          {/* 7-Day Week Columns Grid */}
          <div className="week-grid">
            {currentWeekDays.map(day => {
              const daySessions = filteredSessions.filter(s => s.date === day.dateStr);
              const budgetHours = availability?.weeklyHours?.[day.fullDayName] || 0;

              return (
                <div key={day.dateStr} className={`day-column ${day.isToday ? 'is-today' : ''}`}>
                  <div className="day-header">
                    <div className="day-name">{day.dayName}</div>
                    <div className="day-date">{day.date.getDate()}</div>
                    <div className="day-hours-budget">{budgetHours}h budget</div>
                  </div>

                  <div className="day-sessions">
                    {daySessions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        Rest or Free Slot
                      </div>
                    ) : (
                      daySessions.map(session => {
                        const sub = getSubject(session.subjectId);
                        return (
                          <div 
                            key={session.id} 
                            id={`cal-session-${session.id}`}
                            className={`cal-session-card ${session.completed ? 'completed' : ''}`}
                            style={{ '--item-color': sub.color }}
                            onClick={() => handleToggle(session.id)}
                            title={`Click to mark ${session.completed ? 'incomplete' : 'complete'}`}
                          >
                            <div className="cal-session-time">
                              {session.startTime} • {session.durationMinutes}m
                            </div>
                            <div className="cal-session-title" style={{ color: sub.color }}>
                              {sub.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', marginTop: '2px', color: 'var(--text-main)' }}>
                              {session.topic}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                              <span className={`session-type-badge session-type-${session.sessionType}`}>
                                {session.sessionType}
                              </span>
                              {!session.completed && (
                                <button 
                                  className="icon-btn" 
                                  style={{ width: '24px', height: '24px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStartFocus(session);
                                  }}
                                  title="Start Focus Timer"
                                >
                                  <Play size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: AGENDA LIST */}
      {viewMode === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.keys(agendaGrouped).sort().length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3>No study sessions found matching your filters.</h3>
              <p style={{ marginTop: '8px' }}>Try resetting filters or generating a new study schedule.</p>
            </div>
          ) : (
            Object.keys(agendaGrouped).sort().map(dateStr => {
              const daySessions = agendaGrouped[dateStr];
              const dateObj = new Date(dateStr + 'T00:00:00');
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div key={dateStr} className="card">
                  <div className="card-header" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CalendarIcon size={18} className="text-indigo" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </h3>
                      {isToday && (
                        <span className="brand-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                          TODAY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="session-list">
                    {daySessions.map(session => {
                      const sub = getSubject(session.subjectId);
                      return (
                        <div 
                          key={session.id} 
                          className={`session-item ${session.completed ? 'completed' : ''}`}
                          style={{ '--item-color': sub.color }}
                        >
                          <div className="session-left">
                            <div 
                              className={`session-checkbox ${session.completed ? 'checked' : ''}`}
                              onClick={() => handleToggle(session.id)}
                            >
                              {session.completed && <CheckCircle2 size={16} />}
                            </div>

                            <div className="session-details">
                              <div className="session-subject-tag" style={{ color: sub.color }}>
                                <span>{sub.name}</span>
                                <span>•</span>
                                <span>{session.startTime} - {session.endTime} ({session.durationMinutes}m)</span>
                              </div>
                              <div className="session-title">{session.topic}</div>
                              {session.notes && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {session.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="session-actions">
                            {!session.completed && (
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => onStartFocus(session)}
                              >
                                <Play size={14} />
                                <span>Focus</span>
                              </button>
                            )}
                            <button 
                              className="icon-btn" 
                              style={{ width: '32px', height: '32px', color: 'var(--color-danger)' }}
                              onClick={() => onDeleteSession(session.id)}
                              title="Delete Session"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
