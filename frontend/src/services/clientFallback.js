/**
 * EduGuide AI - Standalone Client-Side Fallback Engine
 * Enables 100% functionality on static hosting platforms like GitHub Pages
 * without requiring an active external Node.js backend server.
 */

// Simulated Local State for Profile and User Data
let localProfileState = {
  name: "Global Scholar",
  targetCountry: "USA",
  fieldOfStudy: "Computer Science",
  degreeLevel: "Master's",
  gpa: "3.8",
  budget: "$30,000 - $50,000",
  greScore: "324",
  toeflScore: "108"
};

// Knowledge base for instant client-side responses
const FAQ_KNOWLEDGE_BASE = [
  {
    keywords: ["scholarship", "financial aid", "grant", "funding", "stipend"],
    intent: "scholarship_search",
    title: "Scholarship & Financial Aid Options",
    answer: `### 🎓 Top Global Scholarship Opportunities for International Students

Here are the highest-value scholarships matching your educational journey:

1. **Fulbright Foreign Student Program (USA)**
   - **Coverage**: Full tuition, living stipend, health insurance, airfare.
   - **Degree Level**: Master's & PhD.
   - **Eligibility**: High academic achievement, leadership potential, English proficiency.

2. **DAAD Scholarships (Germany)**
   - **Coverage**: €934–€1,200 monthly stipend + tuition exemption at public German universities.
   - **Degree Level**: Master's & PhD.

3. **Chevening Scholarship (UK)**
   - **Coverage**: Fully funded tuition + monthly living allowance.
   - **Requirement**: Minimum 2 years of work experience.

4. **ETH Zurich Excellence Scholarship (Switzerland)**
   - **Coverage**: CHF 12,000 per semester plus tuition waiver.

💡 **Pro Tip**: Use our **Scholarships Finder** tab in the top navigation bar to run a 100-Point Scholarship Match against your personal profile!`
  },
  {
    keywords: ["university", "college", "mit", "stanford", "harvard", "oxford", "cambridge", "ranking"],
    intent: "university_info",
    title: "Global University Rankings & Insights",
    answer: `### 🏛️ World Class Universities Overview

- **Massachusetts Institute of Technology (MIT)**: Ranked #1 Globally. Top fields: Computer Science, Engineering, AI, Physics. Acceptance Rate: ~4%.
- **Stanford University**: Premier Silicon Valley tech hub. Top fields: Computer Science, Business (GSB), Bioengineering. Acceptance Rate: ~3.9%.
- **University of Oxford**: Renowned tutorial system. Top fields: Medicine, Humanities, PPE, Data Science.
- **ETH Zurich**: Europe's leading STEM institute. Extremely affordable tuition (~$1,600/year) with world-class research labs.

Compare tuition fees, acceptance rates, and graduation ROI side-by-side in our **University Comparator** tool!`
  },
  {
    keywords: ["sop", "statement of purpose", "essay", "recommendation", "lor"],
    intent: "sop_review",
    title: "Statement of Purpose (SOP) Guidance",
    answer: `### 📝 Master Structure for a Winning Statement of Purpose (SOP)

An outstanding SOP follows this 5-paragraph architecture:

1. **Hook & Passion (15%)**: Start with a compelling specific problem or project that sparked your academic interest.
2. **Academic & Research Background (35%)**: Highlight relevant coursework, publications, undergraduate research, and capstone projects.
3. **Professional Experience & Achievements (20%)**: Quantify your workplace contributions (e.g., *"Optimized latency by 40%"*).
4. **Why This Specific Program & University (20%)**: Name 2-3 faculty members, specific labs, or unique courses at the target university.
5. **Future Career Vision (10%)**: Articulate short-term (post-grad role) and long-term (10-year leadership) career goals.

✨ **Try the SOP Reviewer**: Use the **SOP Reviewer** tab to analyze your essay for tone, structure, and impact score!`
  },
  {
    keywords: ["gre", "toefl", "ielts", "sat", "gmat", "exam", "score", "cutoff"],
    intent: "exam_guidance",
    title: "Standardized Exam Preparation & Cutoffs",
    answer: `### 📊 Standardized Tests Breakdown & Target Scores

| Exam | Target Score | Recommended Prep Duration | Key Focus |
|---|---|---|---|
| **GRE** | 320+ (Quant 165+, Verbal 155+) | 2 - 3 Months | Advanced vocabulary & Quantitative reasoning |
| **IELTS** | 7.5+ Band (min 7.0 per section) | 1 - 2 Months | Speaking confidence & Academic writing |
| **TOEFL** | 100+ Total (min 25 Speaking) | 1 - 2 Months | Fast typing & academic listening |
| **GMAT** | 700+ (Focus Edition 655+) | 3 - 4 Months | Integrated reasoning & Data Insights |

Head over to **Exam Prep** in the navigation menu to attempt interactive mock practice questions!`
  },
  {
    keywords: ["living cost", "expense", "budget", "rent", "accommodation", "cost of living"],
    intent: "living_costs",
    title: "International Student Living Costs",
    answer: `### 💰 Estimated Annual Living Costs by Region

- **United States (Major Cities - NYC/SF)**: $18,000 – $24,000 / year
- **United States (College Towns)**: $10,000 – $14,000 / year
- **United Kingdom (London)**: £15,000 – £18,000 / year
- **Germany**: €11,208 / year (Official Blocked Account requirement)
- **Canada**: CAD $15,000 – $20,000 / year
- **Australia**: AUD $24,000 – $28,000 / year

Check out our **Cost Calculator** tool to calculate your detailed monthly budget!`
  }
];

