import { describe, expect, it } from 'vitest';
import { countWords, evaluateGate } from '../lib/gates';

describe('gates', () => {
  it('counts words with letters, digits, and apostrophes', () => {
    expect(countWords("It's 2 simple tests")).toBe(4);
  });

  it('returns empty for blank input', () => {
    expect(evaluateGate('   ').type).toBe('empty');
  });

  it('passes plain English sample', () => {
    const text =
      'The quick brown fox jumps over the lazy dog while the sun shines brightly today.';
    expect(evaluateGate(text, 'eng').type).toBe('ok');
  });

  it('passes German sample when language is deu', () => {
    const text =
      'Die Analyse der Lesbarkeit deutscher Texte erfordert zuverlässige Silbentrennung und klare Sätze.';
    expect(evaluateGate(text, 'deu').type).toBe('ok');
  });

  it('requires at least twelve words', () => {
    const gate = evaluateGate('one two three four five six seven eight nine ten eleven', 'eng');
    expect(gate.type).toBe('too-short');
    expect(gate.wordCount).toBe(11);
  });

  it('flags unsupported language', () => {
    const text =
      'Ceci est un texte français avec assez de mots pour déclencher une analyse complète.';
    expect(evaluateGate(text, 'und').type).toBe('unsupported');
  });
});
