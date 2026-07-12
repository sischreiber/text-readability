import { describe, expect, it } from 'vitest';
import nlp from 'compromise';
import {
  buildPosHighlightSegments,
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

describe('buildPosHighlightSegments', () => {
  it('tags proper nouns as nouns in the text view', () => {
    const segments = buildPosHighlightSegments('OpenAI released a model.');
    const openAi = segments.find((seg) => seg.text === 'OpenAI');
    expect(openAi?.pos).toBe('noun');
    expect(openAi?.posLabel).toBe('Noun');
  });

  it('maps function words to other and content words to their buckets', () => {
    const segments = buildPosHighlightSegments('The cats run quickly');
    expect(segments.find((seg) => seg.text === 'The')?.pos).toBe('other');
    expect(segments.find((seg) => seg.text === 'cats')?.pos).toBe('noun');
    expect(segments.find((seg) => seg.text === 'run')?.pos).toBe('verb');
    expect(segments.find((seg) => seg.text === 'quickly')?.pos).toBe('adverb');
  });
});
