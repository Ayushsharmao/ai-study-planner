import React, { useState, useEffect } from 'react';
import { Sliders, Clock, Sparkles, Check, Save, Zap, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export default function AvailabilitySettings({ 
  availability, 
  onSaveAvailability,
  onRegenerateAfterSave
}) {
  const [weeklyHours, setWeeklyHours] = useState({
    monday: 3,
    tuesday: 3,
    wednesday: 4,
    thursday: 3,
    friday: 2,
    saturday: 6,
    sunday: 5
  });

  const [preferredTimeslot, setPreferredTimeslot] = useState('evening');
  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (availability) {
      if (availability.weeklyHours) setWeeklyHours(availability.weeklyHours);
      if (availability.preferredTimeslot) setPreferredTimeslot(availability.preferredTimeslot);
      if (availability.preferredSessionMinutes) setPreferredSessionMinutes(availability.preferredSessionMinutes);
      if (availability.breakMinutes) setBreakMinutes(availability.breakMinutes);
    }
  }, [availability]);

  const handleHourChange = (dayKey, val) => {
    setWeeklyHours(prev => ({
      ...prev,
      [dayKey]: parseFloat(val)
    }));
  };

  const totalWeeklyHours = Object.values(weeklyHours).reduce((a, b) => a + Number(b), 0);

  const applyPreset = (type) => {
    if (type === 'crunch') {
      setWeeklyHours({ monday: 5, tuesday: 5, wednesday: 5, thursday: 5, friday: 4, saturday: 8, sunday: 7 });
    } else if (type === 'balanced') {
      setWeeklyHours({ monday: 3.5, tuesday: 3.0, wednesday: 4.0, thursday: 3.5, friday: 2.5, saturday: 6.0, sunday: 5.0 });
    } else if (type === 'light') {
      setWeeklyHours({ monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 1.5, saturday: 3, sunday: 3 });
    }
  };

  const handleSave = async (regenerate = false) => {
    const payload = {
      weeklyHours,
      preferredTimeslot,
      preferredSessionMinutes: Number(preferredSessionMinutes),
      breakMinutes: Number(breakMinutes)
    };

    await onSaveAvailability(payload);
    setSavedSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => setSavedSuccess(false), 3000);

    if (regenerate && onRegenerateAfterSave) {
      await onRegenerateAfterSave();
    }
  };

  return (
    <div className="availability-view">
      {/* Header */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={22} className="text-indigo" />
            <span>Available Study Hours & Pacing Settings</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Define how many hours you can realistically dedicate each day. The AI schedule strictly respects your budget.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('light')}>
            Light (15h/w)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('balanced')}>
            Balanced (27h/w)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('crunch')}>
            <Zap size={14} className="text-indigo" />
            <span>Exam Crunch (39h/w)</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Left: Daily Hours Sliders */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={20} className="text-indigo" />
                <span>Weekly Time Budget</span>
              </h3>
              <div className="card-subtitle">Adjust daily study hours capacity</div>
            </div>

            <div className="brand-badge" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              Total: {totalWeeklyHours.toFixed(1)} hrs / week
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {DAYS.map(day => {
              const val = weeklyHours[day.key] ?? 3;
              return (
                <div key={day.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ width: '110px', fontWeight: 600, fontSize: '0.95rem' }}>
                    {day.label}
                  </div>

                  <div className="slider-group" style={{ flex: 1 }}>
                    <input 
                      id={`slider-${day.key}`}
                      type="range" 
                      min="0" 
                      max="10" 
                      step="0.5"
                      className="slider-input"
                      value={val}
                      onChange={e => handleHourChange(day.key, e.target.value)}
                    />
                  </div>

                  <div style={{ width: '80px', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: val > 0 ? 'var(--text-main)' : 'var(--text-dim)' }}>
                    {val === 0 ? 'Rest Day' : `${val} hrs`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Pacing & Session Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Coffee size={20} className="text-indigo" />
                <span>Study Pacing Preferences</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Preferred Session Length */}
              <div className="form-group">
                <label className="form-label">Single Session Duration</label>
                <select 
                  id="select-session-length"
                  className="form-select"
                  value={preferredSessionMinutes}
                  onChange={e => setPreferredSessionMinutes(e.target.value)}
                >
                  <option value="30">30 minutes (Quick Sprint)</option>
                  <option value="45">45 minutes (Classic Pomodoro)</option>
                  <option value="60">60 minutes (Deep Dive)</option>
                  <option value="90">90 minutes (Ultra Focus Block)</option>
                </select>
              </div>

              {/* Break Duration */}
              <div className="form-group">
                <label className="form-label">Rest Break Between Sessions</label>
                <select 
                  id="select-break-length"
                  className="form-select"
                  value={breakMinutes}
                  onChange={e => setBreakMinutes(e.target.value)}
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes (Recommended)</option>
                  <option value="20">20 minutes</option>
                </select>
              </div>

              {/* Preferred Timeslot */}
              <div className="form-group">
                <label className="form-label">Peak Cognitive Time of Day</label>
                <select 
                  id="select-timeslot"
                  className="form-select"
                  value={preferredTimeslot}
                  onChange={e => setPreferredTimeslot(e.target.value)}
                >
                  <option value="morning">Morning (Starts ~9:00 AM)</option>
                  <option value="afternoon">Afternoon (Starts ~2:00 PM)</option>
                  <option value="evening">Evening (Starts ~5:00 PM)</option>
                  <option value="flexible">Flexible / Spread Throughout</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card" style={{ background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              id="btn-save-availability"
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              onClick={() => handleSave(false)}
            >
              {savedSuccess ? (
                <>
                  <Check size={18} />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Availability</span>
                </>
              )}
            </button>

            <button 
              id="btn-save-and-regenerate"
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => handleSave(true)}
            >
              <Sparkles size={16} className="text-indigo" />
              <span>Save & Regenerate Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
