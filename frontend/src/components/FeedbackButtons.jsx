import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';

export default function FeedbackButtons({ messageId, faqId, userQuery, answerText, initialFeedback, onFeedback }) {
  const [feedback, setFeedback] = useState(initialFeedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (type) => {
    if (feedback || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onFeedback({
        messageId,
        faqId,
        question: userQuery || '',
        answer: answerText || '',
        feedback: type
      });
      setFeedback(type);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-actions">
      {feedback ? (
        <span className="feedback-thanks">
          <Check size={12} style={{ display: 'inline', marginRight: '4px', color: 'var(--success)' }} />
          Thanks for your feedback
        </span>
      ) : (
        <>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Was this helpful?</span>
          <button
            className="feedback-btn"
            onClick={() => handleRate('positive')}
            disabled={isSubmitting}
            title="Helpful"
            aria-label="Mark helpful"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            className="feedback-btn"
            onClick={() => handleRate('negative')}
            disabled={isSubmitting}
            title="Not helpful"
            aria-label="Mark not helpful"
          >
            <ThumbsDown size={13} />
          </button>
        </>
      )}
    </div>
  );
}