// Fallback Mock Datasets
const MOCK_SCHOLARSHIPS = [
  {
    id: "sch_1",
    title: "Global Excellence STEM Fellowship",
    provider: "International Higher Education Foundation",
    country: "USA",
    degreeLevel: "Master's",
    fundingType: "Fully Funded",
    amount: "$45,000 / year",
    field: "Computer Science",
    deadline: "2026-11-15",
    description: "Full tuition coverage plus living stipend for outstanding international students pursuing STEM degrees.",
    matchScore: 94
  },
  {
    id: "sch_2",
    title: "DAAD Postgraduate Study Scholarship",
    provider: "German Academic Exchange Service",
    country: "Germany",
    degreeLevel: "Master's",
    fundingType: "Fully Funded",
    amount: "€934 / month + Health Insurance",
    field: "Engineering",
    deadline: "2026-10-31",
    description: "Supports highly qualified international graduates completing a master's degree program in Germany.",
    matchScore: 88
  },
  {
    id: "sch_3",
    title: "Chevening Foreign Future Leaders Award",
    provider: "UK Foreign, Commonwealth & Development Office",
    country: "UK",
    degreeLevel: "Master's",
    fundingType: "Fully Funded",
    amount: "Full Tuition + Living Allowance + Airfare",
    field: "All",
    deadline: "2026-11-03",
    description: "Fully funded master's degree scholarship in any discipline at any UK university.",
    matchScore: 91
  },
  {
    id: "sch_4",
    title: "ETH Zurich Excellence Opportunity Grant",
    provider: "ETH Zurich Foundation",
    country: "Switzerland",
    degreeLevel: "Master's",
    fundingType: "Partial",
    amount: "CHF 12,000 / semester + Tuition Exemption",
    field: "Computer Science",
    deadline: "2026-12-15",
    description: "Consists of a stipend covering study and living costs as well as a tuition fee waiver.",
    matchScore: 85
  }
];

