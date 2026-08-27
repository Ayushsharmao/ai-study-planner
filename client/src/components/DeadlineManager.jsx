import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit, CheckCircle2, AlertTriangle, Calendar, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DeadlineManager({ 
  deadlines, 
  subjects, 
  onCreateDeadline, 
  onUpdateDeadline, 
  onDeleteDeadline,
  onToggleDeadline 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState('exam');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState(25);
  const [priority, setPriority] = useState('high');
  const [notes, setNotes] = useState('');

  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const openCreateModal = () => {
    setEditingDeadline(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setType('exam');
    
    // Default to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split('T')[0]);
    setWeight(25);
    setPriority('high');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (dead) => {
    setEditingDeadline(dead);
    setTitle(dead.title);
    setSubjectId(dead.subjectId);
    setType(dead.type);
    setDueDate(dead.dueDate);
    setWeight(dead.weight);
    setPriority(dead.priority);
    setNotes(dead.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const payload = {
      title,
      subjectId,
      type,
      dueDate,
      weight: Number(weight),
      priority,
      notes
    };

    if (editingDeadline) {
      await onUpdateDeadline(editingDeadline.id, payload);
    } else {
      await onCreateDeadline(payload);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }

    setIsModalOpen(false);
  };

  const handleToggle = async (deadId) => {
    await onToggleDeadline(deadId);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  const getSubject = (id) => subjects.find(s => s.id === id) || { name: 'General', color: '#6366f1' };

  const filteredDeadlines = deadlines.filter(d => {
    if (filter === 'pending') return !d.completed;
    if (filter === 'completed') return d.completed;
    return true;
  });

  return (
    <div className="deadlines-view">
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} className="text-indigo" />
            <span>Deadlines & Milestones Tracker</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Track exams, assignments, and quizzes. Deadlines inform the AI urgency and spacing algorithms.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Deadlines</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>

          <button 
            id="btn-add-deadline"
            className="btn btn-primary" 
            onClick={openCreateModal}
          >
            <Plus size={16} />
            <span>Add Deadline</span>
          </button>
        </div>
      </div>

      {/* Deadlines List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredDeadlines.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3>No deadlines found.</h3>
            <p style={{ marginTop: '6px' }}>Add upcoming exams or project milestones to guide your study plan.</p>
          </div>
        ) : (
          filteredDeadlines.map(deadline => {
            const sub = getSubject(deadline.subjectId);
            const today = new Date();
            const due = new Date(deadline.dueDate);
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

            let countdownClass = 'countdown-safe';
            if (diffDays <= 3) countdownClass = 'countdown-urgent';
            else if (diffDays <= 7) countdownClass = 'countdown-warning';

            return (
              <div 
                key={deadline.id} 
                className="card"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap',
                  borderLeft: `4px solid ${sub.color}`,
                  opacity: deadline.completed ? 0.65 : 1
                }}
              >
                {/* Left info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                  <div 
                    id={`check-deadline-${deadline.id}`}
                    className={`session-checkbox ${deadline.completed ? 'checked' : ''}`}
                    onClick={() => handleToggle(deadline.id)}
                    title={deadline.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {deadline.completed && <CheckCircle2 size={16} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: sub.color }}>
                        {sub.name}
                      </span>
                      <span className={`session-type-badge session-type-${deadline.type}`}>
                        {deadline.type}
                      </span>
                      <span className="brand-badge">
                        Weight: {deadline.weight}%
                      </span>
                    </div>

                    <div style={{ 
                      fontSize: '1.08rem', 
                      fontWeight: 700, 
                      textDecoration: deadline.completed ? 'line-through' : 'none' 
                    }}>
                      {deadline.title}
                    </div>

                    {deadline.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        💡 {deadline.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right metadata & countdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Due Date</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700 }}>{deadline.dueDate}</div>
                  </div>

                  {!deadline.completed && (
                    <div className={`countdown-tag ${countdownClass}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                      {diffDays <= 0 ? 'Due Today!' : `${diffDays} days left`}
                    </div>
                  )}

                  {deadline.completed && (
                    <div className="countdown-tag countdown-safe" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                      Completed ✓
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => openEditModal(deadline)}
                      title="Edit Deadline"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="icon-btn" 
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => onDeleteDeadline(deadline.id)}
                      title="Delete Deadline"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Deadline Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingDeadline ? 'Edit Deadline' : 'Create New Deadline'}
              </h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Deadline / Milestone Title *</label>
                  <input 
                    id="input-deadline-title"
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Midterm Exam - Thermodynamics"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Associated Subject</label>
                    <select 
                      className="form-select"
                      value={subjectId}
                      onChange={e => setSubjectId(e.target.value)}
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assessment Type</label>
                    <select 
                      className="form-select"
                      value={type}
                      onChange={e => setType(e.target.value)}
                    >
                      <option value="exam">Major Exam</option>
                      <option value="assignment">Assignment / Problem Set</option>
                      <option value="quiz">Pop Quiz</option>
                      <option value="project">Course Project</option>
                      <option value="presentation">Presentation</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input 
                      id="input-deadline-date"
                      type="date" 
                      className="form-input" 
                      required
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Grade Weight ({weight}%)</label>
                    <div className="slider-group">
                      <input 
                        type="range" 
                        min="5" 
                        max="100" 
                        step="5"
                        className="slider-input"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                      />
                      <span className="slider-val">{weight}%</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select 
                    className="form-select"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Standard Exam)</option>
                    <option value="urgent">Urgent (Final / High-Stakes)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Study Notes / Allowed Materials</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Closed notes, 50 multiple choice + 3 coding questions"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button id="btn-save-deadline" type="submit" className="btn btn-primary">
                  {editingDeadline ? 'Save Changes' : 'Create Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
