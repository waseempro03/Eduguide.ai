/**
 * EduGuide AI - Master Educational AI & Synthesis Engine
 * Combines Intent Classification, Database Retrieval, Web Citations, and LLM Synthesis.
 */

import { classifyIntent } from './intentClassifier.js';
import { searchEducationalSources, fetchInstantKnowledge } from './webSearchService.js';
import { matchScholarshipsForStudent } from './recommendationService.js';
import { readJson } from '../utils/storage.js';
import { getOpenAIClient, isOpenAIConfigured } from '../config/openai.js';
import { getGeminiClient, isGeminiConfigured } from '../config/gemini.js';

const EDUGUIDE_SYSTEM_PROMPT = `You are Wiz.AI / EduGuide AI — an intelligent, versatile, and highly capable AI Assistant engineered with the conversational fluency, interactive depth, and contextual understanding of ChatGPT.

Core Identity & Persona:
- When asked for your name, who you are, or who created you (e.g. "what is your name", "who are you", etc.), you MUST reply: "I am the assistant of Mohamed Waseem Ameen, and I am proud to assist you with everything you need!"

Interactive & Conversational Guidelines:
- Respond like ChatGPT: be interactive, engaging, insightful, and responsive to any question, prompt, follow-up, or topic the user asks.
- Answer ANY query — including programming & software development, mathematics, general science, creative writing, text summaries, comparisons, advice, and open-ended conversations.
- For higher education, admissions, scholarships, visas, exams, and placements, provide structured, actionable roadmaps with verified guidance.
- For coding tasks, provide clean, idiomatic, fully commented code blocks (using \`\`\`language ... \`\`\`).
- For general questions, provide thorough, accurate, and easy-to-understand explanations.`;

export function cleanSymbols(text) {
  if (!text) return '';
  return text.trim();
}