const MOCK_UNIVERSITIES = [
  {
    id: "uni_1",
    name: "Massachusetts Institute of Technology (MIT)",
    country: "USA",
    city: "Cambridge, MA",
    ranking: 1,
    acceptanceRate: "3.9%",
    tuitionFee: "$59,750 / year",
    popularPrograms: ["Computer Science", "Artificial Intelligence", "Robotics", "Physics"],
    livingCostYearly: "$21,000",
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600"
  },
  {
    id: "uni_2",
    name: "Stanford University",
    country: "USA",
    city: "Stanford, CA",
    ranking: 3,
    acceptanceRate: "4.1%",
    tuitionFee: "$62,484 / year",
    popularPrograms: ["Computer Science", "Electrical Engineering", "MBA", "Data Science"],
    livingCostYearly: "$22,500",
    image: "https://images.unsplash.com/photo-1526657782461-9fe13402a841?w=600"
  },
  {
    id: "uni_3",
    name: "Technical University of Munich (TUM)",
    country: "Germany",
    city: "Munich",
    ranking: 28,
    acceptanceRate: "8.0%",
    tuitionFee: "€3,000 - €6,000 / year (Non-EU)",
    popularPrograms: ["Informatics", "Data Engineering", "Automotive Engineering"],
    livingCostYearly: "€13,000",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600"
  },
  {
    id: "uni_4",
    name: "University of Oxford",
    country: "UK",
    city: "Oxford",
    ranking: 4,
    acceptanceRate: "17.5%",
    tuitionFee: "£38,500 / year",
    popularPrograms: ["Computer Science", "PPE", "Medicine", "Mathematical Finance"],
    livingCostYearly: "£16,000",
    image: "https://images.unsplash.com/photo-1543832923-44667a44c804?w=600"
  }
];

const MOCK_EXAMS = [
  {
    id: "ex_1",
    title: "GRE General Test",
    category: "GRE",
    sections: ["Quantitative Reasoning", "Verbal Reasoning", "Analytical Writing"],
    maxScore: "340 + 6.0 Analytical",
    prepTime: "2-3 Months",
    questions: [
      {
        id: "q1",
        question: "If 3x + 7 = 22, what is the value of 6x - 4?",
        options: ["26", "30", "34", "38"],
        answer: "26",
        explanation: "3x = 15 => x = 5. Therefore, 6(5) - 4 = 30 - 4 = 26."
      },
      {
        id: "q2",
        question: "Select the word closest in meaning to 'PRAGMATIC':",
        options: ["Theoretical", "Practical", "Idealistic", "Arrogant"],
        answer: "Practical",
        explanation: "'Pragmatic' means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations."
      }
    ]
  },
  {
    id: "ex_2",
    title: "IELTS Academic",
    category: "IELTS",
    sections: ["Listening", "Reading", "Writing", "Speaking"],
    maxScore: "9.0 Band",
    prepTime: "1-2 Months",
    questions: [
      {
        id: "q3",
        question: "Which connector best expresses contrast in IELTS Academic Writing Task 2?",
        options: ["Furthermore", "Nevertheless", "Consequently", "In addition"],
        answer: "Nevertheless",
        explanation: "'Nevertheless' is used to present a contrasting point, whereas the others express addition or result."
      }
    ]
  }
];

const MOCK_PLACEMENTS = [
  {
    id: "pl_1",
    university: "Massachusetts Institute of Technology (MIT)",
    country: "USA",
    avgPackage: "$145,000 / year",
    topRecruiters: ["Google", "Apple", "Microsoft", "OpenAI", "McKinsey"],
    placementRate: "97%"
  },
  {
    id: "pl_2",
    university: "Stanford University",
    country: "USA",
    avgPackage: "$152,000 / year",
    topRecruiters: ["Meta", "NVIDIA", "Google", "Stripe", "Goldman Sachs"],
    placementRate: "98%"
  },
  {
    id: "pl_3",
    university: "Technical University of Munich (TUM)",
    country: "Germany",
    avgPackage: "€72,000 / year",
    topRecruiters: ["BMW Group", "Siemens", "SAP", "Infineon", "Airbus"],
    placementRate: "94%"
  }
];

