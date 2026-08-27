/**
 * Comprehensive NLP and Similarity Utilities for FAQ Chatbot
 * Implements Tokenization, Stop-word filtering, Porter Stemming, TF-IDF Vectorization,
 * Cosine Similarity, Levenshtein Distance, and Hybrid Confidence Scoring.
 */

// Stop words list
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did',
  'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t',
  'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more',
  'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so',
  'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s',
  'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom',
  'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Conversational fillers
  'tell', 'know', 'want', 'please', 'hello', 'hi', 'hey', 'give', 'detail', 'details', 'info',
  'information', 'like', 'need', 'assist', 'help', 'question', 'answer', 'much', 'many'
]);

/**
 * Basic Porter Stemmer implementation for English morphology normalization
 */
export function stemWord(word) {
  if (!word || word.length < 3) return word;
  let w = word.toLowerCase();

  // Step 1a: plurals and third person singular
  if (w.endsWith('sses')) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ies')) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ss')) {
    // keep
  } else if (w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is')) {
    w = w.slice(0, -1);
  }

  // Step 1b: ed / ing
  if (w.endsWith('eed')) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if (w.endsWith('ed')) {
    const stem = w.slice(0, -2);
    if (/[aeiou]/.test(stem) && stem.length >= 2) {
      w = stem;
      if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
        w += 'e';
      } else if (/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/.test(w)) {
        w = w.slice(0, -1);
      }
    }
  } else if (w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    if (/[aeiou]/.test(stem) && stem.length >= 2) {
      w = stem;
      if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
        w += 'e';
      } else if (/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/.test(w)) {
        w = w.slice(0, -1);
      }
    }
  }

  // Step 1c: y -> i
  if (w.endsWith('y') && w.length > 2 && !/[aeiou]y$/.test(w)) {
    w = w.slice(0, -1) + 'i';
  }

  // Step 2 & 3 suffixes
  if (w.endsWith('ational')) w = w.replace(/ational$/, 'ate');
  else if (w.endsWith('tional')) w = w.replace(/tional$/, 'tion');
  else if (w.endsWith('enci')) w = w.replace(/enci$/, 'ence');
  else if (w.endsWith('anci')) w = w.replace(/anci$/, 'ance');
  else if (w.endsWith('izer')) w = w.replace(/izer$/, 'ize');
  else if (w.endsWith('abli')) w = w.replace(/abli$/, 'able');
  else if (w.endsWith('alli')) w = w.replace(/alli$/, 'al');
  else if (w.endsWith('entli')) w = w.replace(/entli$/, 'ent');
  else if (w.endsWith('eli')) w = w.replace(/eli$/, 'e');
  else if (w.endsWith('ousli')) w = w.replace(/ousli$/, 'ous');
  else if (w.endsWith('ization')) w = w.replace(/ization$/, 'ize');
  else if (w.endsWith('ation')) w = w.replace(/ation$/, 'ate');
  else if (w.endsWith('ator')) w = w.replace(/ator$/, 'ate');
  else if (w.endsWith('alism')) w = w.replace(/alism$/, 'al');
  else if (w.endsWith('iveness')) w = w.replace(/iveness$/, 'ive');
  else if (w.endsWith('fulnes')) w = w.replace(/fulnes$/, 'ful');
  else if (w.endsWith('ousnes')) w = w.replace(/ousnes$/, 'ous');

  // Step 4: common endings
  if (w.endsWith('sion')) w = w.slice(0, -3); // e.g. admission -> admiss
  else if (w.endsWith('tion')) w = w.slice(0, -3); // e.g. application -> applica
  else if (w.endsWith('al') && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith('ance') && w.length > 5) w = w.slice(0, -4);
  else if (w.endsWith('ence') && w.length > 5) w = w.slice(0, -4);
  else if (w.endsWith('er') && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith('ic') && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith('able') && w.length > 5) w = w.slice(0, -4);
  else if (w.endsWith('ible') && w.length > 5) w = w.slice(0, -4);
  else if (w.endsWith('ant') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('ement') && w.length > 6) w = w.slice(0, -5);
  else if (w.endsWith('ment') && w.length > 5) w = w.slice(0, -4);
  else if (w.endsWith('ent') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('ou') && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith('ism') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('ate') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('iti') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('ous') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('ive') && w.length > 4) w = w.slice(0, -3);
  else if (w.endsWith('ize') && w.length > 4) w = w.slice(0, -3);

  // Step 5: trailing e
  if (w.endsWith('e') && w.length > 3) {
    w = w.slice(0, -1);
  }

  return w;
}

