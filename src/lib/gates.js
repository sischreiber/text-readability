import { detectLanguage } from './languageDetect.js';
import { countGermanWords } from './germanText.js';

const NON_LATIN_LETTERS =
  /[\u3040-\u30ff\u4e00-\u9fff\u0400-\u04ff\u0370-\u03ff]/;

export function countWords(text, language = 'eng') {
  if (language === 'deu') return countGermanWords(text);

  const matches = text.match(/[A-Za-z0-9']+/g);
  return matches ? matches.length : 0;
}

/**
 * @param {string} text
 * @param {'eng' | 'deu' | 'und' | null} [language]
 */
export function evaluateGate(text, language = null) {
  const trimmed = text.trim();
  if (!trimmed) return { type: 'empty' };

  const resolvedLanguage = language ?? detectLanguage(trimmed);
  if (resolvedLanguage === 'und') {
    if (NON_LATIN_LETTERS.test(trimmed)) {
      return { type: 'unsupported' };
    }
    return { type: 'unsupported' };
  }

  const wordCount = countWords(trimmed, resolvedLanguage);
  if (wordCount < 12) {
    return { type: 'too-short', wordCount, language: resolvedLanguage };
  }

  return { type: 'ok', wordCount, language: resolvedLanguage };
}
