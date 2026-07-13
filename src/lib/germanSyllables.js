import hyphenopoly from 'hyphenopoly';

const HYPHEN = '\u00AD';

/** @type {Promise<(word: string) => string> | null} */
let hyphenatorPromise = null;

function createLoader() {
  if (typeof window !== 'undefined') {
    return async (file) => {
      const response = await fetch(`/patterns/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to load hyphenation pattern: ${file}`);
      }
      return response.arrayBuffer();
    };
  }

  return async (file, patDir) => {
    const fs = await import('node:fs/promises');
    return fs.readFile(new URL(file, patDir));
  };
}

export function ensureGermanHyphenator() {
  if (!hyphenatorPromise) {
    const handles = hyphenopoly.config({
      require: ['de'],
      hyphen: HYPHEN,
      loader: createLoader(),
    });
    hyphenatorPromise = handles.get('de');
  }
  return hyphenatorPromise;
}

/**
 * @param {string} word
 * @param {(word: string) => string} hyphenate
 */
export function countWordSyllables(word, hyphenate) {
  const normalized = word.trim();
  if (!normalized) return 0;
  return hyphenate(normalized).split(HYPHEN).length;
}

/**
 * @param {string} text
 * @param {(word: string) => string} hyphenate
 */
export function buildSyllableCountMap(text, hyphenate) {
  /** @type {Map<string, number>} */
  const cache = new Map();

  return {
    get(word) {
      const key = word.toLowerCase();
      if (cache.has(key)) return cache.get(key);
      const count = countWordSyllables(word, hyphenate);
      cache.set(key, count);
      return count;
    },
  };
}
