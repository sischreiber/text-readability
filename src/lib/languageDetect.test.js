import { describe, expect, it } from 'vitest';
import { evaluateGate, countWords } from './gates.js';
import { detectLanguage } from './languageDetect.js';

describe('languageDetect', () => {
  it('detects German prose', () => {
    const text =
      'Die Analyse der Lesbarkeit deutscher Texte erfordert zuverlässige Silbentrennung und klare Sätze.';
    expect(detectLanguage(text)).toBe('deu');
  });

  it('detects English prose', () => {
    const text =
      'The quick brown fox jumps over the lazy dog while the sun shines brightly today.';
    expect(detectLanguage(text)).toBe('eng');
  });
});

describe('gates with language', () => {
  it('accepts German text when language is deu', () => {
    const text =
      'Die Analyse der Lesbarkeit deutscher Texte erfordert zuverlässige Silbentrennung und klare Sätze.';
    expect(evaluateGate(text, 'deu').type).toBe('ok');
  });

  it('counts German words with umlauts', () => {
    expect(countWords('Größe und Qualität sind wichtig', 'deu')).toBe(5);
  });

  it('flags unsupported language', () => {
    const text =
      'Ceci est un texte français avec assez de mots pour déclencher une analyse complète.';
    expect(evaluateGate(text, 'und').type).toBe('unsupported');
  });
});
