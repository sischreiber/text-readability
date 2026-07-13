# Readability Analyzer

Readability Analyzer is a minimal client-side tool that analyzes pasted English text for readability scores, difficult words, and common style issues. Built as a portfolio piece for [sischreiber.com](https://sischreiber.com).

Repo: [github.com/sischreiber/readability-analyzer](https://github.com/sischreiber/readability-analyzer)

Paste text into the box and the app computes everything in your browser. No server, no API keys.

## What it measures

| Result | What it tells you |
|--------|-------------------|
| **Flesch Reading Ease** | 0–100 score from sentence length and syllables per word, plus a difficulty band and reference table. The text is color-coded by syllable count (2, 3, or 4+ syllables). |
| **Sentence length** | Flags sentences over 20 words and highlights borderline (21–30) and too-long (31+) sentences in the text. Shows the longest sentence length. |
| **Coleman–Liau Index** | US grade level from letters per word and sentences per word. Independent cross-check on Flesch. |
| **Gunning Fog Index** | US grade level from sentence length and the share of words with three or more syllables. |
| **Dale–Chall** | Reading level from unfamiliar words vs. a list of about 3,000 familiar words, with a reference table. |
| **Parts of speech mix** | Approximate share of nouns, verbs, adjectives, adverbs, and other words (compromise tagger). Shown as a bar, legend, and color-coded text with hover labels. |
| **Repeated words** | Content words that appear more than once, highlighted in the text and listed as chips with counts. |
| **Lexical density** | Percentage of words that are content words (nouns, verbs, adjectives, adverbs) rather than function words. |
| **Difficult words** | Words the readability formulas flag as harder, highlighted in the text and listed as chips with counts. |

Beyond scoring, the app builds a copyable LLM prompt that asks a model to rewrite the text for better readability while keeping subject-matter vocabulary unchanged. The prompt includes the current readability scores, a protected-vocabulary list, flagged long sentences, word-variety stats, style issues from write-good, and instructions for a before/after metrics comparison in the model's answer.

Non-English text and samples under 12 words are gated with a short message instead of scores. In-text highlighting is omitted for very long pastes (over 20,000 characters).

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
