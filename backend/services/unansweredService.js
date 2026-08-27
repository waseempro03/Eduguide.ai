import { readJson, writeJson } from '../utils/storage.js';

class UnansweredService {
  /**
   * Log an unanswered or low-confidence query
   * @param {{ question: string, confidence: number, topCandidate?: any, sessionId?: string }} data 
   */
  async logUnanswered(data) {
    if (!data.question || !data.question.trim()) return null;

    const trimmedQuestion = data.question.trim();
    const unanswered = await readJson('unanswered.json', []);

    // Check if similar/same question was already logged
    const existingIndex = unanswered.findIndex(
      item => item.question.toLowerCase() === trimmedQuestion.toLowerCase() && item.status === 'unanswered'
    );

    if (existingIndex !== -1) {
      unanswered[existingIndex].count = (unanswered[existingIndex].count || 1) + 1;
      unanswered[existingIndex].lastSeen = new Date().toISOString();
      unanswered[existingIndex].confidence = data.confidence;
      await writeJson('unanswered.json', unanswered);
      return unanswered[existingIndex];
    }

    const newEntry = {
      id: unanswered.length > 0 ? Math.max(...unanswered.map(u => u.id || 0)) + 1 : 1,
      question: trimmedQuestion,
      confidence: data.confidence || 0,
      candidateFaq: data.topCandidate ? {
        id: data.topCandidate.id,
        question: data.topCandidate.question,
        category: data.topCandidate.category
      } : null,
      count: 1,
      timestamp: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'unanswered', // 'unanswered' | 'resolved' | 'added_to_faq'
      sessionId: data.sessionId || null
    };

    unanswered.unshift(newEntry); // newest first
    await writeJson('unanswered.json', unanswered);
    return newEntry;
  }

  /**
   * Get all unanswered queries
   * @param {string} [status] 
   */
  async getUnanswered(status) {
    let unanswered = await readJson('unanswered.json', []);
    if (status && status !== 'all') {
      unanswered = unanswered.filter(u => u.status === status);
    }
    return unanswered;
  }

  /**
   * Update status of an unanswered query
   * @param {number} id 
   * @param {'unanswered'|'resolved'|'added_to_faq'} status 
   */
  async updateStatus(id, status) {
    const unanswered = await readJson('unanswered.json', []);
    const item = unanswered.find(u => u.id === Number(id));
    if (!item) {
      throw new Error(`Unanswered query with ID ${id} not found`);
    }

    item.status = status;
    item.resolvedAt = new Date().toISOString();
    await writeJson('unanswered.json', unanswered);
    return item;
  }

  /**
   * Delete an unanswered query
   * @param {number} id 
   */
  async deleteUnanswered(id) {
    let unanswered = await readJson('unanswered.json', []);
    const initialLen = unanswered.length;
    unanswered = unanswered.filter(u => u.id !== Number(id));
    if (unanswered.length === initialLen) {
      throw new Error(`Unanswered query with ID ${id} not found`);
    }
    await writeJson('unanswered.json', unanswered);
    return { success: true };
  }
}

export const unansweredService = new UnansweredService();
