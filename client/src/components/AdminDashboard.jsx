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
  UserMinus 
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
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <Shield size={40} className="text-indigo" style={{ margin: '0 auto 12px' }} />
        <h2>Loading Administrator Console...</h2>
      </div>
    );
  }

  return (
    <div className="admin-view">
      {/* Admin Header Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={24} style={{ color: '#818cf8' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Master Administrator Dashboard</h2>
              <span className="brand-badge" style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', borderColor: '#a855f7' }}>
                ADMIN ONLY
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Control global platform settings, manage student accounts, and view platform-wide study volume metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Platform KPI Strip */}
      <div className="metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalUsers || users.length}</div>
            <div className="metric-label">Registered Students</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <BarChart size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalSubjects || 0}</div>
            <div className="metric-label">Course Subjects Enrolled</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalHoursStudied || 0}h</div>
            <div className="metric-label">Total Hours Studied</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            <Sparkles size={24} />
          </div>
          <div className="metric-info">
            <div className="metric-value">{stats?.totalSessions || 0}</div>
            <div className="metric-label">Study Sessions Scheduled</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '24px' }}>
        {/* Left: Global Site Settings Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Settings size={20} className="text-indigo" />
                <span>Global Site Settings</span>
              </h3>
              <div className="card-subtitle">Broadcasts & AI scheduling defaults</div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Site Name */}
              <div className="form-group">
                <label className="form-label">Platform Branding Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              {/* Announcement Banner */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Megaphone size={16} style={{ color: '#f59e0b' }} />
                    <span>Broadcast Announcement</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.announcementActive}
                      onChange={e => setSettings({ ...settings, announcementActive: e.target.checked })}
                    />
                    <span>Show on Dashboard</span>
                  </label>
                </div>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Type an announcement to display to all students..."
                  value={settings.announcementText}
                  onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Default Session (mins)</label>
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
                style={{ width: '100%', marginTop: '6px' }}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Settings Updated & Broadcast Live!</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Platform Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Student Users Directory */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Users size={20} className="text-indigo" />
                <span>Student Directory ({users.length})</span>
              </h3>
              <div className="card-subtitle">Manage user roles and permissions</div>
            </div>

            <input
              type="text"
              className="form-input"
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.82rem' }}
              placeholder="Search user..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '460px', overflowY: 'auto' }}>
            {filteredUsers.map(user => {
              return (
                <div
                  key={user.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: user.role === 'admin' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'white'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>{user.name}</span>
                      <span
                        className="brand-badge"
                        style={{
                          fontSize: '0.65rem',
                          background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.06)',
                          color: user.role === 'admin' ? '#c084fc' : 'var(--text-muted)'
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {user.email} • {user.subjectsCount || 0} subjects • {user.hoursStudied || 0}h studied
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      onClick={() => handleToggleRole(user)}
                      title={user.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                    >
                      {user.role === 'admin' ? <UserMinus size={13} /> : <UserCheck size={13} />}
                      <span>{user.role === 'admin' ? 'Demote' : 'Make Admin'}</span>
                    </button>

                    <button
                      className="icon-btn"
                      style={{ width: '30px', height: '30px', color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      title="Delete User"
                    >
                      <Trash2 size={13} />
                    </button>
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
