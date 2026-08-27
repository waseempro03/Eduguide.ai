import {
  tokenize,
  computeTF,
  computeIDF,
  cosineSimilarity,
  fuzzySimilarity,
  keywordCoverage
} from '../utils/nlpUtils.js';
import { readJson } from '../utils/storage.js';

class NLPService {
  constructor() {
    this.faqs = [];
    this.indexedDocs = [];
    this.idf = {};
    this.isInitialized = false;
  }

  /**
   * Initialize or re-index the FAQ dataset
   */
  async init() {
    this.faqs = await readJson('faqs.json', []);
    this.buildIndex();
    this.isInitialized = true;
    console.log(`[NLPService] Indexed ${this.faqs.length} FAQs successfully.`);
  }

  /**
   * Build TF-IDF index across all FAQs
   */
  buildIndex() {
    const docsTokens = [];

    this.indexedDocs = this.faqs.map(faq => {
      // Aggregate all text representations for the FAQ
      const questionTokens = tokenize(faq.question);
      const alternateTokens = (faq.alternateQuestions || []).flatMap(alt => tokenize(alt));
      const keywordTokens = (faq.keywords || []).flatMap(kw => tokenize(kw));
      const answerTokens = tokenize(faq.answer);

      // Combined document representation with weighting (question & keywords boosted)
      const combinedTokens = [
        ...questionTokens, ...questionTokens, // 2x weight on question
        ...alternateTokens, ...alternateTokens, // 2x weight on alternate questions
        ...keywordTokens, ...keywordTokens, ...keywordTokens, // 3x weight on keywords
        ...answerTokens // 1x weight on answer content
      ];

      docsTokens.push(combinedTokens);

      return {
        id: faq.id,
        faq,
        questionTokens,
        alternateTokens,
        keywordTokens,
        combinedTokens,
        rawQuestion: faq.question.toLowerCase(),
        alternateQuestions: (faq.alternateQuestions || []).map(q => q.toLowerCase()),
        rawKeywords: (faq.keywords || []).map(k => k.toLowerCase())
      };
    });

    // Compute Corpus IDF
    this.idf = computeIDF(docsTokens);

    // Compute TF-IDF vectors for each indexed document
    for (const doc of this.indexedDocs) {
      const tf = computeTF(doc.combinedTokens);
      const tfidf = {};
      for (const term in tf) {
        tfidf[term] = tf[term] * (this.idf[term] || 1.0);
      }
      doc.tfidf = tfidf;
    }
  }

  /**
   * Find the most relevant FAQ for a user query
   * @param {string} query 
   * @param {number} threshold 
   * @returns {{ matched: boolean, confidence: number, faq: any, topCandidates: any[] }}
   */
  findBestMatch(query, threshold = 0.35) {
    if (!this.isInitialized) {
      this.buildIndex();
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return {
        matched: false,
        confidence: 0,
        faq: null,
        topCandidates: []
      };
    }

    const rawQuery = query.trim().toLowerCase();
    const queryTokens = tokenize(query);

    if (queryTokens.length === 0) {
      return {
        matched: false,
        confidence: 0,
        faq: null,
        topCandidates: []
      };
    }

    // Build Query TF-IDF Vector
    const queryTF = computeTF(queryTokens);
    const queryTFIDF = {};
    for (const term in queryTF) {
      queryTFIDF[term] = queryTF[term] * (this.idf[term] || 1.0);
    }

    const scores = this.indexedDocs.map(doc => {
      // 1. Direct match checks (Exact match or close substring)
      if (rawQuery === doc.rawQuestion || doc.alternateQuestions.includes(rawQuery)) {
        return {
          id: doc.id,
          faq: doc.faq,
          confidence: 0.99,
          cosineSim: 1.0,
          keywordScore: 1.0,
          fuzzyScore: 1.0,
          matchReason: 'exact_question_match'
        };
      }

      // Check for high substring or phrase overlap
      let maxFuzzy = fuzzySimilarity(rawQuery, doc.rawQuestion);
      for (const alt of doc.alternateQuestions) {
        const altFuzzy = fuzzySimilarity(rawQuery, alt);
        if (altFuzzy > maxFuzzy) maxFuzzy = altFuzzy;
      }

      // 2. Cosine Similarity on TF-IDF Vectors
      const cosineSim = cosineSimilarity(queryTFIDF, doc.tfidf);

      // 3. Keyword Coverage Score
      const allDocKeywordTokens = [...doc.keywordTokens, ...doc.questionTokens];
      const keywordScore = keywordCoverage(queryTokens, allDocKeywordTokens);

      // 4. Specific keyphrase bonus
      let keyphraseBonus = 0;
      for (const kw of doc.rawKeywords) {
        if (rawQuery.includes(kw)) {
          keyphraseBonus = Math.max(keyphraseBonus, kw.length > 4 ? 0.25 : 0.15);
        }
      }

      // 5. Hybrid Confidence Calculation
      // Weighted combination of Cosine Similarity, Keyword Coverage, and Fuzzy String Matching
      let hybridConfidence = (0.50 * cosineSim) + (0.35 * keywordScore) + (0.15 * maxFuzzy) + keyphraseBonus;

      // Ensure boundary
      hybridConfidence = Math.min(0.98, Math.max(0, hybridConfidence));
      const roundedConfidence = Math.round(hybridConfidence * 100) / 100;

      return {
        id: doc.id,
        faq: doc.faq,
        confidence: roundedConfidence,
        cosineSim: Math.round(cosineSim * 100) / 100,
        keywordScore: Math.round(keywordScore * 100) / 100,
        fuzzyScore: Math.round(maxFuzzy * 100) / 100,
        matchReason: 'hybrid_nlp'
      };
    });

    // Sort descending by confidence
    scores.sort((a, b) => b.confidence - a.confidence);

    const bestCandidate = scores[0];
    const isMatched = bestCandidate && bestCandidate.confidence >= threshold;

    return {
      matched: isMatched,
      confidence: bestCandidate ? bestCandidate.confidence : 0,
      faq: isMatched ? bestCandidate.faq : null,
      topCandidate: bestCandidate ? bestCandidate.faq : null,
      topCandidates: scores.slice(0, 3)
    };
  }
}

export const nlpService = new NLPService();
