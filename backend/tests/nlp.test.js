import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

import {
  tokenize,
  stemWord,
  computeTF,
  computeIDF,
  cosineSimilarity,
  fuzzySimilarity,
  keywordCoverage
} from '../utils/nlpUtils.js';
import { nlpService } from '../services/nlpService.js';

describe('NLP Engine Unit Tests', () => {
  before(async () => {
    await nlpService.init();
  });

  test('tokenize filters stop words and normalizes tokens', () => {
    const tokens = tokenize('What are the admission requirements for our college?');
    assert.ok(tokens.includes('admiss'));
    assert.ok(tokens.includes('requir'));
    assert.ok(tokens.includes('colleg'));
    assert.ok(!tokens.includes('what'));
    assert.ok(!tokens.includes('are'));
    assert.ok(!tokens.includes('the'));
  });

  test('stemWord correctly stems common word variations', () => {
    assert.equal(stemWord('admissions'), 'admiss');
    assert.equal(stemWord('requirements'), 'requir');
    assert.equal(stemWord('scholarships'), 'scholarship');
    assert.equal(stemWord('placement'), 'plac');
    assert.equal(stemWord('graduated'), 'gradu');
    assert.equal(stemWord('studying'), 'studi');
  });

  test('cosineSimilarity correctly scores identical and orthogonal vectors', () => {
    const vecA = { admission: 0.8, criteria: 0.6 };
    const vecB = { admission: 0.8, criteria: 0.6 };
    const vecC = { weather: 0.9, rain: 0.5 };

    const scoreIdentical = cosineSimilarity(vecA, vecB);
    const scoreOrthogonal = cosineSimilarity(vecA, vecC);

    assert.ok(Math.abs(scoreIdentical - 1.0) < 0.001);
    assert.equal(scoreOrthogonal, 0);
  });

  test('fuzzySimilarity handles minor typos', () => {
    const simClose = fuzzySimilarity('hostel', 'hostell');
    const simFar = fuzzySimilarity('hostel', 'astronomy');

    assert.ok(simClose > 0.8);
    assert.ok(simFar < 0.4);
  });

  test('Exact Match: "What are the admission requirements for undergraduate programs?"', () => {
    const result = nlpService.findBestMatch('What are the admission requirements for undergraduate programs?');
    assert.equal(result.matched, true);
    assert.equal(result.faq.id, 1);
    assert.ok(result.confidence >= 0.85);
  });

  test('Similar Question: "What do I need to join the college?"', () => {
    const result = nlpService.findBestMatch('What do I need to join the college?');
    assert.equal(result.matched, true);
    assert.equal(result.faq.id, 1);
    assert.ok(result.confidence >= 0.50);
  });

  test('Different Phrasing: "Tell me about hostel charges."', () => {
    const result = nlpService.findBestMatch('Tell me about hostel charges.');
    assert.equal(result.matched, true);
    assert.equal(result.faq.id, 16);
    assert.ok(result.confidence >= 0.45);
  });

  test('Typo Tolerance: "What are the addmision requirments?"', () => {
    const result = nlpService.findBestMatch('What are the addmision requirments?');
    assert.equal(result.matched, true);
    assert.equal(result.faq.id, 1);
    assert.ok(result.confidence >= 0.40);
  });

  test('Unknown / Unrelated Question: "What is the weather tomorrow in Paris?"', () => {
    const result = nlpService.findBestMatch('What is the weather tomorrow in Paris?');
    assert.equal(result.matched, false);
    assert.ok(result.confidence < 0.35);
  });
});
