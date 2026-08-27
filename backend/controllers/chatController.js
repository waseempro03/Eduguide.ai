import { processEduGuideQuery } from '../services/aiService.js';
import { unansweredService } from '../services/unansweredService.js';
import { readJson, writeJson } from '../utils/storage.js';

export async function handleChatMessage(req, res) {
  try {
    const { message, conversationHistory, studentProfile, sessionId, modelPreference, attachments } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and cannot be empty.'
      });
    }

    const cleanMessage = message.trim();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await processEduGuideQuery(
      cleanMessage,
      conversationHistory || [],
      studentProfile || null,
      { modelPreference: modelPreference || 'gemini', attachments: attachments || [] }
    );

    // Track in analytics
    const analytics = await readJson('analytics.json', { queries: [] });
    if (!analytics.queries) analytics.queries = [];

    const isAnswered = result.intent !== 'OUT_OF_SCOPE';

    analytics.queries.unshift({
      messageId,
      query: cleanMessage,
      intent: result.intent,
      matched: isAnswered,
      confidence: result.confidence,
      source: result.source,
      timestamp: new Date().toISOString()
    });
    if (analytics.queries.length > 500) analytics.queries.pop();
    await writeJson('analytics.json', analytics);

    // If query could not be answered, log to unanswered store
    if (!isAnswered || result.confidence < 0.35) {
      await unansweredService.logUnanswered({
        question: cleanMessage,
        confidence: result.confidence,
        topCandidate: { intent: result.intent },
        sessionId
      });
    }

    return res.json({
      messageId,
      answer: result.answer,
      intent: result.intent,
      entities: result.entities,
      sources: result.sources || [],
      matchedData: result.matchedData,
      confidence: result.confidence,
      source: result.source,
      thinking: result.thinking || null,
      matched: isAnswered
    });
  } catch (error) {
    console.error('[ChatController] Error processing message:', error);
    return res.status(500).json({
      error: 'An internal error occurred while processing your request. Please try again.'
    });
  }
}
