import { faqService } from '../services/faqService.js';

export async function getAllFAQs(req, res) {
  try {
    const { category, search } = req.query;
    const faqs = await faqService.getAllFAQs(category, search);
    res.json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    console.error('[FAQController] Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to retrieve FAQs' });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await faqService.getCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('[FAQController] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
}

export async function getFAQById(req, res) {
  try {
    const { id } = req.params;
    const faq = await faqService.getFAQById(id);
    if (!faq) {
      return res.status(404).json({ error: `FAQ with ID ${id} not found` });
    }
    res.json({ success: true, faq });
  } catch (error) {
    console.error('[FAQController] Error fetching FAQ by id:', error);
    res.status(500).json({ error: 'Failed to retrieve FAQ' });
  }
}

export async function createFAQ(req, res) {
  try {
    const { question, answer, category, keywords, alternateQuestions } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required fields' });
    }

    const newFAQ = await faqService.createFAQ({
      question,
      answer,
      category,
      keywords,
      alternateQuestions
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created and indexed successfully',
      faq: newFAQ
    });
  } catch (error) {
    console.error('[FAQController] Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
}
