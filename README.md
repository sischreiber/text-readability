# Readability Analyzer

Readability Analyzer is a minimal client-side tool that analyzes pasted English or German text for readability scores and common style issues.

Paste text into the box and the app automatically detects English or German, then computes everything in your browser. No server, no API keys.

Live app: [readability-analyzer.vercel.app](https://readability-analyzer.vercel.app)

## What it measures

| Metric | English | German |
|--------|:-------:|:------:|
| Flesch Reading Ease | ✓ | ✓ (Amstad) |
| Sentence length | ✓ | ✓ |
| Coleman–Liau Index | ✓ | — |
| Gunning Fog Index | ✓ | — |
| Dale–Chall | ✓ | — |
| Parts of speech mix | ✓ | — |
| Repeated words | ✓ | — |
| Lexical density | ✓ | — |
| Difficult words | ✓ | — |
| Wiener Sachtextformel | — | ✓ |
| LIX | — | ✓ |
| Improve with AI prompt | ✓ | ✓ |
| Syllable highlights (Flesch) | ✓ | ✓ |

### English mode

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

### German mode

| Result | What it tells you |
|--------|-------------------|
| **Flesch-Index (Amstad)** | German Flesch variant from sentence length and syllables per word (via hyphenopoly). Includes difficulty bands and syllable highlights. |
| **Satzlänge** | Same sentence-length rules as English (20 / 21–30 / 31+ words). |
| **Wiener Sachtextformel** | Classic German expository readability formula from `@lunarisapp/readability`. |
| **LIX** | Letter-based readability index from `lix-index`. |

German mode omits metrics that depend on English word lists or unreliable client-side German POS tagging.

It also builds a copyable LLM prompt for the active language.

Text under 12 words shows a short notice instead of scores. Other languages show an unsupported-language notice.

## Libraries

**English**

- [text-readability](https://www.npmjs.com/package/text-readability) for readability formulas and syllable counts
- [compromise](https://www.npmjs.com/package/compromise) for approximate word tagging in the Word variety section
- [sentence-splitter](https://www.npmjs.com/package/sentence-splitter) for sentence length analysis

**German**

- [franc-min](https://www.npmjs.com/package/franc-min) for English/German detection
- [fleschDe](https://www.npmjs.com/package/fleschDe) for the Amstad Flesch formula
- [@lunarisapp/readability](https://www.npmjs.com/package/@lunarisapp/readability) for the Wiener Sachtextformel formula function
- [lix-index](https://www.npmjs.com/package/lix-index) for LIX
- [hyphenopoly](https://www.npmjs.com/package/hyphenopoly) for German syllable counting

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

Lightweight unit tests cover input gating, language detection, text tokenization, word variety counting, German metrics, and style overlay merging.

## Deploy

Live at [readability-analyzer.vercel.app](https://readability-analyzer.vercel.app). The project is a standard Vite + Svelte app: push to [GitHub](https://github.com/sischreiber/readability-analyzer) and import the repo in [Vercel](https://vercel.com) for zero-config deployment.
