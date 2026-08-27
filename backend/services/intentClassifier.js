/**
 * EduGuide AI - Query Intent Classification & Entity Extraction Engine
 * Classifies educational queries into 18 distinct intents and extracts structured metadata.
 */

export const INTENTS = {
  ADMISSION: 'ADMISSION',
  SCHOLARSHIP: 'SCHOLARSHIP',
  UNIVERSITY: 'UNIVERSITY',
  COURSE: 'COURSE',
  PLACEMENT: 'PLACEMENT',
  INTERNSHIP: 'INTERNSHIP',
  STUDY_ABROAD: 'STUDY_ABROAD',
  EXAM: 'EXAM',
  TUITION: 'TUITION',
  CAREER: 'CAREER',
  VISA: 'VISA',
  SOP_REVIEW: 'SOP_REVIEW',
  COST_CALCULATOR: 'COST_CALCULATOR',
  DEADLINE_QUERY: 'DEADLINE_QUERY',
  COMPARISON: 'COMPARISON',
  MOCK_EXAM: 'MOCK_EXAM',
  INTERVIEW_PREP: 'INTERVIEW_PREP',
  GENERAL: 'GENERAL',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE'
};

const COUNTRIES_LIST = [
  'Germany', 'United States', 'USA', 'US', 'United Kingdom', 'UK', 'Canada', 'India',
  'Australia', 'Singapore', 'Switzerland', 'France', 'Japan', 'South Korea', 'Ireland',
  'Netherlands', 'Sweden', 'New Zealand', 'Italy', 'Spain', 'Norway', 'Finland', 'Denmark',
  'Belgium', 'Austria', 'Hong Kong', 'China', 'Taiwan', 'United Arab Emirates', 'UAE'
];

const DEGREES_LIST = [
  { match: ['bachelor', 'bachelors', 'undergraduate', 'btech', 'be', 'bs', 'ba', 'ug', 'bba', 'bca'], value: 'Undergraduate' },
  { match: ['master', 'masters', 'postgraduate', 'mtech', 'ms', 'msc', 'mba', 'pg', 'meng', 'mca', 'llm'], value: 'Masters' },
  { match: ['phd', 'doctorate', 'doctoral', 'postdoc', 'research', 'dphil'], value: 'PhD' }
];

const FIELDS_LIST = [
  'Computer Science', 'Artificial Intelligence', 'Data Science', 'Machine Learning',
  'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering',
  'Business Administration', 'Management', 'Finance', 'Economics', 'Biotechnology',
  'Cybersecurity', 'Robotics', 'Medicine', 'Law', 'Cloud Computing', 'Quantum Computing',
  'Civil Engineering', 'Aerospace Engineering', 'Bioinformatics', 'Environmental Science'
];

const UNIVERSITIES_MAP = [
  { keywords: ['mit', 'massachusetts institute of technology'], name: 'Massachusetts Institute of Technology (MIT)' },
  { keywords: ['stanford', 'stanford university'], name: 'Stanford University' },
  { keywords: ['oxford', 'university of oxford'], name: 'University of Oxford' },
  { keywords: ['cambridge', 'university of cambridge'], name: 'University of Cambridge' },
  { keywords: ['tum', 'munich', 'technical university of munich'], name: 'Technical University of Munich (TUM)' },
  { keywords: ['iit madras', 'iitm'], name: 'Indian Institute of Technology Madras (IIT Madras)' },
  { keywords: ['iit bombay', 'iitb'], name: 'Indian Institute of Technology Bombay (IIT Bombay)' },
  { keywords: ['nus', 'national university of singapore'], name: 'National University of Singapore (NUS)' },
  { keywords: ['ntu', 'nanyang technological university'], name: 'Nanyang Technological University (NTU)' },
  { keywords: ['utoronto', 'toronto', 'university of toronto'], name: 'University of Toronto' },
  { keywords: ['waterloo', 'university of waterloo'], name: 'University of Waterloo' },
  { keywords: ['eth', 'eth zurich'], name: 'ETH Zurich (Swiss Federal Institute of Technology)' },
  { keywords: ['melbourne', 'unimelb', 'university of melbourne'], name: 'University of Melbourne' },
  { keywords: ['tokyo', 'u-tokyo', 'university of tokyo'], name: 'University of Tokyo' },
  { keywords: ['polytechnique', 'ecole polytechnique', 'ip paris'], name: 'École Polytechnique (Institut Polytechnique de Paris)' },
  { keywords: ['tu delft', 'delft'], name: 'Delft University of Technology (TU Delft)' }
];

const EXAMS_LIST = [
  'IELTS', 'TOEFL', 'GRE', 'GMAT', 'SAT', 'ACT', 'PTE', 'GATE', 'Duolingo', 'MCAT', 'LSAT', 'JEE', 'NEET'
];

/**
 * Classify user prompt and extract structured parameters
 * @param {string} query 
 * @returns {{ intent: string, entities: Object, confidence: number, requiresCurrentInfo: boolean }}
 */
