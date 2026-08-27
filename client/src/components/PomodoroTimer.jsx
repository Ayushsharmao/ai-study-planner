import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, CheckCircle2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PomodoroTimer({ isOpen, onClose, activeSession, onSessionCompleted }) {
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);

  // Set initial time based on activeSession if provided
  useEffect(() => {
    if (activeSession && activeSession.durationMinutes) {
      const sec = activeSession.durationMinutes * 60;
      setTotalSeconds(sec);
      setSecondsLeft(sec);
      setMode('work');
      setIsRunning(false);
    }
  }, [activeSession]);

  // Audio synthesizer chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Gentle melodic chime (E5 -> G#5 -> B5)
      playTone(659.25, 0, 0.6);
      playTone(830.61, 0.2, 0.8);
      playTone(987.77, 0.4, 1.2);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, soundEnabled]);

  const selectPreset = (workMins, isBreak = false) => {
    setIsRunning(false);
    const secs = workMins * 60;
    setMode(isBreak ? 'break' : 'work');
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const handleLogComplete = () => {
    if (activeSession && onSessionCompleted) {
      const minutesSpent = Math.ceil((totalSeconds - secondsLeft) / 60) || activeSession.durationMinutes;
      onSessionCompleted(activeSession.id, minutesSpent);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onClose();
    }
  };

  if (!isOpen) return null;

  // Calculate circular progress
  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent * circumference);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} className="text-indigo" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Focus Pomodoro</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="icon-btn" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="timer-container">
            {/* Presets */}
            <div className="timer-presets">
              <button 
                className={`preset-btn ${mode === 'work' && totalSeconds === 25 * 60 ? 'active' : ''}`}
                onClick={() => selectPreset(25, false)}
              >
                25m Focus
              </button>
              <button 
                className={`preset-btn ${mode === 'work' && totalSeconds === 45 * 60 ? 'active' : ''}`}
                onClick={() => selectPreset(45, false)}
              >
                45m Deep
              </button>
              <button 
                className={`preset-btn ${mode === 'break' && totalSeconds === 5 * 60 ? 'active' : ''}`}
                onClick={() => selectPreset(5, true)}
              >
                5m Break
              </button>
              <button 
                className={`preset-btn ${mode === 'break' && totalSeconds === 15 * 60 ? 'active' : ''}`}
                onClick={() => selectPreset(15, true)}
              >
                15m Break
              </button>
            </div>

            {/* Active Session Info */}
            {activeSession ? (
              <div style={{ marginBottom: '16px', maxWidth: '320px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  Active Focus Task
                </span>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', marginTop: '2px' }}>
                  {activeSession.topic}
                </div>
              </div>
            ) : null}

            {/* SVG Circular Ring */}
            <div className="timer-circle-wrapper">
              <svg className="timer-svg" viewBox="0 0 240 240">
                <defs>
                  <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle className="timer-svg-bg" cx="120" cy="120" r={radius} />
                <circle 
                  className="timer-svg-progress" 
                  cx="120" 
                  cy="120" 
                  r={radius}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset
                  }}
                />
              </svg>

              <div className="timer-digits-box">
                <div className="timer-digits">{timeFormatted}</div>
                <div className="timer-mode-label">
                  {mode === 'work' ? 'Deep Focus Session' : 'Restorative Break'}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="timer-controls">
              <button 
                id="btn-timer-reset" 
                className="btn btn-secondary icon-btn" 
                style={{ width: '48px', height: '48px' }}
                onClick={handleReset} 
                title="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
              
              <button 
                id="btn-timer-toggle" 
                className="btn btn-primary" 
                style={{ minWidth: '130px', padding: '12px 24px', fontSize: '1rem' }}
                onClick={handleTogglePlay}
              >
                {isRunning ? (
                  <>
                    <Pause size={18} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>{secondsLeft === 0 ? 'Restart' : 'Start Focus'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Complete & Log Session Button */}
            {activeSession && (
              <button 
                id="btn-timer-complete-session" 
                className="btn btn-success" 
                style={{ width: '100%', maxWidth: '320px', marginTop: '10px' }}
                onClick={handleLogComplete}
              >
                <CheckCircle2 size={18} />
                <span>Complete & Log Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
