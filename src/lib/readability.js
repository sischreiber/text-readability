import rs from 'text-readability';

export { rs };

export function roundScore(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

export function getDifficultWordsSet(text) {
  if (typeof rs.difficultWordsSet === 'function') {
    const raw = rs.difficultWordsSet(text);
    const words = raw instanceof Set ? [...raw] : [...raw];
    return {
      words,
      lookup: new Set(words.map((w) => w.toLowerCase())),
    };
  }

  const words = [];
  const lookup = new Set();
  const matches = text.match(/[A-Za-z']+/g) ?? [];

  for (const word of matches) {
    const key = word.toLowerCase();
    if (lookup.has(key)) continue;
    if (rs.syllableCount(word) >= 2) {
      words.push(word);
      lookup.add(key);
    }
  }

  return { words, lookup };
}

export function getDifficultWordChips(text, difficultWords) {
  const freq = new Map();

  for (const word of difficultWords) {
    freq.set(word.toLowerCase(), { word, count: 0 });
  }

  const re = /[A-Za-z']+/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const entry = freq.get(match[0].toLowerCase());
    if (entry) entry.count += 1;
  }

  return [...freq.values()]
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length)
    .slice(0, 60);
}

export function getFleschBand(score) {
  if (score >= 90) return { label: 'Very Easy', index: 0 };
  if (score >= 80) return { label: 'Easy', index: 1 };
  if (score >= 70) return { label: 'Fairly Easy', index: 2 };
  if (score >= 60) return { label: 'Standard', index: 3 };
  if (score >= 50) return { label: 'Fairly Difficult', index: 4 };
  if (score >= 30) return { label: 'Difficult', index: 5 };
  return { label: 'Very Confusing', index: 6 };
}

export function getDaleChallBand(score) {
  if (score <= 4.9) return { label: 'Grade 4 and below', index: 0 };
  if (score <= 5.9) return { label: 'Grades 5 to 6', index: 1 };
  if (score <= 6.9) return { label: 'Grades 7 to 8', index: 2 };
  if (score <= 7.9) return { label: 'Grades 9 to 10', index: 3 };
  if (score <= 8.9) return { label: 'Grades 11 to 12', index: 4 };
  if (score <= 9.9) return { label: 'College', index: 5 };
  return { label: 'College graduate', index: 6 };
}

export function getCliBucket(grade) {
  if (grade <= 4) return 'le4';
  if (grade <= 8) return '5to8';
  if (grade <= 12) return '9to12';
  return '13plus';
}

export function computeMetrics(text) {
  const flesch = roundScore(rs.fleschReadingEase(text));
  const cli = roundScore(rs.colemanLiauIndex(text));
  const dale = roundScore(rs.daleChallReadabilityScore(text));
  const difficultCount = rs.difficultWords(text);
  const lexicon = rs.lexiconCount(text);
  const textStandard = rs.textStandard(text);
  const { words: difficultWords, lookup: difficultLookup } =
    getDifficultWordsSet(text);

  return {
    flesch,
    cli: Math.max(1, cli),
    dale,
    difficultCount,
    lexicon,
    textStandard,
    difficultWords,
    difficultLookup,
    fleschBand: getFleschBand(flesch),
    daleBand: getDaleChallBand(dale),
    cliBucket: getCliBucket(Math.max(1, cli)),
  };
}
