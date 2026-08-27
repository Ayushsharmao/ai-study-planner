import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  Clock, 
  Sliders, 
  BarChart3, 
  Flame, 
  Timer, 
  Plus, 
  Sun, 
  Moon,
  Shield,
  LogOut,
  LogIn
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  setTheme, 
  stats, 
  currentUser,
  onOpenQuickAdd, 
  onOpenTimer,
  onOpenAuth,
  onLogout
}) {
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'schedule', label: 'Calendar', icon: CalendarDays },
    { id: 'subjects', label: 'Courses', icon: BookOpen },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'availability', label: 'Hours', icon: Sliders },
    { id: 'analytics', label: 'Progress', icon: BarChart3 }
  ];

  if (currentUser && currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield, isAdmin: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setCurrentTab('dashboard')}>
          <div className="brand-icon">
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>S</span>
          </div>
          <div>
            <span className="brand-title">StudyMind</span>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="nav-tabs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentTab(item.id)}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Streak pill */}
          <div className="streak-pill" title="Daily study streak">
            <Flame size={14} fill="currentColor" />
            <span>{stats?.streak || 0}d</span>
          </div>

          {/* Pomodoro Focus Timer */}
          <button 
            id="btn-open-pomodoro" 
            className="btn btn-secondary btn-sm" 
            onClick={onOpenTimer}
            title="Focus Timer"
          >
            <Timer size={14} />
            <span>Timer</span>
          </button>

          {/* Quick Add */}
          <button 
            id="btn-quick-add" 
            className="btn btn-primary btn-sm" 
            onClick={onOpenQuickAdd}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>

          {/* Theme Toggle */}
          <button 
            id="theme-toggle" 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Account */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  background: currentUser.role === 'admin' ? '#7c3aed' : 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>

              <button
                id="btn-logout"
                className="icon-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-login"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAuth}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
