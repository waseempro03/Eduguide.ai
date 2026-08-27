import React, { useState } from 'react';
import { User, Bot, ThumbsUp, ThumbsDown, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function ChatMessage({ message, onFeedback, onSelectSuggestion }) {
  const isBot = message.sender === 'bot';
  const [feedbackState, setFeedbackState] = useState(message.feedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackClick = async (type) => {
    if (feedbackState === type || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onFeedback({
        messageId: message.messageId,
        faqId: message.faqId,
        question: message.userQuery || '',
        answer: message.text,
        feedback: type
      });
      setFeedbackState(type);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceClass = (conf) => {
    if (conf >= 0.75) return 'pill-confidence-high';
    if (conf >= 0.40) return 'pill-confidence-mid';
    return 'pill-confidence-low';
  };

  const formattedTime = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`message-row ${isBot ? 'bot' : 'user'}`}>
      <div className={`message-avatar ${isBot ? 'bot' : 'user'}`}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className="message-content">
        <div className="bubble">
          {message.text}

          {/* If there are fallback suggestions on low confidence */}
          {isBot && message.fallbackOptions && message.fallbackOptions.length > 0 && (
            <div className="fallback-box">
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '4px' }}>
                Suggested Next Steps:
              </div>
              {message.fallbackOptions.map((opt, idx) => (
                <button
                  key={idx}
                  className="fallback-option-btn"
                  onClick={() => onSelectSuggestion(opt.query || opt.label)}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>➔</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="message-meta">
          <span>{formattedTime}</span>

          {isBot && message.category && (
            <span className="pill pill-category">{message.category}</span>
          )}

          {isBot && message.confidence !== undefined && (
            <span className={`pill ${getConfidenceClass(message.confidence)}`}>
              {Math.round(message.confidence * 100)}% Confidence
            </span>
          )}

          {isBot && message.source === 'ai_fallback' && (
            <span className="pill" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Sparkles size={10} style={{ marginRight: '2px' }} /> AI Fallback
            </span>
          )}
        </div>

        {/* Feedback Section for Assistant Answers */}
        {isBot && (
          <div className="feedback-container">
            <button
              className={`feedback-btn ${feedbackState === 'positive' ? 'active-positive' : ''}`}
              onClick={() => handleFeedbackClick('positive')}
              disabled={feedbackState !== null}
              title="Helpful answer"
            >
              {feedbackState === 'positive' ? <Check size={13} /> : <ThumbsUp size={13} />}
              <span>Helpful</span>
            </button>

            <button
              className={`feedback-btn ${feedbackState === 'negative' ? 'active-negative' : ''}`}
              onClick={() => handleFeedbackClick('negative')}
              disabled={feedbackState !== null}
              title="Not helpful"
            >
              {feedbackState === 'negative' ? <Check size={13} /> : <ThumbsDown size={13} />}
              <span>Not Helpful</span>
            </button>

            {feedbackState && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                Thank you for your feedback!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
