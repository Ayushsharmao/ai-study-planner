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
  Moon 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  setTheme, 
  stats, 
  onOpenQuickAdd, 
  onOpenTimer 
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
              >
                <Icon size={16} />
                <span>{item.label}</span>
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
        </div>
      </div>
    </header>
  );
}