export async function processEduGuideQuery(userMessage, conversationHistory = [], studentProfile = null, options = {}) {
  if (!userMessage || !userMessage.trim()) {
    throw new Error('User message is required.');
  }

  const { modelPreference = 'gemini', attachments = [] } = options;
  const query = userMessage.trim();
  const lowerQuery = query.toLowerCase();

  // Name / Identity / Domain Creator Direct Check (Strictly for the bot itself)
  const isNameOrCreatorQuery = Boolean(
    /^(what('?s| is| are)? (your|ur) name|whats? (your|ur) name)/i.test(lowerQuery) ||
    /^(who (are you|r u|r you))/i.test(lowerQuery) ||
    /^(who (made|created|built|developed|designed) (you|this bot|this assistant|u|this app))/i.test(lowerQuery) ||
    /^(who (is|are) (your|ur) (creator|developer|founder|author|maker|owner|boss|master))/i.test(lowerQuery) ||
    /^(whose assistant (are you|r u))/i.test(lowerQuery) ||
    /^(who (is|are) (the )?domain creator\??)$/i.test(lowerQuery) ||
    lowerQuery === 'domain creator' ||
    lowerQuery === 'your name' ||
    lowerQuery === 'ur name' ||
    lowerQuery === 'who created you' ||
    lowerQuery === 'who made you' ||
    lowerQuery === 'who is your creator' ||
    lowerQuery === 'who is ur creator' ||
    lowerQuery === 'who are you'
  );

  if (isNameOrCreatorQuery) {
    return {
      answer: 'I am the assistant of "Mohamed Waseem Ameen", and I am proud to assist you with everything you need! How can I help you today?',
      intent: 'GENERAL',
      entities: {},
      sources: [],
      matchedData: null,
      confidence: 1.0,
      source: 'gemini',
      thinking: 'Identified creator / identity question • Direct verified identity response dispatched.'
    };
  }

  // 1. Query Intent Classification & Entity Extraction
  const classification = classifyIntent(query);
  const { intent, entities } = classification;

  // Build thinking reasoning step
  const thinkingDetails = [
    `Intent classified as ${intent} (Confidence: ${(classification.confidence * 100).toFixed(0)}%)`
  ];
  if (entities.country) thinkingDetails.push(`Target Country: ${entities.country}`);
  if (entities.university) thinkingDetails.push(`Target University: ${entities.university}`);
  if (entities.degree) thinkingDetails.push(`Degree Level: ${entities.degree}`);
  if (entities.exam) thinkingDetails.push(`Exam: ${entities.exam}`);
  if (attachments.length > 0) thinkingDetails.push(`Processed ${attachments.length} attached document(s)/image(s)`);

  // 2. Data Retrieval from Local / MongoDB Education Knowledge Base
  const [universities, scholarships, placements, courses, exams] = await Promise.all([
    readJson('seeds/universities.json', []),
    readJson('seeds/scholarships.json', []),
    readJson('seeds/placements.json', []),
    readJson('seeds/courses.json', []),
    readJson('seeds/exams.json', [])
  ]);

  let relevantContext = '';
  let matchedData = null;

  // Context gathering based on intent
  if (intent === 'SCHOLARSHIP') {
    let filteredScholarships = scholarships;
    if (entities.country) {
      filteredScholarships = scholarships.filter(s =>
        s.country.toLowerCase().includes(entities.country.toLowerCase()) ||
        s.country.toLowerCase() === 'european union' ||
        s.country.toLowerCase() === 'global'
      );
    }
    if (entities.degree) {
      filteredScholarships = filteredScholarships.filter(s =>
        s.degree.some(d => d.toLowerCase().includes(entities.degree.toLowerCase()))
      );
    }

    if (studentProfile) {
      matchedData = matchScholarshipsForStudent(studentProfile, filteredScholarships).slice(0, 4);
    } else {
      matchedData = filteredScholarships.slice(0, 4);
    }

    relevantContext = `Verified Scholarship Database Entries:\n` + matchedData.map(s =>
      `- ${s.name} (${s.country}): Level: ${s.funding}, Amount: ${s.amount}, Eligibility: Min CGPA ${s.eligibility?.minCGPA || 'N/A'}. Official Portal: ${s.officialWebsite}`
    ).join('\n');
    thinkingDetails.push(`Retrieved ${matchedData.length} matched scholarships from verified database`);
  } else if (intent === 'UNIVERSITY' || intent === 'ADMISSION' || intent === 'TUITION') {
    let filteredUni = universities;
    if (entities.university) {
      filteredUni = universities.filter(u => u.name.toLowerCase().includes(entities.university.toLowerCase()));
    } else if (entities.country) {
      filteredUni = universities.filter(u => u.country.toLowerCase().includes(entities.country.toLowerCase()));
    }
    matchedData = filteredUni.slice(0, 3);
    relevantContext = `Relevant Universities:\n` + matchedData.map(u =>
      `- ${u.name} (${u.country}): Tuition: UG ${u.tuition?.undergraduate}, PG ${u.tuition?.postgraduate}. Requirements: ${u.admissionRequirements?.join('; ')}. Official Website: ${u.website}`
    ).join('\n');
    thinkingDetails.push(`Retrieved ${matchedData.length} university profiles`);
  } else if (intent === 'PLACEMENT') {
    let filteredPlacements = placements;
    if (entities.university) {
      filteredPlacements = placements.filter(p => p.university.toLowerCase().includes(entities.university.toLowerCase()));
    }
    matchedData = filteredPlacements.slice(0, 3);
    relevantContext = `Verified Placement Statistics:\n` + matchedData.map(p =>
      `- ${p.university} (${p.program}, ${p.year}): Average Salary: ${p.averageSalary}, Highest: ${p.highestSalary}, Placement Rate: ${p.placementRate}, Top Recruiters: ${p.topRecruiters?.join(', ')}`
    ).join('\n');
    thinkingDetails.push(`Retrieved verified placement statistics`);
  } else if (intent === 'EXAM') {
    let filteredExams = exams;
    if (entities.exam) {
      filteredExams = exams.filter(e => e.name.toLowerCase().includes(entities.exam.toLowerCase()));
    }
    matchedData = filteredExams.slice(0, 2);
    relevantContext = `Standardized Exam Details:\n` + matchedData.map(e =>
      `- ${e.name} (${e.fullName}): Purpose: ${e.purpose}, Total Score: ${e.totalScore}, Duration: ${e.duration}, Fee: ${e.fee}, Website: ${e.officialWebsite}`
    ).join('\n');
    thinkingDetails.push(`Retrieved standardized exam guidelines`);
  }

  // 3. Web Search & Source Retrieval
  const sources = await searchEducationalSources(query, entities);
  if (sources.length > 0) {
    thinkingDetails.push(`Cross-referenced ${sources.length} authoritative source links`);
  }

  const thinking = thinkingDetails.join(' • ');

  // 4. Google Gemini Generation with Live Web Search Grounding
  const gemini = getGeminiClient();
  if (gemini && modelPreference !== 'local' && modelPreference !== 'openai') {
    const candidateModels = [
      process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      'gemini-3.6-flash',
      'gemini-3.1-pro-preview'
    ];

    for (const modelName of candidateModels) {
      try {
        // Build conversation contents
        const contents = [];
        for (const msg of conversationHistory.slice(-6)) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content || '' }]
          });
        }

        const userParts = [{ text: query }];

        // Include any uploaded image attachments as inline data
        if (attachments && attachments.length > 0) {
          for (const att of attachments) {
            if (att.data && att.mimeType) {
              userParts.push({
                inlineData: {
                  data: att.data.replace(/^data:[^;]+;base64,/, ''),
                  mimeType: att.mimeType
                }
              });
            } else if (att.text) {
              userParts.push({ text: `Attached Document Content (${att.name}):\n${att.text}` });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: userParts
        });

        const systemInstruction = `${EDUGUIDE_SYSTEM_PROMPT}\n\nReal-Time Web Search Context:\n${sources.map(s => `${s.title}: ${s.snippet} (${s.url})`).join('\n')}\n\nContextual Knowledge Base Data:\n${relevantContext}`;

        const response = await gemini.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });

        const answer = response.text?.trim();

        if (answer) {
          return {
            answer: cleanSymbols(answer),
            intent,
            entities,
            sources,
            matchedData,
            confidence: 0.98,
            source: 'gemini',
            thinking: `${thinking} • Live Gemini response generated with high precision (${modelName})`
          };
        }
      } catch (apiError) {
        console.warn(`[EduGuide AI] Gemini API error with model [${modelName}], trying fallback:`, apiError.message);
      }
    }
  }

  // 4b. OpenAI Generation (if API Key is configured and requested)
  const openai = getOpenAIClient();
  if (openai && modelPreference !== 'local') {
    try {
      const messages = [
        {
          role: 'system',
          content: `${EDUGUIDE_SYSTEM_PROMPT}\n\nContextual Knowledge Base Data:\n${relevantContext}\n\nVerified Sources:\n${sources.map(s => `${s.title}: ${s.url}`).join('\n')}`
        },
        ...conversationHistory.slice(-6),
        { role: 'user', content: query }
      ];

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 750
      });

      const answer = response.choices?.[0]?.message?.content?.trim();
      if (answer) {
        return {
          answer: cleanSymbols(answer),
          intent,
          entities,
          sources,
          matchedData,
          confidence: 0.95,
          source: 'openai',
          thinking
        };
      }
    } catch (apiError) {
      console.warn('[EduGuide AI] OpenAI API error, using fluent local engine:', apiError.message);
    }
  }

  // 5. Conversational Local Synthesizer (Natural ChatGPT-style Tone)
  let answer = '';

  if (query.toLowerCase().includes('what is a scholarship') || query.toLowerCase() === 'what is scholarship') {
    answer = `A scholarship is a financial grant awarded to students to support their education, based on academic achievement, financial need, leadership, or specialized talents. Unlike student loans, scholarships do not have to be repaid.\n\nTypes of Scholarships Available:\n1. Merit-Based Scholarships: Awarded for outstanding academic records, GPA, or standardized test scores (e.g., Rhodes, Gates Cambridge).\n2. Need-Based Financial Aid: Awarded to students who demonstrate economic hardship (e.g., university tuition waivers).\n3. Government Fellowships: Prestigious national exchange programs covering 100% tuition, travel, and monthly living stipends (e.g., DAAD in Germany, Chevening in the UK, Fulbright in the US).\n4. University-Specific Grants: Automatic fee reductions offered directly by institutions.\n\nWould you like me to find specific scholarships matching your target degree, country, or field of study?`;
  } else if (intent === 'SCHOLARSHIP' && matchedData && matchedData.length > 0) {
    const destination = entities.country ? `in ${entities.country}` : 'globally';
    answer = `Here are the top verified scholarship and fellowship programs available for your study plans ${destination}:\n\n` +
      matchedData.map((s, idx) => (
        `${idx + 1}. 🎓 ${s.name}\n` +
        `• Country / Scope: ${s.country} (${s.university})\n` +
        `• Funding Level: ${s.funding} — ${s.amount}\n` +
        `• Eligibility Cutoff: Minimum CGPA ${s.eligibility?.minCGPA || '7.5+'} • ${s.eligibility?.languageRequirement || 'IELTS/TOEFL required'}\n` +
        `• Upcoming Deadline: ${s.deadline}\n` +
        `• Official Portal: ${s.officialWebsite}\n`
      )).join('\n') +
      `\n---\nPro Tip for Applicants:\n` +
      `Most government and university scholarships require applications 6 to 9 months before the intake begins. Make sure you prepare your Statement of Purpose (SOP), Letters of Recommendation (LORs), and language test scores early.`;
  } else if (intent === 'SOP_REVIEW' || /sop|statement of purpose|motivation letter|lor|essay review/i.test(lowerQuery)) {
    answer = `Statement of Purpose (SOP) & Admissions Essay Guidance:\n\n` +
      `A winning Statement of Purpose must bridge your academic past, your present competencies, and your future career vision with precision:\n\n` +
      `Recommended Structure (800 - 1,000 words):\n` +
      `1. The Academic Hook (150 words): Introduce your core research curiosity and why you are pursuing this specialized degree now.\n` +
      `2. Academic & Technical Foundation (250 words): Discuss undergraduate capstone projects, algorithms implemented, publications, or thesis work with quantifiable outcomes.\n` +
      `3. Industry / Research Impact (200 words): Highlight professional experience, leadership roles, open-source work, and practical problem-solving.\n` +
      `4. University Customization (200 words): Name specific professors, lab groups, and elective modules at your target university to demonstrate genuine fit.\n` +
      `5. Short- & Long-Term Goals (150 words): Articulate clear 3-year post-graduation roles and 10-year industry/academic aspirations.\n\n` +
      `Tip: You can use our built-in SOP Reviewer tool from the sidebar to get instant rubric scoring and AI enhancement!`;
  } else if (intent === 'COST_CALCULATOR' || /cost of living|living cost|monthly expenses|blocked account/i.test(lowerQuery)) {
    answer = `Global Cost of Living & Study Budget Estimations (2026/2027):\n\n` +
      `Key Country Monthly Living Cost Benchmarks:\n` +
      `• Germany: €950 - €1,100 / month (Blocked Account requirement: €11,208/year). Public tuition is virtually free.\n` +
      `• United States: $1,400 - $2,200 / month (depending on campus location and housing).\n` +
      `• United Kingdom: £1,100 - £1,500 / month (£1,334/mo in London, ~£1,023/mo outside London).\n` +
      `• Canada: CAD $1,600 - $2,000 / month (GIC financial requirement: CAD $20,635).\n` +
      `• Australia: AUD $1,800 - $2,400 / month (Part-time student minimum wage: AUD $23.23/hr).\n` +
      `• France: €800 - €1,100 / month (CAF housing subsidy refunds up to 30-40% of rent).\n\n` +
      `Tip: Explore the Living Cost & Currency Calculator tool in the sidebar for interactive currency conversion and city-specific breakdowns!`;
  } else if (intent === 'DEADLINE_QUERY' || /deadline|when to apply|intake|application cycle/i.test(lowerQuery)) {
    answer = `Upcoming Global Admissions & Scholarship Deadlines:\n\n` +
      `Main Application Cycles (2026 / 2027):\n` +
      `• US Early Action / Decision: November 1, 2026 (MIT, Stanford, Harvard, Columbia, CMU)\n` +
      `• US Regular Decision: January 1 - January 15, 2027\n` +
      `• UK UCAS Oxbridge & Medicine: October 15, 2026\n` +
      `• UK UCAS Standard Undergraduate: January 29, 2027\n` +
      `• Germany Winter Intake 2026: July 15, 2026\n` +
      `• Germany Summer Intake 2027: January 15, 2027\n` +
      `• Major Scholarships (DAAD, Chevening, Fulbright, EMJM): October to January.\n\n` +
      `Tip: Check the Application Deadlines Planner in the sidebar to view our interactive countdown timeline and set custom milestones!`;
  } else if (intent === 'COMPARISON' || /\bvs\b|compare|which is better/i.test(lowerQuery)) {
    answer = `Comparative Evaluation Strategy for Higher Education:\n\n` +
      `When comparing top institutions and degree programs, evaluate these key dimensions:\n` +
      `1. Academic Prestige & QS Global Rank: Research impact, citations per faculty, and academic reputation.\n` +
      `2. Total Cost of Attendance (COA): Tuition fees minus available scholarship waivers + local living expenses.\n` +
      `3. Post-Study Work (PSW) Visa & Immigration: US (3-yr STEM OPT), Germany (18-mo Job Search), UK (2-yr Graduate Route), Canada (3-yr PGWP).\n` +
      `4. Career Outcomes & Average CTC: On-campus recruitment presence and median graduate compensation.\n` +
      `5. Location & Industry Ecosystem: Proximity to tech hubs, research clusters, and corporate headquarters.\n\n` +
      `Tip: Use the University & Course Comparator tool in the sidebar to view side-by-side matrices of top universities!`;
  } else if (intent === 'MOCK_EXAM' || /mock test|quiz|practice question/i.test(lowerQuery)) {
    answer = `Standardized Exam Practice & Diagnostic Quizzes:\n\n` +
      `Diagnostic testing is the most effective way to identify knowledge gaps before test day:\n` +
      `• IELTS / TOEFL: Focus on academic vocabulary, paragraph cohesion, and active listening notes.\n` +
      `• GRE General: Master quantitative algebra/geometry shortcuts and high-frequency verbal vocabulary (Sentence Equivalence & Text Completion).\n` +
      `• GATE CS: Strengthen Operating Systems, Data Structures, Algorithms, Computer Networks, and DBMS.\n\n` +
      `Tip: Launch the Exam Practice & Quiz Hub from the sidebar to take interactive mini quizzes with instant explanations!`;
  } else if (intent === 'INTERVIEW_PREP' || /visa interview|mock interview|embassy interview/i.test(lowerQuery)) {
    answer = `Student Visa & University Admissions Interview Guide:\n\n` +
      `Top 5 Questions & How to Answer Them:\n` +
      `1. "Why did you choose this university over others?" -> Focus on specific curriculum modules, faculty research, and unique lab infrastructure.\n` +
      `2. "How are you financing your studies?" -> Clearly specify personal savings, family sponsorship, education loan sanction letters, or scholarships.\n` +
      `3. "What are your plans after graduation?" -> Reiterate your strong intent to leverage this international qualification for long-term career growth in your home country/global industry.\n` +
      `4. "Why this specific country?" -> Explain the high academic standards, research-oriented pedagogical framework, and multicultural learning environment.\n` +
      `5. "Tell me about your academic background." -> Concisely summarize your degree, CGPA, and key engineering or research projects.`;
  } else if (intent === 'PLACEMENT' && matchedData && matchedData.length > 0) {
    const p = matchedData[0];
    answer = `Here is a breakdown of the graduate placement and salary statistics for ${p.university} (${p.program}, ${p.year}):\n\n` +
      `Compensation & Recruitment Overview:\n` +
      `• Average Salary Package: ${p.averageSalary}\n` +
      `• Highest Salary Recorded: ${p.highestSalary}\n` +
      `• Median Package: ${p.medianSalary || 'High Percentile'}\n` +
      `• Overall Placement Rate: ${p.placementRate} of the graduating batch placed\n\n` +
      `Key Hiring Companies:\n` +
      `${p.topRecruiters?.map(r => `• ${r}`).join('\n')}\n\n` +
      `These figures reflect verified placement reports published by the institution's official career development cell.`;
  } else if ((intent === 'UNIVERSITY' || intent === 'ADMISSION' || intent === 'TUITION') && matchedData && matchedData.length > 0) {
    const u = matchedData[0];
    answer = `Here is the complete guide and admission roadmap for ${u.name}:\n\n` +
      `Overview:\n` +
      `${u.description}\n` +
      `• Location: ${u.city}, ${u.country}\n` +
      `• Global Ranking: QS #${u.ranking?.qsWorld || 'Top Tier'} • National Rank: #${u.ranking?.national || 1}\n` +
      `• Acceptance Rate: ${u.acceptanceRate}\n\n` +
      `Admission Pathways & Requirements:\n` +
      `${u.admissionRequirements?.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n` +
      `Estimated Tuition & Expenses:\n` +
      `• Undergraduate Programs: ${u.tuition?.undergraduate}\n` +
      `• Postgraduate Programs: ${u.tuition?.postgraduate}\n\n` +
      `Key Programs Offered:\n` +
      `${u.courses?.map(c => `• ${c}`).join('\n')}\n\n` +
      `Official Admissions Website: ${u.website}`;
  } else if (intent === 'EXAM' && matchedData && matchedData.length > 0) {
    const e = matchedData[0];
    answer = `${e.name} (${e.fullName})\n\n` +
      `${e.purpose}\n\n` +
      `Test Structure & Details:\n` +
      `• Test Duration: ${e.duration}\n` +
      `• Total Score Scale: ${e.totalScore}\n` +
      `• Approximate Fee: ${e.fee}\n` +
      `• Widely Accepted In: ${e.countries?.join(', ')}\n\n` +
      `Recommended Preparation Tips:\n` +
      `${e.preparationTips?.map(t => `• ${t}`).join('\n')}\n\n` +
      `Official Portal: ${e.officialWebsite}`;
  } else if (/quantum|quantum computing|qubit/i.test(lowerQuery)) {
    answer = `Quantum Computing Overview:\n\n` +
      `Quantum Computing is an advanced computing paradigm that utilizes the fundamental principles of quantum mechanics to process information at exponential speeds compared to classical computers.\n\n` +
      `Core Quantum Principles:\n` +
      `1. Superposition: Unlike classical binary bits (0 or 1), qubits can exist in a linear combination of states simultaneously.\n` +
      `2. Entanglement: Quantum correlation where the state of one qubit instantaneously determines the state of another, enabling massive parallel computation.\n` +
      `3. Interference: Amplifying correct computational paths while canceling out incorrect outcomes.\n\n` +
      `Key Applications & Frameworks:\n` +
      `• Applications: Post-Quantum Cryptography, Molecular Modeling & Drug Discovery, Financial Portfolio Optimization, and Quantum AI.\n` +
      `• Frameworks: Qiskit (IBM Quantum in Python), Cirq (Google Quantum AI), and PennyLane (Quantum ML).`;
  } else if (/machine learning|ml|deep learning|neural network|ai|artificial intelligence|data science/i.test(lowerQuery)) {
    answer = `Overview of Machine Learning & AI:\n\n` +
      `Machine Learning (ML) is a subfield of Artificial Intelligence that focuses on developing algorithms that allow computers to learn from data and make predictions or decisions without being explicitly programmed.\n\n` +
      `Core Pillars of Machine Learning:\n` +
      `1. Supervised Learning: Learning with labeled data (e.g., Regression, Classification - Linear Models, Random Forest, XGBoost).\n` +
      `2. Unsupervised Learning: Finding hidden patterns without labels (e.g., K-Means Clustering, PCA).\n` +
      `3. Reinforcement Learning: Learning through trial, error, and reward signals (e.g., AlphaGo, Robotics).\n` +
      `4. Deep Learning: Neural network architectures with multiple layers (e.g., CNNs for vision, Transformers & LLMs for NLP).\n\n` +
      `Recommended Learning Roadmap:\n` +
      `• Mathematics: Linear Algebra, Probability, Calculus, Optimization.\n` +
      `• Python Libraries: NumPy, Pandas, Scikit-Learn, PyTorch, TensorFlow.\n` +
      `• Real Projects: Kaggle competitions, GitHub open-source repositories, and end-to-end model deployment.`;
  } else if (/python|coding|learn programming|dsa|data structures|algorithms/i.test(lowerQuery)) {
    answer = `Step-by-Step Programming & DSA Roadmap:\n\n` +
      `1. Foundations (Weeks 1-4):\n` +
      `• Syntax, Variables, Control Flow, Functions, and Object-Oriented Programming (OOP).\n` +
      `• Practice basic problem-solving and clean code principles.\n\n` +
      `2. Core Data Structures (Weeks 5-10):\n` +
      `• Arrays, Strings, Hash Maps / Sets, Linked Lists, Stacks, and Queues.\n` +
      `• Trees (Binary Trees, BST), Heaps, and Graphs (BFS, DFS).\n\n` +
      `3. Algorithms & Patterns (Weeks 11-16):\n` +
      `• Two Pointers, Sliding Window, Binary Search, Recursion & Backtracking, Dynamic Programming.\n` +
      `• Practice 150+ problems on LeetCode / HackerRank.\n\n` +
      `4. Real-World Applications:\n` +
      `• Build full-stack projects or data pipelines on GitHub to demonstrate hands-on expertise.`;
  } else if (/sop|statement of purpose|lor|letter of recommendation|resume|cv/i.test(lowerQuery)) {
    answer = `Guide to Writing a Winning Statement of Purpose (SOP) & Resume:\n\n` +
      `1. Structure of an Academic SOP (800 - 1000 words):\n` +
      `• Introduction: Hook the committee with your specific academic curiosity and career vision.\n` +
      `• Academic Background: Key undergraduate achievements, high-impact coursework, and research projects.\n` +
      `• Industry / Research Experience: Tangible metrics, technologies used, and problem-solving examples.\n` +
      `• Why This Program & University: Mention specific faculty labs, specialized modules, and campus resources.\n` +
      `• Long-Term Career Goals: Clear 3-5 year roadmap post-graduation.\n\n` +
      `2. Essential Guidelines:\n` +
      `• Quantify your impact (e.g., improved model accuracy by 14%, handled 10k daily requests).\n` +
      `• Proofread thoroughly to eliminate generic statements and grammatical errors.`;
  } else if (/visa|blocked account|germany|study abroad|living cost/i.test(lowerQuery)) {
    answer = `Study Abroad & Visa Process Overview:\n\n` +
      `1. Germany Study Visa & Blocked Account:\n` +
      `• Blocked Account Requirement: Approximately €11,904/year (€992/month) deposited into an approved account (Expatrio, Fintiba, Coracle).\n` +
      `• APS Certificate: Mandatory for Indian students before applying for German student visas.\n` +
      `• Health Insurance: Public health insurance (TK, AOK, Barmer) or student travel insurance.\n\n` +
      `2. USA (F-1 Visa) & UK (Student Visa):\n` +
      `• USA: Receive Form I-20 from university, pay SEVIS I-901 fee, and schedule DS-160 interview.\n` +
      `• UK: Receive Confirmation of Acceptance for Studies (CAS) and show living costs of ~£1,334/month (London) or ~£1,023/month (outside London).\n\n` +
      `3. Key Advice:\n` +
      `• Start visa applications at least 3 months prior to program start dates.`;
  } else if (/sathyabama/i.test(lowerQuery)) {
    answer = `Sathyabama Institute of Science and Technology:\n\n` +
      `• Founder: Founded by Col. Dr. Jeppiaar in 1987.\n` +
      `• Leadership: Dr. Mariazeena Johnson (Chancellor) and Dr. Marie Johnson (President).\n` +
      `• Location: Chennai, Tamil Nadu, India (OMR / Rajiv Gandhi Salai).\n` +
      `• Accreditation: NAAC A++ Grade, NIRF Top-Ranked Deemed University.\n` +
      `• Key Programs: B.Tech (AI & Data Science, Computer Science, Aerospace, ECE), Dental, Pharmacy, and MBA.\n` +
      `• Admissions: Sathyabama All India Entrance Examination (SAEEE) and 12th Board merit.\n` +
      `• Official Website: https://www.sathyabama.ac.in`;
  } else if (entities.university || lowerQuery.includes('iit') || lowerQuery.includes('madras') || lowerQuery.includes('mit') || lowerQuery.includes('stanford') || lowerQuery.includes('oxford')) {
    answer = `To get into top institutions like IIT Madras or global universities, here is the structured step-by-step pathway:\n\n` +
      `1. Undergraduate Admissions (B.Tech / BS):\n` +
      `• For Indian IITs (IIT Madras / IIT Bombay): Qualify JEE Main in the top 2.5 lakh candidates, then secure a top rank (usually top 1,000 - 5,000) in JEE Advanced. Participate in JoSAA counseling.\n` +
      `• For US/UK Universities (MIT, Stanford, Oxford): Excel in high school GPA, SAT/ACT scores, extracurricular leadership, and English proficiency (IELTS 7.5+ or TOEFL 100+).\n\n` +
      `2. Postgraduate Admissions (M.Tech / MS / MBA):\n` +
      `• For Indian IITs: Secure a high GATE score for M.Tech, JAM for M.Sc, or CAT for MBA programs.\n` +
      `• For International Masters: GRE/GMAT score, high undergraduate CGPA (8.0+), Statement of Purpose (SOP), and 2-3 Letters of Recommendation (LORs).\n\n` +
      `3. Key Preparation Action Plan:\n` +
      `• Focus heavily on core STEM subjects (Physics, Chemistry, Math / Computer Science).\n` +
      `• Solve previous 5-10 years question papers.\n` +
      `• Prepare all academic transcripts and application essays well before deadlines.`;
  } else if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|namaste|what'?s\s*up|howdy|hola)$/i.test(lowerQuery)) {
    answer = `Hello! 👋 How can I help you today?\n\nWhether you have questions about global university admissions, scholarships, exam prep (JEE, GATE, GRE, IELTS), programming tasks, or career guidance, I'm here to assist you. Feel free to ask anything!`;
  } else {
    const instantKnowledge = await fetchInstantKnowledge(query);
    if (instantKnowledge && instantKnowledge.extract) {
      answer = `${instantKnowledge.title}\n\n${instantKnowledge.extract}`;
      if (instantKnowledge.url) {
        sources.push({
          title: `${instantKnowledge.title} (${instantKnowledge.source || 'Verified Source'})`,
          url: instantKnowledge.url,
          domain: instantKnowledge.source || 'Knowledge Base',
          snippet: instantKnowledge.extract.slice(0, 140) + '...'
        });
      }
    } else {
      answer = `Here is detailed guidance regarding your request about "${query}":\n\n` +
        `• Overview: We recommend breaking down your goal into clear, actionable steps.\n` +
        `• Strategy: Research official university guidelines, align your academic portfolio, and prepare required documentation early.\n` +
        `• Key Resources: You can explore our built-in scholarship finder, university comparator, deadlines planner, and SOP reviewer tools from the sidebar.\n\n` +
        `Please feel free to ask a specific follow-up question or provide more details so I can give you an even more tailored answer!`;
    }
  }

  return {
    answer: cleanSymbols(answer),
    intent,
    entities,
    sources,
    matchedData,
    confidence: classification.confidence,
    source: 'eduguide_nlp'
  };
}
