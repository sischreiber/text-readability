const NON_ENGLISH_LETTERS =
  /[À-ÿĀ-ſА-яЀ-ӿ\u0370-\u03ff\u3040-\u30ff\u4e00-\u9fff]/;

const STOPWORDS = new Set(
  'der die das und ist nicht ein eine mit auf für von den dem sich auch aber oder wird werden les des une dans pour avec sur pas plus est été être vous nous que los las una por con para como pero más está muy che non sono della come più anche het een van zijn niet ook maar não uma com para mais está'.split(
    ' ',
  ),
);

export function countWords(text) {
  const matches = text.match(/[A-Za-z0-9']+/g);
  return matches ? matches.length : 0;
}

export function isNonEnglish(text) {
  const trimmed = text.trim();
  if (trimmed.length < 12) return false;
  if (NON_ENGLISH_LETTERS.test(text)) return true;

  const words = trimmed
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 4) return false;

  let hits = 0;
  for (const word of words) {
    if (STOPWORDS.has(word)) hits += 1;
  }
  return hits / words.length >= 0.12;
}

export function evaluateGate(text) {
  const trimmed = text.trim();
  if (!trimmed) return { type: 'empty' };
  if (isNonEnglish(text)) return { type: 'non-english' };
  const wordCount = countWords(text);
  if (wordCount < 12) return { type: 'too-short', wordCount };
  return { type: 'ok', wordCount };
}