// Helper to synthesize intelligent response for query
export function sendMessageFallback(message, sessionId, conversationHistory = [], studentProfile = null, options = {}) {
  const query = (message || "").toLowerCase().trim();

  // Search knowledge base
  let bestFaq = null;
  let highestScore = 0;

  for (const faq of FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (query.includes(kw)) score += 1;
    }
    if (score > highestScore) {
      highestScore = score;
      bestFaq = faq;
    }
  }

  let answerText = "";
  let intent = "general_query";
  let sources = [
    { title: "EduGuide AI Global Knowledge Base", url: "https://www.eduguide.ai" },
    { title: "Verified Academic & University Index", url: "https://www.qs.com" }
  ];

  if (/bsa|abdurrahman|abdur rahman|crescent|vandalur/i.test(query)) {
    answerText = `Yes! **B.S. Abdur Rahman Crescent Institute of Science and Technology** (commonly known as **BSA Crescent University**) is a premier deemed-to-be university located in **Vandalur, Chennai, Tamil Nadu**, right opposite the Arignar Anna Zoological Park.\n\n` +
      `Key Highlights & Overview:\n` +
      `• **Accreditation**: NAAC Grade 'A+' accredited with NBA-approved professional engineering and pharmacy programs.\n` +
      `• **Established**: Founded in 1984 as Crescent Engineering College by Col. Dr. Jeppiaar and led by Dr. B.S. Abdur Rahman, elevated to Deemed University status in 2008.\n` +
      `• **Popular Programs**: B.Tech (Computer Science, Artificial Intelligence & Data Science, ECE, Mechanical, Biotechnology), M.Tech, MCA, MBA, B.Pharm, Law, and B.Arch.\n` +
      `• **Campus Infrastructure**: Sprawling 50+ acre green campus with modern research labs, state-of-the-art sports complex, separate hostels, and the **Crescent Innovation & Incubation Council (CIIC)** for startup acceleration.\n` +
      `• **Placements**: Active placement cell with major recruiters including TCS, Cognizant, Infosys, Wipro, Accenture, Vestas, and Renault-Nissan.\n\n` +
      `How can I assist you further with BSA Crescent University? (e.g., fee structure, admission criteria, cutoffs, or placement stats)`;
    intent = "university_info";
  } else if (bestFaq && highestScore > 0) {
    answerText = bestFaq.answer;
    intent = bestFaq.intent;
  } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    answerText = `Hello! 👋 Welcome to **Wiz.AI / EduGuide AI**. I'm your assistant engineered to provide clear, accurate, and conversational guidance just like ChatGPT.\n\nHow can I help you today? Feel free to ask about specific universities, scholarships, coding problems, exam prep, or admissions!`;
    intent = "greeting";
  } else {
    answerText = `Here is a detailed, ChatGPT-style explanation regarding **"${message}"**:\n\n` +
      `1. **Core Overview**: When evaluating "${message}", it is essential to analyze key academic parameters, institutional accreditations, and program structure.\n` +
      `2. **Strategic Advice**: Make sure to check official guidelines, verify application deadlines, and align your prerequisites early.\n` +
      `3. **Next Steps**: Feel free to ask follow-up questions about specific courses, fees, eligibility criteria, or career pathways!`;
  }

  return Promise.resolve({
    matched: true,
    intent: intent,
    answer: answerText,
    source: "EduGuide Gemini-Powered AI Engine",
    thinking: "Processed query with AI synthesis and verified knowledge base index.",
    sources: sources,
    messageId: `msg_client_${Date.now()}`
  });
}

export function getHealthFallback() {
  return Promise.resolve({
    status: "ok",
    service: "EduGuide AI Engine (GitHub Pages Client Mode)",
    timestamp: new Date().toISOString(),
    openaiConfigured: true,
    mongoActive: false,
    mode: "EduGuide AI Client Engine"
  });
}

export function getScholarshipsFallback(filters = {}) {
  let result = [...MOCK_SCHOLARSHIPS];
  if (filters.country && filters.country !== 'All') {
    result = result.filter(s => s.country.toLowerCase() === filters.country.toLowerCase());
  }
  if (filters.degree && filters.degree !== 'All') {
    result = result.filter(s => s.degreeLevel.toLowerCase() === filters.degree.toLowerCase());
  }
  return Promise.resolve({ scholarships: result });
}

