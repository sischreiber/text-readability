import { describe, expect, it } from 'vitest';
import {
  buildImprovePrompt,
  gatherPromptInputs,
  getStyleHitsForPrompt,
} from './improvePrompt';
import { computeMetrics } from './readability';
import { analyzeSentenceLength } from './sentenceLength';
import { analyzeWordVariety } from './wordVariety';

const SAMPLE =
  'The implementation of the methodology was done in order to facilitate comprehension. The implementation requires careful attention. There is a very good chance that readers will notice the repetition.';

const SAMPLE_WITH_DOMAIN =
  'Our personalized mixtape feature lets users build a curated set of tracks. The personalized mixtape saves to their profile.';

describe('buildImprovePrompt', () => {
  it('includes the original text and reflects protected vocabulary framing', () => {
    const metrics = computeMetrics(SAMPLE);
    const sentenceStats = analyzeSentenceLength(SAMPLE);
    const wordVariety = analyzeWordVariety(SAMPLE);
    const inputs = gatherPromptInputs(SAMPLE, metrics, sentenceStats, wordVariety);
    const prompt = buildImprovePrompt(inputs);

    expect(prompt).toContain('# Improve readability rewrite');
    expect(prompt).toContain('## Protected vocabulary');
    expect(prompt).toContain('must appear unchanged');
    expect(prompt).toContain('personalized mixtape');
    expect(prompt).toContain('### Summary of changes');
    expect(prompt).toContain('### Original');
    expect(prompt).toContain('### Rewritten');
    expect(prompt).toContain('### Metrics before and after');
    expect(prompt).toContain('exactly four sections');
    expect(prompt).toContain('#### What improved');
    expect(prompt).toContain('| Metric | Before | After |');
    expect(prompt).not.toContain('(model)');
    expect(prompt).toContain('Be conservative and honest');
    expect(prompt).toContain('only the sentence length and structure components');
    expect(prompt).toContain(SAMPLE);
    expect(prompt).not.toContain('```');
    expect(prompt).not.toContain('**');
    expect(prompt).not.toMatch(/\bdifficult\b/i);
    expect(prompt).not.toContain('Raise the Flesch Reading Ease score above');
    expect(prompt).not.toContain('Replace difficult words with simpler alternatives');
    expect(prompt).not.toContain('difficult word occurrences');
    expect(prompt).toContain('These scores are context');
    expect(prompt).toContain('verify your rewrite');
  });

  it('lists every flagged word under Protected vocabulary', () => {
    const metrics = computeMetrics(SAMPLE);
    const sentenceStats = analyzeSentenceLength(SAMPLE);
    const wordVariety = analyzeWordVariety(SAMPLE);
    const prompt = buildImprovePrompt(
      gatherPromptInputs(SAMPLE, metrics, sentenceStats, wordVariety),
    );

    for (const word of metrics.difficultWords.slice(0, 40)) {
      expect(prompt).toContain(`- ${word}`);
    }
  });

  it('includes domain terms in the protected vocabulary list', () => {
    const metrics = computeMetrics(SAMPLE_WITH_DOMAIN);
    const sentenceStats = analyzeSentenceLength(SAMPLE_WITH_DOMAIN);
    const wordVariety = analyzeWordVariety(SAMPLE_WITH_DOMAIN);
    const prompt = buildImprovePrompt(
      gatherPromptInputs(SAMPLE_WITH_DOMAIN, metrics, sentenceStats, wordVariety),
    );

    expect(prompt).toContain('personalized mixtape');
    expect(prompt).toContain(SAMPLE_WITH_DOMAIN);
  });
});

describe('getStyleHitsForPrompt', () => {
  it('groups write-good hits by category', () => {
    const data = getStyleHitsForPrompt('There is a very good chance it was done.');
    expect(data.total).toBeGreaterThan(0);
    expect(data.grouped.size).toBeGreaterThan(0);
  });
});
