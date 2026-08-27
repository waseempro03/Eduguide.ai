import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw
} from 'lucide-react';
import { reviewSop } from '../services/api';

const SAMPLE_SOP_PROMPT = `Ever since developing my first neural network model during my undergraduate studies in Computer Science, I have been fascinated by how intelligent systems can automate decision-making. At Stanford University, I wish to pursue a Master's in Artificial Intelligence to delve into scalable deep learning and reinforcement learning.

During my undergraduate thesis, I worked on optimizing transformer attention mechanisms, resulting in a 14% latency improvement for text processing pipelines. Additionally, my internship at a cloud robotics lab exposed me to real-time distributed perception algorithms.

I am particularly excited about the research conducted at the AI Systems Laboratory at Stanford University, especially the work by faculty on sparse representation learning. With state-of-the-art compute clusters and multidisciplinary faculty, Stanford University offers the ideal environment for my research.

Post-graduation, my objective is to lead engineering teams developing foundation models for real-world automated systems, bridging theoretical machine learning with practical industry challenges.`;

const DEFAULT_REVIEW_RESULT = {
  wordCount: 168,
  overallScore: 84,
  rubric: {
    clarityAndStructure: 82,
    academicDepth: 88,
    universitySpecificity: 92,
    academicTone: 88,
    careerGoalAlignment: 72
  },
  strengths: [
    'Strong technical and academic depth with concrete mentions of transformer optimization and 14% latency metrics.',
    'Excellent institutional tailoring explicitly mentioning Stanford University faculty and the AI Systems Laboratory.',
    'Clear academic progression from undergraduate thesis to graduate research aspirations.'
  ],
  improvements: [
    'Incorporate a stronger bridge between your master\'s degree and your 5-year post-graduation career roadmap.',
    'Consider expanding the draft slightly (current count: 168 words). Top graduate SOPs typically range between 650 to 1,000 words.'
  ],
  polishedSample: `Statement of Purpose — M.S. in Artificial Intelligence (Stanford University)\n\nHaving cultivated a rigorous foundation in Computer Science, I am eager to advance my academic exploration at Stanford University. My academic journey has been driven by an enduring passion to solve complex real-world challenges through structured inquiry and technological innovation.\n\nDuring my previous research on transformer attention mechanisms, I achieved a 14% latency reduction in text processing pipelines. At Stanford, I am particularly drawn to the AI Systems Laboratory and faculty research in sparse representation learning.\n\nIn the short term, this program will equip me with cutting-edge theoretical rigor. In the long term, I envision leading engineering initiatives that bridge foundational research with real-world industry adoption.`
};

