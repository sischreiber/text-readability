import { describe, expect, it } from 'vitest';
import { countWords, evaluateGate, isNonEnglish } from '../lib/gates';

describe('gates', () => {
  it('counts words with letters, digits, and apostrophes', () => {
    expect(countWords("It's 2 simple tests")).toBe(4);
  });

  it('returns empty for blank input', () => {
    expect(evaluateGate('   ').type).toBe('empty');
  });

  it('flags non-English letters', () => {
    expect(isNonEnglish('This café has enough words to trigger detection here')).toBe(
      true,
    );
  });

  it('flags likely German text via stopwords', () => {
    const text =
      'der die das und ist nicht ein eine mit auf für von den dem sich auch aber';
    expect(isNonEnglish(text)).toBe(true);
  });

  it('passes plain English sample', () => {
    const text =
      'The quick brown fox jumps over the lazy dog while the sun shines brightly today.';
    expect(evaluateGate(text).type).toBe('ok');
  });

  it('requires at least twelve words', () => {
    const gate = evaluateGate('one two three four five six seven eight nine ten eleven');
    expect(gate.type).toBe('too-short');
    expect(gate.wordCount).toBe(11);
  });
});
