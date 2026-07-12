export const STYLE_COLORS = {
  'Passive voice': '#ffdcdc',
  'Weasel word': '#fff0c4',
  Wordy: '#dbe8ff',
  Adverb: '#ffdcef',
  Cliché: '#e6dcff',
  Filler: '#e8e8e8',
  'Vague opener': '#e8e8e8',
  Style: '#e8e8e8',
  Difficult: '#d8efdb',
};

export function categorizeStyleHit(reason) {
  const lower = reason.toLowerCase();
  if (/passive/.test(lower)) return 'Passive voice';
  if (/weasel/.test(lower)) return 'Weasel word';
  if (/wordy|unneeded|in order to/.test(lower)) return 'Wordy';
  if (/adverb|weaken meaning/.test(lower)) return 'Adverb';
  if (/clich/.test(lower)) return 'Cliché';
  if (/no meaning|adds nothing|so\b/.test(lower)) return 'Filler';
  if (/there (is|are)/.test(lower)) return 'Vague opener';
  return 'Style';
}

/**
 * Build per-character category labels, clamped to text bounds.
 * Difficult-word spans are applied first; write-good spans overlay on top.
 */
export function buildCharOverlay(text, difficultWordPositions, styleHits) {
  const len = text.length;
  if (len === 0) return [];

  const categories = new Array(len).fill(null);

  for (const { start, end } of difficultWordPositions) {
    const s = Math.max(0, start);
    const e = Math.min(len, end);
    for (let i = s; i < e; i += 1) {
      categories[i] = 'Difficult';
    }
  }

  for (const hit of styleHits) {
    const start = Math.max(0, hit.index);
    const end = Math.min(len, hit.index + hit.offset);
    const category = hit.category;
    for (let i = start; i < end; i += 1) {
      categories[i] = category;
    }
  }

  return categories;
}

export function mergeCharRuns(text, categories) {
  if (!text) return [];

  const runs = [];
  let runStart = 0;
  let current = categories[0] ?? null;

  for (let i = 1; i <= text.length; i += 1) {
    const next = i < text.length ? (categories[i] ?? null) : '\0';
    if (next !== current) {
      runs.push({
        text: text.slice(runStart, i),
        category: current,
      });
      runStart = i;
      current = categories[i] ?? null;
    }
  }

  return runs;
}

export function findDifficultWordPositions(text, difficultSet) {
  const positions = [];
  const re = /[A-Za-z']+/g;
  let match;

  while ((match = re.exec(text)) !== null) {
    if (difficultSet.has(match[0].toLowerCase())) {
      positions.push({ start: match.index, end: match.index + match[0].length });
    }
  }

  return positions;
}
