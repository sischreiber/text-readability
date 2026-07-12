<script>
  import { onMount } from 'svelte';
  import Legend from './components/Legend.svelte';
  import HighlightedTextBox from './components/HighlightedTextBox.svelte';
  import FlashValue from './components/FlashValue.svelte';
  import CopyPromptButton from './components/CopyPromptButton.svelte';
  import ScoreTable from './components/ScoreTable.svelte';
  import { rollCopyPicks } from './lib/copyPools.js';
  import { evaluateGate } from './lib/gates.js';
  import {
    computeMetrics,
    formatCliGradePhrase,
    formatDaleGradePhrase,
    formatGunningFogPhrase,
    getDifficultWordChips,
    rs,
  } from './lib/readability.js';
  import { evaluatePasteSecurity } from './lib/security.js';
  import {
    SENTENCE_LENGTH_COLORS,
    analyzeSentenceLength,
    buildSentenceLengthSegments,
    hasLongSentenceHighlight,
  } from './lib/sentenceLength.js';
  import { tokenizeWithGaps } from './lib/tokenizer.js';
  import {
    POS_COLORS,
    REPEAT_HIGHLIGHT,
    analyzeWordVariety,
    buildPosHighlightSegments,
    buildRepeatHighlightSegments,
  } from './lib/wordVariety.js';
  import { buildImprovePrompt, gatherPromptInputs } from './lib/improvePrompt.js';
  import { DIFFICULT_WORD_HIGHLIGHT } from './lib/overlay.js';
  import { pickPlaceholder } from './lib/placeholders.js';
  import {
    formatScore,
    posHighlightColor,
    segmentStyle,
    sentenceHighlightColor,
    syllableClass,
    syllableHighlightColor,
    syllableTooltipLabel,
  } from './lib/highlightHelpers.js';
  import {
    ANALYSIS_DEBOUNCE_MS,
    BUTTON_STYLE,
    DALE_ROWS,
    FONT,
    FOOTER_ICON_LINK_STYLE,
    FOOTER_LINK_STYLE,
    FRE_ROWS,
    H1_STYLE,
    H2_STYLE,
    IN_TEXT_BOX_STYLE,
    LINK_STYLE,
    PAGE_STYLE,
    POS_BUCKETS,
    PROSE_STYLE,
    SECTION_GAP,
    SECTION_GAP_FIRST,
    STACK_PACKAGES,
    SYLLABLE_COLORS,
    TEXTAREA_STYLE,
  } from './lib/uiConstants.js';

  let { flashOnChange = false } = $props();

  let rawInput = $state('');
  let analysisText = $state('');
  let securityBlock = $state(null);
  let flashToggle = $state(0);
  const placeholder = pickPlaceholder();
  let syllableLegendHover = $state(null);
  let sentenceLegendHover = $state(null);
  let posLegendHover = $state(null);

  let pendingPaste = false;
  let prevMetrics = null;

  onMount(() => {
    window.scrollTo(0, 0);
  });

  function handleChange(event) {
    const value = event.currentTarget.value;

    if (!value.trim()) {
      rawInput = '';
      analysisText = '';
      securityBlock = null;
      pendingPaste = false;
      return;
    }

    if (pendingPaste) {
      pendingPaste = false;
      const security = evaluatePasteSecurity(value);

      if (!security.allowed) {
        securityBlock = security.reason;
        analysisText = '';
        rawInput = security.sanitized;
        return;
      }

      securityBlock = null;
      rawInput = security.sanitized;
      return;
    }

    securityBlock = null;
    rawInput = value;
  }

  $effect(() => {
    if (!rawInput.trim() || securityBlock) return;

    const timer = setTimeout(() => {
      analysisText = rawInput;
    }, ANALYSIS_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  });

  function handlePaste() {
    pendingPaste = true;
  }

  function handleClear() {
    rawInput = '';
    analysisText = '';
    securityBlock = null;
    pendingPaste = false;
  }

  const gate = $derived(evaluateGate(analysisText));

  const metrics = $derived.by(() => {
    if (gate.type !== 'ok') return null;
    return computeMetrics(analysisText);
  });

  const wordVariety = $derived.by(() => {
    if (gate.type !== 'ok') return null;
    return analyzeWordVariety(analysisText);
  });

  const copy = $derived.by(() => {
    if (gate.type !== 'ok' || !metrics || !wordVariety) return null;
    return rollCopyPicks(metrics, wordVariety);
  });

  $effect(() => {
    if (!flashOnChange || !metrics || !prevMetrics) {
      prevMetrics = metrics;
      return;
    }
    const prev = prevMetrics;
    if (
      prev.flesch !== metrics.flesch ||
      prev.cli !== metrics.cli ||
      prev.gunningFog !== metrics.gunningFog ||
      prev.dale !== metrics.dale ||
      prev.difficultCount !== metrics.difficultCount
    ) {
      flashToggle += 1;
    }
    prevMetrics = metrics;
  });

  const skipHighlight = $derived(analysisText.length > 20000);

  const syllableSegments = $derived.by(() => {
    if (skipHighlight || gate.type !== 'ok') return null;
    return tokenizeWithGaps(analysisText).map((seg) => {
      if (seg.type === 'gap') return seg;
      const count = syllableClass(rs.syllableCount(seg.text));
      return { ...seg, syllables: count };
    });
  });

  const sentenceLengthStats = $derived.by(() => {
    if (gate.type !== 'ok') return null;
    return analyzeSentenceLength(analysisText);
  });

  const sentenceLengthSegments = $derived.by(() => {
    if (skipHighlight || gate.type !== 'ok') return null;
    return buildSentenceLengthSegments(analysisText);
  });

  const showSentenceLengthBox = $derived(
    sentenceLengthSegments && hasLongSentenceHighlight(sentenceLengthSegments),
  );

  const sentenceBandCounts = $derived.by(() => {
    const counts = { borderline: 0, 'too-long': 0 };
    if (!sentenceLengthStats) return counts;
    for (const sentence of sentenceLengthStats.sentences) {
      if (sentence.band === 'borderline') counts.borderline += 1;
      if (sentence.band === 'too-long') counts['too-long'] += 1;
    }
    return counts;
  });

  const hardWordSegments = $derived.by(() => {
    if (skipHighlight || gate.type !== 'ok' || !metrics) return null;
    return tokenizeWithGaps(analysisText).map((seg) => {
      if (seg.type === 'gap') return seg;
      const hard = metrics.difficultLookup.has(seg.text.toLowerCase());
      return { ...seg, hard };
    });
  });

  const chips = $derived.by(() => {
    if (!metrics || metrics.difficultCount === 0) return [];
    return getDifficultWordChips(analysisText, metrics.difficultWords);
  });

  const repeatSegments = $derived.by(() => {
    if (skipHighlight || gate.type !== 'ok' || !wordVariety) return null;
    if (wordVariety.repeated.words.length === 0) return null;
    return buildRepeatHighlightSegments(
      analysisText,
      wordVariety.repeated.surfaceLookup,
    );
  });

  const posSegments = $derived.by(() => {
    if (skipHighlight || gate.type !== 'ok') return null;
    return buildPosHighlightSegments(analysisText);
  });

  const improvePrompt = $derived.by(() => {
    if (gate.type !== 'ok' || !metrics || !wordVariety || !sentenceLengthStats) {
      return null;
    }
    const inputs = gatherPromptInputs(
      analysisText,
      metrics,
      sentenceLengthStats,
      wordVariety,
    );
    return buildImprovePrompt(inputs);
  });

  const showResults = $derived(
    !securityBlock && gate.type === 'ok' && metrics && copy,
  );
</script>

<div style={PAGE_STYLE}>
  <h1 style={H1_STYLE}>Text Readability</h1>

  <textarea
    value={rawInput}
    oninput={handleChange}
    onpaste={handlePaste}
    {placeholder}
    spellcheck="false"
    style={TEXTAREA_STYLE}
  ></textarea>

  {#if rawInput.trim() !== ''}
    <div style="margin-top:0.65rem;display:flex;flex-wrap:wrap;gap:0.5rem">
      <button type="button" onclick={handleClear} style={BUTTON_STYLE}>Clear</button>
    </div>
  {/if}

  {#if securityBlock && rawInput.trim() !== ''}
    <div
      style="margin-top:1.6rem;background:#fff6f5;border:1px solid #e6b9b4;border-left:4px solid #9a2b2b;border-radius:5px;padding:0.85rem 1rem"
    >
      <span style="color:#7a2222;font-size:0.9rem">
        {securityBlock === 'code'
          ? 'This looks like source code, not prose. Paste readable English text to get scores.'
          : 'This paste looks unsafe. Readability analysis only works with plain text, so remove scripts or markup and try again.'}
      </span>
    </div>
  {/if}

  {#if !securityBlock && gate.type === 'non-english' && analysisText.trim() !== ''}
    <div
      style="margin-top:1.6rem;background:#fff6f5;border:1px solid #e6b9b4;border-left:4px solid #9a2b2b;border-radius:5px;padding:0.85rem 1rem"
    >
      <span style="color:#7a2222;font-size:0.9rem">
        This text doesn't look like English. Readability scores are calculated for English text
        only. Paste English text to see the metrics.
      </span>
    </div>
  {/if}

  {#if !securityBlock && gate.type === 'too-short' && analysisText.trim() !== ''}
    <div
      style="margin-top:1.6rem;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:5px;padding:0.85rem 1rem"
    >
      <span style="color:#3a3a3a;font-size:0.9rem">
        A little more text, please. Readability formulas need at least 12 words to say anything
        meaningful, so add about {12 - gate.wordCount} more.
      </span>
    </div>
  {/if}

  {#if showResults}
    <section style={SECTION_GAP_FIRST}>
      <h2 style={H2_STYLE}>Flesch Reading Ease</h2>
      <p style={PROSE_STYLE}>{copy.freIntro}</p>
      {#if syllableSegments}
        <Legend
          items={[
            { key: 2, label: '2 syllables', color: SYLLABLE_COLORS[2] },
            { key: 3, label: '3 syllables', color: SYLLABLE_COLORS[3] },
            { key: 4, label: '4+ syllables', color: SYLLABLE_COLORS[4] },
          ]}
          bind:activeKey={syllableLegendHover}
          interactive
        />
        <HighlightedTextBox
          segments={syllableSegments}
          getBackground={(seg) =>
            syllableHighlightColor(seg.syllables, syllableLegendHover)}
          getTooltip={(seg) => syllableTooltipLabel(seg.syllables)}
        />
      {/if}
      <p
        style="{PROSE_STYLE}{syllableSegments
          ? ';margin:0.9rem 0 0.9rem'
          : ''}"
      >
        Your score is
        <FlashValue
          value={formatScore(metrics.flesch)}
          {flashOnChange}
          {flashToggle}
        />, rated <span style="font-weight:700">{metrics.fleschBand.label.toLowerCase()}</span>.
        {copy.freReader}
      </p>
      <ScoreTable
        rows={FRE_ROWS}
        activeIndex={metrics.fleschBand.index}
        columns={['Score', 'Difficulty']}
      />
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Sentence length</h2>
      <p style={PROSE_STYLE}>
        {sentenceLengthStats && sentenceLengthStats.longCount > 0
          ? copy.sentenceLongLine(
              sentenceLengthStats.longCount,
              sentenceLengthStats.total,
            )
          : copy.sentenceOkLine}
      </p>
      {#if showSentenceLengthBox}
        <Legend
          items={[
            {
              key: 'borderline',
              label: '21 to 30 words',
              color: SENTENCE_LENGTH_COLORS.borderline,
              disabled: sentenceBandCounts.borderline === 0,
            },
            {
              key: 'too-long',
              label: '31+ words',
              color: SENTENCE_LENGTH_COLORS['too-long'],
              disabled: sentenceBandCounts['too-long'] === 0,
            },
          ]}
          bind:activeKey={sentenceLegendHover}
          interactive
        />
        <div style={IN_TEXT_BOX_STYLE}>
          {#each sentenceLengthSegments as seg, i (i)}
            {#if seg.type === 'gap'}
              <span style={segmentStyle()}>{seg.text}</span>
            {:else}
              <span
                style={segmentStyle(
                  sentenceHighlightColor(seg.band, sentenceLegendHover),
                )}>{seg.text}</span
              >
            {/if}
          {/each}
        </div>
      {/if}
      {#if sentenceLengthStats && sentenceLengthStats.total > 0}
        <p
          style="color:#555;font-size:0.9rem;margin:{showSentenceLengthBox
            ? '0.75rem 0 0'
            : '0'}"
        >
          Longest sentence: <span style="font-weight:700">{sentenceLengthStats.longest}</span>
          words.
        </p>
      {/if}
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Coleman–Liau Index</h2>
      <p style={PROSE_STYLE}>{copy.cliIntro}</p>
      <p style="{PROSE_STYLE};margin:0">
        The Coleman–Liau Index puts this text at
        <span style="font-weight:700"
          >{formatCliGradePhrase(metrics.cli, metrics.cliBucket)}</span
        >.
        {copy.cliReader}
      </p>
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Gunning Fog Index</h2>
      <p style={PROSE_STYLE}>{copy.gunningIntro}</p>
      <p style="{PROSE_STYLE};margin:0">
        The Gunning Fog Index puts this text at
        <span style="font-weight:700"
          >{formatGunningFogPhrase(metrics.gunningFog, metrics.gunningBucket)}</span
        >.
        {copy.gunningReader}
      </p>
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Dale–Chall Readability</h2>
      <p style={PROSE_STYLE}>{copy.daleIntro}</p>
      <p style={PROSE_STYLE}>
        Your
        <span style="font-weight:700"
          >{formatDaleGradePhrase(
            metrics.dale,
            metrics.daleBand.index,
            metrics.daleBand.label,
          )}</span
        >.
        {copy.daleReader}
      </p>
      <ScoreTable
        rows={DALE_ROWS}
        activeIndex={metrics.daleBand.index}
        columns={['Score', 'Reading level']}
      />
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Parts of speech mix</h2>
      <p style="{PROSE_STYLE};margin:0 0 0.75rem">{copy.posSummary}</p>
      <div
        style="display:flex;width:100%;height:0.75rem;border-radius:3px;overflow:hidden;margin-bottom:0.55rem"
      >
        {#each POS_BUCKETS as bucket}
          {@const pct = wordVariety.pos.percentages[bucket.key]}
          {#if pct > 0}
            <div style="width:{pct}%;background:{POS_COLORS[bucket.key]}"></div>
          {/if}
        {/each}
      </div>
      <Legend
        items={POS_BUCKETS.map((bucket) => ({
          key: bucket.key,
          label: `${bucket.label} ${wordVariety.pos.percentages[bucket.key]}%`,
          color: POS_COLORS[bucket.key],
        }))}
        bind:activeKey={posLegendHover}
        interactive
      />
      {#if posSegments}
        <HighlightedTextBox
          segments={posSegments}
          getBackground={(seg) => posHighlightColor(seg.pos, posLegendHover)}
          getTooltip={(seg) => seg.posLabel}
        />
      {/if}

      <h2 style="{H2_STYLE};margin-top:2.8rem">Repeated words</h2>
      <p style="{PROSE_STYLE};margin:0 0 0.75rem">{copy.repeatSummary}</p>
      {#if repeatSegments}
        <Legend items={[{ label: 'Repeated word', color: REPEAT_HIGHLIGHT }]} />
        <div style={IN_TEXT_BOX_STYLE}>
          {#each repeatSegments as seg, i (i)}
            {#if seg.type === 'gap'}
              <span style={segmentStyle()}>{seg.text}</span>
            {:else}
              <span
                style={segmentStyle(seg.repeat ? REPEAT_HIGHLIGHT : undefined)}
                >{seg.text}</span
              >
            {/if}
          {/each}
        </div>
      {/if}
      {#if wordVariety.repeated.words.length > 0}
        <div
          style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:{repeatSegments
            ? '0.75rem'
            : '0'}"
        >
          {#each wordVariety.repeated.words as chip (chip.word)}
            <span
              style="padding:0.4rem 0.8rem;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:999px;font-size:0.95rem;display:inline-flex;align-items:center;gap:0.45rem"
            >
              {chip.word}
              <span
                style="background:#e0e0e0;border-radius:999px;font-size:0.72rem;font-weight:700;color:#555;padding:0.1rem 0.4rem"
              >
                ×{chip.count}
              </span>
            </span>
          {/each}
        </div>
      {/if}

      <h2 style="{H2_STYLE};margin-top:2.8rem">Lexical density</h2>
      <p style="margin:0 0 0.5rem;color:#3a3a3a;font-size:1rem">
        <span style="font-weight:700">{wordVariety.lexicalDensity.percent}</span> percent
      </p>
      <p style="{PROSE_STYLE};margin:0">{copy.densityLine}</p>
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Difficult words</h2>
      <p style={PROSE_STYLE}>{copy.difficultIntro}</p>
      {#if metrics.difficultCount >= 1 && hardWordSegments}
        <Legend
          items={[{ label: 'Hard word', color: DIFFICULT_WORD_HIGHLIGHT }]}
        />
        <div style={IN_TEXT_BOX_STYLE}>
          {#each hardWordSegments as seg, i (i)}
            {#if seg.type === 'gap'}
              <span style={segmentStyle()}>{seg.text}</span>
            {:else}
              <span
                style={segmentStyle(seg.hard ? DIFFICULT_WORD_HIGHLIGHT : undefined)}
                >{seg.text}</span
              >
            {/if}
          {/each}
        </div>
      {/if}
      <p
        style="{PROSE_STYLE}{metrics.difficultCount >= 1 && hardWordSegments
          ? ';margin:0.9rem 0 0.8rem'
          : ''}"
      >
        {#if metrics.difficultCount > 0}
          <span style="font-weight:700">{metrics.difficultWords.length}</span> distinct words
          below account for <span style="font-weight:700">{metrics.difficultCount}</span> of your
          <span style="font-weight:700">{metrics.lexicon}</span> words (about
          <span style="font-weight:700"
            >{Math.round((metrics.difficultCount / metrics.lexicon) * 100)}%</span
          >). These are the longer, less familiar words the formulas count against you, so swapping
          them for simpler ones is the quickest way to lift every score above.
        {:else}
          Nothing stands out. Your text is built almost entirely from short, familiar words, which
          is exactly what keeps the scores easy.
        {/if}
      </p>
      {#if chips.length > 0}
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          {#each chips as chip (chip.word)}
            <span
              style="padding:0.4rem 0.8rem;background:#f5f5f5;border:1px solid #d9d9d9;border-radius:999px;font-size:0.95rem;display:inline-flex;align-items:center;gap:0.45rem"
            >
              {chip.word}
              {#if chip.count > 1}
                <span
                  style="background:#e0e0e0;border-radius:999px;font-size:0.72rem;font-weight:700;color:#555;padding:0.1rem 0.4rem"
                >
                  ×{chip.count}
                </span>
              {/if}
            </span>
          {/each}
        </div>
      {/if}
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Improve with AI</h2>
      <p style="color:#3a3a3a;font-size:1rem;margin:0 0 0.9rem">
        Copy this prompt into any LLM to get a clearer rewrite that keeps your original meaning.
      </p>
      <div
        style="border:1px solid #d9d9d9;border-radius:5px;padding:1rem 1.1rem;background:#f5f7ff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:0.9rem;line-height:1.5;white-space:pre-wrap;word-break:break-word;color:#212121;max-height:22rem;overflow:auto"
      >
        {improvePrompt}
      </div>
      <div style="margin-top:0.65rem">
        <CopyPromptButton text={improvePrompt} />
      </div>
    </section>

    <section style={SECTION_GAP}>
      <h2 style={H2_STYLE}>Built with</h2>
      <p style="font-family:{FONT};font-size:1rem;line-height:1.6;color:#3a3a3a;margin:0 0 0.9rem">
        These npm packages run in your browser. No uploads, no API calls, no API keys.
      </p>
      <div style="font-family:{FONT};font-size:1rem;line-height:1.75;color:#3a3a3a">
        {#each STACK_PACKAGES as item (item.name)}
          <div style="margin-bottom:0.65rem">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style="{LINK_STYLE};font-weight:700"
            >
              {item.name}
            </a>
            <span>: {item.role}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <footer style="margin-top:2.25rem;font-size:0.8rem;line-height:1.6;color:#888">
    <p
      style="margin:0;display:flex;flex-wrap:nowrap;align-items:center;gap:0.35rem;white-space:nowrap"
    >
      <span>Built by</span>
      <a
        href="https://www.sischreiber.com"
        target="_blank"
        rel="noopener noreferrer"
        style={FOOTER_LINK_STYLE}
      >
        sischreiber
      </a>
      <a
        href="https://github.com/sischreiber/text-readability"
        target="_blank"
        rel="noopener noreferrer"
        style={FOOTER_ICON_LINK_STYLE}
        aria-label="GitHub repository"
        title="GitHub"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
      <span>
        Readability scores from open source npm packages, running entirely in your browser.
      </span>
    </p>
  </footer>
</div>
