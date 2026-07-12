import { SENTENCE_LENGTH_COLORS } from './sentenceLength.js';
import { POS_COLORS } from './wordVariety.js';
import { SYLLABLE_COLORS } from './uiConstants.js';

export function syllableClass(count) {
  if (count <= 1) return 1;
  if (count >= 4) return 4;
  return count;
}

export function formatScore(value) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

export function syllableHighlightColor(syllables, hoverKey) {
  if (syllables < 2) return undefined;
  const bucket = syllables >= 4 ? 4 : syllables;
  if (hoverKey !== null && hoverKey !== bucket) return undefined;
  return SYLLABLE_COLORS[bucket] ?? SYLLABLE_COLORS[4];
}

export function sentenceHighlightColor(band, hoverKey) {
  if (!band || band === 'fine') return undefined;
  if (hoverKey !== null && hoverKey !== band) return undefined;
  return SENTENCE_LENGTH_COLORS[band] ?? undefined;
}

export function segmentStyle(background) {
  return `white-space:pre-wrap;border-radius:3px;padding:0.08em 0;background:${background ?? 'transparent'};color:#212121`;
}

export function syllableTooltipLabel(syllables) {
  if (syllables < 2) return null;
  if (syllables === 2) return '2 syllables';
  if (syllables === 3) return '3 syllables';
  return '4+ syllables';
}

export function posHighlightColor(pos, hoverKey) {
  if (!pos) return undefined;
  if (hoverKey !== null && hoverKey !== pos) return undefined;
  return POS_COLORS[pos] ?? POS_COLORS.other;
}
