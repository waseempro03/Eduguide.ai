import { readJson, writeJson } from '../utils/storage.js';

class FeedbackService {
  /**
   * Submit feedback for an answer
   * @param {{ faqId: number|null, messageId?: string, question?: string, answer?: string, feedback: 'positive'|'negative', comment?: string }} data 
   */
  async submitFeedback(data) {
    if (!data.feedback || !['positive', 'negative'].includes(data.feedback)) {
      throw new Error("Feedback must be either 'positive' or 'negative'");
    }

    const feedbacks = await readJson('feedback.json', []);

    // Check for duplicate feedback with messageId or same query/faq within recent window
    if (data.messageId) {
      const existing = feedbacks.find(f => f.messageId === data.messageId);
      if (existing) {
        // Update existing feedback rather than duplicating
        existing.feedback = data.feedback;
        existing.comment = data.comment || existing.comment;
        existing.timestamp = new Date().toISOString();
        await writeJson('feedback.json', feedbacks);
        return { success: true, updated: true, record: existing };
      }
    }

    const newFeedback = {
      id: feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id || 0)) + 1 : 1,
      messageId: data.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      faqId: data.faqId || null,
      question: data.question || '',
      answer: data.answer || '',
      feedback: data.feedback,
      comment: data.comment || '',
      timestamp: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    await writeJson('feedback.json', feedbacks);
    return { success: true, updated: false, record: newFeedback };
  }

  /**
   * Get all feedback entries
   */
  async getAllFeedback() {
    return await readJson('feedback.json', []);
  }

  /**
   * Get aggregated feedback statistics
   */
  async getFeedbackStats() {
    const feedbacks = await readJson('feedback.json', []);
    const positive = feedbacks.filter(f => f.feedback === 'positive').length;
    const negative = feedbacks.filter(f => f.feedback === 'negative').length;
    const total = feedbacks.length;
    const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 100;

    return {
      total,
      positive,
      negative,
      satisfactionRate
    };
  }
}

export const feedbackService = new FeedbackService();