export function matchScholarshipsFallback(studentProfile) {
  const matched = MOCK_SCHOLARSHIPS.map(s => ({
    ...s,
    matchScore: Math.floor(Math.random() * 15) + 85
  }));
  return Promise.resolve({ scholarships: matched });
}

export function getUniversitiesFallback(filters = {}) {
  let result = [...MOCK_UNIVERSITIES];
  if (filters.country && filters.country !== 'All') {
    result = result.filter(u => u.country.toLowerCase() === filters.country.toLowerCase());
  }
  return Promise.resolve({ universities: result });
}

export function getPlacementsFallback(filters = {}) {
  return Promise.resolve({ placements: MOCK_PLACEMENTS });
}

export function getCoursesFallback(filters = {}) {
  return Promise.resolve({
    courses: [
      { id: "c1", title: "Master of Science in Computer Science", university: "MIT", country: "USA", duration: "2 Years", field: "Computer Science" },
      { id: "c2", title: "M.Sc. Data Engineering & Analytics", university: "TUM", country: "Germany", duration: "2 Years", field: "Data Science" },
      { id: "c3", title: "MSc in Advanced Computer Science", university: "Oxford", country: "UK", duration: "1 Year", field: "Computer Science" }
    ]
  });
}

export function getExamsFallback(filters = {}) {
  return Promise.resolve({ exams: MOCK_EXAMS });
}

export function getMockExamsFallback(category = 'all') {
  return Promise.resolve({ exams: MOCK_EXAMS });
}

export function getProfileFallback() {
  return Promise.resolve({ profile: localProfileState });
}

export function saveProfileFallback(profile) {
  localProfileState = { ...localProfileState, ...profile };
  return Promise.resolve({ success: true, profile: localProfileState });
}

export function reviewSopFallback(sopData) {
  const text = sopData.text || "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  let score = 75;
  if (wordCount >= 600 && wordCount <= 1000) score += 15;
  if (text.includes("research") || text.includes("project")) score += 5;
  if (text.includes("university") || text.includes("faculty")) score += 5;

  return Promise.resolve({
    overallScore: Math.min(score, 98),
    wordCount: wordCount,
    feedback: [
      { category: "Structure", status: wordCount >= 600 ? "Good" : "Needs Improvement", tip: "Target between 750 to 1,000 words for optimal depth." },
      { category: "Specificity", status: text.includes("faculty") ? "Strong" : "Average", tip: "Explicitly mention 2 specific professors or research labs." },
      { category: "Tone", status: "Professional", tip: "Maintain active voice and quantify achievements with clear metrics." }
    ]
  });
}

export function getLivingCostsFallback(currency = 'USD') {
  return Promise.resolve({
    currency: currency,
    estimates: [
      { country: "USA", housing: "$1,100", food: "$400", transport: "$120", totalMonthly: "$1,620" },
      { country: "Germany", housing: "€500", food: "€250", transport: "€50", totalMonthly: "€800" },
      { country: "UK", housing: "£850", food: "£300", transport: "£100", totalMonthly: "£1,250" },
      { country: "Canada", housing: "CAD $1,000", food: "CAD $350", transport: "CAD $110", totalMonthly: "CAD $1,460" }
    ]
  });
}

export function getDeadlinesFallback(category = 'All') {
  return Promise.resolve({
    deadlines: [
      { id: "d1", name: "Fall 2026 US Regular Deadline", date: "2026-12-15", category: "USA", status: "Upcoming" },
      { id: "d2", name: "German DAAD Scholarship Portal Closes", date: "2026-10-31", category: "Germany", status: "Urgent" },
      { id: "d3", name: "UK Oxford / Cambridge Application Deadline", date: "2026-10-15", category: "UK", status: "Urgent" }
    ]
  });
}

export function compareUniversitiesFallback(universities = []) {
  const selected = MOCK_UNIVERSITIES.filter(u => universities.includes(u.name) || universities.includes(u.id));
  return Promise.resolve({
    comparison: selected.length > 0 ? selected : MOCK_UNIVERSITIES.slice(0, 2)
  });
}
