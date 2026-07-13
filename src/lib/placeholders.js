const PLACEHOLDERS = [
  'Paste English or German text for readability scores and an LLM prompt.',
  'Paste English or German copy for metrics and a rewrite prompt.',
  'English or German text in, scores and AI prompt out.',
  'Paste prose here for readability metrics and a copyable LLM prompt.',
  'Drop in English or German text to get scores and an AI rewrite prompt.',
  'Paste English or German writing for instant metrics and an LLM prompt.',
];

export function pickPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}
