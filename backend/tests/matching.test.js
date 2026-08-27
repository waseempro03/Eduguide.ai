import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateScholarshipMatch, matchScholarshipsForStudent } from '../services/recommendationService.js';

describe('EduGuide AI - 100-Point Scholarship Recommendation Engine Tests', () => {
  const mockScholarship = {
    id: 1,
    name: 'DAAD EPOS Scholarship',
    country: 'Germany',
    degree: ['Masters', 'PhD'],
    fields: ['Computer Science', 'Engineering'],
    nationalityEligibility: ['Developing Countries', 'India', 'International'],
    eligibility: {
      minCGPA: 7.5
    }
  };

  test('Calculates score and assigns Excellent Match for high-fit profile', () => {
    const studentProfile = {
      nationality: 'India',
      degree: 'Masters',
      field: 'Computer Science',
      cgpa: 8.5,
      preferredCountries: ['Germany'],
      ieltsScore: 7.5
    };

    const match = calculateScholarshipMatch(studentProfile, mockScholarship);
    assert.ok(match.score >= 90, `Expected score >= 90, got ${match.score}`);
    assert.equal(match.tier, 'Excellent Match');
    assert.equal(match.breakdown.countryMatch, 20);
    assert.equal(match.breakdown.degreeMatch, 20);
    assert.equal(match.breakdown.fieldMatch, 20);
    assert.equal(match.breakdown.academicEligibility, 20);
    assert.equal(match.breakdown.nationalityEligibility, 10);
    assert.equal(match.breakdown.languageRequirement, 10);
  });

  test('Ranks scholarships correctly with matchScholarshipsForStudent', async () => {
    const studentProfile = {
      nationality: 'India',
      degree: 'Masters',
      field: 'Computer Science',
      cgpa: 8.2,
      preferredCountries: ['Germany'],
      ieltsScore: 7.0
    };

    const results = await matchScholarshipsForStudent(studentProfile);
    assert.ok(results.length > 0);
    assert.ok(results[0].matchScore >= results[results.length - 1].matchScore);
  });
});
