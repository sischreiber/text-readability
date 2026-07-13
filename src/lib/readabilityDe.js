import fleschDe from 'fleschDe';
import lixIndex from 'lix-index';
import { wienerSachtextformel } from '@lunarisapp/readability';
import { analyzeSentenceLength } from './sentenceLength.js';
import { getGermanWords } from './germanText.js';
import {
  buildSyllableCountMap,
  countWordSyllables,
  ensureGermanHyphenator,
} from './germanSyllables.js';
import { roundScore } from './readability.js';

const LONG_WORD_MIN = 6;
const POLYSYLLABLE_MIN = 3;

export function getFleschAmstadBand(score) {
  if (score >= 90) return { label: 'Sehr leicht', index: 0 };
  if (score >= 80) return { label: 'Leicht', index: 1 };
  if (score >= 70) return { label: 'Mittelschwer', index: 2 };
  if (score >= 60) return { label: 'Mittelschwer', index: 3 };
  if (score >= 50) return { label: 'Schwer', index: 4 };
  if (score >= 30) return { label: 'Sehr schwer', index: 5 };
  return { label: 'Sehr schwer', index: 6 };
}

export function getWstfBand(score) {
  if (score >= 15) return { label: 'Sehr leicht', index: 0 };
  if (score >= 12) return { label: 'Leicht', index: 1 };
  if (score >= 9) return { label: 'Mittel', index: 2 };
  if (score >= 6) return { label: 'Schwer', index: 3 };
  return { label: 'Sehr schwer', index: 4 };
}

export function getLixBand(score) {
  if (score < 25) return { label: 'Kinderbücher', index: 0 };
  if (score < 35) return { label: 'Belletristik', index: 1 };
  if (score < 45) return { label: 'Normaler Text', index: 2 };
  if (score < 55) return { label: 'Sachtexte', index: 3 };
  return { label: 'Wissenschaftlich', index: 4 };
}

/**
 * @param {string} text
 * @param {(word: string) => string} hyphenate
 */
export function computeGermanTextStats(text, hyphenate) {
  const words = getGermanWords(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, analyzeSentenceLength(text, 'deu').total || 1);

  let syllableCount = 0;
  let polysyllables = 0;
  let monosyllables = 0;
  let longWords = 0;

  for (const word of words) {
    const syllables = countWordSyllables(word, hyphenate);
    syllableCount += syllables;
    if (syllables >= POLYSYLLABLE_MIN) polysyllables += 1;
    if (syllables === 1) monosyllables += 1;
    if (word.length > LONG_WORD_MIN) longWords += 1;
  }

  return {
    words: wordCount,
    sentences: sentenceCount,
    syllables: syllableCount,
    polysyllables,
    monosyllables,
    longWords,
  };
}

/**
 * @param {string} text
 * @param {(word: string) => string} hyphenate
 */
export function computeGermanMetricsSync(text, hyphenate) {
  const stats = computeGermanTextStats(text, hyphenate);
  const flesch = roundScore(
    fleschDe({
      word: stats.words,
      sentence: stats.sentences,
      syllable: stats.syllables,
    }),
  );
  const wstf = roundScore(
    wienerSachtextformel({
      words: stats.words,
      sentences: stats.sentences,
      longWords: stats.longWords,
      polysyllables: stats.polysyllables,
      monosyllables: stats.monosyllables,
      variant: 1,
    }),
  );
  const lix = roundScore(lixIndex(text));

  return {
    flesch,
    wstf,
    lix,
    fleschBand: getFleschAmstadBand(flesch),
    wstfBand: getWstfBand(wstf),
    lixBand: getLixBand(lix),
    stats,
  };
}

export async function computeGermanMetrics(text) {
  const hyphenate = await ensureGermanHyphenator();
  const metrics = computeGermanMetricsSync(text, hyphenate);
  const syllableLookup = buildSyllableCountMap(text, hyphenate);
  const sentenceLengthStats = analyzeSentenceLength(text, 'deu');

  return {
    ...metrics,
    syllableLookup,
    sentenceLengthStats,
  };
}
