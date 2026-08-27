import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit, CheckCircle2, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#7c3aed', // Purple
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#16a34a', // Green
  '#d97706', // Amber
  '#e11d48'  // Rose
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

    const rawTopics = topicsInput
      .split(/[\n,]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const topics = rawTopics.map((t, idx) => {
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
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
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
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Course Catalog</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage course topics, target grades, and relative difficulty ratings.
          </p>
        </div>

        <button 
          id="btn-add-subject"
          className="btn btn-primary" 
          onClick={openCreateModal}
        >
          <Plus size={15} />
          <span>Add Course</span>
        </button>
      </div>

      {/* Grid of Courses */}
      <div className="subjects-grid">
        {subjects.map(subject => {
          const completedTopicsCount = (subject.topics || []).filter(t => t.completed).length;
          const totalTopics = (subject.topics || []).length;
          const progress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

          return (
            <div key={subject.id} className="subject-card" style={{ borderLeft: `3px solid ${subject.color}` }}>
              {/* Card Top */}
              <div className="subject-card-header">
                <div>
                  <div className="subject-name">{subject.name}</div>
                  {subject.code && <span className="subject-code">{subject.code}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '2px 6px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                    Target: {subject.targetGrade || 'A'}
                  </span>
                  <button 
                    className="icon-btn" 
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => openEditModal(subject)}
                    title="Edit Course"
                  >
                    <Edit size={13} />
                  </button>
                  <button 
                    className="icon-btn" 
                    style={{ width: '28px', height: '28px', color: 'var(--color-danger)' }}
                    onClick={() => onDeleteSubject(subject.id)}
                    title="Delete Course"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Difficulty & Priority */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span>Difficulty:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {'●'.repeat(subject.difficulty)}{'○'.repeat(5 - subject.difficulty)}
                  </span>
                </div>
                <span className="session-type-badge">
                  {subject.priority}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Syllabus covered</span>
                  <span>{progress}% ({completedTopicsCount}/{totalTopics})</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, background: subject.color }} />
                </div>
              </div>

              {/* Topics */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Topics
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
                        <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                      ) : (
                        <Circle size={12} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span style={{ textDecoration: topic.completed ? 'line-through' : 'none' }}>
                        {topic.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Topic */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                  placeholder="Add a topic..."
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
                  <Plus size={13} />
                </button>
              </div>

              {subject.notes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
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
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                {editingSubject ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Course Name *</label>
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
                    <label className="form-label">Code</label>
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
                  <label className="form-label">Color Accent</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {PRESET_COLORS.map(c => (
                      <div 
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          background: c,
                          cursor: 'pointer',
                          border: color === c ? '2px solid white' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Difficulty (1–5)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Level {difficulty} of 5
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Grade</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. A"
                    value={targetGrade}
                    onChange={e => setTargetGrade(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Topics / Syllabus (comma separated)</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    placeholder="e.g. Neural Networks, Backpropagation, Optimization"
                    value={topicsInput}
                    onChange={e => setTopicsInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Midterm 1 on Oct 15"
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
                  {editingSubject ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
