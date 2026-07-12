import { describe, expect, it } from 'vitest';
import nlp from 'compromise';
import {
  computeLexicalDensityPercent,
  countPosBuckets,
} from './wordVariety';

describe('countPosBuckets', () => {
  it('sorts tagged words into five buckets with whole number percentages', () => {
    const doc = nlp('The cats run quickly');
    const { counts, percentages, total } = countPosBuckets(doc);

    expect(total).toBe(4);
    expect(counts.noun).toBe(1);
    expect(counts.verb).toBe(1);
    expect(counts.adverb).toBe(1);
    expect(counts.other).toBe(1);
    expect(
      percentages.noun +
        percentages.verb +
        percentages.adjective +
        percentages.adverb +
        percentages.other,
    ).toBe(100);
  });
});

describe('computeLexicalDensityPercent', () => {
  it('returns a rounded whole number percentage', () => {
    expect(computeLexicalDensityPercent(48, 100)).toBe(48);
    expect(computeLexicalDensityPercent(1, 3)).toBe(33);
    expect(computeLexicalDensityPercent(0, 0)).toBe(0);
  });
});
