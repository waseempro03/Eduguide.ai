import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  PlusCircle,
  Trash2,
  Check,
  AlertTriangle,
  FolderTree
} from 'lucide-react';
import {
  getAnalytics,
  getUnanswered,
  updateUnanswered,
  deleteUnanswered,
  createFAQ
} from '../services/api';

export default function AdminDashboard({ isOpen, onClose, onFaqCreated }) {
  const [analytics, setAnalytics] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // FAQ creation modal for unanswered queries
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [selectedUnansweredItem, setSelectedUnansweredItem] = useState(null);
  const [newFaqData, setNewFaqData] = useState({
    question: '',
    answer: '',
    category: 'Admissions',
    keywords: '',
    alternateQuestions: ''
  });
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen, statusFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, unansweredRes] = await Promise.all([
        getAnalytics(),
        getUnanswered(statusFilter)
      ]);
      setAnalytics(analyticsRes.data || null);
      setUnanswered(unansweredRes.unanswered || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUnanswered(id, newStatus);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unanswered question record?')) return;
    try {
      await deleteUnanswered(id);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete unanswered question:', err);
    }
  };

  const handleOpenAddFaq = (item) => {
    setSelectedUnansweredItem(item);
    setNewFaqData({
      question: item ? item.question : '',
      answer: '',
      category: item?.candidateFaq?.category || 'Admissions',
      keywords: '',
      alternateQuestions: ''
    });
    setShowAddFaqModal(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!newFaqData.question || !newFaqData.answer) return;

    setIsSavingFaq(true);
    try {
      await createFAQ(newFaqData);

      // If resolving an unanswered query, mark as added_to_faq
      if (selectedUnansweredItem) {
        await updateUnanswered(selectedUnansweredItem.id, 'added_to_faq');
      }

      setShowAddFaqModal(false);
      setSelectedUnansweredItem(null);
      if (onFaqCreated) onFaqCreated();
      loadDashboardData();
    } catch (err) {
      console.error('Failed to create FAQ:', err);
      alert('Error creating FAQ: ' + err.message);
    } finally {
      setIsSavingFaq(false);
    }
  };

  if (!isOpen) return null;

  const summary = analytics?.summary || {
    totalFaqs: 32,
    totalQuestions: 0,
    answeredQuestions: 0,
    unansweredQuestions: 0,
    answerRate: 100,
    positiveFeedback: 0,
    negativeFeedback: 0,
    satisfactionRate: 100
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <BarChart3 size={22} style={{ color: 'var(--accent-primary)' }} />
            CampusConnect Admin & Analytics Center
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn" onClick={loadDashboardData} disabled={loading} title="Refresh Analytics">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="btn btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Knowledge Base FAQs</span>
              <span className="metric-value" style={{ color: 'var(--accent-primary)' }}>
                {summary.totalFaqs}
              </span>
              <span className="metric-sub">Active indexed entries</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Questions Processed</span>
              <span className="metric-value">{summary.totalQuestions}</span>
              <span className="metric-sub">{summary.answeredQuestions} successfully matched</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">NLP Match Rate</span>
              <span className="metric-value" style={{ color: summary.answerRate >= 70 ? '#10b981' : '#f59e0b' }}>
                {summary.answerRate}%
              </span>
              <span className="metric-sub">Confidence score &ge; 0.35</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Student Satisfaction</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="metric-value" style={{ color: '#10b981' }}>{summary.satisfactionRate}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({summary.positiveFeedback} 👍 / {summary.negativeFeedback} 👎)
                </span>
              </div>
              <span className="metric-sub">{summary.positiveFeedback + summary.negativeFeedback} total ratings</span>
            </div>
          </div>

          {/* FAQ Category Breakdown */}
          {analytics?.faqCategories && (
            <div className="glass-panel" style={{ padding: '16px 20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={16} color="var(--accent-primary)" />
                FAQ Category Coverage
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(analytics.faqCategories).map(([cat, count]) => (
                  <div
                    key={cat}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '10px' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unanswered Queries Management Section */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} style={{ color: '#f59e0b' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Unanswered & Low-Confidence Queries</h3>
                <span className="pill pill-confidence-mid" style={{ fontSize: '0.7rem' }}>
                  {unanswered.length} recorded
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="unanswered">Pending Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="added_to_faq">Added to FAQ</option>
                </select>

                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => handleOpenAddFaq(null)}
                >
                  <PlusCircle size={14} />
                  <span>Add New FAQ</span>
                </button>
              </div>
            </div>

            {unanswered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No unanswered queries recorded in this view.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Confidence</th>
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
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(item.lastSeen || item.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <span className={`pill ${item.confidence >= 0.35 ? 'pill-confidence-mid' : 'pill-confidence-low'}`}>
                            {Math.round((item.confidence || 0) * 100)}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{item.count || 1}</span>
                        </td>
                        <td>
                          <span className="pill" style={{
                            background: item.status === 'unanswered' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: item.status === 'unanswered' ? '#f59e0b' : '#10b981'
                          }}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {item.status === 'unanswered' && (
                              <>
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                  onClick={() => handleOpenAddFaq(item)}
                                  title="Add as a new FAQ"
                                >
                                  <PlusCircle size={12} />
                                  <span>Add FAQ</span>
                                </button>
                                <button
                                  className="btn"
                                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                  onClick={() => handleStatusChange(item.id, 'resolved')}
                                  title="Mark as resolved"
                                >
                                  <Check size={12} />
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-icon"
                              style={{ padding: '4px 6px', color: 'var(--danger)' }}
                              onClick={() => handleDelete(item.id)}
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New FAQ Sub-Modal */}
      {showAddFaqModal && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowAddFaqModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <PlusCircle size={20} style={{ color: 'var(--accent-primary)' }} />
                {selectedUnansweredItem ? 'Create FAQ from Unanswered Query' : 'Add New FAQ to Knowledge Base'}
              </h2>
              <button className="btn btn-icon" onClick={() => setShowAddFaqModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={newFaqData.question}
                  onChange={(e) => setNewFaqData({ ...newFaqData, question: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={newFaqData.category}
                    onChange={(e) => setNewFaqData({ ...newFaqData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="Admissions">Admissions</option>
                    <option value="Courses">Courses</option>
                    <option value="Fees">Fees</option>
                    <option value="Exams">Exams</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Library">Library</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Transport">Transport</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Placements">Placements</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Campus Facilities">Campus Facilities</option>
                    <option value="Contact Information">Contact Information</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. course, change, branch, switch"
                    value={newFaqData.keywords}
                    onChange={(e) => setNewFaqData({ ...newFaqData, keywords: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newFaqData.answer}
                  onChange={(e) => setNewFaqData({ ...newFaqData, answer: e.target.value })}
                  placeholder="Provide a comprehensive and accurate answer for students..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddFaqModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingFaq || !newFaqData.question || !newFaqData.answer}
                >
                  {isSavingFaq ? 'Indexing...' : 'Save & Index FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