/**
 * Tokenize a text string into normalized, stemmed words
 * @param {string} text 
 * @param {boolean} removeStopWords 
 * @param {boolean} applyStemming 
 * @returns {string[]}
 */
export function tokenize(text, removeStopWords = true, applyStemming = true) {
  if (!text || typeof text !== 'string') return [];

  // Normalize punctuation and non-alphanumeric (keep single quotes in words, split others)
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s\d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const rawTokens = cleaned.split(' ').filter(token => token.length > 0);

  const tokens = [];
  for (const token of rawTokens) {
    if (removeStopWords && STOP_WORDS.has(token)) {
      continue;
    }
    const tokenToPush = applyStemming ? stemWord(token) : token;
    if (tokenToPush && tokenToPush.length > 1) {
      tokens.push(tokenToPush);
    }
  }

  return tokens;
}

/**
 * Compute Term Frequency (TF) for a token list
 * @param {string[]} tokens 
 * @returns {Record<string, number>}
 */
export function computeTF(tokens) {
  const tf = {};
  if (!tokens || tokens.length === 0) return tf;

  const total = tokens.length;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize by total tokens (augmented / smooth TF)
  for (const term in tf) {
    tf[term] = tf[term] / total;
  }

  return tf;
}

/**
 * Compute Inverse Document Frequency (IDF) across a corpus of tokenized documents
 * @param {string[][]} docsTokens 
 * @returns {Record<string, number>}
 */
export function computeIDF(docsTokens) {
  const idf = {};
  const N = docsTokens.length;
  if (N === 0) return idf;

  const docFreq = {};
  for (const doc of docsTokens) {
    const uniqueTokens = new Set(doc);
    for (const term of uniqueTokens) {
      docFreq[term] = (docFreq[term] || 0) + 1;
    }
  }

  // Smooth IDF: log(1 + (N / (1 + df))) + 1
  for (const term in docFreq) {
    idf[term] = Math.log(1 + (N / (1 + docFreq[term]))) + 1;
  }

  return idf;
}

/**
 * Calculate Cosine Similarity between two sparse TF-IDF vectors
 * @param {Record<string, number>} vecA 
 * @param {Record<string, number>} vecB 
 * @returns {number} 0.0 to 1.0
 */
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const term in vecA) {
    normA += vecA[term] * vecA[term];
    if (vecB[term]) {
      dotProduct += vecA[term] * vecB[term];
    }
  }

  for (const term in vecB) {
    normB += vecB[term] * vecB[term];
  }

  if (normA === 0 || normB === 0) return 0;

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : Math.min(1, Math.max(0, dotProduct / denominator));
}

/**
 * Calculate Levenshtein edit distance between two strings
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function levenshteinDistance(a, b) {
  if (!a) return b ? b.length : 0;
  if (!b) return a.length;

  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();

  const matrix = Array.from({ length: s2.length + 1 }, () =>
    new Array(s1.length + 1).fill(0)
  );

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }

  return matrix[s2.length][s1.length];
}

/**
 * Calculate Normalized Fuzzy Similarity (0.0 to 1.0)
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function fuzzySimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Calculate Keyword Jaccard Overlap Score
 * @param {string[]} queryTokens 
 * @param {string[]} docKeywordsTokens 
 * @returns {number}
 */
export function keywordCoverage(queryTokens, docKeywordsTokens) {
  if (!queryTokens.length || !docKeywordsTokens.length) return 0;

  const qSet = new Set(queryTokens);
  let matches = 0;

  for (const kw of docKeywordsTokens) {
    if (qSet.has(kw)) {
      matches += 1;
    } else {
      // Check for fuzzy matching token similarity (handles slight typos like 'hostell' vs 'hostel')
      for (const q of qSet) {
        if (fuzzySimilarity(q, kw) >= 0.85) {
          matches += 0.9;
          break;
        }
      }
    }
  }

  return Math.min(1.0, matches / Math.max(1, Math.min(qSet.size, docKeywordsTokens.length)));
}
