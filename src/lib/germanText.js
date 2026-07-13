export const GERMAN_WORD_RE = /[\p{L}\p{M}0-9']+/gu;

export function getGermanWords(text) {
  return text.match(GERMAN_WORD_RE) ?? [];
}

export function countGermanWords(text) {
  return getGermanWords(text).length;
}

export function countGermanSentences(text) {
  const nodes = text.match(/[.!?…]+[\s)"»'']*/g);
  if (!nodes || nodes.length === 0) {
    return getGermanWords(text).length > 0 ? 1 : 0;
  }
  return nodes.length;
}
