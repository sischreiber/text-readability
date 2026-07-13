function pick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const FRE_INTROS_DE = [
  'Der Flesch-Index nach Amstad misst die Lesbarkeit deutscher Texte anhand der Satzlänge und der Silben pro Wort. Höhere Werte bedeuten leichteres Lesen, meist auf einer Skala von 0 bis 100.',
  'Diese Formel nach Toni Amstad (1978) schätzt die Lesbarkeit aus durchschnittlicher Satzlänge und Silbenzahl pro Wort. Je höher der Wert, desto leichter der Text.',
];

export const FRE_READERS_DE = [
  ['Sehr leicht lesbar. Fast jede Zielgruppe kommt gut zurecht.'],
  ['Leicht lesbar. Die meisten Erwachsenen lesen das mühelos.'],
  ['Mittelschwer. Für die meisten allgemeinen Zielgruppen geeignet.'],
  ['Mittelschwer. Typisches Niveau für erwachsene Leserinnen und Leser.'],
  ['Schwer. Erfordert mehr Konzentration und Vorwissen.'],
  ['Sehr schwer. Nur für geübte Leserinnen und Leser geeignet.'],
  ['Sehr schwer. Extrem anspruchsvoll und schwer zu erfassen.'],
];

export const WSTF_INTROS_DE = [
  'Die Wiener Sachtextformel ist eine klassische deutsche Lesbarkeitsformel für Sachtexte. Sie berücksichtigt Silbenstruktur, Satzlänge und Wortlänge. Höhere Werte bedeuten leichteres Lesen.',
  'Die Erste Wiener Sachtextformel bewertet deutsche Sachtexte anhand von Mehrfachsilbern, Satzlänge, langen Wörtern und Einsilbern. Höher ist leichter.',
];

export const WSTF_READERS_DE = [
  ['Sehr leicht. Für breite Zielgruppen gut verständlich.'],
  ['Leicht. Allgemein gut lesbar.'],
  ['Mittel. Erfordert etwas Lesegewohnheit.'],
  ['Schwer. Für gezieltere Zielgruppen geschrieben.'],
  ['Sehr schwer. Nur für sehr geübte Leserinnen und Leser.'],
];

export const LIX_INTROS_DE = [
  'Der LIX-Index (Lesbarkeitsindex) arbeitet mit Wörtern pro Satz und dem Anteil langer Wörter. Er funktioniert sprachübergreifend und eignet sich auch für deutsche Texte.',
  'LIX misst Lesbarkeit über Satzlänge und den Anteil von Wörtern mit mehr als sechs Buchstaben. Niedrigere Werte bedeuten leichteres Lesen.',
];

export const LIX_READERS_DE = [
  ['Kinderbuch-Niveau. Sehr einfach.'],
  ['Belletristik. Leicht und flüssig.'],
  ['Normaler Fließtext. Alltagstauglich.'],
  ['Sachtexte. Etwas anspruchsvoller.'],
  ['Wissenschaftlich oder sehr dicht.'],
];

export const SENTENCE_OK_DE =
  'Alle Sätze liegen bei höchstens 20 Wörtern. Das ist ein gutes Zeichen für die Lesbarkeit.';

export function rollGermanCopyPicks(metrics) {
  return {
    freIntro: pick(FRE_INTROS_DE),
    freReader: pick(FRE_READERS_DE[metrics.fleschBand.index]),
    wstfIntro: pick(WSTF_INTROS_DE),
    wstfReader: pick(WSTF_READERS_DE[metrics.wstfBand.index]),
    lixIntro: pick(LIX_INTROS_DE),
    lixReader: pick(LIX_READERS_DE[metrics.lixBand.index]),
    sentenceOkLine: SENTENCE_OK_DE,
    sentenceLongLine: (longCount, total) =>
      `${longCount} von ${total} Sätzen sind länger als 20 Wörter. Kürzere Sätze erleichtern das Lesen.`,
  };
}
