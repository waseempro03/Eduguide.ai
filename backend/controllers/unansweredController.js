import { unansweredService } from '../services/unansweredService.js';

export async function logUnanswered(req, res) {
  try {
    const { question, confidence, topCandidate, sessionId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const entry = await unansweredService.logUnanswered({
      question,
      confidence: confidence || 0,
      topCandidate,
      sessionId
    });

    res.status(201).json({
      success: true,
      message: 'Unanswered query recorded successfully',
      data: entry
    });
  } catch (error) {
    console.error('[UnansweredController] Error saving unanswered query:', error);
    res.status(500).json({ error: 'Failed to record unanswered query' });
  }
}

export async function getUnanswered(req, res) {
  try {
    const { status } = req.query;
    const unanswered = await unansweredService.getUnanswered(status);
    res.json({
      success: true,
      count: unanswered.length,
      unanswered
    });
  } catch (error) {
    console.error('[UnansweredController] Error fetching unanswered queries:', error);
    res.status(500).json({ error: 'Failed to retrieve unanswered queries' });
  }
}

export async function updateUnansweredStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['unanswered', 'resolved', 'added_to_faq'].includes(status)) {
      return res.status(400).json({
        error: "Status must be 'unanswered', 'resolved', or 'added_to_faq'"
      });
    }

    const updated = await unansweredService.updateStatus(id, status);
    res.json({
      success: true,
      message: `Query #${id} status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('[UnansweredController] Error updating status:', error);
    res.status(500).json({ error: error.message || 'Failed to update status' });
  }
}

export async function deleteUnanswered(req, res) {
  try {
    const { id } = req.params;
    await unansweredService.deleteUnanswered(id);
    res.json({
      success: true,
      message: `Unanswered query #${id} deleted successfully`
    });
  } catch (error) {
    console.error('[UnansweredController] Error deleting unanswered query:', error);
    res.status(500).json({ error: error.message || 'Failed to delete query' });
  }
}
