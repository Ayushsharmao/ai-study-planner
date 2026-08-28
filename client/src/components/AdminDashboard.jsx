import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Settings, 
  Megaphone, 
  Clock, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  BarChart, 
  UserCheck, 
  UserMinus,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as api from '../services/api';

export default function AdminDashboard({ onSiteSettingsUpdated }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    siteName: 'StudyMind AI',
    announcementText: '',
    announcementActive: true,
    defaultSessionDuration: 45,
    defaultBreakDuration: 15,
    maxDailyHoursCap: 8
  });

  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [platformStats, allUsers, siteConfig] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminSiteSettings()
      ]);

      setStats(platformStats);
      setUsers(allUsers || []);
      if (siteConfig) setSettings(siteConfig);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateAdminSiteSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      if (onSiteSettingsUpdated) onSiteSettingsUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Error updating settings: ${err.message}`);
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${nextRole.toUpperCase()}?`)) return;

    try {
      await api.updateUserRole(user.id, nextRole);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}" and all their study data?`)) return;

    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      // Refresh stats
      const newStats = await api.getAdminStats();
      setStats(newStats);
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    u.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <Shield size={36} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
        <h2>Loading Administrator Workspace...</h2>
      </div>
    );
  }

  return (
    <div className="admin-view">
      {/* Admin Header Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-surface-raised)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={22} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Administrator Console</h2>
              <span className="session-type-badge" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
                MASTER ACCESS
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Manage registered student profiles, review new user signups, and control global system settings.
            </p>
          </div>
        </div>
      </div>

      {/* Platform KPI Strip */}
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)' }}>
            <Users size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalUsers || users.length}</div>
            <div className="metric-label">Registered Accounts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success)' }}>
            <BarChart size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalSubjects || 0}</div>
            <div className="metric-label">Enrolled Courses</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--color-warning-subtle)', color: 'var(--color-warning)' }}>
            <Clock size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalHoursStudied || 0}h</div>
            <div className="metric-label">Total Hours Studied</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'var(--color-info-subtle)', color: 'var(--color-info)' }}>
            <Activity size={20} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalSessions || 0}</div>
            <div className="metric-label">Sessions Scheduled</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
        {/* Left: Global Site Settings Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Settings size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Site Settings & Broadcast</span>
              </h3>
              <div className="card-subtitle">Global announcements and session defaults</div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Site Name */}
              <div className="form-group">
                <label className="form-label">Platform Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              {/* Announcement Banner */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Megaphone size={15} style={{ color: 'var(--color-warning)' }} />
                    <span>Global Banner</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={settings.announcementActive}
                      onChange={e => setSettings({ ...settings, announcementActive: e.target.checked })}
                    />
                    <span>Show Banner</span>
                  </label>
                </div>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Type an announcement to broadcast to all students..."
                  value={settings.announcementText}
                  onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Default Focus (mins)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.defaultSessionDuration}
                    onChange={e => setSettings({ ...settings, defaultSessionDuration: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Break (mins)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.defaultBreakDuration}
                    onChange={e => setSettings({ ...settings, defaultBreakDuration: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button
                id="btn-save-admin-settings"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '4px' }}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Settings Broadcast Live!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Detailed Registered Students Directory */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Users size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>User Accounts Directory ({users.length})</span>
              </h3>
              <div className="card-subtitle">Detailed user profile & registration records</div>
            </div>

            <input
              type="text"
              className="form-input"
              style={{ width: '160px', padding: '5px 10px', fontSize: '0.8rem' }}
              placeholder="Search user..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
            {filteredUsers.map(user => {
              const formattedJoinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A';

              const formattedLastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              }) : 'Recent';

              const isGoogleUser = user.authProvider === 'google' || user.picture;

              return (
                <div
                  key={user.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {user.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          background: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{user.name}</span>
                          <span
                            className="session-type-badge"
                            style={{
                              fontSize: '0.65rem',
                              background: user.role === 'admin' ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                              color: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                            }}
                          >
                            {user.role.toUpperCase()}
                          </span>

                          {/* Auth Provider Badge */}
                          <span 
                            style={{ 
                              fontSize: '0.68rem', 
                              padding: '1px 6px', 
                              borderRadius: 'var(--radius-xs)',
                              background: isGoogleUser ? 'rgba(66, 133, 244, 0.15)' : 'var(--bg-subtle)',
                              color: isGoogleUser ? '#60a5fa' : 'var(--text-secondary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isGoogleUser ? 'Google' : 'Email'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {user.email} • Age: <strong style={{ color: 'var(--text-primary)' }}>{user.age || 20}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                        onClick={() => handleToggleRole(user)}
                        title={user.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                      >
                        {user.role === 'admin' ? <UserMinus size={12} /> : <UserCheck size={12} />}
                        <span>{user.role === 'admin' ? 'Demote' : 'Make Admin'}</span>
                      </button>

                      <button
                        className="icon-btn"
                        style={{ width: '28px', height: '28px', color: 'var(--color-danger)' }}
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        title="Delete User"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Details Row */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div>
                      <span>Joined: <strong>{formattedJoinedDate}</strong></span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>Last active: <strong>{formattedLastLogin}</strong></span>
                    </div>

                    <div>
                      <span><strong>{user.subjectsCount || 0}</strong> courses</span>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span><strong>{user.hoursStudied || 0}h</strong> studied</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
