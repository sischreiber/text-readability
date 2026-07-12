const PLACEHOLDERS = [
  'Paste English text for readability scores and an LLM prompt.',
  'Paste English copy for metrics and a rewrite prompt.',
  'English text in, scores and AI prompt out.',
  'Paste prose here for readability metrics and a copyable LLM prompt.',
  'Drop in English text to get scores and an AI rewrite prompt.',
  'Paste English writing for instant metrics and an LLM prompt.',
];

export function pickPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}
