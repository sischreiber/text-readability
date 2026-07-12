# Improve with AI: Prompt-Spezifikation

Diese Datei beschreibt, wie der kopierbare LLM-Prompt in der App gebaut wird. Nutze sie in Cursor für einen inhaltlichen Gegencheck (Copy, Regeln, Reihenfolge, Datenquellen).

Implementierung: `src/lib/improvePrompt.js`  
Anzeige in der UI: `src/App.jsx` (Section „Improve with AI“, `useMemo` über `gatherPromptInputs` + `buildImprovePrompt`)

---

## Ablauf

1. Nutzer:in hat Text in der Textarea (nach Debounce 300 ms in `analysisText`).
2. `gatherPromptInputs(text, metrics, sentenceStats, wordVariety)` sammelt alle Eingaben.
3. Dabei wird `write-good` einmal aufgerufen → Style-Hits, gruppiert über `categorizeStyleHit` aus `src/lib/overlay.js`.
4. `buildImprovePrompt(inputs)` baut einen einzelnen String und gibt ihn zurück.
5. Die UI zeigt den String read-only; „Copy prompt“ kopiert ihn per Clipboard. Kein API-Call.

---

## Eingabedaten (dynamisch)

| Feld | Quelle | Verwendung im Prompt |
|------|--------|----------------------|
| `text` | Original-Textarea-Inhalt | Am Ende unter „Text to rewrite“, unverändert |
| `metrics` | `computeMetrics()` / text-readability | Scores, difficult words, Flesch-Ziel |
| `sentenceStats` | `analyzeSentenceLength()` | Lange Sätze mit Wortzahl und Volltext |
| `wordVariety` | `analyzeWordVariety()` / compromise | POS-%, Lexical density, Wiederholungen |
| `styleData` | `getStyleHitsForPrompt()` / write-good | Style issues nach Kategorie |

### Readability scores (Tabelle)

| Metric | Datenfeld |
|--------|-----------|
| Flesch Reading Ease | `metrics.flesch` + `metrics.fleschBand.label` |
| Coleman-Liau | `formatCliGradePhrase(metrics.cli, metrics.cliBucket)` |
| Gunning Fog | `formatGunningFogPhrase(metrics.gunningFog, metrics.gunningBucket)` |
| Dale-Chall | `formatDaleGradePhrase(metrics.dale, metrics.daleBand.index, metrics.daleBand.label)` |
| Consensus grade | `rs.textStandard(text)` |

### Caps (Listen werden gekürzt, Volltext bleibt immer komplett)

| Liste | Cap | Hinweis bei Kürzung |
|-------|-----|---------------------|
| Difficult words | 40 | `_N more difficult words not shown_` |
| Long sentences | 15 (längste zuerst) | `_N more long sentences not shown_` |
| Repeated content words | 40 | `_N more repeated words not shown_` |
| Style issues | 40 gesamt | `_N more style issues not shown_` |

---

## Format-Regeln für den Prompt-String

- Markdown erlaubt: `#` / `##` / `###` / `####`, Bullet-Listen, nummerierte Listen, Tabellen, `>` Blockquotes, `---` Trennlinien, `_kursiv_` für leere Zustände und Cap-Hinweise
- Nicht erlaubt: `` ``` `` (Code-Fences), `**` (Bold)
- Sprache: Englisch, sachlich, ohne Em-Dashes in der Copy
- Kein Netzwerk, kein Speicher: nur String-Bau im Browser

---

## Feste Abschnitts-Reihenfolge

Jeder Block wird mit `\n` zusammengefügt. `---` trennt Hauptkapitel.

### 1. Titel

```markdown
# Improve readability rewrite
```

### 2. Your role

Statischer Text:

```markdown
## Your role

You are an editor who improves the readability of English text.

### Rewrite goals

- Keep the original meaning, tone, and every fact intact
- Do not add new information or drop any point the author makes
- Preserve all subject matter vocabulary, proper nouns, and domain specific terms exactly as written unless they are clear filler with no content value
- Preserve the exact input structure in the output (bullet points, numbered lists, paragraphs, line breaks, headings, and any other formatting the original uses)
- Use shorter sentences, clearer phrasing, less repetition, and natural active voice without dumbing down the content
```

### 3. Current analysis

```markdown
## Current analysis

### Readability scores

| Metric | Result |
| --- | --- |
| … | … dynamisch … |

### At a glance

- {difficultCount} difficult word occurrences
- {longCount} long sentences
- {styleTotal} style flags
- {lexicalDensity}% lexical density
```

### 4. Difficult words (formula flags only)

Wichtig für den inhaltlichen Check: Diese Liste kommt aus den Readability-Formeln, ist aber keine Ersetzungsliste.

Statischer Preamble (immer):

```markdown
## Difficult words (formula flags only)

These words triggered readability formulas because they are less common in everyday English.
They are context for the analysis only. They are NOT a list of words to replace.

Vocabulary rules:

- Keep every term that names something specific in the text (products, features, brands, places, technical concepts, domain language, proper nouns)
- Never replace subject matter vocabulary with a simpler generic word if that changes what the text is about
- Examples that must stay unchanged: feature names, product phrases, specialist terms the author chose on purpose (such as "personalized mixtape")
- Only simplify words that are genuinely needless filler or vague padding, and only when the meaning stays identical
```

Dann dynamisch:

- Wenn keine: `_No difficult words flagged by the formulas._`
- Sonst: `Flagged words (X occurrences across Y distinct words):` + Bullet-Liste aus `metrics.difficultWords`

### 5. Long sentences

- Wenn keine: `_No long sentences flagged. All are at 20 words or fewer._`
- Sonst: Anzahl + nummerierte Liste; pro Satz: Wortzahl, Label (`borderline` / `too long`), darunter Blockquote mit Satztext
- Quelle: Sätze mit `band !== 'fine'`, sortiert nach Länge absteigend

### 6. Word variety

Unterabschnitte:

- `#### Parts of speech (approximate)` → Tabelle Type / Share (nouns, verbs, adjectives, adverbs, other)
- `#### Lexical density` → ein Satz mit Prozent
- `#### Repeated content words` → Tabelle Word / Count oder `_None flagged._`

### 7. Style issues

- Kategorien aus `overlay.js`: Passive voice, Weasel word, Wordy, Adverb, Cliché, Filler, Vague opener, Style
- Pro Kategorie `#### {category}` und Bullets: `- "{phrase}": {reason}`
- Wenn keine: `_No style issues flagged._`

### 8. What to improve

Statischer Rahmen + dynamisches Flesch-Ziel:

```markdown
## What to improve

Improve readability through structure and phrasing without changing what the text is about.

1. Raise the Flesch Reading Ease score above {fleschScore} if possible, without replacing content specific vocabulary
2. Break the long sentences into shorter ones, mostly under about 20 words
3. Keep every flagged difficult word that carries specific meaning. Improve readability around those terms instead of swapping them out
4. Cut flagged repetition and vary word choice only where the same idea is needlessly repeated, not where a term is intentionally precise
5. Fix passive voice, filler, weasel words, and wordy phrases from the style list
6. Keep sentence length varied but readable throughout
```

### 9. Output (erwartete LLM-Antwort)

Das Modell soll genau drei Abschnitte liefern:

```markdown
## Output

Return your answer in exactly three sections, in this order:

### Summary of changes

A short plain summary of what you changed and why. A few sentences at most. Mention the main readability fixes (sentence length, phrasing, repetition, style). Note which specialist terms you kept unchanged.

### Original

The original text exactly as provided below, unchanged.

### Rewritten

The improved text.

- Keep the same structure as the input: if the original uses bullet points, numbered lists, short lines, blank lines, or sections, the rewrite must use the same layout
- Do not flatten lists into prose or turn prose into lists unless the original already did
- Do not add new information or remove any point the author makes
- Keep all content specific vocabulary, product names, feature names, and domain terms from the original
```

### 10. Text to rewrite

```markdown
## Text to rewrite

{original text, exakt wie eingegeben, kein Code-Fence}
```

---

## Inhaltliche Kernentscheidungen (für Review)

1. Difficult words dienen nur der Transparenz über Formel-Scores, nicht der Vereinfachung von Fachsprache.
2. Konkretes Negativbeispiel im Prompt: „personalized mixtape“ darf nicht ersetzt werden.
3. Lesbarkeit wird primär über Satzlänge, Struktur, Stil (write-good) und unnötige Wiederholungen verbessert.
4. Struktur des Inputs (Listen, Absätze, Überschriften) muss im Rewritten erhalten bleiben.
5. LLM-Ausgabe ist dreiteilig: Kurzfassung der Änderungen, Original, Rewrite.

---

## Cursor Gegencheck: Vorschlag

In Cursor öffnen und z. B. fragen:

> Lies `docs/improve-prompt-spec.md` und `src/lib/improvePrompt.js`. Prüfe, ob die Prompt-Regeln widerspruchsfrei sind, ob „Difficult words“ klar genug von „ersetzen“ abgrenzt, und ob die Output-Anweisungen für ein LLM eindeutig sind. Schlage konkrete Copy-Änderungen vor, ohne `**` oder Code-Fences einzuführen.

Optional mit echtem Beispieltext aus der App: Prompt kopieren und prüfen, ob das Modell trotzdem Fachbegriffe ersetzt → dann Preamble oder Punkt 3 unter „What to improve“ schärfen.

---

## Tests

`src/lib/improvePrompt.test.js` prüft u. a.:

- Originaltext ist im Prompt enthalten
- Kein `` ``` `` und kein `**`
- Abschnitte Summary / Original / Rewritten in den Output-Anweisungen
- „formula flags only“, „NOT a list of words to replace“, „personalized mixtape“
- Kein alter Satz „Replace difficult words with simpler alternatives“
