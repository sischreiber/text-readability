import { useEffect, useMemo, useRef, useState } from 'react';
import { rollCopyPicks } from './lib/copyPools';
import { evaluateGate } from './lib/gates';
import {
  computeMetrics,
  formatCliGradePhrase,
  formatDaleGradePhrase,
  formatGunningFogPhrase,
  getDifficultWordChips,
  rs,
} from './lib/readability';
import { evaluatePasteSecurity } from './lib/security';
import {
  SENTENCE_LENGTH_COLORS,
  analyzeSentenceLength,
  buildSentenceLengthSegments,
  hasLongSentenceHighlight,
} from './lib/sentenceLength';
import { tokenizeWithGaps } from './lib/tokenizer';
import {
  POS_COLORS,
  REPEAT_HIGHLIGHT,
  analyzeWordVariety,
  buildRepeatHighlightSegments,
} from './lib/wordVariety';
import {
  buildImprovePrompt,
  gatherPromptInputs,
} from './lib/improvePrompt';
import { pickPlaceholder } from './lib/placeholders';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

const ANALYSIS_DEBOUNCE_MS = 300;

const SYLLABLE_COLORS = {
  2: '#e7eeff',
  3: '#c6d6ff',
  4: '#a4bcff',
};

const POS_BUCKETS = [
  { key: 'noun', label: 'Nouns' },
  { key: 'verb', label: 'Verbs' },
  { key: 'adjective', label: 'Adjectives' },
  { key: 'adverb', label: 'Adverbs' },
  { key: 'other', label: 'Other' },
];

const FRE_ROWS = [
  { range: '90–100', label: 'Very Easy', min: 90 },
  { range: '80–89', label: 'Easy', min: 80 },
  { range: '70–79', label: 'Fairly Easy', min: 70 },
  { range: '60–69', label: 'Standard', min: 60 },
  { range: '50–59', label: 'Fairly Difficult', min: 50 },
  { range: '30–49', label: 'Difficult', min: 30 },
  { range: '0–29', label: 'Very Confusing', min: 0 },
];

const DALE_ROWS = [
  { range: '4.9 or lower', label: 'Grade 4 and below', match: (s) => s <= 4.9 },
  { range: '5.0 to 5.9', label: 'Grades 5 to 6', match: (s) => s >= 5.0 && s <= 5.9 },
  { range: '6.0 to 6.9', label: 'Grades 7 to 8', match: (s) => s >= 6.0 && s <= 6.9 },
  { range: '7.0 to 7.9', label: 'Grades 9 to 10', match: (s) => s >= 7.0 && s <= 7.9 },
  { range: '8.0 to 8.9', label: 'Grades 11 to 12', match: (s) => s >= 8.0 && s <= 8.9 },
  { range: '9.0 to 9.9', label: 'College', match: (s) => s >= 9.0 && s <= 9.9 },
  { range: '10.0 and up', label: 'College graduate', match: (s) => s >= 10.0 },
];

const STACK_PACKAGES = [
  {
    name: 'text-readability',
    npm: true,
    role: 'Flesch, Coleman-Liau, Dale-Chall, Gunning Fog, difficult words, syllable counts',
  },
  {
    name: 'sentence-splitter',
    npm: true,
    role: 'Sentence boundaries and length checks',
  },
  {
    name: 'compromise',
    npm: true,
    role: 'Approximate parts of speech, repetition, and lexical density',
  },
  {
    name: 'write-good',
    npm: true,
    role: 'Style flags in the AI prompt (passive voice, weasel words, wordiness)',
  },
  {
    name: 'React and Vite',
    npm: true,
    role: 'Client side UI. All analysis stays local in your browser',
  },
];

const H1_STYLE = {
  fontSize: '1.6rem',
  fontWeight: 700,
  margin: '0 0 1.2rem',
  color: '#212121',
};

const H2_STYLE = {
  fontSize: '1.25rem',
  fontWeight: 700,
  margin: '0 0 0.8rem',
  color: '#212121',
};

const PROSE_STYLE = {
  fontFamily: FONT,
  fontSize: '1rem',
  lineHeight: 1.6,
  fontWeight: 400,
  color: '#3a3a3a',
  margin: '0 0 0.9rem',
};

