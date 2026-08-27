import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PomodoroTimer({ isOpen, onClose, activeSession, onSessionCompleted }) {
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    if (activeSession && activeSession.durationMinutes) {
      const sec = activeSession.durationMinutes * 60;
      setTotalSeconds(sec);
      setSecondsLeft(sec);
      setMode('work');
      setIsRunning(false);
    }
  }, [activeSession]);

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
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playTone(523.25, 0, 0.5);  // C5
      playTone(659.25, 0.15, 0.7); // E5
      playTone(783.99, 0.3, 1.0);  // G5
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
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
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
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onClose();
    }
  };

  if (!isOpen) return null;

  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent * circumference);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Focus Timer</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="icon-btn" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button className="icon-btn" onClick={onClose}>
              <X size={16} />
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
            {activeSession && (
              <div style={{ marginBottom: '14px', maxWidth: '300px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Current Task
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '1px' }}>
                  {activeSession.topic}
                </div>
              </div>
            )}

            {/* Circular Ring */}
            <div className="timer-circle-wrapper">
              <svg className="timer-svg" viewBox="0 0 220 220">
                <circle className="timer-svg-bg" cx="110" cy="110" r={radius} />
                <circle 
                  className="timer-svg-progress" 
                  cx="110" 
                  cy="110" 
                  r={radius}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset
                  }}
                />
              </svg>

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="timer-digits">{timeFormatted}</div>
                <div className="timer-mode-label">
                  {mode === 'work' ? 'Focus Session' : 'Rest Break'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button 
                id="btn-timer-reset" 
                className="icon-btn" 
                style={{ width: '40px', height: '40px' }}
                onClick={handleReset} 
                title="Reset timer"
              >
                <RotateCcw size={16} />
              </button>
              
              <button 
                id="btn-timer-toggle" 
                className="btn btn-primary" 
                style={{ minWidth: '120px', padding: '9px 20px' }}
                onClick={handleTogglePlay}
              >
                {isRunning ? (
                  <>
                    <Pause size={15} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    <span>{secondsLeft === 0 ? 'Restart' : 'Start'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Complete & Log Session */}
            {activeSession && (
              <button 
                id="btn-timer-complete-session" 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%', maxWidth: '280px' }}
                onClick={handleLogComplete}
              >
                <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                <span>Mark Task as Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
