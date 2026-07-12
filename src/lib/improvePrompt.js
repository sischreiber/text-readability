import writeGood from 'write-good';
import { categorizeStyleHit } from './overlay';
import {
  rs,
  formatCliGradePhrase,
  formatDaleGradePhrase,
  formatGunningFogPhrase,
} from './readability';

const PROTECTED_VOCAB_CAP = 40;
const LONG_SENTENCE_CAP = 15;
const REPEAT_WORD_CAP = 40;
const STYLE_HIT_CAP = 40;

function capNote(total, cap, label) {
  if (total <= cap) return '';
  return `\n_${total - cap} more ${label} not shown_`;
}

function formatScore(value) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function mdTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return [head, divider, body].join('\n');
}

export function getLongSentencesForPrompt(text, sentenceStats, cap = LONG_SENTENCE_CAP) {
  const long = sentenceStats.sentences
    .filter((sentence) => sentence.band !== 'fine')
    .map((sentence) => ({
      wordCount: sentence.wordCount,
      band: sentence.band,
      text: text.slice(sentence.start, sentence.end).trim(),
    }))
    .sort((a, b) => b.wordCount - a.wordCount);

  return {
    items: long.slice(0, cap),
    total: long.length,
    truncated: long.length > cap,
  };
}

export function getStyleHitsForPrompt(text, cap = STYLE_HIT_CAP) {
  let raw = [];
  try {
    raw = writeGood(text);
  } catch {
    raw = [];
  }
  const hits = raw.map((hit) => ({
    phrase: text.slice(hit.index, hit.index + hit.offset),
    reason: hit.reason,
    category: categorizeStyleHit(hit.reason),
  }));

  const items = hits.slice(0, cap);
  const grouped = new Map();
  for (const hit of items) {
    const list = grouped.get(hit.category) ?? [];
    list.push(hit);
    grouped.set(hit.category, list);
  }

  return {
    items,
    grouped,
    total: hits.length,
    truncated: hits.length > cap,
  };
}

function getScoreRows(metrics, textStandard) {
  const fleschScore = formatScore(metrics.flesch);
  return [
    ['Flesch Reading Ease', `${fleschScore} (${metrics.fleschBand.label})`],
    ['Coleman-Liau', formatCliGradePhrase(metrics.cli, metrics.cliBucket)],
    ['Gunning Fog', formatGunningFogPhrase(metrics.gunningFog, metrics.gunningBucket)],
    ['Dale-Chall', formatDaleGradePhrase(
      metrics.dale,
      metrics.daleBand.index,
      metrics.daleBand.label,
    )],
    ['Consensus grade', textStandard],
  ];
}

function formatScoresTable(metrics, textStandard) {
  return mdTable(['Metric', 'Result'], getScoreRows(metrics, textStandard));
}

const METRIC_NAMES = [
  'Flesch Reading Ease',
  'Coleman-Liau',
  'Gunning Fog',
  'Dale-Chall',
  'Consensus grade',
];

function formatOutputMetricsSection() {
  const rows = METRIC_NAMES.map((metric) => [metric, '', '']);

  return [
    '### Metrics before and after',
    '',
    'Show a comparison table with three columns: Metric, Before, After.',
    '',
    'How to compute each metric (apply the same method to both texts):',
    '',
    '- Flesch Reading Ease: based on average sentence length and average',
    '  syllables per word. Higher is easier.',
    '- Gunning Fog: based on average sentence length and the share of words',
    '  with three or more syllables. Lower is easier.',
    '- Coleman-Liau: based on letters per word and sentences per word. Lower',
    '  is easier.',
    '- Dale-Chall: based on the share of hard or unfamiliar words and average',
    '  sentence length. Lower is easier.',
    '- Consensus grade: a combined grade level estimate from the scores above.',
    '',
    'Before: calculate each metric yourself from the Original text in your',
    'answer. After: calculate each metric yourself from the Rewritten text.',
    'Use the same counting rules for both so Before and After are comparable.',
    '',
    'Estimation rules:',
    '',
    '- Be conservative and honest. Do not inflate improvements.',
    '- Protected vocabulary is unchanged between Original and Rewritten, so',
    '  only the sentence length and structure components of each score should',
    '  move between Before and After. Word choice and vocabulary share stay',
    '  the same.',
    '',
    mdTable(['Metric', 'Before', 'After'], rows),
    '',
    '#### What improved',
    '',
    'A short summary in a few sentences using your own Before and After',
    'numbers: which scores went up or down, sentence length changes,',
    'repetition cuts, and any long sentences resolved. Note that your estimates',
    'are approximate and may differ slightly from a dedicated readability',
    'tool.',
  ].join('\n');
}

