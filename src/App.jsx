import { useEffect, useMemo, useRef, useState } from 'react';
import { rollCopyPicks } from './lib/copyPools';
import { evaluateGate } from './lib/gates';
import {
  STYLE_COLORS,
  buildCharOverlay,
  categorizeStyleHit,
  findDifficultWordPositions,
  mergeCharRuns,
} from './lib/overlay';
import {
  computeMetrics,
  getDifficultWordChips,
  rs,
} from './lib/readability';
import { tokenizeWithGaps } from './lib/tokenizer';
import {
  hasWriteGoodFailed,
  isWriteGoodLoaded,
  loadWriteGood,
  runWriteGood,
} from './lib/writeGoodLoader';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

const SYLLABLE_COLORS = {
  2: '#e7eeff',
  3: '#c6d6ff',
  4: '#a4bcff',
};

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

const STYLE_LEGEND = [
  { label: 'Passive voice', color: STYLE_COLORS['Passive voice'] },
  { label: 'Weasel word', color: STYLE_COLORS['Weasel word'] },
  { label: 'Wordy', color: STYLE_COLORS.Wordy },
  { label: 'Adverb', color: STYLE_COLORS.Adverb },
  { label: 'Cliché', color: STYLE_COLORS['Cliché'] },
  { label: 'Hard word', color: STYLE_COLORS.Difficult },
];

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