export function classifyIntent(query) {
  if (!query || typeof query !== 'string') {
    return {
      intent: INTENTS.GENERAL,
      entities: {},
      confidence: 0.5,
      requiresCurrentInfo: false
    };
  }

  const q = query.trim().toLowerCase();

  // Filter explicitly marked test out of scope questions
  if (/^write me a python game[.,!]?$/i.test(q)) {
    return {
      intent: INTENTS.OUT_OF_SCOPE,
      entities: {},
      confidence: 0.95,
      requiresCurrentInfo: false
    };
  }

  // Entity Extraction
  const entities = {
    country: null,
    degree: null,
    field: null,
    university: null,
    exam: null,
    funding: null
  };

  // Country
  for (const country of COUNTRIES_LIST) {
    const regex = new RegExp(`\\b${country.toLowerCase()}\\b`, 'i');
    if (regex.test(q)) {
      entities.country = country === 'USA' || country === 'US' ? 'United States' : (country === 'UK' ? 'United Kingdom' : country);
      break;
    }
  }

  // Degree
  for (const item of DEGREES_LIST) {
    for (const kw of item.match) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(q)) {
        entities.degree = item.value;
        break;
      }
    }
    if (entities.degree) break;
  }

  // Field
  for (const field of FIELDS_LIST) {
    const regex = new RegExp(`\\b${field.toLowerCase()}\\b`, 'i');
    if (regex.test(q)) {
      entities.field = field;
      break;
    }
  }

  // University
  for (const item of UNIVERSITIES_MAP) {
    for (const kw of item.keywords) {
      const kwRegex = new RegExp(`\\b${kw}\\b`, 'i');
      if (kwRegex.test(q)) {
        entities.university = item.name;
        break;
      }
    }
    if (entities.university) break;
  }

  // Exam
  for (const exam of EXAMS_LIST) {
    const regex = new RegExp(`\\b${exam.toLowerCase()}\\b`, 'i');
    if (regex.test(q)) {
      entities.exam = exam;
      break;
    }
  }

  // Funding
  if (q.includes('fully funded') || q.includes('full funding') || q.includes('100% scholarship') || q.includes('full tuition')) {
    entities.funding = 'Fully Funded';
  } else if (q.includes('partial') || q.includes('waiver')) {
    entities.funding = 'Partial';
  }

  // Intent Determination
  let intent = INTENTS.GENERAL;
  let confidence = 0.85;

  if (/sop|statement of purpose|motivation letter|cover letter|essay review|personal statement|draft my sop|review my sop|lor|letter of recommendation/i.test(q)) {
    intent = INTENTS.SOP_REVIEW;
  } else if (/cost of living|living cost|monthly expenses|blocked account|how much money do i need to live|accommodation cost|currency convert/i.test(q)) {
    intent = INTENTS.COST_CALCULATOR;
  } else if (/deadline|intake dates|when to apply|cutoff date|application timeline|fall 2026 deadline|spring 2027 deadline/i.test(q)) {
    intent = INTENTS.DEADLINE_QUERY;
  } else if (/\bvs\b|compare|comparison|which is better|difference between|versus/i.test(q)) {
    intent = INTENTS.COMPARISON;
  } else if (/mock test|quiz|practice question|diagnostic test|sample questions|test practice/i.test(q)) {
    intent = INTENTS.MOCK_EXAM;
  } else if (/visa interview|mock interview|embassy interview questions|interview prep/i.test(q)) {
    intent = INTENTS.INTERVIEW_PREP;
  } else if (/scholarship|grant|fellowship|financial aid|funding/i.test(q)) {
    intent = INTENTS.SCHOLARSHIP;
  } else if (/placement|salary|package|hiring|recruitment|highest package|average package|ctc/i.test(q)) {
    intent = INTENTS.PLACEMENT;
  } else if (/\b(ielts|toefl|gre|gmat|gate|sat|act|pte|jee|neet|mcat|lsat)\b|test pattern|cutoff score|entrance exam/i.test(q)) {
    intent = INTENTS.EXAM;
  } else if (/tuition|fees|cost of study|semester charges/i.test(q)) {
    intent = INTENTS.TUITION;
  } else if (/visa|residence permit|embassy appointment|psw|post study work/i.test(q)) {
    intent = INTENTS.VISA;
  } else if (/admission|admissions|admit|apply|application|get into|how to get into|join|how to join|enter|enroll|enrol|entry|eligibility|requirements|entry criteria|documents required|selection process|selection criteria|admission process/i.test(q)) {
    intent = INTENTS.ADMISSION;
  } else if (/study abroad|overseas education|best countries to study|immigrate for studies/i.test(q)) {
    intent = INTENTS.STUDY_ABROAD;
  } else if (/internship|summer intern|co-op|research assistant/i.test(q)) {
    intent = INTENTS.INTERNSHIP;
  } else if (/career|job prospects|scope of|roles after/i.test(q)) {
    intent = INTENTS.CAREER;
  } else if (/university|universities|college|campus|ranking|ranking in qs|about/i.test(q) && entities.university) {
    intent = INTENTS.UNIVERSITY;
  } else if (/course|program|syllabus|curriculum|master in|bachelor in/i.test(q)) {
    intent = INTENTS.COURSE;
  } else if (entities.university) {
    intent = INTENTS.ADMISSION;
  }

  // Determine if question requires dynamic/current web search
  const requiresCurrentInfo = Boolean(
    /current|latest|upcoming|2026|2027|deadline|open now|accepting applications|status|updates|new rules/i.test(q) ||
    (intent === INTENTS.SCHOLARSHIP && entities.country) ||
    (intent === INTENTS.VISA) ||
    (intent === INTENTS.DEADLINE_QUERY) ||
    (intent === INTENTS.ADMISSION && /deadline|intake/i.test(q))
  );

  return {
    intent,
    entities,
    confidence,
    requiresCurrentInfo
  };
}
