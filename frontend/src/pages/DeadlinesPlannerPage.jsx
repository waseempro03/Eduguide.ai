import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getDeadlines } from '../services/api';

const DEFAULT_DEADLINES = [
  {
    id: "dl_1",
    title: "US Universities Fall 2027 Early Action / Early Decision",
    category: "Admissions",
    country: "United States",
    deadlineDate: "2026-11-01",
    description: "MIT, Stanford, Harvard, Princeton, Caltech Early Action / Early Decision round.",
    urgent: false,
    recommendedActions: [
      "Finalize Common App / Coalition App essays",
      "Request 3 Letters of Recommendation (LORs) from professors/mentors",
      "Send official TOEFL/IELTS and GRE score reports"
    ]
  },
  {
    id: "dl_2",
    title: "UK Oxford & Cambridge (Oxbridge) & Medicine Deadline",
    category: "Admissions",
    country: "United Kingdom",
    deadlineDate: "2026-10-15",
    description: "UCAS application deadline for Oxford, Cambridge, and all UK Medicine/Dentistry courses for 2027 entry.",
    urgent: false,
    recommendedActions: [
      "Polish UCAS Personal Statement (4,000 characters)",
      "Register for admissions tests (e.g., UCAT, MAT, STEP, LNAT)",
      "Ensure academic reference is uploaded by school referee"
    ]
  },
  {
    id: "dl_4",
    title: "German Universities Winter 2026/2027 (Main Intake)",
    category: "Admissions",
    country: "Germany",
    deadlineDate: "2026-07-15",
    description: "Main application window for all public universities in Germany for the Winter semester starting October 2026.",
    urgent: true,
    recommendedActions: [
      "Submit Uni-Assist VPD requests at least 6 weeks in advance",
      "Open Blocked Account (Expatrio / Coracle / Fintiba) with €11,208",
      "Book German student visa appointment at VFS / Embassy"
    ]
  },
  {
    id: "dl_5",
    title: "Chevening Scholarships 2027/2028 Cycle",
    category: "Scholarship",
    country: "United Kingdom",
    deadlineDate: "2026-11-05",
    description: "Fully funded UK government scholarship covering master's tuition, stipend, and airfare.",
    urgent: false,
    recommendedActions: [
      "Draft 4 Chevening leadership and networking essays (500 words each)",
      "Select 3 eligible master's degree courses at UK universities",
      "Secure two strong professional/academic referees"
    ]
  },
  {
    id: "dl_6",
    title: "DAAD EPOS Postgraduate Scholarship Deadline",
    category: "Scholarship",
    country: "Germany",
    deadlineDate: "2026-10-31",
    description: "DAAD Development-Related Postgraduate Courses full funding for developing nation scholars.",
    urgent: false,
    recommendedActions: [
      "Gather 2 years of verifiable professional work experience proof",
      "Draft Europass format CV and DAAD motivation letter",
      "Apply directly to participating German university course coordinators"
    ]
  }
];

const USER_MILESTONES_KEY = 'eduguide_user_milestones';