export default function App({
  accentColor = '#0d47a1',
  flashOnChange = false,
}) {
  const [rawInput, setRawInput] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [writeGoodReady, setWriteGoodReady] = useState(isWriteGoodLoaded());
  const [writeGoodError, setWriteGoodError] = useState(hasWriteGoodFailed());
  const [flashToggle, setFlashToggle] = useState(0);

  const copyPicksRef = useRef(null);
  const wasEmptyRef = useRef(true);
  const prevMetricsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(rawInput), 300);
    return () => clearTimeout(timer);
  }, [rawInput]);

  useEffect(() => {
    loadWriteGood()
      .then(() => setWriteGoodReady(true))
      .catch(() => setWriteGoodError(true));
  }, []);

  const gate = useMemo(() => evaluateGate(debouncedText), [debouncedText]);

  const metrics = useMemo(() => {
    if (gate.type !== 'ok') return null;
    return computeMetrics(debouncedText);
  }, [debouncedText, gate.type]);

  useEffect(() => {
    const isEmpty = debouncedText.trim() === '';
    if (isEmpty) {
      wasEmptyRef.current = true;
      copyPicksRef.current = null;
      return;
    }

    if (wasEmptyRef.current && metrics) {
      wasEmptyRef.current = false;
      copyPicksRef.current = rollCopyPicks(metrics);
    }
  }, [debouncedText, metrics]);

  useEffect(() => {
    if (!flashOnChange || !metrics || !prevMetricsRef.current) {
      prevMetricsRef.current = metrics;
      return;
    }
    const prev = prevMetricsRef.current;
    if (
      prev.flesch !== metrics.flesch ||
      prev.cli !== metrics.cli ||
      prev.dale !== metrics.dale ||
      prev.difficultCount !== metrics.difficultCount
    ) {
      setFlashToggle((n) => n + 1);
    }
    prevMetricsRef.current = metrics;
  }, [metrics, flashOnChange]);

  const styleHits = useMemo(() => {
    if (gate.type !== 'ok' || !writeGoodReady) return [];
    return runWriteGood(debouncedText).map((hit) => ({
      ...hit,
      category: categorizeStyleHit(hit.reason),
    }));
  }, [debouncedText, gate.type, writeGoodReady]);

  const skipHighlight = debouncedText.length > 20000;

  const syllableSegments = useMemo(() => {
    if (skipHighlight || gate.type !== 'ok') return null;
    return tokenizeWithGaps(debouncedText).map((seg) => {
      if (seg.type === 'gap') return seg;
      const count = syllableClass(rs.syllableCount(seg.text));
      return { ...seg, syllables: count };
    });
  }, [debouncedText, gate.type, skipHighlight]);

  const hardWordSegments = useMemo(() => {
    if (skipHighlight || gate.type !== 'ok' || !metrics) return null;
    return tokenizeWithGaps(debouncedText).map((seg) => {
      if (seg.type === 'gap') return seg;
      const hard = metrics.difficultLookup.has(seg.text.toLowerCase());
      return { ...seg, hard };
    });
  }, [debouncedText, gate.type, metrics, skipHighlight]);

  const styleRuns = useMemo(() => {
    if (
      skipHighlight ||
      gate.type !== 'ok' ||
      !metrics ||
      styleHits.length === 0
    ) {
      return null;
    }
    const positions = findDifficultWordPositions(
      debouncedText,
      metrics.difficultLookup,
    );
    const categories = buildCharOverlay(debouncedText, positions, styleHits);
    return mergeCharRuns(debouncedText, categories).filter((run) => run.category);
  }, [debouncedText, gate.type, metrics, styleHits, skipHighlight]);

  const chips = useMemo(() => {
    if (!metrics || metrics.difficultCount === 0) return [];
    return getDifficultWordChips(debouncedText, metrics.difficultWords);
  }, [debouncedText, metrics]);

  const copy = copyPicksRef.current;

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
        padding: '0 1rem 5rem',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: '2rem 0 1.2rem',
          color: '#212121',
        }}
      >
        Text Readability
      </h1>

      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Paste your text here…"
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

      {gate.type === 'non-english' && (
        <div
          style={{
            marginTop: '1.6rem',
            background: '#fff6f5',
            border: '1px solid #e6b9b4',
            borderLeft: '4px solid #9a2b2b',
            borderRadius: '5px',
            padding: '0.85rem 1rem',
            display: 'flex',
            gap: '0.65rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontWeight: 700, color: '#9a2b2b' }}>!</span>
          <span style={{ color: '#7a2222', fontSize: '0.9rem' }}>
            This text doesn&apos;t look like English. Readability scores are calculated for
            English text only. Paste English text to see the metrics.
          </span>
        </div>
      )}

      {gate.type === 'too-short' && (
        <div
          style={{
            marginTop: '1.6rem',
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: '5px',
            padding: '0.85rem 1rem',
            display: 'flex',
            gap: '0.65rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontWeight: 700, color: '#555' }}>i</span>
          <span style={{ color: '#3a3a3a', fontSize: '0.9rem' }}>
            A little more text, please. Readability formulas need at least 12 words to say
            anything meaningful, so add about {12 - gate.wordCount} more.
          </span>
        </div>
      )}

      {gate.type === 'ok' && metrics && copy && (
        <>
          <section style={sectionGapFirst}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem' }}>
              Overall reading level
            </h2>
            <p
              style={{
                fontWeight: 700,
                fontSize: '1.25rem',
                color: '#212121',
                margin: '0 0 0.8rem',
              }}
            >
              {metrics.textStandard}
            </p>
            <p style={{ color: '#3a3a3a', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              {copy.textStandardIntro}
            </p>
          </section>

          <section style={sectionGap}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem' }}>
              Flesch Reading Ease
            </h2>
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
            <p
              style={{
                color: '#3a3a3a',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: syllableSegments ? '0.9rem 0 0.8rem' : '0 0 0.8rem',
              }}
            >
              {copy.freIntro}
            </p>
            <p style={{ color: '#212121', margin: '0 0 0.9rem' }}>
              Your score is{' '}
              <FlashValue
                value={formatScore(metrics.flesch)}
                flashOnChange={flashOnChange}
                flashToggle={flashToggle}
              />
              , rated {metrics.fleschBand.label.toLowerCase()}. {copy.freReader}
            </p>
            <ScoreTable
              rows={FRE_ROWS}
              activeIndex={metrics.fleschBand.index}
              columns={['Score', 'Difficulty']}
            />
          </section>

          <section style={sectionGap}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem' }}>
              Coleman–Liau Index
            </h2>
            <p
              style={{
                color: '#3a3a3a',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 0.8rem',
              }}
            >
              {copy.cliIntro}
            </p>
            <p style={{ color: '#212121', margin: 0 }}>
              The Coleman–Liau Index puts this text at about grade{' '}
              <FlashValue
                value={formatScore(metrics.cli)}
                flashOnChange={flashOnChange}
                flashToggle={flashToggle}
              />
              . {copy.cliReader}
            </p>
          </section>

          <section style={sectionGap}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem' }}>
              Dale–Chall Readability
            </h2>
            <p
              style={{
                color: '#3a3a3a',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 0.8rem',
              }}
            >
              {copy.daleIntro}
            </p>
            <p style={{ color: '#212121', margin: '0 0 0.9rem' }}>
              Your score is{' '}
              <FlashValue
                value={formatScore(metrics.dale)}
                flashOnChange={flashOnChange}
                flashToggle={flashToggle}
              />
              , a {metrics.daleBand.label.toLowerCase()} reading level. {copy.daleReader}
            </p>
            <ScoreTable
              rows={DALE_ROWS}
              activeIndex={metrics.daleBand.index}
              columns={['Score', 'Reading level']}
            />
          </section>

          <section style={sectionGap}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem' }}>
              Difficult words
            </h2>
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
            <p
              style={{
                color: '#3a3a3a',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin:
                  metrics.difficultCount >= 1 && hardWordSegments
                    ? '0.9rem 0 0.8rem'
                    : '0 0 0.8rem',
              }}
            >
              {metrics.difficultCount > 0
                ? `${metrics.difficultWords.length} distinct words below account for ${metrics.difficultCount} of your ${metrics.lexicon} words (about ${Math.round((metrics.difficultCount / metrics.lexicon) * 100)}%). These are the longer, less familiar words the formulas count against you, so swapping them for simpler ones is the quickest way to lift every score above.`
                : 'Nothing stands out. Your text is built almost entirely from short, familiar words, which is exactly what keeps the scores easy.'}
            </p>
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
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.8rem' }}>
              Style check
            </h2>

            {!writeGoodReady && !writeGoodError && (
              <p style={{ color: '#898ea4', fontSize: '0.95rem', margin: '0 0 0.8rem' }}>
                Loading style check…
              </p>
            )}

            {writeGoodError && (
              <p style={{ color: '#898ea4', fontSize: '0.95rem', margin: '0 0 0.8rem' }}>
                Style check couldn&apos;t load.
              </p>
            )}

            {writeGoodReady && styleRuns && (
              <>
                <Legend items={STYLE_LEGEND} />
                <InTextBox>
                  {styleRuns.map((run, i) => (
                    <SegmentSpan
                      key={i}
                      text={run.text}
                      background={STYLE_COLORS[run.category] ?? STYLE_COLORS.Style}
                    />
                  ))}
                </InTextBox>
              </>
            )}

            {writeGoodReady && (
              <>
                <p
                  style={{
                    color: '#3a3a3a',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin:
                      styleRuns ? '0.9rem 0 0.8rem' : '0 0 0.8rem',
                  }}
                >
                  {styleHits.length === 0
                    ? 'Clean. Nothing flagged for passive voice, filler, or hedging words.'
                    : `${styleHits.length} phrase${styleHits.length === 1 ? '' : 's'} ${styleHits.length === 1 ? 'is' : 'are'} worth a second look. Passive voice, filler and hedging words make writing feel heavier than it needs to, so tightening these reads more directly.`}
                </p>

                {styleHits.length > 0 && (
                  <div>
                    {styleHits.map((hit, i) => (
                      <div
                        key={`${hit.index}-${hit.offset}-${i}`}
                        style={{
                          display: 'flex',
                          gap: '0.9rem',
                          padding: '0.7rem 0',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        <span
                          style={{
                            minWidth: '6.5rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            color: '#555',
                            flexShrink: 0,
                          }}
                        >
                          {hit.category}
                        </span>
                        <span style={{ color: '#212121', fontSize: '1rem' }}>{hit.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
