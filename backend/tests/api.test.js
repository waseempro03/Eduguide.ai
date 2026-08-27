import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

import { faqService } from '../services/faqService.js';
import { feedbackService } from '../services/feedbackService.js';
import { unansweredService } from '../services/unansweredService.js';
import { nlpService } from '../services/nlpService.js';

describe('CampusConnect Backend Service Integration Tests', () => {
  before(async () => {
    await nlpService.init();
  });

  test('FAQ Service: retrieves 30+ FAQs and categories', async () => {
    const faqs = await faqService.getAllFAQs();
    const categories = await faqService.getCategories();

    assert.ok(faqs.length >= 30, `Expected at least 30 FAQs, got ${faqs.length}`);
    assert.ok(categories.includes('Admissions'));
    assert.ok(categories.includes('Hostel'));
    assert.ok(categories.includes('Fees'));
    assert.ok(categories.includes('Exams'));
  });

  test('FAQ Service: filters FAQs by category', async () => {
    const hostelFaqs = await faqService.getAllFAQs('Hostel');
    assert.ok(hostelFaqs.length >= 2);
    hostelFaqs.forEach(f => assert.equal(f.category, 'Hostel'));
  });

  test('Feedback Service: saves positive and negative feedback without duplication', async () => {
    const msgId = `test_msg_${Date.now()}`;
    
    // Positive feedback
    const res1 = await feedbackService.submitFeedback({
      faqId: 1,
      messageId: msgId,
      question: 'What are admission requirements?',
      feedback: 'positive'
    });
    assert.equal(res1.success, true);
    assert.equal(res1.record.feedback, 'positive');

    // Updating same message to negative
    const res2 = await feedbackService.submitFeedback({
      faqId: 1,
      messageId: msgId,
      question: 'What are admission requirements?',
      feedback: 'negative',
      comment: 'Needed more details on PG'
    });
    assert.equal(res2.success, true);
    assert.equal(res2.updated, true);
    assert.equal(res2.record.feedback, 'negative');

    const stats = await feedbackService.getFeedbackStats();
    assert.ok(stats.total >= 1);
  });

  test('Unanswered Service: logs low-confidence questions and updates status', async () => {
    const testQuestion = `Can I bring a pet parrot to the dormitory? ${Date.now()}`;

    const logged = await unansweredService.logUnanswered({
      question: testQuestion,
      confidence: 0.12,
      topCandidate: { id: 16, question: 'Hostel info', category: 'Hostel' }
    });

    assert.ok(logged.id);
    assert.equal(logged.question, testQuestion);
    assert.equal(logged.status, 'unanswered');

    // Update status
    const updated = await unansweredService.updateStatus(logged.id, 'resolved');
    assert.equal(updated.status, 'resolved');

    // Delete test record
    const deleteRes = await unansweredService.deleteUnanswered(logged.id);
    assert.equal(deleteRes.success, true);
  });
});
