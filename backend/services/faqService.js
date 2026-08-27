import { readJson, writeJson } from '../utils/storage.js';
import { nlpService } from './nlpService.js';

class FAQService {
  /**
   * Get all FAQs
   * @param {string} [category] 
   * @param {string} [search] 
   */
  async getAllFAQs(category, search) {
    let faqs = await readJson('faqs.json', []);

    if (category && category !== 'All') {
      faqs = faqs.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      faqs = faqs.filter(f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        (f.keywords && f.keywords.some(k => k.toLowerCase().includes(q))) ||
        (f.category && f.category.toLowerCase().includes(q))
      );
    }

    return faqs;
  }

  /**
   * Get all distinct categories
   */
  async getCategories() {
    const faqs = await readJson('faqs.json', []);
    const categories = ['All', ...new Set(faqs.map(f => f.category))];
    return categories;
  }

  /**
   * Get FAQ by ID
   * @param {number} id 
   */
  async getFAQById(id) {
    const faqs = await readJson('faqs.json', []);
    return faqs.find(f => f.id === Number(id)) || null;
  }

  /**
   * Create a new FAQ and update NLP index
   * @param {Object} faqData 
   */
  async createFAQ(faqData) {
    const faqs = await readJson('faqs.json', []);
    const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;

    const newFAQ = {
      id: newId,
      question: faqData.question,
      answer: faqData.answer,
      category: faqData.category || 'General',
      keywords: Array.isArray(faqData.keywords)
        ? faqData.keywords
        : (faqData.keywords || '').split(',').map(s => s.trim()).filter(Boolean),
      alternateQuestions: Array.isArray(faqData.alternateQuestions)
        ? faqData.alternateQuestions
        : (faqData.alternateQuestions || '').split('\n').map(s => s.trim()).filter(Boolean)
    };

    faqs.push(newFAQ);
    await writeJson('faqs.json', faqs);
    await nlpService.init(); // Refresh index
    return newFAQ;
  }
}

export const faqService = new FAQService();
