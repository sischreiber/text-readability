import { formatLongSentencesBlock, getLongSentencesForPrompt, LONG_SENTENCE_CAP } from './improvePrompt.js';
import { formatScore } from './highlightHelpers.js';

function mdTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return [head, divider, body].join('\n');
}

function formatGermanScoresTable(metrics) {
  return mdTable(
    ['Metrik', 'Ergebnis'],
    [
      ['Flesch-Index (Amstad)', `${formatScore(metrics.flesch)} (${metrics.fleschBand.label})`],
      ['Wiener Sachtextformel', `${formatScore(metrics.wstf)} (${metrics.wstfBand.label})`],
      ['LIX', `${formatScore(metrics.lix)} (${metrics.lixBand.label})`],
    ],
  );
}

function formatGermanOutputMetricsSection() {
  const rows = [
    ['Flesch-Index (Amstad)', '', ''],
    ['Wiener Sachtextformel', '', ''],
    ['LIX', '', ''],
  ];

  return [
    '### Metriken vorher und nachher',
    '',
    'Zeige eine Vergleichstabelle mit drei Spalten: Metrik, Vorher, Nachher.',
    '',
    'Berechne jede Metrik mit denselben Regeln für Original und Überarbeitung:',
    '',
    '- Flesch-Index (Amstad): aus Satzlänge und Silben pro Wort. Höher ist leichter.',
    '- Wiener Sachtextformel: deutsche Sachtextformel aus Silbenstruktur, Satzlänge und Wortlänge. Höher ist leichter.',
    '- LIX: Wörter pro Satz plus Anteil langer Wörter. Niedriger ist leichter.',
    '',
    mdTable(['Metrik', 'Vorher', 'Nachher'], rows),
    '',
    '#### Was sich verbessert hat',
    '',
    'Kurze Zusammenfassung in ein paar Sätzen mit deinen Vorher/Nachher-Zahlen.',
  ].join('\n');
}

export function buildGermanImprovePrompt({ text, metrics, sentenceStats }) {
  const longBlock = formatLongSentencesBlock(text, sentenceStats);
  const longTotal = sentenceStats.sentences.filter((s) => s.band !== 'fine').length;

  return [
    '# Lesbarkeit verbessern',
    '',
    '## Deine Rolle',
    '',
    'Du bist Lektorin oder Lektor für deutsche Texte. Du verbesserst Lesbarkeit durch',
    'Satzstruktur und Formulierung, ohne den Inhalt zu verändern.',
    '',
    '### Harte Regel: Fachvokabular bleibt',
    '',
    'Fachbegriffe, Produktnamen, Marken und Domänensprache gehören zum Inhalt und',
    'dürfen nicht durch vereinfachende Synonyme ersetzt werden.',
    '',
    '---',
    '',
    '## Aktuelle Analyse',
    '',
    '### Lesbarkeitswerte',
    '',
    formatGermanScoresTable(metrics),
    '',
    '### Auf einen Blick',
    '',
    `- ${longTotal} lange Sätze`,
    '',
    '---',
    '',
    '## Lange Sätze',
    '',
    longBlock,
    '',
    '---',
    '',
    '## Was du verbessern sollst',
    '',
    '1. Lange Sätze aufteilen, meist unter etwa 20 Wörtern',
    '2. Satzstruktur vereinfachen: weniger Verschachtelung, klarere Subjekte',
    '3. Wiederholungen nur streichen, wenn dieselbe Idee unnötig doppelt steht',
    '4. Fachvokabular unverändert lassen',
    '',
    '---',
    '',
    '## Ausgabe',
    '',
    'Antworte in genau vier Abschnitten, in dieser Reihenfolge:',
    '',
    '### Zusammenfassung der Änderungen',
    '### Original',
    '### Überarbeitung',
    '',
    formatGermanOutputMetricsSection(),
    '',
    '---',
    '',
    '## Text zum Überarbeiten',
    '',
    text,
  ].join('\n');
}

export { getLongSentencesForPrompt, LONG_SENTENCE_CAP };
