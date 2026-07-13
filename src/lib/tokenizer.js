const WORD_RE = /[A-Za-z']+/g;
const GERMAN_WORD_RE = /[\p{L}\p{M}']+/gu;

export function tokenizeWithGaps(text, language = 'eng') {
  if (!text) return [];

  const segments = [];
  let lastIndex = 0;
  const wordRe = language === 'deu' ? GERMAN_WORD_RE : WORD_RE;

  if (language === 'deu') {
    for (const match of text.matchAll(wordRe)) {
      if (match.index > lastIndex) {
        segments.push({ type: 'gap', text: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'word', text: match[0], index: match.index });
      lastIndex = match.index + match[0].length;
    }
  } else {
    let match;
    WORD_RE.lastIndex = 0;
    while ((match = WORD_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'gap', text: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'word', text: match[0], index: match.index });
      lastIndex = WORD_RE.lastIndex;
    }
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'gap', text: text.slice(lastIndex) });
  }

  return segments;
}

export function countWordFrequencies(text) {
  const freq = new Map();
  let match;
  WORD_RE.lastIndex = 0;
  while ((match = WORD_RE.exec(text)) !== null) {
    const word = match[0];
    const key = word.toLowerCase();
    freq.set(key, { word, count: (freq.get(key)?.count ?? 0) + 1 });
  }
  return freq;
}
