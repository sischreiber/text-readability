import nlp from 'compromise';
import { tokenizeWithGaps } from './tokenizer.js';

const WORD_RE = /[A-Za-z0-9']+/g;
const TOKEN_RE = /[A-Za-z']+/g;

export const POS_COLORS = {
  noun: '#78d4ff',
  verb: '#72e8a8',
  adjective: '#ffe566',
  adverb: '#ff9ed0',
  other: '#d0b8ff',
};

export const POS_LABELS = {
  noun: 'Noun',
  verb: 'Verb',
  adjective: 'Adjective',
  adverb: 'Adverb',
  other: 'Other',
};

export const REPEAT_HIGHLIGHT = '#ff9a5c';

function classifyTerm(term) {
  if (
    term.has('#ProperNoun') ||
    term.has('#Person') ||
    term.has('#Place') ||
    term.has('#Organization')
  ) {
    return 'noun';
  }
  if (term.has('#Noun')) return 'noun';
  if (term.has('#Verb')) return 'verb';
  if (term.has('#Adjective')) return 'adjective';
  if (term.has('#Adverb')) return 'adverb';
  return 'other';
}

function isContentTerm(term) {
  return classifyTerm(term) !== 'other';
}

export function countPosBuckets(doc) {
  const counts = {
    noun: 0,
    verb: 0,
    adjective: 0,
    adverb: 0,
    other: 0,
  };

  doc.terms().forEach((term) => {
    counts[classifyTerm(term)] += 1;
  });

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const percentages = {};
  for (const [key, value] of Object.entries(counts)) {
    percentages[key] = total === 0 ? 0 : Math.round((value / total) * 100);
  }

  return { counts, total, percentages };
}

export function computeLexicalDensityPercent(contentCount, totalWords) {
  if (totalWords === 0) return 0;
  return Math.round((contentCount / totalWords) * 100);
}

function countTotalWords(text) {
  const matches = text.match(WORD_RE);
  return matches ? matches.length : 0;
}

function getTermKey(term) {
  const data = term.json({ root: true })[0];
  return (data.root || data.normal || data.text).toLowerCase();
}

export function getDominantPosPair(counts) {
  const ranked = [
    { key: 'noun', label: 'nouns', count: counts.noun },
    { key: 'verb', label: 'verbs', count: counts.verb },
    { key: 'adjective', label: 'adjectives', count: counts.adjective },
    { key: 'adverb', label: 'adverbs', count: counts.adverb },
  ].sort((a, b) => b.count - a.count);

  const first = ranked[0];
  const second = ranked[1];
  const ratio =
    second.count === 0
      ? `${first.count} to 0`
      : `${Math.round(first.count / second.count)} to 1`;

  return {
    dominant: first.label,
    second: second.label,
    ratio,
    dominantKey: first.key,
  };
}

export function analyzeWordVariety(text) {
  const doc = nlp(text);
  doc.compute('root');

  const { counts, total: taggedTotal, percentages } = countPosBuckets(doc);
  const contentCount =
    counts.noun + counts.verb + counts.adjective + counts.adverb;
  const totalWords = countTotalWords(text);
  const lexicalDensity = computeLexicalDensityPercent(contentCount, totalWords);
  const dominant = getDominantPosPair(counts);

  const repeatKeyToSurface = new Map();
  doc.terms().forEach((term) => {
    if (!isContentTerm(term)) return;
    const key = getTermKey(term);
    const surface = term.text();
    const entry = repeatKeyToSurface.get(key) ?? { word: surface, count: 0 };
    entry.count += 1;
    if (surface.length >= entry.word.length) entry.word = surface;
    repeatKeyToSurface.set(key, entry);
  });

  const allRepeats = [...repeatKeyToSurface.values()].filter(
    (entry) => entry.count >= 2,
  );
  const repeatedWords = allRepeats
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length)
    .slice(0, 40);

  const repeatSurfaceLookup = new Set();
  doc.terms().forEach((term) => {
    if (!isContentTerm(term)) return;
    const key = getTermKey(term);
    if (repeatKeyToSurface.get(key)?.count >= 2) {
      repeatSurfaceLookup.add(term.text().toLowerCase());
    }
  });

  return {
    pos: { counts, taggedTotal, percentages, dominant },
    lexicalDensity: {
      percent: lexicalDensity,
      contentCount,
      totalWords,
    },
    repeated: {
      words: repeatedWords,
      uniqueRepeatCount: allRepeats.length,
      surfaceLookup: repeatSurfaceLookup,
    },
  };
}

export function buildRepeatHighlightSegments(text, surfaceLookup) {
  const segments = [];
  let lastIndex = 0;
  let match;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'gap', text: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'word',
      text: match[0],
      repeat: surfaceLookup.has(match[0].toLowerCase()),
    });
    lastIndex = TOKEN_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'gap', text: text.slice(lastIndex) });
  }

  return segments;
}

export function getPosLabel(pos) {
  return POS_LABELS[pos] ?? POS_LABELS.other;
}

export function buildPosHighlightSegments(text) {
  const doc = nlp(text);
  const byStart = new Map();

  doc.terms().forEach((term) => {
    const data = term.json({ offset: true })[0];
    const start = data.offset?.start;
    if (Number.isFinite(start)) {
      byStart.set(start, classifyTerm(term));
    }
  });

  return tokenizeWithGaps(text).map((seg) => {
    if (seg.type === 'gap') return seg;
    const pos = byStart.get(seg.index) ?? 'other';
    return { ...seg, pos, posLabel: getPosLabel(pos) };
  });
}
