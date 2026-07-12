import { describe, expect, it } from 'vitest';
import {
  containsHarmfulContent,
  evaluatePasteSecurity,
  looksLikeCode,
  sanitizePastedText,
} from './security';

describe('security', () => {
  it('strips html tags from pasted content', () => {
    expect(sanitizePastedText('<b>Hello</b> world')).toBe('Hello world');
  });

  it('blocks script injection', () => {
    expect(containsHarmfulContent('<script>alert(1)</script>')).toBe(true);
    expect(evaluatePasteSecurity('<script>alert(1)</script>').allowed).toBe(false);
  });

  it('blocks obvious code samples', () => {
    const code = `function test() {
      const value = 1;
      return value + 2;
    }`;
    expect(looksLikeCode(code)).toBe(true);
    expect(evaluatePasteSecurity(code).reason).toBe('code');
  });

  it('allows normal prose', () => {
    const text =
      'The quick brown fox jumps over the lazy dog. This is plain English text for readability analysis.';
    expect(evaluatePasteSecurity(text).allowed).toBe(true);
  });
});