function formatAtAGlance(sentenceStats, wordVariety, styleData) {
  const longTotal = sentenceStats.sentences.filter(
    (sentence) => sentence.band !== 'fine',
  ).length;
  const repeatedCount = wordVariety.repeated.uniqueRepeatCount;
  return [
    `${longTotal} long sentences`,
    `${styleData.total} style flags`,
    `${repeatedCount} needlessly repeated words`,
    `${wordVariety.lexicalDensity.percent}% lexical density`,
  ]
    .map((line) => `- ${line}`)
    .join('\n');
}

function formatProtectedVocabularyBlock(metrics) {
  const words = metrics.difficultWords;
  const total = words.length;

  const preamble = [
    'The readability formulas flag longer or less common words. In this text,',
    'those words are largely the subject matter itself. Treat every term below',
    'as protected: it must appear unchanged in your rewrite. Improve the',
    'sentences around these terms instead of swapping them out.',
    '',
    'If, and only if, one of these words is pure filler with no content value',
    '(a vague word like "utilize" where "use" means exactly the same), you may',
    'simplify it. When in doubt, keep the original word.',
    '',
  ].join('\n');

  if (total === 0) {
    return `${preamble}_No protected terms flagged._`;
  }

  const listed = words.slice(0, PROTECTED_VOCAB_CAP);
  return [
    preamble,
    ...listed.map((word) => `- ${word}`),
    capNote(total, PROTECTED_VOCAB_CAP, 'protected terms').trimEnd(),
  ]
    .filter((line, index, arr) => !(line === '' && index === arr.length - 1))
    .join('\n');
}

