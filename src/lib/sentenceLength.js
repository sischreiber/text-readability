import { SentenceSplitterSyntax, split } from 'sentence-splitter';

const WORD_RE = /[A-Za-z0-9']+/g;

export const SENTENCE_LENGTH_COLORS = {
  fine: null,
  borderline: '#ffe566',
  'too-long': '#ff9494',
};

export function countWordsInSpan(text) {
  const matches = text.match(WORD_RE);
  return matches ? matches.length : 0;
}

export function classifySentenceLength(wordCount) {
  if (wordCount <= 20) return 'fine';
  if (wordCount <= 30) return 'borderline';
  return 'too-long';
}

export function analyzeSentenceLength(text) {
  const nodes = split(text);
  const sentences = [];

  for (const node of nodes) {
    if (node.type !== SentenceSplitterSyntax.Sentence) continue;
    const [start, end] = node.range;
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

    const sentenceText = text.slice(start, end);
    const wordCount = countWordsInSpan(sentenceText);
    sentences.push({
      start,
      end,
      wordCount,
      band: classifySentenceLength(wordCount),
    });
  }

  const total = sentences.length;
  const longCount = sentences.filter((sentence) => sentence.band !== 'fine').length;
  const longest = sentences.reduce((max, sentence) => Math.max(max, sentence.wordCount), 0);

  return { sentences, total, longCount, longest };
}

export function buildSentenceLengthSegments(text) {
  const nodes = split(text);
  const segments = [];
  let lastIndex = 0;

  for (const node of nodes) {
    const [start, end] = node.range;
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

    if (start > lastIndex) {
      segments.push({ type: 'gap', text: text.slice(lastIndex, start) });
    }

    const slice = text.slice(start, end);
    if (node.type === SentenceSplitterSyntax.Sentence) {
      const wordCount = countWordsInSpan(slice);
      segments.push({
        type: 'sentence',
        text: slice,
        band: classifySentenceLength(wordCount),
        wordCount,
      });
    } else {
      segments.push({ type: 'gap', text: slice });
    }

    lastIndex = Math.max(lastIndex, end);
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'gap', text: text.slice(lastIndex) });
  }

  return segments;
}

export function hasLongSentenceHighlight(segments) {
  return segments.some(
    (segment) =>
      segment.type === 'sentence' &&
      (segment.band === 'borderline' || segment.band === 'too-long'),
  );
}
