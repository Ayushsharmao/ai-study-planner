import React from 'react';
import { 
  Sparkles, 
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
  User,
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'availability', label: 'Study Hours', icon: Sliders },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  // If user is Admin, add the exclusive Admin tab
  if (currentUser && currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield, isAdmin: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setCurrentTab('dashboard')}>
          <div className="brand-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="brand-title">StudyMind AI</div>
          </div>
          <span className="brand-badge">PRO PLANNER</span>
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
                style={item.isAdmin ? { color: isActive ? 'white' : '#c084fc' } : {}}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.isAdmin && (
                  <span style={{ fontSize: '0.62rem', background: 'rgba(168, 85, 247, 0.25)', padding: '1px 5px', borderRadius: '4px' }}>
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Streak pill */}
          <div className="streak-pill" title="Current daily study streak">
            <Flame size={16} fill="#f59e0b" />
            <span>{stats?.streak || 0}d Streak</span>
          </div>

          {/* Pomodoro Focus Timer Trigger */}
          <button 
            id="btn-open-pomodoro" 
            className="btn btn-secondary btn-sm" 
            onClick={onOpenTimer}
            title="Open Focus Pomodoro Timer"
          >
            <Timer size={16} className="text-indigo" />
            <span>Focus Timer</span>
          </button>

          {/* Quick Add */}
          <button 
            id="btn-quick-add" 
            className="btn btn-primary btn-sm" 
            onClick={onOpenQuickAdd}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>

          {/* Theme Toggle */}
          <button 
            id="theme-toggle" 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Account / Auth */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: currentUser.role === 'admin' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: currentUser.role === 'admin' ? 'var(--accent-gradient)' : 'var(--accent-cyan-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'white'
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' && (
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase' }}>
                    Admin
                  </span>
                )}
              </div>

              <button
                id="btn-logout"
                className="icon-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-login"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAuth}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
