import type { Recipe } from '../types/recipe';
import { SASTRAWI_STOPWORDS } from './sastrawiStopwords';

const STOPWORDS = new Set(SASTRAWI_STOPWORDS);
const MAX_RESULTS = 20;
const SIMILARITY_THRESHOLD = 0.05;

// Normalize text by removing accents, punctuation, and converting to lowercase.
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');
};

// Helpers that mimic Sastrawi's stemming pipeline.
const removeParticle = (word: string): string => word.replace(/(lah|kah|tah|pun)$/u, '');
const removePossessivePronoun = (word: string): string => word.replace(/(ku|mu|nya)$/u, '');

const removeFirstOrderPrefix = (word: string): string => {
  if (/^di/.test(word)) return word.slice(2);
  if (/^ke/.test(word)) return word.slice(2);
  if (/^se/.test(word)) return word.slice(2);
  return word;
};

const removeSecondOrderPrefix = (word: string): string => {
  if (word.startsWith('meng')) {
    if ('aiueo'.includes(word[4] ?? '')) return word.slice(4);
    return word.slice(4);
  }
  if (word.startsWith('meny')) return `s${word.slice(4)}`;
  if (word.startsWith('men')) return word.slice(3);
  if (word.startsWith('mem')) {
    if ('bfv'.includes(word[3] ?? '')) return word.slice(3);
    return `p${word.slice(3)}`;
  }
  if (word.startsWith('me')) return word.slice(2);
  if (word.startsWith('peng')) {
    if ('aiueo'.includes(word[4] ?? '')) return word.slice(4);
    return word.slice(4);
  }
  if (word.startsWith('peny')) return `s${word.slice(4)}`;
  if (word.startsWith('pen')) return word.slice(3);
  if (word.startsWith('pem')) return word.slice(3);
  if (word.startsWith('pe')) return word.slice(2);
  if (word.startsWith('ber')) return word.slice(3);
  if (word.startsWith('bel')) return word.slice(3);
  if (word.startsWith('be')) return word.slice(2);
  if (word.startsWith('ter')) return word.slice(3);
  if (word.startsWith('te')) return word.slice(2);
  if (word.startsWith('per')) return word.slice(3);
  if (word.startsWith('pel')) return word.slice(3);
  return word;
};

const removeSuffix = (word: string): string => {
  if (/kan$/.test(word)) return word.slice(0, -3);
  if (/i$/.test(word)) return word.slice(0, -1);
  if (/an$/.test(word)) return word.slice(0, -2);
  return word;
};

const stemSastrawi = (word: string): string => {
  let result = removeParticle(word);
  result = removePossessivePronoun(result);
  const afterFirstPrefix = removeFirstOrderPrefix(result);
  const afterSecondPrefix = removeSecondOrderPrefix(afterFirstPrefix);
  const afterSuffix = removeSuffix(afterSecondPrefix);
  if (!afterSuffix || afterSuffix.length < 2) return result;
  return afterSuffix;
};

/**
 * Tokenize content by normalizing, removing stopwords, and applying
 * lightweight Sastrawi-style stemming. The output tokens are used for
 * both TF-IDF training and query vectorization.
 */
const tokenize = (text: string): string[] => {
  return normalizeText(text)
    .split(/\s+/)
    .filter(token => token.length > 1)
    .filter(token => !STOPWORDS.has(token))
    .map(stemSastrawi);
};

/**
 * Extract the primary keyword from the user's query so we can
 * post-filter results to titles that explicitly contain it.
 */
const pickPrimaryKeyword = (query: string): string | undefined => {
  const tokens = normalizeText(query)
    .split(/\s+/)
    .filter(token => token.length > 1);

  if (tokens.length === 0) return undefined;
  const nonStopword = tokens.find(token => !STOPWORDS.has(token));
  return (nonStopword || tokens[0])?.trim() || undefined;
};

// TF-IDF Types
type DocumentVector = Map<string, number>;
type Corpus = Recipe[];

export class SearchEngine {
  private corpus: Corpus;
  private tfidfMatrix: DocumentVector[];
  private idfVector: Map<string, number>;
  private vocabulary: Set<string>;