export default function SopReviewerPage({ onNavigate }) {
  const [sopText, setSopText] = useState(SAMPLE_SOP_PROMPT);
  const [targetUniversity, setTargetUniversity] = useState('Stanford University');
  const [targetProgram, setTargetProgram] = useState('M.S. in Computer Science (AI Track)');
  const [degreeLevel, setDegreeLevel] = useState('Masters');
  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(DEFAULT_REVIEW_RESULT);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('critique'); // 'critique' | 'polished'

  const handleReview = async () => {
    if (!sopText.trim() || sopText.length < 50) return;
    setLoading(true);
    try {
      const res = await reviewSop({
        text: sopText,
        targetUniversity,
        targetProgram,
        degreeLevel
      });
      if (res && res.overallScore) {
        setReviewResult(res);
      }
    } catch (err) {
      console.error('SOP review error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (text, filename = 'SOP_Draft.txt') => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = sopText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="hub-page-container">
      {/* Header */}
      <div className="hub-header-section">
        <div className="hub-badge">
          <Sparkles size={14} />
          <span>AI Admissions Suite</span>
        </div>
        <h1 className="hub-title">Statement of Purpose (SOP) & Essay Reviewer</h1>
        <p className="hub-subtitle">
          Get real-time rubric analysis, admissions committee feedback, and AI enhancement tailored to your target university.
        </p>
      </div>

      {/* Main Grid */}
      <div className="sop-grid-layout">
        {/* Left Column: Input & Target Meta */}
        <div className="sop-editor-column">
          <div className="hub-card">
            <h3 className="hub-card-title" style={{ marginBottom: '14px' }}>
              <FileText size={18} color="var(--accent-primary)" />
              Target University & Degree
            </h3>

            <div className="sop-meta-row">
              <div className="hub-form-group" style={{ flex: 1 }}>
                <label>Target University</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford, TUM, Oxford, MIT"
                  value={targetUniversity}
                  onChange={(e) => setTargetUniversity(e.target.value)}
                  className="hub-input"
                />
              </div>

              <div className="hub-form-group" style={{ flex: 1 }}>
                <label>Program / Major</label>
                <input
                  type="text"
                  placeholder="e.g. M.S. in Computer Science"
                  value={targetProgram}
                  onChange={(e) => setTargetProgram(e.target.value)}
                  className="hub-input"
                />
              </div>

              <div className="hub-form-group" style={{ width: '130px' }}>
                <label>Degree</label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="hub-select"
                >
                  <option value="Bachelors">Bachelors</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>

            {/* SOP Text Area */}
            <div className="hub-form-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label>Your Statement of Purpose / Essay Draft</label>
                <span style={{ fontSize: '0.8rem', color: wordCount < 500 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                  {wordCount} words {wordCount >= 500 && wordCount <= 1100 ? '(Optimal)' : ''}
                </span>
              </div>

              <textarea
                value={sopText}
                onChange={(e) => setSopText(e.target.value)}
                placeholder="Paste or write your Statement of Purpose draft here..."
                rows={14}
                className="sop-textarea"
              />
            </div>

            <div className="sop-actions-bar">
              <button
                className="hub-btn hub-btn-secondary"
                onClick={() => {
                  setSopText(SAMPLE_SOP_PROMPT);
                  setReviewResult(DEFAULT_REVIEW_RESULT);
                }}
              >
                <RefreshCw size={14} />
                Load Sample SOP
              </button>

              <button
                className="hub-btn hub-btn-primary"
                onClick={handleReview}
                disabled={loading || wordCount < 10}
              >
                <Sparkles size={16} />
                {loading ? 'Evaluating SOP...' : 'Analyze & Score SOP'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Rubric & Feedback Results */}
        <div className="sop-results-column">
          {reviewResult && (
            <div className="hub-card">
              {/* Overall Score Badge */}
              <div className="sop-score-header">
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Admissions Readiness
                  </div>
                  <div className="sop-overall-score">
                    {reviewResult.overallScore} <span>/ 100</span>
                  </div>
                </div>

                <div className="sop-score-rating">
                  {reviewResult.overallScore >= 85 ? (
                    <span className="badge-pill badge-green">✦ Highly Competitive</span>
                  ) : reviewResult.overallScore >= 70 ? (
                    <span className="badge-pill badge-yellow">Competitive • Minor Polish Needed</span>
                  ) : (
                    <span className="badge-pill badge-red">Needs Strengthening</span>
                  )}
                </div>
              </div>

              {/* Rubric Breakdown Progress Bars */}
              <div className="sop-rubric-box">
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>Criteria Breakdown</h4>
                {reviewResult.rubric && (
                  <div className="rubric-bars-list">
                    <div className="rubric-bar-item">
                      <div className="rubric-bar-label">
                        <span>Clarity & Structure</span>
                        <strong>{reviewResult.rubric.clarityAndStructure}%</strong>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${reviewResult.rubric.clarityAndStructure}%` }}></div>
                      </div>
                    </div>

                    <div className="rubric-bar-item">
                      <div className="rubric-bar-label">
                        <span>Academic Depth & Projects</span>
                        <strong>{reviewResult.rubric.academicDepth}%</strong>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${reviewResult.rubric.academicDepth}%` }}></div>
                      </div>
                    </div>

                    <div className="rubric-bar-item">
                      <div className="rubric-bar-label">
                        <span>University & Lab Specificity</span>
                        <strong>{reviewResult.rubric.universitySpecificity}%</strong>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${reviewResult.rubric.universitySpecificity}%` }}></div>
                      </div>
                    </div>

                    <div className="rubric-bar-item">
                      <div className="rubric-bar-label">
                        <span>Academic Tone & Fluency</span>
                        <strong>{reviewResult.rubric.academicTone}%</strong>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${reviewResult.rubric.academicTone}%` }}></div>
                      </div>
                    </div>

                    <div className="rubric-bar-item">
                      <div className="rubric-bar-label">
                        <span>Career Goals Alignment</span>
                        <strong>{reviewResult.rubric.careerGoalAlignment}%</strong>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${reviewResult.rubric.careerGoalAlignment}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for Critique vs Polished Sample */}
              <div className="sop-tabs-bar">
                <button
                  className={`sop-tab-btn ${activeTab === 'critique' ? 'active' : ''}`}
                  onClick={() => setActiveTab('critique')}
                >
                  <Award size={14} />
                  Detailed Critique
                </button>
                <button
                  className={`sop-tab-btn ${activeTab === 'polished' ? 'active' : ''}`}
                  onClick={() => setActiveTab('polished')}
                >
                  <Sparkles size={14} />
                  AI Polished Draft
                </button>
              </div>

              {activeTab === 'critique' ? (
                <div className="sop-critique-content">
                  {/* Strengths */}
                  <div className="sop-feedback-section">
                    <h5 className="sop-section-heading green">
                      <CheckCircle2 size={15} /> Key Strengths
                    </h5>
                    <ul>
                      {reviewResult.strengths?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Priority Improvements */}
                  <div className="sop-feedback-section">
                    <h5 className="sop-section-heading orange">
                      <AlertCircle size={15} /> Priority Improvements
                    </h5>
                    <ul>
                      {reviewResult.improvements?.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="sop-polished-content">
                  <div className="sop-sample-box">
                    <pre>{reviewResult.polishedSample}</pre>
                  </div>
                  <div className="sop-export-row">
                    <button
                      className="hub-btn hub-btn-secondary"
                      onClick={() => handleCopy(reviewResult.polishedSample)}
                    >
                      <Copy size={14} />
                      {copied ? 'Copied to Clipboard!' : 'Copy Draft'}
                    </button>
                    <button
                      className="hub-btn hub-btn-primary"
                      onClick={() => handleDownload(reviewResult.polishedSample, `${targetUniversity.replace(/\s+/g, '_')}_SOP.txt`)}
                    >
                      <Download size={14} />
                      Export as File
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