function formatLongSentencesBlock(text, sentenceStats) {
  const { items, total } = getLongSentencesForPrompt(text, sentenceStats);

  if (total === 0) {
    return '_No long sentences flagged. All are at 20 words or fewer._';
  }

  const lines = [`${total} flagged as borderline or too long.`, ''];
  items.forEach((sentence, index) => {
    const label = sentence.band === 'too-long' ? 'too long' : 'borderline';
    lines.push(`${index + 1}. ${sentence.wordCount} words (${label})`);
    lines.push('');
    lines.push(`> ${sentence.text}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd() + capNote(total, LONG_SENTENCE_CAP, 'long sentences');
}

function formatWordVarietyBlock(wordVariety) {
  const { percentages } = wordVariety.pos;
  const lines = [
    '#### Parts of speech (approximate)',
    '',
    mdTable(
      ['Type', 'Share'],
      [
        ['Nouns', `${percentages.noun}%`],
        ['Verbs', `${percentages.verb}%`],
        ['Adjectives', `${percentages.adjective}%`],
        ['Adverbs', `${percentages.adverb}%`],
        ['Other', `${percentages.other}%`],
      ],
    ),
    '',
    '#### Lexical density',
    '',
    `${wordVariety.lexicalDensity.percent}% of words are content words (nouns, verbs, adjectives, adverbs).`,
    '',
  ];

  const repeats = wordVariety.repeated.words;
  lines.push('#### Repeated content words', '');
  lines.push(
    'Repetition of a protected term is not a flaw. Only reduce repetition where the same idea is needlessly restated in different sentences.',
    '',
  );

  if (repeats.length === 0) {
    lines.push('_None flagged._');
    return lines.join('\n');
  }

  const totalRepeats = wordVariety.repeated.uniqueRepeatCount;
  lines.push(
    mdTable(
      ['Word', 'Count'],
      repeats.slice(0, REPEAT_WORD_CAP).map((entry) => [entry.word, String(entry.count)]),
    ),
  );
  return lines.join('\n') + capNote(totalRepeats, REPEAT_WORD_CAP, 'repeated words');
}

function formatStyleBlock(styleData) {
  if (styleData.total === 0) {
    return '_No style issues flagged._';
  }

  const lines = [`${styleData.total} flagged in total.`, ''];
  for (const [category, hits] of styleData.grouped) {
    lines.push(`#### ${category}`, '');
    for (const hit of hits) {
      lines.push(`- "${hit.phrase}": ${hit.reason}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd() + capNote(styleData.total, STYLE_HIT_CAP, 'style issues');
}

export function buildImprovePrompt({
  text,
  metrics,
  sentenceStats,
  wordVariety,
  styleData,
}) {
  const textStandard = rs.textStandard(text);

  const sections = [
    '# Improve readability rewrite',
    '',
    '## Your role',
    '',
    'You are an editor who improves the readability of English text through',
    'sentence structure and phrasing. You never change what a text is about.',
    '',
    '### Hard rule: vocabulary is content',
    '',
    'The subject matter vocabulary of this text is part of its content, not',
    'part of its style. Product names, feature names, brand terms, technical',
    'concepts, domain language, and proper nouns must appear unchanged in your',
    'rewrite. A concrete example: if the text says "personalized mixtape",',
    'your rewrite must also say "personalized mixtape". Replacing it with',
    'something like "custom playlist" changes the content and is a failed',
    'rewrite, even if every readability score improves.',
    '',
    '### Rewrite goals',
    '',
    '- Keep the original meaning, tone, and every fact intact',
    '- Do not add new information or drop any point the author makes',
    '- Preserve the exact input structure (bullet points, numbered lists,',
    '  paragraphs, line breaks, headings, and any other formatting)',
    '- Improve readability only through: shorter sentences, clearer sentence',
    '  structure, less needless repetition, and natural active voice',
    '',
    '---',
    '',
    '## Current analysis',
    '',
    '### Readability scores',
    '',
    formatScoresTable(metrics, textStandard),
    '',
    'These scores are context. Some of them are lowered by the subject matter',
    'vocabulary itself. That is expected and acceptable. Do not try to fix a',
    'score by changing vocabulary.',
    '',
    '### At a glance',
    '',
    formatAtAGlance(sentenceStats, wordVariety, styleData),
    '',
    '---',
    '',
    '## Protected vocabulary',
    '',
    formatProtectedVocabularyBlock(metrics),
    '',
    '---',
    '',
    '## Long sentences',
    '',
    formatLongSentencesBlock(text, sentenceStats),
    '',
    '---',
    '',
    '## Word variety',
    '',
    formatWordVarietyBlock(wordVariety),
    '',
    '---',
    '',
    '## Style issues',
    '',
    formatStyleBlock(styleData),
    '',
    '---',
    '',
    '## What to improve',
    '',
    'Improve readability through structure and phrasing only. The vocabulary',
    'stays.',
    '',
    '1. Break the long sentences listed above into shorter ones, mostly under',
    '   about 20 words',
    '2. Simplify sentence structure: fewer nested clauses, clearer subjects,',
    '   one idea per sentence where possible',
    '3. Fix the passive voice, filler, weasel words, and wordy phrases from',
    '   the style list',
    '4. Cut repetition only where the same idea is needlessly restated, never',
    '   by replacing a protected term with a synonym',
    '5. Keep sentence length varied but readable throughout',
    '',
    'Shorter, clearer sentences will raise the readability scores on their',
    'own. That is the only way you are allowed to raise them.',
    '',
    '---',
    '',
    '## Output',
    '',
    'Before you answer, verify your rewrite: every term from the Protected',
    'vocabulary list must appear in the rewritten text exactly as written in',
    'the original. If any term is missing or altered, fix your rewrite first.',
    '',
    'Return your answer in exactly four sections, in this order:',
    '',
    '### Summary of changes',
    '',
    'A short plain summary of what you changed and why. A few sentences at',
    'most. Mention the main readability fixes (sentence length, phrasing,',
    'repetition, style). Confirm explicitly that all protected terms are',
    'unchanged.',
    '',
    '### Original',
    '',
    'The original text exactly as provided below, unchanged.',
    '',
    '### Rewritten',
    '',
    'The improved text.',
    '',
    '- Keep the same structure as the input: if the original uses bullet',
    '  points, numbered lists, short lines, blank lines, or sections, the',
    '  rewrite must use the same layout',
    '- Do not flatten lists into prose or turn prose into lists unless the',
    '  original already did',
    '- Do not add new information or remove any point the author makes',
    '- Every protected term, product name, feature name, and domain term',
    '  appears unchanged',
    '',
    formatOutputMetricsSection(),
    '',
    '---',
    '',
    '## Text to rewrite',
    '',
    text,
  ];

  return sections.join('\n');
}

export function gatherPromptInputs(text, metrics, sentenceStats, wordVariety) {
  const styleData = getStyleHitsForPrompt(text);
  return {
    text,
    metrics,
    sentenceStats,
    wordVariety,
    styleData,
  };
}

export {
  PROTECTED_VOCAB_CAP,
  LONG_SENTENCE_CAP,
  REPEAT_WORD_CAP,
  STYLE_HIT_CAP,
  PROTECTED_VOCAB_CAP as DIFFICULT_WORD_CAP,
};
