import { describe, expect, it } from 'vitest';
import { classifySentenceLength } from './sentenceLength';

describe('classifySentenceLength', () => {
  it('treats up to 20 words as fine', () => {
    expect(classifySentenceLength(0)).toBe('fine');
    expect(classifySentenceLength(20)).toBe('fine');
  });

  it('treats 21 to 30 words as borderline', () => {
    expect(classifySentenceLength(21)).toBe('borderline');
    expect(classifySentenceLength(30)).toBe('borderline');
  });

  it('treats 31 words or more as too long', () => {
    expect(classifySentenceLength(31)).toBe('too-long');
    expect(classifySentenceLength(80)).toBe('too-long');
  });
});
