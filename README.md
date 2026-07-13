# Readability Analyzer

Readability Analyzer is a minimal client-side tool that analyzes pasted English text for readability scores, difficult words, and common style issues.

Repo: [github.com/sischreiber/readability-analyzer](https://github.com/sischreiber/readability-analyzer)

Paste text into the box and the app computes everything in your browser. No server, no API keys.

## What it measures

| Metric | What it tells you |
|--------|-------------------|
| **Flesch Reading Ease** | 0–100 score from sentence length and syllables per word. Higher is easier. |
| **Sentence length** | Highlights sentences that run long by word count |
| **Coleman–Liau Index** | US grade level from letters per word. Independent cross-check on Flesch. |
| **Gunning Fog Index** | US grade level from sentence length and words with three or more syllables |
| **Dale–Chall** | Reading level from unfamiliar words vs. a list of ~3,000 familiar words |
| **Word variety** | Approximate parts of speech mix, repeated content words, and lexical density |
| **Difficult words** | Count and list of longer, less familiar words |
| **Improve with AI** | Copyable prompt with all findings for pasting into any LLM |

Non-English text and samples under 12 words are gated with a short message instead of scores.

## Libraries

- [text-readability](https://www.npmjs.com/package/text-readability) for all readability formulas and syllable counts
- [compromise](https://www.npmjs.com/package/compromise) for approximate word tagging in the Word variety section
- [sentence-splitter](https://www.npmjs.com/package/sentence-splitter) for sentence length analysis

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
```

Lightweight unit tests cover input gating, text tokenization, word variety counting, and style overlay merging.

## Deploy

The project is a standard Vite + Svelte app. Push to [GitHub](https://github.com/sischreiber/readability-analyzer) and import the repo in [Vercel](https://vercel.com) for zero-config deployment.
