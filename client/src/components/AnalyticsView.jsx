import React from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AnalyticsView({ analytics, subjects, deadlines }) {
  const summary = analytics?.summary || {
    totalSessions: 0,
    completedCount: 0,
    completionRate: 0,
    totalPlannedHours: 0,
    totalActualHours: 0,
    streak: 0
  };

  const subjectStats = analytics?.subjectStats || [];
  const upcomingDeadlines = analytics?.upcomingDeadlines || [];
  const dailyBreakdown = analytics?.dailyBreakdown || [];

  return (
    <div className="analytics-view">
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={22} className="text-indigo" />
          <span>Study Performance & Workload Analytics</span>
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Real-time metrics on your study pacing, subject distribution, and exam preparedness.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{summary.completionRate}%</div>
            <div className="metric-label">Schedule Completion Rate</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Clock size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{summary.totalActualHours}h / {summary.totalPlannedHours}h</div>
            <div className="metric-label">Actual vs Planned Hours</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Flame size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{summary.streak} Days</div>
            <div className="metric-label">Active Learning Streak</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{summary.completedCount} of {summary.totalSessions}</div>
            <div className="metric-label">Completed Study Blocks</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Subject-Wise Time Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Layers size={20} className="text-indigo" />
                <span>Subject Study Distribution</span>
              </h3>
              <div className="card-subtitle">Hours logged vs. planned per course</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {subjectStats.map(sub => {
              return (
                <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: sub.color }} />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sub.name}</span>
                      {sub.code && <span className="subject-code" style={{ fontSize: '0.75rem' }}>{sub.code}</span>}
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      <span>{sub.actualHours}h</span>
                      <span style={{ color: 'var(--text-muted)' }}> of {sub.plannedHours}h</span>
                      <span style={{ marginLeft: '8px', color: sub.color }}>({sub.completionRate}%)</span>
                    </div>
                  </div>

                  <div className="progress-bar-container" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${Math.min(100, sub.completionRate)}%`, 
                        background: sub.color 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam Readiness by Deadline */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Award size={20} style={{ color: '#f59e0b' }} />
                <span>Exam Preparedness</span>
              </h3>
              <div className="card-subtitle">Readiness factor per milestone</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {upcomingDeadlines.map(d => {
              return (
                <div 
                  key={d.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${d.subjectColor}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{d.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {d.subjectName} • Due in {d.daysLeft} days
                      </div>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: d.readiness >= 75 ? '#10b981' : '#f59e0b' }}>
                      {d.readiness}%
                    </div>
                  </div>

                  <div className="progress-bar-container" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${d.readiness}%`,
                        background: d.readiness >= 75 ? 'var(--accent-emerald-gradient)' : 'var(--accent-amber-gradient)' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Study Timeline / History */}
      {dailyBreakdown.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Calendar size={20} className="text-indigo" />
                <span>Daily Study Volume Timeline</span>
              </h3>
              <div className="card-subtitle">Planned vs. Actual study duration over days</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', padding: '10px 0', overflowX: 'auto' }}>
            {dailyBreakdown.map(day => {
              const plannedHrs = day.plannedMins / 60;
              const actualHrs = day.actualMins / 60;
              const maxScale = 6; // max 6 hours
              const plannedHeight = Math.min(100, Math.round((plannedHrs / maxScale) * 100));
              const actualHeight = Math.min(100, Math.round((actualHrs / maxScale) * 100));

              const d = new Date(day.date + 'T00:00:00');
              const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow', month: 'numeric', day: 'numeric' });

              return (
                <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '42px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '110px', width: '100%', justifyContent: 'center' }}>
                    {/* Planned Bar */}
                    <div 
                      style={{ 
                        width: '12px', 
                        height: `${Math.max(8, plannedHeight)}%`, 
                        background: 'rgba(99, 102, 241, 0.25)', 
                        borderRadius: '4px 4px 0 0' 
                      }} 
                      title={`Planned: ${plannedHrs.toFixed(1)}h`}
                    />
                    {/* Actual Bar */}
                    <div 
                      style={{ 
                        width: '12px', 
                        height: `${Math.max(4, actualHeight)}%`, 
                        background: 'var(--accent-gradient)', 
                        borderRadius: '4px 4px 0 0' 
                      }} 
                      title={`Actual: ${actualHrs.toFixed(1)}h`}
                    />
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
