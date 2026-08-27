import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Send, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { getFAQs, getCategories } from '../services/api';

export default function FaqDirectoryModal({ isOpen, onClose, onAskQuestion }) {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [faqData, catData] = await Promise.all([
        getFAQs(selectedCategory, searchQuery),
        getCategories()
      ]);
      setFaqs(faqData.faqs || []);
      if (catData.categories) setCategories(catData.categories);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <BookOpen size={22} style={{ color: 'var(--accent-primary)' }} />
            FAQ Knowledge Base Directory
          </h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div style={{ padding: '16px 24px 8px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search FAQs by question, keywords, or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* FAQ List */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Loading FAQs...
            </div>
          ) : faqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No FAQs found matching your filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="glass-panel"
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: '12px'
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span className="pill pill-category" style={{ fontSize: '0.65rem' }}>
                          {faq.category}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {faq.question}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskQuestion(faq.question);
                            onClose();
                          }}
                          title="Ask this question in chat"
                        >
                          <Send size={12} />
                          <span>Ask Bot</span>
                        </button>

                        {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                        <p>{faq.answer}</p>
                        {faq.keywords && faq.keywords.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <Tag size={12} color="var(--text-muted)" />
                            {faq.keywords.map((kw, i) => (
                              <span key={i} style={{ fontSize: '0.7rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
