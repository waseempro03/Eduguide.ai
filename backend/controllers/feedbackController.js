import { feedbackService } from '../services/feedbackService.js';

export async function submitFeedback(req, res) {
  try {
    const { faqId, messageId, question, answer, feedback, comment } = req.body;

    if (!feedback || !['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({ error: "Field 'feedback' must be 'positive' or 'negative'" });
    }

    const result = await feedbackService.submitFeedback({
      faqId: faqId !== undefined ? faqId : null,
      messageId,
      question,
      answer,
      feedback,
      comment
    });

    res.status(201).json({
      success: true,
      message: result.updated ? 'Feedback updated successfully' : 'Feedback recorded successfully',
      feedback: result.record
    });
  } catch (error) {
    console.error('[FeedbackController] Error recording feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
}

export async function getAllFeedback(req, res) {
  try {
    const feedbacks = await feedbackService.getAllFeedback();
    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    console.error('[FeedbackController] Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback list' });
  }
}

export async function getFeedbackStats(req, res) {
  try {
    const stats = await feedbackService.getFeedbackStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('[FeedbackController] Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback statistics' });
  }
}
