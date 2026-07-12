import { describe, expect, it } from 'vitest';
import { tokenizeWithGaps } from './tokenizer';

describe('tokenizer', () => {
  it('preserves gaps and punctuation between words', () => {
    expect(tokenizeWithGaps('Hi, world!')).toEqual([
      { type: 'word', text: 'Hi', index: 0 },
      { type: 'gap', text: ', ' },
      { type: 'word', text: 'world', index: 4 },
      { type: 'gap', text: '!' },
    ]);
  });

  it('keeps apostrophes inside words', () => {
    const segments = tokenizeWithGaps("don't stop");
    expect(segments[0]).toMatchObject({ type: 'word', text: "don't" });
    expect(segments[2]).toMatchObject({ type: 'word', text: 'stop' });
  });

  it('handles leading and trailing whitespace', () => {
    const segments = tokenizeWithGaps('  hello  ');
    expect(segments[0]).toMatchObject({ type: 'gap', text: '  ' });
    expect(segments[2]).toMatchObject({ type: 'gap', text: '  ' });
  });

  it('returns empty array for empty input', () => {
    expect(tokenizeWithGaps('')).toEqual([]);
  });
});
