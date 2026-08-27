import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit, CheckCircle2, Circle, Sparkles, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6'  // Blue
];

export default function SubjectManager({ 
  subjects, 
  onCreateSubject, 
  onUpdateSubject, 
  onDeleteSubject 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [difficulty, setDifficulty] = useState(3);
  const [priority, setPriority] = useState('medium');
  const [targetGrade, setTargetGrade] = useState('A');
  const [topicsInput, setTopicsInput] = useState('');
  const [notes, setNotes] = useState('');

  // Quick add topic state per card
  const [cardTopicInputs, setCardTopicInputs] = useState({});

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setDifficulty(3);
    setPriority('medium');
    setTargetGrade('A');
    setTopicsInput('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code || '');
    setColor(sub.color || PRESET_COLORS[0]);
    setDifficulty(sub.difficulty || 3);
    setPriority(sub.priority || 'medium');
    setTargetGrade(sub.targetGrade || 'A');
    setTopicsInput((sub.topics || []).map(t => t.title).join(', '));
    setNotes(sub.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse topics from comma/line separated string
    const rawTopics = topicsInput
      .split(/[\n,]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const topics = rawTopics.map((t, idx) => {
      // Retain previous completed status if matching title exists
      if (editingSubject) {
        const existing = editingSubject.topics.find(et => et.title.toLowerCase() === t.toLowerCase());
        if (existing) return existing;
      }
      return { id: `top-${Date.now()}-${idx}`, title: t, completed: false };
    });

    const payload = {
      name,
      code,
      color,
      difficulty: Number(difficulty),
      priority,
      targetGrade,
      topics,
      notes
    };

    if (editingSubject) {
      await onUpdateSubject(editingSubject.id, payload);
    } else {
      await onCreateSubject(payload);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }

    setIsModalOpen(false);
  };

  const handleToggleTopic = async (subject, topicId) => {
    const updatedTopics = subject.topics.map(t => {
      if (t.id === topicId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    await onUpdateSubject(subject.id, { topics: updatedTopics });
  };

  const handleQuickAddTopic = async (subject) => {
    const text = (cardTopicInputs[subject.id] || '').trim();
    if (!text) return;

    const newTopic = {
      id: `top-${Date.now()}`,
      title: text,
      completed: false
    };

    const updatedTopics = [...(subject.topics || []), newTopic];
    await onUpdateSubject(subject.id, { topics: updatedTopics });

    setCardTopicInputs({ ...cardTopicInputs, [subject.id]: '' });
  };

  return (
    <div className="subjects-view">
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} className="text-indigo" />
            <span>Course & Subject Catalog</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Define difficulty ratings and curriculum topics for each subject to calibrate the AI scheduler.
          </p>
        </div>

        <button 
          id="btn-add-subject"
          className="btn btn-primary" 
          onClick={openCreateModal}
        >
          <Plus size={16} />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="subjects-grid">
        {subjects.map(subject => {
          const completedTopicsCount = (subject.topics || []).filter(t => t.completed).length;
          const totalTopics = (subject.topics || []).length;
          const progress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

          return (
            <div key={subject.id} className="subject-card">
              {/* Color Bar Accent */}
              <div className="subject-color-bar" style={{ background: subject.color }} />

              {/* Card Top */}
              <div className="subject-card-header">
                <div>
                  <div className="subject-name">{subject.name}</div>
                  {subject.code && <div className="subject-code">{subject.code}</div>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="brand-badge" style={{ borderColor: subject.color, color: subject.color }}>
                    Target: {subject.targetGrade || 'A'}
                  </span>
                  <button 
                    className="icon-btn" 
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => openEditModal(subject)}
                    title="Edit Subject"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="icon-btn" 
                    style={{ width: '32px', height: '32px', color: 'var(--color-danger)' }}
                    onClick={() => onDeleteSubject(subject.id)}
                    title="Delete Subject"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Difficulty & Priority */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Difficulty:</span>
                  <span style={{ fontWeight: 700, color: subject.difficulty >= 4 ? '#fb7185' : '#818cf8' }}>
                    {'★'.repeat(subject.difficulty)}{'☆'.repeat(5 - subject.difficulty)} ({subject.difficulty}/5)
                  </span>
                </div>
                <span className={`session-type-badge session-type-${subject.priority}`}>
                  {subject.priority}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Syllabus Covered</span>
                  <span>{progress}% ({completedTopicsCount}/{totalTopics})</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, background: subject.color }} />
                </div>
              </div>

              {/* Topics List */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Key Topics & Modules
                </div>
                <div className="topics-chip-list">
                  {(subject.topics || []).map(topic => (
                    <div 
                      key={topic.id} 
                      className={`topic-chip ${topic.completed ? 'done' : ''}`}
                      onClick={() => handleToggleTopic(subject, topic.id)}
                      style={{ cursor: 'pointer' }}
                      title={`Click to mark ${topic.completed ? 'incomplete' : 'completed'}`}
                    >
                      {topic.completed ? (
                        <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                      ) : (
                        <Circle size={13} style={{ color: 'var(--text-dim)' }} />
                      )}
                      <span style={{ textDecoration: topic.completed ? 'line-through' : 'none' }}>
                        {topic.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Topic Input */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                  placeholder="Quick add topic..."
                  value={cardTopicInputs[subject.id] || ''}
                  onChange={(e) => setCardTopicInputs({ ...cardTopicInputs, [subject.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAddTopic(subject);
                  }}
                />
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickAddTopic(subject)}
                >
                  <Plus size={14} />
                </button>
              </div>

              {subject.notes && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  "{subject.notes}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingSubject ? 'Edit Subject Details' : 'Add New Subject'}
              </h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Subject Name *</label>
                    <input 
                      id="input-subject-name"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Machine Learning"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course Code</label>
                    <input 
                      id="input-subject-code"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CS480"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Color Theme Tag</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {PRESET_COLORS.map(c => (
                      <div 
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: c,
                          cursor: 'pointer',
                          border: color === c ? '3px solid white' : '2px solid transparent',
                          boxShadow: color === c ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Difficulty Rating (1 = Easy, 5 = Extreme)</label>
                    <div className="slider-group">
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        className="slider-input"
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                      />
                      <span className="slider-val" style={{ color: difficulty >= 4 ? '#fb7185' : '#818cf8' }}>
                        {difficulty} / 5
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Grade Goal</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. A+ or 90%"
                    value={targetGrade}
                    onChange={e => setTargetGrade(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Topics / Chapters to Cover (comma or newline separated)</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    placeholder="e.g. Neural Networks, Backpropagation, Gradient Descent, Attention Mechanisms"
                    value={topicsInput}
                    onChange={e => setTopicsInput(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    The AI will use these topics to create individual focused study sessions.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Course Notes / Key Insights</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Emphasizes theoretical proofs, 2 midterms"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button id="btn-save-subject" type="submit" className="btn btn-primary">
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