export default function DeadlinesPlannerPage({ onNavigate }) {
  const [deadlines, setDeadlines] = useState(DEFAULT_DEADLINES);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [customMilestones, setCustomMilestones] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_MILESTONES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: 'm1', text: 'Request 3 Letters of Recommendation (LORs) from professors', completed: true, date: '2026-09-15' },
      { id: 'm2', text: 'Take official IELTS / TOEFL test and achieve target band', completed: true, date: '2026-10-01' },
      { id: 'm3', text: 'Finalize Statement of Purpose (SOP) with AI Reviewer', completed: false, date: '2026-10-20' },
      { id: 'm4', text: 'Order official sealed transcripts from university registrar', completed: false, date: '2026-11-01' }
    ];
  });

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  useEffect(() => {
    loadDeadlines();
  }, [categoryFilter]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_MILESTONES_KEY, JSON.stringify(customMilestones));
    } catch (e) {}
  }, [customMilestones]);

  const loadDeadlines = async () => {
    setLoading(true);
    try {
      const res = await getDeadlines(categoryFilter);
      if (res && res.deadlines && res.deadlines.length > 0) {
        setDeadlines(res.deadlines);
      }
    } catch (err) {
      console.error('Failed to load deadlines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = (id) => {
    setCustomMilestones(prev =>
      prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m)
    );
  };

  const handleDeleteMilestone = (id) => {
    setCustomMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;
    const newM = {
      id: `ms_${Date.now()}`,
      text: newMilestoneText.trim(),
      date: newMilestoneDate || new Date().toISOString().split('T')[0],
      completed: false
    };
    setCustomMilestones(prev => [newM, ...prev]);
    setNewMilestoneText('');
    setNewMilestoneDate('');
  };

  const calculateDaysLeft = (targetDateStr) => {
    const target = new Date(targetDateStr);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="hub-page-container">
      {/* Header */}
      <div className="hub-header-section">
        <div className="hub-badge">
          <Calendar size={14} />
          <span>Intake & Admissions Tracker</span>
        </div>
        <h1 className="hub-title">Application Deadlines & Milestones Planner</h1>
        <p className="hub-subtitle">
          Track official application cycles for Fall 2026 & 2027, global scholarship cutoffs, and manage your personal application timeline.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="deadlines-filter-row">
        <div className="filter-pill-group">
          {['All', 'Admissions', 'Scholarship'].map(cat => (
            <button
              key={cat}
              className={`filter-pill-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="deadlines-layout-grid">
        {/* Left Column: Official Global Deadlines Feed */}
        <div className="deadlines-feed-col">
          <h3 className="hub-section-subheading">
            <Clock size={16} /> Official 2026/2027 Application Cycles
          </h3>

          <div className="deadlines-cards-list">
            {deadlines.map(dl => {
              const daysLeft = calculateDaysLeft(dl.deadlineDate);
              const isUpcomingSoon = daysLeft > 0 && daysLeft <= 45;
              const isPassed = daysLeft < 0;

              return (
                <div key={dl.id} className={`deadline-card ${dl.urgent ? 'urgent-border' : ''}`}>
                  <div className="deadline-card-header">
                    <div>
                      <span className={`badge-pill ${dl.category === 'Scholarship' ? 'badge-yellow' : 'badge-indigo'}`}>
                        {dl.category} • {dl.country}
                      </span>
                      <h4 className="deadline-card-title">{dl.title}</h4>
                    </div>

                    <div className="deadline-countdown-badge">
                      {isPassed ? (
                        <span className="days-badge passed">Cycle Concluded</span>
                      ) : (
                        <span className={`days-badge ${isUpcomingSoon ? 'urgent' : 'active'}`}>
                          {daysLeft} days left
                        </span>
                      )}
                      <span className="deadline-raw-date">{dl.deadlineDate}</span>
                    </div>
                  </div>

                  <p className="deadline-desc">{dl.description}</p>

                  {dl.recommendedActions && (
                    <div className="deadline-actions-box">
                      <div className="actions-header">Recommended Action Checklist:</div>
                      <ul>
                        {dl.recommendedActions.map((act, idx) => (
                          <li key={idx}>
                            <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Custom Student Checklist Planner */}
        <div className="milestones-planner-col">
          <div className="hub-card sticky-card">
            <h3 className="hub-card-title" style={{ marginBottom: '12px' }}>
              <CheckSquare size={18} color="var(--accent-primary)" />
              My Application Milestones
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Personal checklist of documents, exams, and submissions.
            </p>

            {/* Add Milestone Form */}
            <form onSubmit={handleAddMilestone} className="add-milestone-form">
              <input
                type="text"
                placeholder="e.g. Schedule Visa Interview"
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                className="hub-input"
                style={{ marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="hub-input"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="hub-btn hub-btn-primary" style={{ padding: '0 16px' }}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </form>

            {/* Milestones List */}
            <div className="milestones-checklist">
              {customMilestones.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No milestones added yet. Add your first task above!
                </div>
              ) : (
                customMilestones.map(m => (
                  <div key={m.id} className={`milestone-item ${m.completed ? 'completed' : ''}`}>
                    <button
                      className="milestone-toggle-btn"
                      onClick={() => handleToggleMilestone(m.id)}
                    >
                      {m.completed ? <CheckSquare size={16} color="#10b981" /> : <Square size={16} />}
                    </button>
                    <div className="milestone-text-col" onClick={() => handleToggleMilestone(m.id)}>
                      <span className="milestone-title">{m.text}</span>
                      {m.date && <span className="milestone-target-date">Target: {m.date}</span>}
                    </div>
                    <button
                      className="milestone-del-btn"
                      onClick={() => handleDeleteMilestone(m.id)}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Progress Summary */}
            <div className="milestones-progress-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>Milestones Completed</span>
                <strong>
                  {customMilestones.filter(m => m.completed).length} / {customMilestones.length}
                </strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${customMilestones.length > 0 ? (customMilestones.filter(m => m.completed).length / customMilestones.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
