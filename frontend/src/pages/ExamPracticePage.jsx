import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Calculator,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { getMockExams } from '../services/api';

const DEFAULT_CATEGORIES = [
  {
    id: "ielts",
    name: "IELTS Academic Prep",
    questions: [
      {
        id: "ielts_1",
        category: "ielts",
        type: "multiple-choice",
        question: "Which word is the closest synonym for 'PRAGMATIC' as often used in academic contexts?",
        options: [
          "Theoretical and abstract",
          "Practical and realistic",
          "Idealistic and hopeful",
          "Dogmatic and strict"
        ],
        correctAnswerIndex: 1,
        explanation: "'Pragmatic' means dealing with things sensibly and realistically based on practical rather than theoretical considerations."
      },
      {
        id: "ielts_2",
        category: "ielts",
        type: "multiple-choice",
        question: "Identify the grammatically correct sentence for academic writing:",
        options: [
          "Despite of the high cost, many students choose to study abroad.",
          "Despite the high cost, many students choose to study abroad.",
          "In spite the high cost, many students choose to study abroad.",
          "Although the high cost, many students choose to study abroad."
        ],
        correctAnswerIndex: 1,
        explanation: "'Despite' takes a noun phrase directly without 'of'. Alternatively, one can say 'In spite of the high cost'."
      }
    ]
  },
  {
    id: "gre_quant",
    name: "GRE Quantitative Reasoning",
    questions: [
      {
        id: "gre_q2",
        category: "gre_quant",
        type: "multiple-choice",
        question: "A worker's salary increases by 20% and later decreases by 20%. Compared to the original salary, the final salary is:",
        options: [
          "Equal to original salary",
          "4% higher",
          "4% lower",
          "2% lower"
        ],
        correctAnswerIndex: 2,
        explanation: "Let initial salary be 100. After 20% increase: 120. After 20% decrease: 120 - 0.20*(120) = 120 - 24 = 96. Thus, 4% lower than original."
      }
    ]
  },
  {
    id: "gate_cs",
    name: "GATE & CS Fundamentals",
    questions: [
      {
        id: "gate_1",
        category: "gate_cs",
        type: "multiple-choice",
        question: "What is the worst-case time complexity of searching in an unbalanced Binary Search Tree (BST) of n nodes?",
        options: [
          "O(1)",
          "O(log n)",
          "O(n)",
          "O(n log n)"
        ],
        correctAnswerIndex: 2,
        explanation: "In an unbalanced (skewed) BST, all nodes form a single linear chain (like a linked list), making search O(n)."
      }
    ]
  }
];

export default function ExamPracticePage({ onNavigate }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeCategoryId, setActiveCategoryId] = useState('ielts');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMockExams();
      if (res && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load mock exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
  const questions = activeCategory?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (questionId, optionIndex) => {
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanations(prev => ({ ...prev, [questionId]: true }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowExplanations({});
    setCurrentQuestionIndex(0);
  };

  const answeredCount = questions.filter(q => selectedAnswers[q.id] !== undefined).length;
  const correctCount = questions.filter(q => selectedAnswers[q.id] === q.correctAnswerIndex).length;

  return (
    <div className="hub-page-container">
      {/* Header */}
      <div className="hub-header-section">
        <div className="hub-badge">
          <Sparkles size={14} />
          <span>Diagnostic Test Engine</span>
        </div>
        <h1 className="hub-title">Exam Practice & Diagnostic Quizzes</h1>
        <p className="hub-subtitle">
          Test your preparation with instant diagnostic questions for IELTS Academic, GRE Quant & Verbal, and GATE CS.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="quiz-categories-bar">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`quiz-cat-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategoryId(cat.id);
              setCurrentQuestionIndex(0);
            }}
          >
            {cat.id === 'ielts' && <BookOpen size={16} />}
            {cat.id === 'gre_quant' && <Calculator size={16} />}
            {cat.id === 'gre_verbal' && <Sparkles size={16} />}
            {cat.id === 'gate_cs' && <Cpu size={16} />}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Main Quiz Area */}
      {questions.length === 0 ? (
        <div className="hub-empty-state-card">
          <p>No questions available for this module yet.</p>
        </div>
      ) : (
        <div className="quiz-container hub-card">
          {/* Quiz Top Bar */}
          <div className="quiz-top-bar">
            <div>
              <span className="quiz-counter">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '2px' }}>
                {activeCategory?.name}
              </h3>
            </div>

            <div className="quiz-score-pill">
              <Award size={16} color="var(--accent-primary)" />
              <span>Score: {correctCount} / {answeredCount} correct</span>
            </div>
          </div>

          {/* Question Text */}
          {currentQuestion && (
            <div className="quiz-question-box">
              <p className="question-text">{currentQuestion.question}</p>

              {/* Options */}
              <div className="quiz-options-list">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                  const isCorrect = currentQuestion.correctAnswerIndex === optIdx;
                  const hasAnswered = selectedAnswers[currentQuestion.id] !== undefined;

                  let optionClass = 'quiz-option-btn';
                  if (hasAnswered) {
                    if (isCorrect) optionClass += ' correct';
                    else if (isSelected && !isCorrect) optionClass += ' incorrect';
                    else optionClass += ' disabled';
                  }

                  return (
                    <button
                      key={optIdx}
                      className={optionClass}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      disabled={hasAnswered}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                      <span className="opt-label">{opt}</span>
                      {hasAnswered && isCorrect && <CheckCircle2 size={16} color="#10b981" />}
                      {hasAnswered && isSelected && !isCorrect && <XCircle size={16} color="#ef4444" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {showExplanations[currentQuestion.id] && (
                <div className="quiz-explanation-box">
                  <div className="exp-header">
                    <HelpCircle size={15} color="var(--accent-primary)" />
                    <span>Answer Explanation</span>
                  </div>
                  <p className="exp-text">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="quiz-footer-nav">
            <button
              className="hub-btn hub-btn-secondary"
              onClick={handleResetQuiz}
            >
              <RotateCcw size={14} /> Reset Category
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="hub-btn hub-btn-secondary"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>

              <button
                className="hub-btn hub-btn-primary"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next Question <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
