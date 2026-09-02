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

import { getSupabaseClient } from '../config/supabase.js';

/**
 * Retrieve saved chat sessions for a specific user ID
 */
export async function getUserChats(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_chats')
          .select('sessions')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data && Array.isArray(data.sessions)) {
          return res.json({ success: true, sessions: data.sessions });
        }
      } catch (e) {
        console.warn('[Supabase] Error reading user_chats from Supabase:', e.message);
      }
    }

    const allChats = await readJson('user_chats.json', {});
    const userSessions = allChats[userId] || [];
    return res.json({ success: true, sessions: userSessions });
  } catch (error) {
    console.error('[ChatController] Error fetching user chats:', error);
    return res.status(500).json({ error: 'Failed to fetch user chat sessions.' });
  }
}

/**
 * Save / Sync chat sessions for a specific user ID
 */
export async function saveUserChats(req, res) {
  try {
    const { userId, sessions } = req.body;
    if (!userId || !Array.isArray(sessions)) {
      return res.status(400).json({ error: 'User ID and sessions array are required.' });
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('user_chats')
          .upsert({ user_id: userId, sessions, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      } catch (e) {
        console.warn('[Supabase] Error writing user_chats to Supabase:', e.message);
      }
    }

    const allChats = await readJson('user_chats.json', {});
    allChats[userId] = sessions;
    await writeJson('user_chats.json', allChats);

    return res.json({ success: true, message: 'User chat sessions synced successfully.' });
  } catch (error) {
    console.error('[ChatController] Error saving user chats:', error);
    return res.status(500).json({ error: 'Failed to save user chat sessions.' });
  }
}

