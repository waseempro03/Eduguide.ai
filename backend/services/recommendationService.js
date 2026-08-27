/**
 * EduGuide AI - 100-Point Scholarship Recommendation & Matching Engine
 * Compares student academic profile against scholarship database.
 */

import { readJson } from '../utils/storage.js';

export function calculateScholarshipMatch(studentProfile, scholarship) {
  let score = 0;
  const breakdown = {
    countryMatch: 0,
    degreeMatch: 0,
    fieldMatch: 0,
    academicEligibility: 0,
    nationalityEligibility: 0,
    languageRequirement: 0
  };

  if (!studentProfile || !scholarship) {
    return { score: 0, tier: 'Low Match', breakdown };
  }

  // 1. Country Match (20 Points)
  const preferredCountries = Array.isArray(studentProfile.preferredCountries)
    ? studentProfile.preferredCountries.map(c => c.toLowerCase())
    : (studentProfile.preferredCountries ? [studentProfile.preferredCountries.toLowerCase()] : []);

  if (
    preferredCountries.length === 0 ||
    preferredCountries.includes('any') ||
    preferredCountries.includes('all') ||
    preferredCountries.includes(scholarship.country.toLowerCase()) ||
    scholarship.country.toLowerCase() === 'european union' ||
    scholarship.country.toLowerCase() === 'global'
  ) {
    breakdown.countryMatch = 20;
  } else {
    breakdown.countryMatch = 5;
  }

  // 2. Degree Match (20 Points)
  const studentDegree = (studentProfile.degree || studentProfile.educationLevel || '').toLowerCase();
  const scholarshipDegrees = (scholarship.degree || []).map(d => d.toLowerCase());

  if (
    !studentDegree ||
    scholarshipDegrees.some(d => d.includes(studentDegree) || studentDegree.includes(d)) ||
    scholarshipDegrees.includes('all degrees')
  ) {
    breakdown.degreeMatch = 20;
  } else {
    breakdown.degreeMatch = 0;
  }

  // 3. Field of Study Match (20 Points)
  const studentField = (studentProfile.field || '').toLowerCase();
  const scholarshipFields = (scholarship.fields || []).map(f => f.toLowerCase());

  if (
    !studentField ||
    scholarshipFields.includes('all fields') ||
    scholarshipFields.some(f => f.includes(studentField) || studentField.includes(f))
  ) {
    breakdown.fieldMatch = 20;
  } else {
    breakdown.fieldMatch = 5;
  }

  // 4. Academic Eligibility / CGPA (20 Points)
  const studentCGPA = parseFloat(studentProfile.cgpa || '0');
  const minCGPA = scholarship.eligibility?.minCGPA || 0;

  if (studentCGPA >= minCGPA || minCGPA === 0) {
    breakdown.academicEligibility = 20;
  } else if (studentCGPA >= minCGPA - 0.5) {
    breakdown.academicEligibility = 12;
  } else {
    breakdown.academicEligibility = 5;
  }

  // 5. Nationality Eligibility (10 Points)
  const studentNationality = (studentProfile.nationality || '').toLowerCase();
  const allowedNationalities = (scholarship.nationalityEligibility || []).map(n => n.toLowerCase());

  if (
    !studentNationality ||
    allowedNationalities.includes('international') ||
    allowedNationalities.includes('all nationalities') ||
    allowedNationalities.includes('worldwide') ||
    allowedNationalities.some(n => n.includes(studentNationality) || studentNationality.includes(n)) ||
    (allowedNationalities.includes('developing countries') && ['india', 'nigeria', 'pakistan', 'kenya', 'brazil', 'vietnam'].includes(studentNationality))
  ) {
    breakdown.nationalityEligibility = 10;
  } else {
    breakdown.nationalityEligibility = 0;
  }

  // 6. Language Requirement (10 Points)
  const studentIelts = parseFloat(studentProfile.ieltsScore || '0');
  const studentToefl = parseFloat(studentProfile.toeflScore || '0');

  if (studentIelts >= 6.5 || studentToefl >= 90 || (!studentIelts && !studentToefl)) {
    breakdown.languageRequirement = 10;
  } else if (studentIelts >= 6.0 || studentToefl >= 75) {
    breakdown.languageRequirement = 7;
  } else {
    breakdown.languageRequirement = 4;
  }

  score = (
    breakdown.countryMatch +
    breakdown.degreeMatch +
    breakdown.fieldMatch +
    breakdown.academicEligibility +
    breakdown.nationalityEligibility +
    breakdown.languageRequirement
  );

  let tier = 'Low Match';
  if (score >= 90) tier = 'Excellent Match';
  else if (score >= 75) tier = 'Strong Match';
  else if (score >= 60) tier = 'Possible Match';

  return {
    score,
    tier,
    breakdown,
    guidance: `Based on the available criteria, you appear to be a ${tier.toLowerCase()} (${score}/100). Verify the official eligibility requirements before applying.`
  };
}

/**
 * Match all scholarships against student profile
 * @param {Object} studentProfile 
 * @param {Array} [scholarshipsList] 
 * @returns {Promise<Array>}
 */
export async function matchScholarshipsForStudent(studentProfile, scholarshipsList = null) {
  const scholarships = scholarshipsList || await readJson('seeds/scholarships.json', []);

  const results = scholarships.map(scholarship => {
    const match = calculateScholarshipMatch(studentProfile, scholarship);
    return {
      ...scholarship,
      matchScore: match.score,
      matchTier: match.tier,
      matchBreakdown: match.breakdown,
      guidance: match.guidance
    };
  });

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}
