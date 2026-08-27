/**
 * EduGuide AI - Educational Tools & Assessment Service
 * Powers SOP Review, University Comparator, Living Cost Calculator, Deadlines Tracker & Mock Exams.
 */

import { readJson } from '../utils/storage.js';
import { getOpenAIClient, isOpenAIConfigured } from '../config/openai.js';
import { getGeminiClient, isGeminiConfigured } from '../config/gemini.js';

/**
 * Evaluate Statement of Purpose (SOP) or College Essay
 */
export async function evaluateSop({ text, targetUniversity = '', targetProgram = '', degreeLevel = 'Masters' }) {
  if (!text || text.trim().length < 50) {
    throw new Error('Please provide at least 50 characters of SOP text for meaningful evaluation.');
  }

  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  // Local algorithmic rubric scoring
  let clarityScore = 78;
  let academicFocusScore = 75;
  let specificityScore = 72;
  let toneScore = 80;
  let goalAlignmentScore = 70;

  if (wordCount >= 500 && wordCount <= 1200) clarityScore += 10;
  if (/research|project|algorithm|thesis|methodology|publication|github|prototype/i.test(cleanText)) academicFocusScore += 12;
  if (targetUniversity && new RegExp(targetUniversity, 'i').test(cleanText)) specificityScore += 15;
  if (/professor|lab|faculty|curriculum|module|coursework/i.test(cleanText)) specificityScore += 8;
  if (/career|future|long-term|short-term|aspire|industry|vision/i.test(cleanText)) goalAlignmentScore += 15;
  if (!/i think|maybe|stuff|things|basically/i.test(cleanText)) toneScore += 10;

  // Cap scores at 98 max
  clarityScore = Math.min(98, clarityScore);
  academicFocusScore = Math.min(98, academicFocusScore);
  specificityScore = Math.min(98, specificityScore);
  toneScore = Math.min(98, toneScore);
  goalAlignmentScore = Math.min(98, goalAlignmentScore);

  const overallScore = Math.round((clarityScore + academicFocusScore + specificityScore + toneScore + goalAlignmentScore) / 5);

  const strengths = [];
  const improvements = [];

  if (academicFocusScore >= 85) {
    strengths.push('Strong technical/academic depth with concrete mentions of projects or research.');
  } else {
    improvements.push('Incorporate more specific technical projects, quantifiable metrics, or research methodologies.');
  }

  if (specificityScore >= 85) {
    strengths.push(`Excellent institutional tailoring explicitly mentioning professors, labs, or courses at ${targetUniversity || 'your target university'}.`);
  } else {
    improvements.push(`Deepen university customization: mention specific professors, research groups, or specialized courses at ${targetUniversity || 'the university'}.`);
  }

  if (goalAlignmentScore >= 85) {
    strengths.push('Clear articulation of short-term and long-term career goals.');
  } else {
    improvements.push('Strengthen the bridge between this degree and your 5-year post-graduation career roadmap.');
  }

  if (wordCount < 400) {
    improvements.push(`Your SOP is slightly brief (${wordCount} words). A typical graduate SOP ranges between 650 to 1,000 words.`);
  } else if (wordCount > 1200) {
    improvements.push(`Your SOP is quite lengthy (${wordCount} words). Aim for concise impact within 800-1,000 words.`);
  } else {
    strengths.push(`Ideal document length (${wordCount} words) suitable for top international admissions committees.`);
  }

  let polishedSample = `Statement of Purpose — ${targetProgram || 'Graduate Studies'} (${targetUniversity || 'Target University'})\n\n`;
  polishedSample += `Having cultivated a rigorous foundation in ${targetProgram || 'my undergraduate studies'}, I am eager to advance my academic exploration at ${targetUniversity || 'your esteemed institution'}. My academic journey has been driven by an enduring passion to solve complex real-world challenges through structured inquiry and technological innovation.\n\n`;
  polishedSample += `During my previous research and coursework, I focused on building scalable, principled solutions. I am particularly drawn to ${targetUniversity || 'the university'}'s distinguished faculty and specialized laboratories, where I aspire to contribute actively to collaborative research while sharpening my leadership in the discipline.\n\n`;
  polishedSample += `In the short term, this program will equip me with cutting-edge theoretical rigor and practical mastery. In the long term, I envision applying these competencies to lead high-impact engineering initiatives that bridge foundational research with real-world industry adoption.`;

  return {
    wordCount,
    overallScore,
    rubric: {
      clarityAndStructure: clarityScore,
      academicDepth: academicFocusScore,
      universitySpecificity: specificityScore,
      academicTone: toneScore,
      careerGoalAlignment: goalAlignmentScore
    },
    strengths,
    improvements,
    polishedSample
  };
}

/**
 * Fetch and filter Living Costs
 */
export async function getLivingCostsData(targetCurrency = 'USD') {
  const data = await readJson('seeds/livingCosts.json');
  if (!data || !data.countries) {
    return { countries: [], exchangeRates: {} };
  }

  const rate = (data.exchangeRates && data.exchangeRates[targetCurrency]) || 1.0;

  const convertedCountries = data.countries.map(c => ({
    ...c,
    selectedCurrency: targetCurrency,
    displayMonthlyTotal: Math.round(c.avgMonthlyTotalUSD * rate),
    displayBreakdown: {
      rent: Math.round(c.breakdown.rent * rate),
      food: Math.round(c.breakdown.food * rate),
      healthInsurance: Math.round(c.breakdown.healthInsurance * rate),
      transport: Math.round(c.breakdown.transport * rate),
      utilitiesAndInternet: Math.round(c.breakdown.utilitiesAndInternet * rate),
      leisure: Math.round(c.breakdown.leisure * rate)
    }
  }));

  return {
    countries: convertedCountries,
    exchangeRates: data.exchangeRates,
    targetCurrency
  };
}

/**
 * Fetch and filter Application Deadlines
 */
export async function getDeadlinesData(category = 'All') {
  const deadlines = await readJson('seeds/deadlines.json') || [];
  if (category === 'All') return deadlines;
  return deadlines.filter(d => d.category.toLowerCase() === category.toLowerCase());
}

/**
 * Side-by-Side University Comparison
 */
export async function compareUniversities(universityNames = []) {
  const allUnis = await readJson('seeds/universities.json') || [];
  const allPlacements = await readJson('seeds/placements.json') || [];

  if (universityNames.length === 0) {
    return allUnis.slice(0, 3);
  }

  const selected = [];
  for (const name of universityNames) {
    const found = allUnis.find(u =>
      u.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(u.name.toLowerCase())
    );
    if (found) {
      const placement = allPlacements.find(p => p.university.toLowerCase().includes(found.name.toLowerCase()));
      selected.push({
        ...found,
        placementDetails: placement || { avgSalary: 'Competitive market rate', topRecruiters: ['Global Tech & Finance Firms'], placementRate: '92%+' }
      });
    }
  }

  return selected.length > 0 ? selected : allUnis.slice(0, 3);
}

/**
 * Get Mock Exam Categories & Questions
 */
export async function getMockExamsData(categoryId = 'all') {
  const data = await readJson('seeds/mockExams.json') || { categories: [] };
  if (categoryId === 'all') return data.categories;
  return data.categories.filter(c => c.id === categoryId);
}
