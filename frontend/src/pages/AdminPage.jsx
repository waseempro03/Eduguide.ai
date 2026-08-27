import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  HelpCircle,
  Award,
  GraduationCap,
  RefreshCw,
  PlusCircle,
  Trash2,
  Check,
  Search,
  X,
  Sparkles
} from 'lucide-react';
import {
  getAnalytics,
  getScholarships,
  getUniversities,
  getUnanswered,
  updateUnanswered,
  deleteUnanswered,
  createScholarship
} from '../services/api';

export default function AdminPage({ onBackToChat }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'scholarships' | 'unanswered'
  const [analytics, setAnalytics] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Scholarship Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScholarship, setNewScholarship] = useState({
    name: '',
    country: 'Germany',
    university: 'Multiple Universities',
    degree: 'Masters',
    fields: 'Computer Science, Engineering',
    funding: 'Fully Funded',
    amount: '€934/month + 100% Tuition Waiver',
    deadline: 'October 31, 2026',
    applicationUrl: 'https://www.daad.de',
    officialWebsite: 'https://www.daad.de',
    description: '',
    source: 'Official Commission'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, scholarshipsRes, unansweredRes] = await Promise.all([
        getAnalytics(),
        getScholarships({ search: searchQuery }),
        getUnanswered('all')
      ]);
      setAnalytics(analyticsRes.data || null);
      setScholarships(scholarshipsRes.scholarships || []);
      setUnanswered(unansweredRes.unanswered || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveUnanswered = async (id) => {
    try {
      await updateUnanswered(id, 'resolved');
      loadData();
    } catch (err) {
      console.error('Failed to resolve query:', err);
    }
  };

  const handleDeleteUnanswered = async (id) => {
    if (!window.confirm('Delete this unanswered query record?')) return;
    try {
      await deleteUnanswered(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete query:', err);
    }
  };

  const handleSaveScholarship = async (e) => {
    e.preventDefault();
    if (!newScholarship.name || !newScholarship.amount) return;

    setIsSaving(true);
    try {
      const payload = {
        ...newScholarship,
        degree: newScholarship.degree.split(',').map(s => s.trim()),
        fields: newScholarship.fields.split(',').map(s => s.trim())
      };
      await createScholarship(payload);
      setShowAddModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save scholarship:', err);
      alert('Error saving scholarship: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const summary = analytics?.summary || {
    totalFaqs: 35,
    totalQuestions: 0,
    answeredQuestions: 0,
    unansweredQuestions: 0,
    answerRate: 100,
    positiveFeedback: 0,
    negativeFeedback: 0,
    satisfactionRate: 100
  };

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '8px 10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="sparkle-icon">✦</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>EduGuide AI Admin</span>
        </div>

        <button
          className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} />
          <span>Dashboard & KPIs</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'scholarships' ? 'active' : ''}`}
          onClick={() => setActiveTab('scholarships')}
        >
          <Award size={16} />
          <span>Scholarships DB</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'unanswered' ? 'active' : ''}`}
          onClick={() => setActiveTab('unanswered')}
        >
          <HelpCircle size={16} />
          <span>Unanswered Backlog</span>
        </button>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="sidebar-footer-btn" onClick={onBackToChat}>
            <ArrowLeft size={16} />
            <span>Back to Assistant</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Action Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeTab === 'dashboard' && 'EduGuide AI Platform Analytics'}
              {activeTab === 'scholarships' && 'Scholarships Knowledge Base'}
              {activeTab === 'unanswered' && 'Unanswered Queries & Out-of-Scope Backlog'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Real-time monitoring, query intent telemetry, and educational database management
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="icon-btn" onClick={loadData} disabled={loading} title="Refresh data">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <PlusCircle size={14} />
              <span>Add Scholarship</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <span className="admin-kpi-label">Active Scholarships</span>
                <span className="admin-kpi-value" style={{ color: 'var(--accent-primary)' }}>
                  {scholarships.length || 35}
                </span>
                <span className="admin-kpi-sub">Verified Global Grants</span>
              </div>

              <div className="admin-kpi-card">
                <span className="admin-kpi-label">Questions Processed</span>
                <span className="admin-kpi-value">{summary.totalQuestions}</span>
                <span className="admin-kpi-sub">{summary.answeredQuestions} successfully classified</span>
              </div>

              <div className="admin-kpi-card">
                <span className="admin-kpi-label">Classification Accuracy</span>
                <span className="admin-kpi-value" style={{ color: 'var(--success)' }}>
                  {summary.answerRate}%
                </span>
                <span className="admin-kpi-sub">Confidence score &ge; 0.35</span>
              </div>

              <div className="admin-kpi-card">
                <span className="admin-kpi-label">Student Feedback Rate</span>
                <span className="admin-kpi-value" style={{ color: 'var(--accent-primary)' }}>
                  {summary.satisfactionRate}%
                </span>
                <span className="admin-kpi-sub">{summary.positiveFeedback} 👍 / {summary.negativeFeedback} 👎</span>
              </div>
            </div>

            {/* Recent Queries Table */}
            {analytics?.recentQueries && analytics.recentQueries.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
                  Recent Live Inquiries
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th>Intent</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentQueries.slice(0, 8).map((q, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{q.query}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', color: 'var(--accent-primary)' }}>
                              {q.intent || 'GENERAL'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', color: q.matched ? 'var(--success)' : 'var(--warning)' }}>
                              {q.matched ? 'Answered' : 'Unanswered'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(q.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCHOLARSHIPS DB */}
        {activeTab === 'scholarships' && (
          <div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Scholarship Name</th>
                  <th>Country</th>
                  <th>Funding & Amount</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.university}</div>
                    </td>
                    <td>{s.country}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{s.funding}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{s.amount}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{s.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: UNANSWERED QUERIES */}
        {activeTab === 'unanswered' && (
          <div>
            {unanswered.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No unanswered queries recorded yet.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Hits</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unanswered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.question}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(item.lastSeen || item.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td>{item.count || 1}</td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: item.status === 'unanswered' ? 'var(--warning-bg)' : 'var(--success-bg)',
                          color: item.status === 'unanswered' ? 'var(--warning)' : 'var(--success)'
                        }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {item.status === 'unanswered' && (
                            <button
                              className="icon-btn"
                              onClick={() => handleResolveUnanswered(item.id)}
                              title="Mark Resolved"
                            >
                              <Check size={14} color="var(--success)" />
                            </button>
                          )}
                          <button
                            className="icon-btn"
                            onClick={() => handleDeleteUnanswered(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} color="var(--danger)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Add New Scholarship Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Scholarship to Knowledge Base</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveScholarship} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Scholarship Name *</label>
                <input
                  type="text"
                  required
                  value={newScholarship.name}
                  onChange={(e) => setNewScholarship({ ...newScholarship, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Country *</label>
                  <input
                    type="text"
                    required
                    value={newScholarship.country}
                    onChange={(e) => setNewScholarship({ ...newScholarship, country: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Funding Level *</label>
                  <select
                    value={newScholarship.funding}
                    onChange={(e) => setNewScholarship({ ...newScholarship, funding: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partial">Partial</option>
                    <option value="Tuition Waiver">Tuition Waiver</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Coverage / Amount *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. €934/month + 100% Tuition Waiver"
                  value={newScholarship.amount}
                  onChange={(e) => setNewScholarship({ ...newScholarship, amount: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
