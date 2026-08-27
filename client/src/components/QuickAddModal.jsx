import React, { useState } from 'react';
import { BookOpen, Clock, X, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export default function QuickAddModal({ 
  isOpen, 
  onClose, 
  subjects, 
  onCreateSubject, 
  onCreateDeadline 
}) {
  const [tab, setTab] = useState('subject'); // 'subject' | 'deadline'

  // Subject state
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subColor, setSubColor] = useState(PRESET_COLORS[0]);
  const [subDiff, setSubDiff] = useState(3);
  const [subTopics, setSubTopics] = useState('');

  // Deadline state
  const [deadTitle, setDeadTitle] = useState('');
  const [deadSubjectId, setDeadSubjectId] = useState(subjects[0]?.id || '');
  const [deadType, setDeadType] = useState('exam');
  const [deadDate, setDeadDate] = useState('');
  const [deadWeight, setDeadWeight] = useState(25);

  if (!isOpen) return null;

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const rawTopics = subTopics.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
    const topics = rawTopics.map((t, idx) => ({ id: `top-${Date.now()}-${idx}`, title: t, completed: false }));

    await onCreateSubject({
      name: subName,
      code: subCode,
      color: subColor,
      difficulty: Number(subDiff),
      priority: 'medium',
      targetGrade: 'A',
      topics
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const handleDeadlineSubmit = async (e) => {
    e.preventDefault();
    if (!deadTitle.trim() || !deadDate) return;

    await onCreateDeadline({
      title: deadTitle,
      subjectId: deadSubjectId || (subjects[0]?.id || ''),
      type: deadType,
      dueDate: deadDate,
      weight: Number(deadWeight),
      priority: 'high'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="timer-presets" style={{ margin: 0 }}>
            <button 
              id="tab-quick-subject"
              className={`preset-btn ${tab === 'subject' ? 'active' : ''}`}
              onClick={() => setTab('subject')}
            >
              <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
              New Subject
            </button>
            <button 
              id="tab-quick-deadline"
              className={`preset-btn ${tab === 'deadline' ? 'active' : ''}`}
              onClick={() => setTab('deadline')}
            >
              <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
              New Deadline / Exam
            </button>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {tab === 'subject' ? (
          <form onSubmit={handleSubjectSubmit}>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject Name *</label>
                  <input 
                    id="quick-subject-name"
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Cognitive Psychology" 
                    required 
                    value={subName} 
                    onChange={e => setSubName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. PSYC210" 
                    value={subCode} 
                    onChange={e => setSubCode(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Color Tag</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {PRESET_COLORS.map(c => (
                    <div 
                      key={c}
                      onClick={() => setSubColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: subColor === c ? '2px solid white' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Key Topics (comma separated)</label>
                <textarea 
                  className="form-textarea" 
                  rows="2" 
                  placeholder="e.g. Attention models, Memory consolidation, Perception"
                  value={subTopics}
                  onChange={e => setSubTopics(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button id="btn-quick-submit-subject" type="submit" className="btn btn-primary">
                Add Subject
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDeadlineSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Assessment Title *</label>
                <input 
                  id="quick-deadline-title"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Final Exam: Cognitive Psych" 
                  required 
                  value={deadTitle} 
                  onChange={e => setDeadTitle(e.target.value)} 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select 
                    className="form-select"
                    value={deadSubjectId}
                    onChange={e => setDeadSubjectId(e.target.value)}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select"
                    value={deadType}
                    onChange={e => setDeadType(e.target.value)}
                  >
                    <option value="exam">Major Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input 
                    id="quick-deadline-date"
                    type="date" 
                    className="form-input" 
                    required 
                    value={deadDate} 
                    onChange={e => setDeadDate(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight ({deadWeight}%)</label>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    className="slider-input" 
                    value={deadWeight} 
                    onChange={e => setDeadWeight(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button id="btn-quick-submit-deadline" type="submit" className="btn btn-primary">
                Add Deadline
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
