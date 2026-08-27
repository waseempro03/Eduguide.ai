import { readJson } from '../utils/storage.js';
import { feedbackService } from '../services/feedbackService.js';

export async function getAnalytics(req, res) {
  try {
    const faqs = await readJson('faqs.json', []);
    const unanswered = await readJson('unanswered.json', []);
    const feedbackStats = await feedbackService.getFeedbackStats();
    const analytics = await readJson('analytics.json', { queries: [] });

    const queries = analytics.queries || [];
    const totalQueries = queries.length;
    const answeredQueries = queries.filter(q => q.matched).length;
    const unansweredFromLogs = queries.filter(q => !q.matched).length;
    const answerRate = totalQueries > 0 ? Math.round((answeredQueries / totalQueries) * 100) : 100;

    // FAQ Category breakdown
    const categoryCount = {};
    for (const faq of faqs) {
      categoryCount[faq.category] = (categoryCount[faq.category] || 0) + 1;
    }

    // Query Category popularity
    const queryCategoryCount = {};
    for (const q of queries) {
      if (q.category && q.category !== 'Unanswered') {
        queryCategoryCount[q.category] = (queryCategoryCount[q.category] || 0) + 1;
      }
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalFaqs: faqs.length,
          totalQuestions: totalQueries,
          answeredQuestions: answeredQueries,
          unansweredQuestions: unanswered.filter(u => u.status === 'unanswered').length,
          answerRate,
          positiveFeedback: feedbackStats.positive,
          negativeFeedback: feedbackStats.negative,
          satisfactionRate: feedbackStats.satisfactionRate,
          totalFeedback: feedbackStats.total
        },
        faqCategories: categoryCount,
        queryCategories: queryCategoryCount,
        recentQueries: queries.slice(0, 10),
        pendingUnanswered: unanswered.filter(u => u.status === 'unanswered').slice(0, 5)
      }
    });
  } catch (error) {
    console.error('[AnalyticsController] Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
}
