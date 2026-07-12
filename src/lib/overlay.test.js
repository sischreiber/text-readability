import { describe, expect, it } from 'vitest';
import {
  buildCharOverlay,
  categorizeStyleHit,
  mergeCharRuns,
} from './overlay';

describe('overlay', () => {
  it('maps write-good reasons to categories', () => {
    expect(categorizeStyleHit('"was" may be passive voice')).toBe('Passive voice');
    expect(categorizeStyleHit('"very" is a weasel word')).toBe('Weasel word');
    expect(categorizeStyleHit('"actually" can weaken meaning')).toBe('Adverb');
  });

  it('clamps overlay spans to text bounds', () => {
    const categories = buildCharOverlay(
      'abc',
      [{ start: -2, end: 2 }],
      [{ index: 1, offset: 99, category: 'Wordy' }],
    );
    expect(categories).toEqual(['Difficult', 'Wordy', 'Wordy']);
  });

  it('lets write-good spans override difficult-word base', () => {
    const categories = buildCharOverlay(
      'abcdef',
      [{ start: 0, end: 6 }],
      [{ index: 2, offset: 2, category: 'Passive voice' }],
    );
    expect(categories.slice(0, 2)).toEqual(['Difficult', 'Difficult']);
    expect(categories.slice(2, 4)).toEqual(['Passive voice', 'Passive voice']);
    expect(categories.slice(4)).toEqual(['Difficult', 'Difficult']);
  });

  it('merges adjacent runs with the same category', () => {
    const runs = mergeCharRuns('aaabbc', [
      'Adverb',
      'Adverb',
      'Adverb',
      'Wordy',
      'Wordy',
      'Difficult',
    ]);
    expect(runs).toEqual([
      { text: 'aaa', category: 'Adverb' },
      { text: 'bb', category: 'Wordy' },
      { text: 'c', category: 'Difficult' },
    ]);
  });
});
