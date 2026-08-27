import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifyIntent } from '../services/intentClassifier.js';

describe('EduGuide AI - Intent Classification & Entity Extraction Tests', () => {
  test('Scholarship Intent: "Find fully funded scholarships for computer science in Germany."', () => {
    const res = classifyIntent('Find fully funded scholarships for computer science in Germany.');
    assert.equal(res.intent, 'SCHOLARSHIP');
    assert.equal(res.entities.country, 'Germany');
    assert.equal(res.entities.field, 'Computer Science');
    assert.equal(res.entities.funding, 'Fully Funded');
    assert.equal(res.requiresCurrentInfo, true);
  });

  test('Placement Intent: "What is the average placement package at IIT Madras?"', () => {
    const res = classifyIntent('What is the average placement package at IIT Madras?');
    assert.equal(res.intent, 'PLACEMENT');
    assert.equal(res.entities.university, 'Indian Institute of Technology Madras (IIT Madras)');
  });

  test('Admission Intent: "What are the admission requirements for MIT?"', () => {
    const res = classifyIntent('What are the admission requirements for MIT?');
    assert.equal(res.intent, 'ADMISSION');
    assert.equal(res.entities.university, 'Massachusetts Institute of Technology (MIT)');
  });

  test('Exam Intent: "What is IELTS and what is the test structure?"', () => {
    const res = classifyIntent('What is IELTS and what is the test structure?');
    assert.equal(res.intent, 'EXAM');
    assert.equal(res.entities.exam, 'IELTS');
  });

  test('Out of Scope Intent: "Write me a Python game."', () => {
    const res = classifyIntent('Write me a Python game.');
    assert.equal(res.intent, 'OUT_OF_SCOPE');
  });

  test('General Query: "What is a scholarship?"', () => {
    const res = classifyIntent('What is a scholarship?');
    assert.equal(res.intent, 'SCHOLARSHIP');
    assert.equal(res.requiresCurrentInfo, false);
  });
});