  constructor(corpus: Corpus) {
    this.corpus = corpus;
    this.vocabulary = new Set();
    this.tfidfMatrix = [];
    this.idfVector = new Map();
    this.train();
  }

  /**
   * Build a synthetic document string for each recipe where title, ingredients,
   * and description contribute different weights. This improves accuracy without
   * needing a full TF-IDF library.
   */
  private getDocumentText(recipe: Recipe): string {
    return recipe.title;
  }

  /**
   * Pre-compute TF-IDF vectors for every recipe in the corpus.
   * This runs once on initialization so searches stay fast.
   */
  private train() {
    const docTokensList: string[][] = this.corpus.map(doc => tokenize(this.getDocumentText(doc)));

    // Build Vocabulary
    docTokensList.forEach(tokens => {
      tokens.forEach(token => this.vocabulary.add(token));
    });

    // Calculate IDF
    // IDF(t) = log(N / (df(t) + 1))
    const N = this.corpus.length;
    this.vocabulary.forEach(term => {
      let docCount = 0;
      docTokensList.forEach(tokens => {
        if (tokens.includes(term)) docCount++;
      });
      this.idfVector.set(term, Math.log(N / (docCount + 1)));
    });

    // Calculate TF-IDF for each document
    this.tfidfMatrix = docTokensList.map(tokens => {
      const vec = new Map<string, number>();
      const totalTerms = tokens.length;

      // Count frequencies
      const counts = new Map<string, number>();
      tokens.forEach(token => {
        counts.set(token, (counts.get(token) || 0) + 1);
      });

      // Calculate TF * IDF
      counts.forEach((count, term) => {
        const tf = count / totalTerms;
        const idf = this.idfVector.get(term) || 0;
        vec.set(term, tf * idf);
      });

      return vec;
    });
  }

  /**
   * Convert the query into a TF-IDF vector, compute cosine similarity
   * against every recipe, and return sorted matches (plus similarity score).
   */
  public search(query: string): Recipe[] {
    const queryTokens = tokenize(query);
    const primaryKeyword = pickPrimaryKeyword(query);

    if (queryTokens.length === 0) {
      return this.corpus.slice(0, MAX_RESULTS).map(doc => ({ ...doc, score: undefined }));
    }

    const queryTokenSet = new Set(queryTokens);

    // Vectorize Query
    const queryVector = new Map<string, number>();
    const totalQueryTerms = queryTokens.length;

    // Calculate Query TF
    const queryCounts = new Map<string, number>();
    queryTokens.forEach(token => {
      queryCounts.set(token, (queryCounts.get(token) || 0) + 1);
    });

    // Calculate Query TF-IDF
    queryCounts.forEach((count, term) => {
      if (this.vocabulary.has(term)) {
        const tf = count / totalQueryTerms;
        const idf = this.idfVector.get(term) || 0;
        queryVector.set(term, tf * idf);
      }
    });

    // Calculate Cosine Similarity
    const results = this.corpus.map((doc, index) => {
      const docVector = this.tfidfMatrix[index];
      const similarity = this.calculateCosineSimilarity(queryVector, docVector);
      return { doc, similarity };
    });

    // Filter and Sort
    // Filter threshold > 0.0 (relaxed for demo)
    return results
      .filter(res => res.similarity >= SIMILARITY_THRESHOLD)
      .filter(res => {
        if (!primaryKeyword) return true;
        const normalizedTitle = normalizeText(res.doc.title);
        return normalizedTitle.includes(primaryKeyword);
      })
      .filter(res => {
        if (!queryTokenSet.size) return true;
        const titleTokens = tokenize(res.doc.title);
        return titleTokens.some(token => queryTokenSet.has(token));
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS)
      .map(res => ({
        ...res.doc,
        score: Number(res.similarity.toFixed(4))
      }));
  }

  private calculateCosineSimilarity(vecA: DocumentVector, vecB: DocumentVector): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // Calculate Dot Product and Magnitude A
    vecA.forEach((valA, key) => {
      const valB = vecB.get(key) || 0;
      dotProduct += valA * valB;
      magnitudeA += valA * valA;
    });

    // Calculate Magnitude B
    vecB.forEach((valB) => {
      magnitudeB += valB * valB;
    });

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