function Prose({ children, style }) {
  return <p style={{ ...PROSE_STYLE, ...style }}>{children}</p>;
}

function syllableClass(count) {
  if (count <= 1) return 1;
  if (count >= 4) return 4;
  return count;
}

function formatScore(value) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function Legend({ items }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.65rem 1rem',
        marginBottom: '0.55rem',
        fontSize: '0.8rem',
        color: '#555',
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              width: '0.9rem',
              height: '0.9rem',
              borderRadius: '3px',
              border: '1px solid #d0d0d0',
              background: item.color ?? 'transparent',
              flexShrink: 0,
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function InTextBox({ children }) {
  return (
    <div
      style={{
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        fontSize: '1rem',
        lineHeight: 1.9,
        padding: '1rem 1.1rem',
        border: '1px solid #d9d9d9',
        borderRadius: '5px',
        color: '#212121',
      }}
    >
      {children}
    </div>
  );
}

function SegmentSpan({ text, background }) {
  return (
    <span
      style={{
        whiteSpace: 'pre-wrap',
        borderRadius: '3px',
        padding: '0.08em 0',
        background: background ?? 'transparent',
        color: '#212121',
      }}
    >
      {text}
    </span>
  );
}

function Result({ children }) {
  return <span style={{ fontWeight: 700 }}>{children}</span>;
}

function FlashValue({ value, flashOnChange, flashToggle }) {
  const prev = useRef(value);
  const [anim, setAnim] = useState(null);

  useEffect(() => {
    if (!flashOnChange || prev.current === value) {
      prev.current = value;
      return;
    }
    setAnim(flashToggle % 2 === 0 ? 'flashA' : 'flashB');
    prev.current = value;
    const timer = setTimeout(() => setAnim(null), 600);
    return () => clearTimeout(timer);
  }, [value, flashOnChange, flashToggle]);

  return (
    <span
      style={{
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        animation: anim ? `${anim} 0.6s ease` : undefined,
      }}
    >
      {value}
    </span>
  );
}

function ScoreTable({ rows, activeIndex, columns }) {
  return (
    <table
      style={{
        borderCollapse: 'collapse',
        fontSize: '1rem',
        width: '100%',
      }}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col}
              style={{
                border: '1px solid #d9d9d9',
                padding: '0.7rem 1.4rem 0.7rem 0.9rem',
                textAlign: 'left',
                fontWeight: 700,
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const active = index === activeIndex;
          return (
            <tr key={row.label}>
              <td
                style={{
                  border: '1px solid #d9d9d9',
                  padding: '0.7rem 1.4rem 0.7rem 0.9rem',
                  background: active ? '#e9e9e9' : '#fff',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {row.range}
              </td>
              <td
                style={{
                  border: '1px solid #d9d9d9',
                  padding: '0.7rem 1.4rem 0.7rem 0.9rem',
                  background: active ? '#e9e9e9' : '#fff',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {row.label}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CopyPromptButton({ text }) {
  const [label, setLabel] = useState('Copy prompt');
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setLabel('Copied');
    } catch {
      setLabel('Copy failed, select the text manually');
    }
    timerRef.current = setTimeout(() => setLabel('Copy prompt'), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        padding: '0.5rem 0.9rem',
        border: '1px solid #898ea4',
        borderRadius: '5px',
        background: '#fff',
        fontSize: '0.95rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: '#212121',
        marginBottom: '0.75rem',
      }}
    >
      {label}
    </button>
  );
}

export default function App({ flashOnChange = false }) {
  const [rawInput, setRawInput] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [securityBlock, setSecurityBlock] = useState(null);
  const [flashToggle, setFlashToggle] = useState(0);
  const [placeholder] = useState(() => pickPlaceholder());

  const pendingPasteRef = useRef(false);
  const prevMetricsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;

    if (!value.trim()) {
      setRawInput('');
      setAnalysisText('');
      setSecurityBlock(null);
      pendingPasteRef.current = false;
      return;
    }

    if (pendingPasteRef.current) {
      pendingPasteRef.current = false;
      const security = evaluatePasteSecurity(value);

      if (!security.allowed) {
        setSecurityBlock(security.reason);
        setAnalysisText('');
        setRawInput(security.sanitized);
        return;
      }

      setSecurityBlock(null);
      setRawInput(security.sanitized);
      return;
    }

    setSecurityBlock(null);
    setRawInput(value);
  };

  useEffect(() => {
    if (!rawInput.trim() || securityBlock) return;

    const timer = setTimeout(() => {
      setAnalysisText(rawInput);
    }, ANALYSIS_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [rawInput, securityBlock]);

  const handlePaste = () => {
    pendingPasteRef.current = true;
  };

  const handleClear = () => {
    setRawInput('');
    setAnalysisText('');
    setSecurityBlock(null);
    pendingPasteRef.current = false;
  };

  const gate = useMemo(() => evaluateGate(analysisText), [analysisText]);

  const metrics = useMemo(() => {
    if (gate.type !== 'ok') return null;
    return computeMetrics(analysisText);
  }, [analysisText, gate.type]);

  const wordVariety = useMemo(() => {
    if (gate.type !== 'ok') return null;
    return analyzeWordVariety(analysisText);
  }, [analysisText, gate.type]);

  const copy = useMemo(() => {
    if (gate.type !== 'ok' || !metrics || !wordVariety) return null;
    return rollCopyPicks(metrics, wordVariety);
  }, [analysisText, gate.type, metrics, wordVariety]);

  useEffect(() => {
    if (!flashOnChange || !metrics || !prevMetricsRef.current) {
      prevMetricsRef.current = metrics;
      return;
    }
    const prev = prevMetricsRef.current;
    if (
      prev.flesch !== metrics.flesch ||
      prev.cli !== metrics.cli ||
      prev.gunningFog !== metrics.gunningFog ||
      prev.dale !== metrics.dale ||
      prev.difficultCount !== metrics.difficultCount
    ) {
      setFlashToggle((n) => n + 1);
    }
    prevMetricsRef.current = metrics;
  }, [metrics, flashOnChange]);

  const skipHighlight = analysisText.length > 20000;

  const syllableSegments = useMemo(() => {
    if (skipHighlight || gate.type !== 'ok') return null;
    return tokenizeWithGaps(analysisText).map((seg) => {
      if (seg.type === 'gap') return seg;
      const count = syllableClass(rs.syllableCount(seg.text));
      return { ...seg, syllables: count };
    });
  }, [analysisText, gate.type, skipHighlight]);

  const sentenceLengthStats = useMemo(() => {
    if (gate.type !== 'ok') return null;
    return analyzeSentenceLength(analysisText);
  }, [analysisText, gate.type]);

  const sentenceLengthSegments = useMemo(() => {
    if (skipHighlight || gate.type !== 'ok') return null;
    return buildSentenceLengthSegments(analysisText);
  }, [analysisText, gate.type, skipHighlight]);

  const showSentenceLengthBox =
    sentenceLengthSegments && hasLongSentenceHighlight(sentenceLengthSegments);

  const hardWordSegments = useMemo(() => {
    if (skipHighlight || gate.type !== 'ok' || !metrics) return null;
    return tokenizeWithGaps(analysisText).map((seg) => {
      if (seg.type === 'gap') return seg;
      const hard = metrics.difficultLookup.has(seg.text.toLowerCase());
      return { ...seg, hard };
    });
  }, [analysisText, gate.type, metrics, skipHighlight]);

  const chips = useMemo(() => {
    if (!metrics || metrics.difficultCount === 0) return [];
    return getDifficultWordChips(analysisText, metrics.difficultWords);
  }, [analysisText, metrics]);

  const repeatSegments = useMemo(() => {
    if (skipHighlight || gate.type !== 'ok' || !wordVariety) return null;
    if (wordVariety.repeated.words.length === 0) return null;
    return buildRepeatHighlightSegments(
      analysisText,
      wordVariety.repeated.surfaceLookup,
    );
  }, [analysisText, gate.type, skipHighlight, wordVariety]);

  const improvePrompt = useMemo(() => {
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
  }, [analysisText, gate.type, metrics, sentenceLengthStats, wordVariety]);

  const sectionGapFirst = { paddingTop: '1.6rem' };
  const sectionGap = { paddingTop: '2.8rem' };

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: '1.05rem',
        lineHeight: 1.5,
        color: '#212121',
        maxWidth: '48rem',
        margin: '0 auto',
        padding: '3rem 1rem 5rem',
        minHeight: '100vh',
      }}
    >
      <h1 style={H1_STYLE}>Text Readability</h1>

      <textarea
        value={rawInput}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: '220px',
          resize: 'vertical',
          display: 'block',
          background: '#f5f7ff',
          border: '1px solid #898ea4',
          borderRadius: '5px',
          padding: '0.75rem 0.9rem',
          font: 'inherit',
          fontSize: '1rem',
          lineHeight: 1.55,
          color: '#212121',
        }}
      />

      {rawInput.trim() !== '' && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            marginTop: '0.65rem',
            padding: '0.5rem 0.9rem',
            border: '1px solid #898ea4',
            borderRadius: '5px',
            background: '#fff',
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: '#212121',
          }}
        >
          Clear
        </button>
      )}

      {securityBlock && rawInput.trim() !== '' && (
        <div
          style={{
            marginTop: '1.6rem',
            background: '#fff6f5',
            border: '1px solid #e6b9b4',
            borderLeft: '4px solid #9a2b2b',
            borderRadius: '5px',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ color: '#7a2222', fontSize: '0.9rem' }}>
            {securityBlock === 'code'
              ? 'This looks like source code, not prose. Paste readable English text to get scores.'
              : 'This paste looks unsafe. Readability analysis only works with plain text, so remove scripts or markup and try again.'}
          </span>
        </div>
      )}

      {!securityBlock && gate.type === 'non-english' && analysisText.trim() !== '' && (
        <div
          style={{
            marginTop: '1.6rem',
            background: '#fff6f5',
            border: '1px solid #e6b9b4',
            borderLeft: '4px solid #9a2b2b',
            borderRadius: '5px',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ color: '#7a2222', fontSize: '0.9rem' }}>
            This text doesn&apos;t look like English. Readability scores are calculated for
            English text only. Paste English text to see the metrics.
          </span>
        </div>
      )}

      {!securityBlock && gate.type === 'too-short' && analysisText.trim() !== '' && (
        <div
          style={{
            marginTop: '1.6rem',
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: '5px',
            padding: '0.85rem 1rem',
          }}
        >
          <span style={{ color: '#3a3a3a', fontSize: '0.9rem' }}>
            A little more text, please. Readability formulas need at least 12 words to say
            anything meaningful, so add about {12 - gate.wordCount} more.
          </span>
        </div>
      )}

      {!securityBlock && gate.type === 'ok' && metrics && copy && (
        <>
          <section style={sectionGapFirst}>
            <h2 style={H2_STYLE}>Flesch Reading Ease</h2>
            <Prose>{copy.freIntro}</Prose>
            {syllableSegments && (
              <>
                <Legend
                  items={[
                    { label: '2 syllables', color: SYLLABLE_COLORS[2] },
                    { label: '3 syllables', color: SYLLABLE_COLORS[3] },
                    { label: '4+ syllables', color: SYLLABLE_COLORS[4] },
                  ]}
                />
                <InTextBox>
                  {syllableSegments.map((seg, i) =>
                    seg.type === 'gap' ? (
                      <SegmentSpan key={i} text={seg.text} />
                    ) : (
                      <SegmentSpan
                        key={i}
                        text={seg.text}
                        background={
                          seg.syllables >= 2
                            ? SYLLABLE_COLORS[seg.syllables] ?? SYLLABLE_COLORS[4]
                            : undefined
                        }
                      />
                    ),
                  )}
                </InTextBox>
              </>
            )}
            <Prose style={{ margin: syllableSegments ? '0.9rem 0 0.9rem' : undefined }}>
              Your score is{' '}
              <FlashValue
                value={formatScore(metrics.flesch)}
                flashOnChange={flashOnChange}
                flashToggle={flashToggle}
              />
              , rated <Result>{metrics.fleschBand.label.toLowerCase()}</Result>. {copy.freReader}
            </Prose>
            <ScoreTable
              rows={FRE_ROWS}
              activeIndex={metrics.fleschBand.index}
              columns={['Score', 'Difficulty']}
            />
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Sentence length</h2>
            <Prose>
              {sentenceLengthStats && sentenceLengthStats.longCount > 0
                ? copy.sentenceLongLine(
                    sentenceLengthStats.longCount,
                    sentenceLengthStats.total,
                  )
                : copy.sentenceOkLine}
            </Prose>
            {showSentenceLengthBox && (
              <>
                <Legend
                  items={[
                    { label: '21 to 30 words', color: SENTENCE_LENGTH_COLORS.borderline },
                    { label: '31+ words', color: SENTENCE_LENGTH_COLORS['too-long'] },
                  ]}
                />
                <InTextBox>
                  {sentenceLengthSegments.map((seg, i) =>
                    seg.type === 'gap' ? (
                      <SegmentSpan key={i} text={seg.text} />
                    ) : (
                      <SegmentSpan
                        key={i}
                        text={seg.text}
                        background={SENTENCE_LENGTH_COLORS[seg.band] ?? undefined}
                      />
                    ),
                  )}
                </InTextBox>
              </>
            )}
            {sentenceLengthStats && sentenceLengthStats.total > 0 && (
              <p
                style={{
                  color: '#555',
                  fontSize: '0.9rem',
                  margin: showSentenceLengthBox ? '0.75rem 0 0' : '0',
                }}
              >
                Longest sentence: <Result>{sentenceLengthStats.longest}</Result> words.
              </p>
            )}
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Coleman–Liau Index</h2>
            <Prose>{copy.cliIntro}</Prose>
            <Prose style={{ margin: 0 }}>
              The Coleman–Liau Index puts this text at{' '}
              <Result>{formatCliGradePhrase(metrics.cli, metrics.cliBucket)}</Result>.{' '}
              {copy.cliReader}
            </Prose>
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Gunning Fog Index</h2>
            <Prose>{copy.gunningIntro}</Prose>
            <Prose style={{ margin: 0 }}>
              The Gunning Fog Index puts this text at{' '}
              <Result>{formatGunningFogPhrase(metrics.gunningFog, metrics.gunningBucket)}</Result>.{' '}
              {copy.gunningReader}
            </Prose>
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Dale–Chall Readability</h2>
            <Prose>{copy.daleIntro}</Prose>
            <Prose>
              Your{' '}
              <Result>
                {formatDaleGradePhrase(
                  metrics.dale,
                  metrics.daleBand.index,
                  metrics.daleBand.label,
                )}
              </Result>
              . {copy.daleReader}
            </Prose>
            <ScoreTable
              rows={DALE_ROWS}
              activeIndex={metrics.daleBand.index}
              columns={['Score', 'Reading level']}
            />
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Word variety</h2>

            <Prose style={{ margin: '0 0 0.75rem' }}>{copy.posSummary}</Prose>
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '0.75rem',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '0.55rem',
              }}
            >
              {POS_BUCKETS.map((bucket) => {
                const pct = wordVariety.pos.percentages[bucket.key];
                if (pct === 0) return null;
                return (
                  <div
                    key={bucket.key}
                    style={{
                      width: `${pct}%`,
                      background: POS_COLORS[bucket.key],
                    }}
                  />
                );
              })}
            </div>
            <Legend
              items={POS_BUCKETS.map((bucket) => ({
                label: `${bucket.label} ${wordVariety.pos.percentages[bucket.key]}%`,
                color: POS_COLORS[bucket.key],
              }))}
            />

            <Prose style={{ marginTop: '1.4rem' }}>{copy.repeatSummary}</Prose>
            {repeatSegments && (
              <InTextBox>
                {repeatSegments.map((seg, i) =>
                  seg.type === 'gap' ? (
                    <SegmentSpan key={i} text={seg.text} />
                  ) : (
                    <SegmentSpan
                      key={i}
                      text={seg.text}
                      background={seg.repeat ? REPEAT_HIGHLIGHT : undefined}
                    />
                  ),
                )}
              </InTextBox>
            )}
            {wordVariety.repeated.words.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginTop: repeatSegments ? '0.75rem' : 0,
                }}
              >
                {wordVariety.repeated.words.map((chip) => (
                  <span
                    key={chip.word}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#f5f5f5',
                      border: '1px solid #d9d9d9',
                      borderRadius: '999px',
                      fontSize: '0.95rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    {chip.word}
                    <span
                      style={{
                        background: '#e0e0e0',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#555',
                        padding: '0.1rem 0.4rem',
                      }}
                    >
                      ×{chip.count}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <p style={{ margin: '1.4rem 0 0.5rem', color: '#3a3a3a', fontSize: '1rem' }}>
              Lexical density: <Result>{wordVariety.lexicalDensity.percent}</Result> percent
            </p>
            <Prose style={{ margin: 0 }}>{copy.densityLine}</Prose>
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Difficult words</h2>
            <Prose>{copy.difficultIntro}</Prose>
            {metrics.difficultCount >= 1 && hardWordSegments && (
              <>
                <Legend items={[{ label: 'Hard word', color: '#d8efdb' }]} />
                <InTextBox>
                  {hardWordSegments.map((seg, i) =>
                    seg.type === 'gap' ? (
                      <SegmentSpan key={i} text={seg.text} />
                    ) : (
                      <SegmentSpan
                        key={i}
                        text={seg.text}
                        background={seg.hard ? '#d8efdb' : undefined}
                      />
                    ),
                  )}
                </InTextBox>
              </>
            )}
            <Prose
              style={{
                margin:
                  metrics.difficultCount >= 1 && hardWordSegments
                    ? '0.9rem 0 0.8rem'
                    : undefined,
              }}
            >
              {metrics.difficultCount > 0 ? (
                <>
                  <Result>{metrics.difficultWords.length}</Result> distinct words below account
                  for <Result>{metrics.difficultCount}</Result> of your{' '}
                  <Result>{metrics.lexicon}</Result> words (about{' '}
                  <Result>
                    {Math.round((metrics.difficultCount / metrics.lexicon) * 100)}%
                  </Result>
                  ). These are the longer, less familiar words the formulas count against you, so
                  swapping them for simpler ones is the quickest way to lift every score above.
                </>
              ) : (
                'Nothing stands out. Your text is built almost entirely from short, familiar words, which is exactly what keeps the scores easy.'
              )}
            </Prose>
            {chips.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {chips.map((chip) => (
                  <span
                    key={chip.word}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#f5f5f5',
                      border: '1px solid #d9d9d9',
                      borderRadius: '999px',
                      fontSize: '0.95rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    {chip.word}
                    {chip.count > 1 && (
                      <span
                        style={{
                          background: '#e0e0e0',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#555',
                          padding: '0.1rem 0.4rem',
                        }}
                      >
                        ×{chip.count}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Improve with AI</h2>
            <p style={{ color: '#3a3a3a', fontSize: '1rem', margin: '0 0 0.9rem' }}>
              Copy this prompt into any LLM to get a clearer rewrite that keeps your
              original meaning.
            </p>
            <CopyPromptButton text={improvePrompt} />
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '5px',
                padding: '1rem 1.1rem',
                background: '#f5f7ff',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#212121',
                maxHeight: '22rem',
                overflow: 'auto',
              }}
            >
              {improvePrompt}
            </div>
          </section>

          <section style={sectionGap}>
            <h2 style={H2_STYLE}>Built with</h2>
            <p
              style={{
                fontFamily: FONT,
                fontSize: '1rem',
                lineHeight: 1.6,
                color: '#3a3a3a',
                margin: '0 0 0.9rem',
              }}
            >
              These npm packages run in your browser. No uploads, no API calls, no API keys.
            </p>
            <div
              style={{
                fontFamily: FONT,
                fontSize: '1rem',
                lineHeight: 1.75,
                color: '#3a3a3a',
              }}
            >
              {STACK_PACKAGES.map((item) => (
                <div key={item.name} style={{ marginBottom: '0.65rem' }}>
                  <span style={{ fontWeight: 700 }}>
                    {item.name}
                    {item.npm ? ' (npm)' : ''}
                  </span>
                  <span>: {item.role}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
