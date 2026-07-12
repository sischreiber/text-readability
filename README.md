# Text Readability

A minimal client-side tool that analyzes pasted English text for readability scores, difficult words, and common style issues. Built as a portfolio piece for [sischreiber.com](https://sischreiber.com).

Paste text into the box and the app computes everything in your browser. No server, no API keys.

## What it measures

| Metric | What it tells you |
|--------|-------------------|
| **Overall reading level** | Consensus grade across several formulas (e.g. "9th and 10th grade") |
| **Flesch Reading Ease** | 0–100 score from sentence length and syllables per word. Higher is easier. |
| **Coleman–Liau Index** | US grade level from letters per word. Independent cross-check on Flesch. |
| **Dale–Chall** | Reading level from unfamiliar words vs. a list of ~3,000 familiar words |
| **Difficult words** | Count and list of longer, less familiar words |
| **Style check** | Flags passive voice, weasel words, wordiness, adverbs, clichés, and filler |

Non-English text and samples under 12 words are gated with a short message instead of scores.

## Libraries

- [text-readability](https://www.npmjs.com/package/text-readability) for all readability formulas and syllable counts
- [write-good](https://www.npmjs.com/package/write-good) for the style check

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

Lightweight unit tests cover input gating, text tokenization, and style overlay merging.

## Deploy

The project is a standard Vite + React app. Push to GitHub and import the repo in [Vercel](https://vercel.com) for zero-config deployment.
