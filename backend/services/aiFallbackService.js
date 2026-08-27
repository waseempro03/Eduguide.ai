import dotenv from 'dotenv';
dotenv.config();

class AIFallbackService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  /**
   * Determine if external AI fallback is enabled
   */
  isEnabled() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10 && !this.apiKey.includes('your_openai_key_here'));
  }

  /**
   * Attempt to answer using OpenAI if API key is provided
   * @param {string} question 
   * @param {Array} contextFaqs 
   * @returns {Promise<{ answer: string, source: 'ai_fallback' } | null>}
   */
  async generateFallbackAnswer(question, contextFaqs = []) {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      // Build brief context from FAQ knowledge base for grounded generation
      const faqSummary = contextFaqs.slice(0, 5).map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are CampusConnect Virtual Assistant for college students. Answer student inquiries politely, accurately, and concisely based on standard campus guidelines. If unsure, advise contacting the administrative helpdesk.\n\nContext FAQs:\n${faqSummary}`
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.3,
          max_tokens: 250
        })
      });

      if (!response.ok) {
        console.warn(`[AIFallbackService] OpenAI API responded with status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (content) {
        return {
          answer: content,
          source: 'ai_fallback'
        };
      }

      return null;
    } catch (error) {
      console.warn('[AIFallbackService] Fallback generation error:', error.message);
      return null;
    }
  }
}

export const aiFallbackService = new AIFallbackService();
