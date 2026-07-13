import { describe, expect, it } from 'vitest';
import { computeGermanMetricsSync } from './readabilityDe.js';

function mockHyphenate(word) {
  const map = {
    der: 'der',
    die: 'die',
    das: 'das',
    und: 'und',
    ist: 'ist',
    ein: 'ein',
    text: 'text',
    analyse: 'ana­ly­se',
    lesbarkeit: 'les­bar­keit',
    silbentrennung: 'sil­ben­tren­nung',
    zuverlässige: 'zu­ver­läs­si­ge',
    erfordert: 'er­for­dert',
    deutscher: 'deut­scher',
    texte: 'tex­te',
    kurze: 'kur­ze',
    sätze: 'sät­ze',
    helfen: 'hel­fen',
  };
  return map[word.toLowerCase()] ?? word;
}

describe('readabilityDe', () => {
  it('computes Amstad Flesch, WSTF, and LIX for German text', () => {
    const text =
      'Die Analyse der Lesbarkeit deutscher Texte erfordert zuverlässige Silbentrennung. Kurze Sätze helfen.';
    const metrics = computeGermanMetricsSync(text, mockHyphenate);

    expect(metrics.flesch).toBeGreaterThan(0);
    expect(metrics.wstf).toBeGreaterThan(0);
    expect(metrics.lix).toBeGreaterThan(0);
    expect(metrics.fleschBand.label).toBeTruthy();
    expect(metrics.wstfBand.label).toBeTruthy();
    expect(metrics.lixBand.label).toBeTruthy();
  });
});
