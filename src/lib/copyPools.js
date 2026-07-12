function pick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const FRE_INTROS = [
  'Flesch Reading Ease measures how easy text is to read from sentence length and syllables per word. Higher scores mean easier reading, usually on a 0 to 100 scale.',
  'This score looks at sentence length and syllables per word to estimate reading ease. A higher number means easier text, typically between 0 and 100.',
  'Flesch Reading Ease combines average sentence length with syllables per word. Higher is easier, with most scores falling between 0 and 100.',
  'Developed by Rudolf Flesch in 1948, this formula measures reading ease from sentence length and syllables per word. Higher scores mean easier reading, usually 0 to 100.',
  'Reading ease here comes from two signals: how long your sentences are and how many syllables each word carries. Higher scores mean easier reading, on a 0 to 100 scale.',
  'The Flesch score estimates readability from sentence length and syllables per word. Higher numbers mean the text is easier to read, generally between 0 and 100.',
  'This metric scores reading ease using sentence length and syllables per word. Higher is better for casual readers, with scores typically from 0 to 100.',
  'Flesch Reading Ease rates how approachable your prose is based on sentence length and syllables per word. A higher score means easier reading, usually 0 to 100.',
  'By weighing sentence length against syllables per word, Flesch Reading Ease estimates how easy a passage is to read. Higher scores indicate easier text, on a 0 to 100 scale.',
  'One of the most widely used readability scores, Flesch Reading Ease runs from sentence length and syllables per word. Higher means easier, typically 0 to 100.',
];

export const CLI_INTROS = [
  'Coleman-Liau estimates a US grade level from letters per word and sentences per word, so it never counts syllables. Because it uses a different signal than Flesch, agreement between the two is a good sign.',
  'This index measures letters per word and sentences per word to estimate grade level. It ignores syllables entirely, so it works as an independent check on Flesch.',
  'Coleman-Liau calculates a US grade level from how many letters and sentences appear per word. No syllable counting involved, which makes it a useful cross-check against Flesch.',
  'Where Flesch counts syllables, Coleman-Liau counts letters per word instead. The two formulas use different inputs, so similar results suggest your readability picture is stable.',
  'This grade estimate comes from letters per word and sentences per word, not syllables. When it lines up with Flesch, you can trust the overall reading level more.',
  'Coleman-Liau offers a syllable-free way to estimate grade level using letters per word and sentence length. It complements Flesch because the two methods measure different things.',
];

export const DALE_INTROS = [
  'Dale-Chall is vocabulary based: it counts words outside a list of about 3,000 familiar words. Lower scores mean easier reading.',
  'This score measures how many unfamiliar words appear in your text against a list of roughly 3,000 common words. Lower is easier.',
  'Dale-Chall checks each word against a familiar word list of about 3,000 entries. Fewer unfamiliar words means a lower, easier score.',
  'Created by Edgar Dale and Jeanne Chall, this formula compares your vocabulary to a list of about 3,000 familiar words. Lower scores indicate easier text.',
  'Rather than counting syllables or letters, Dale-Chall focuses on word familiarity using a list of roughly 3,000 common words. Lower is easier.',
  'The Dale-Chall score reflects how many words fall outside a familiar vocabulary list of about 3,000 words. A lower score means more accessible text.',
  'Vocabulary difficulty drives this score: words not on the familiar list of about 3,000 common words push it higher. Lower scores are easier.',
  'Dale-Chall estimates reading difficulty by tallying words absent from a list of approximately 3,000 familiar words. Lower means simpler reading.',
  'This approach treats word familiarity as the main signal, using a reference list of about 3,000 common words. Lower scores mean easier reading.',
  'A genuinely different method from grade level formulas, Dale-Chall counts unfamiliar words against a list of about 3,000 familiar ones. Lower is easier.',
];

export const FRE_READERS = [
  [
    'Very easy to read. Almost anyone could get through it.',
    'Extremely approachable. Even casual readers will breeze through.',
    'Reads like everyday conversation. Very little effort required.',
    'About as easy as text gets. Accessible to virtually all readers.',
  ],
  [
    'Easy to read. Most adults will have no trouble.',
    'Straightforward prose that flows without much effort.',
    'Comfortable reading for the average adult.',
    'Clear and accessible to a broad audience.',
  ],
  [
    'Fairly easy to read. Suitable for most general audiences.',
    'Readable with minimal concentration. Good for general interest writing.',
    'Most readers will find this comfortable but not trivial.',
    'Accessible prose that does not demand much from the reader.',
  ],
  [
    'Standard difficulty. Expect a typical adult reading level.',
    'Reads at a normal adult level. Neither especially easy nor hard.',
    'Middle of the road difficulty for everyday readers.',
    'Comfortable for educated adults but not simplified.',
  ],
  [
    'Fairly difficult. Readers may need to slow down and concentrate.',
    'Some passages will require careful attention.',
    'Not casual reading. Expect to re-read a sentence now and then.',
    'Challenging enough that concentration helps.',
  ],
  [
    'Difficult to read. Best suited for engaged or expert readers.',
    'Dense prose that demands sustained attention.',
    'Readers will work to follow the argument.',
    'Expect slower reading and occasional re-reading.',
  ],
  [
    'Very confusing. Most readers will struggle to follow the meaning.',
    'Extremely dense. Even careful readers may lose the thread.',
    'Hard to parse. The structure and vocabulary create real friction.',
    'Among the toughest readability scores. Readers will fight the text.',
  ],
];

export const CLI_READERS = {
  le4: [
    'Reads at an elementary level.',
    'Suitable for young readers or early elementary grades.',
    'Simple enough for grade 4 and below.',
  ],
  '5to8': [
    'Reads at a middle school level.',
    'Comfortable for grades 5 through 8.',
    'Accessible to junior high readers.',
  ],
  '9to12': [
    'Reads at a high school level.',
    'Suitable for grades 9 through 12.',
    'Expect a high school reading level.',
  ],
  '13plus': [
    'Reads at a college level or beyond.',
    'Expect college level comprehension.',
    'Written for advanced or college educated readers.',
  ],
};

export const DALE_READERS = [
  [
    'Readable by fourth graders and below.',
    'Elementary level vocabulary throughout.',
    'Very accessible for young readers.',
    'Simple word choices keep this at a low grade level.',
  ],
  [
    'Suitable for fifth and sixth grade readers.',
    'A step above elementary but still approachable.',
    'Middle elementary reading level.',
    'Accessible to late elementary students.',
  ],
  [
    'Middle school reading level.',
    'Suitable for seventh and eighth graders.',
    'Expect junior high comprehension.',
    'Comfortable for early teenage readers.',
  ],
  [
    'High school freshman and sophomore level.',
    'Suitable for grades 9 and 10.',
    'Expect standard high school reading ability.',
    'Accessible to most high school students.',
  ],
  [
    'Upper high school reading level.',
    'Suitable for juniors and seniors.',
    'Expect advanced high school comprehension.',
    'Challenging for younger readers but fine for grades 11 and 12.',
  ],
  [
    'College level reading.',
    'Expect undergraduate comprehension.',
    'Written for an educated college audience.',
    'Challenging vocabulary and structure typical of college texts.',
  ],
  [
    'Graduate level reading.',
    'Expect advanced college or professional comprehension.',
    'Among the most demanding readability levels.',
    'Written for highly educated specialist readers.',
  ],
];

export const GUNNING_INTROS = [
  'The Gunning Fog Index estimates years of formal education needed to read your text on first reading. It combines average sentence length with the share of words that have three or more syllables.',
  'Gunning Fog measures readability from sentence length and complex words, counting any word with three or more syllables as hard. Higher scores mean a higher US grade level.',
  'This formula asks how foggy the prose feels: long sentences plus a high percentage of polysyllabic words push the score up. Lower is easier.',
  'Where Flesch rewards short words and sentences, Gunning Fog specifically penalizes words with three or more syllables. It is a useful check on how dense your vocabulary reads.',
  'Gunning Fog is a US grade level estimate built from sentence length and the proportion of complex words in the text. Because it targets polysyllabic vocabulary, it often flags formal or technical writing.',
  'Developed by Robert Gunning in 1952, this index blends average sentence length with the percentage of words containing three or more syllables. Higher means harder reading.',
];

export const DIFFICULT_INTROS = [
  'Difficult words are longer, less familiar terms that readability formulas treat as harder to read. They usually have more syllables and sit outside a list of about 3,000 common English words.',
  'This count tracks words that formulas flag as hard: polysyllabic terms and vocabulary outside the familiar word list most readers know by late elementary school.',
  'Readability scores penalize difficult words because they slow readers down. These are the longer, less everyday terms the formulas notice in your text.',
  'Every difficult word here is one the formulas would count against readability: not on the familiar word list, and typically two syllables or more.',
];

function sentenceWord(n) {
  return n === 1 ? 'sentence' : 'sentences';
}

function runWord(n) {
  return n === 1 ? 'runs' : 'run';
}

export const SENTENCE_LENGTH_LONG = [
  (n, m) =>
    `Long sentences are the single biggest thing the formulas count against you. ${n} of your ${m} ${sentenceWord(m)} ${runWord(n)} long. Breaking them into shorter ones is the fastest way to read more clearly.`,
  (n, m) =>
    `Readability formulas punish long sentences harder than almost anything else. ${n} of your ${m} ${sentenceWord(m)} ${runWord(n)} long, so splitting a few would lift every score above.`,
  (n, m) =>
    `Sentence length is where most readability scores quietly suffer. ${n} of ${m} ${sentenceWord(m)} here ${runWord(n)} long. Shorter sentences are the quickest fix.`,
  (n, m) =>
    `The formulas fold sentence length into one number, but this is where it hurts. ${n} of your ${m} ${sentenceWord(m)} ${runWord(n)} long. Trim them and the text opens up.`,
  (n, m) =>
    `Long sentences slow readers and drag scores down together. ${n} of your ${m} ${sentenceWord(m)} ${runWord(n)} long. Breaking them apart is the most direct improvement you can make.`,
  (n, m) =>
    `If you want clearer writing fast, start with sentence length. ${n} of your ${m} ${sentenceWord(m)} ${runWord(n)} long. Shorter ones would help every formula above.`,
];

export const SENTENCE_LENGTH_OK = [
  'Your sentences are all a comfortable length. Nothing runs long enough to slow a reader down.',
  'Every sentence here stays within a comfortable range. Nothing is long enough to trip a reader up.',
  'Sentence length looks healthy throughout. Nothing runs so long that it would drag your scores down.',
];

function dominantPosNote(key) {
  if (key === 'noun') {
    return 'A very noun heavy text reads as static and formal, a verb heavy one reads as active and direct.';
  }
  if (key === 'verb') {
    return 'A verb heavy text reads as active and direct, a noun heavy one reads as static and formal.';
  }
  if (key === 'adjective') {
    return 'An adjective heavy text reads as descriptive and vivid, a verb heavy one reads as active and direct.';
  }
  return 'An adverb heavy text reads as careful about manner and tone, a verb heavy one reads as active and direct.';
}

export const POS_SUMMARY_TEMPLATES = [
  (d) =>
    `By a rough word tag, this text leans on ${d.dominant} and ${d.second} in a ${d.ratio} ratio. ${dominantPosNote(d.dominantKey)}`,
  (d) =>
    `Approximate tagging puts ${d.dominant} and ${d.second} ahead in about a ${d.ratio} mix. ${dominantPosNote(d.dominantKey)}`,
  (d) =>
    `Word tags are only approximate, but ${d.dominant} and ${d.second} lead here in roughly a ${d.ratio} ratio. ${dominantPosNote(d.dominantKey)}`,
  (d) =>
    `This rough pass over parts of speech shows ${d.dominant} and ${d.second} in about a ${d.ratio} ratio. ${dominantPosNote(d.dominantKey)}`,
  (d) =>
    `Tagging is approximate, yet ${d.dominant} and ${d.second} stand out in roughly a ${d.ratio} mix. ${dominantPosNote(d.dominantKey)}`,
];

export const REPEAT_HAS_TEMPLATES = [
  (n) =>
    `${n} content words show up more than once. Some repetition is natural, but the words below are the ones a reader will notice you leaning on.`,
  (n) =>
    `About ${n} content words repeat. A little echo is normal, yet the chips below are the ones readers are most likely to notice.`,
  (n) =>
    `${n} content words appear more than once here. Repetition can help rhythm, but the list below shows where you lean on the same ideas.`,
  (n) =>
    `Roughly ${n} content words repeat in this text. That is not always a problem, but the words below are the ones that stand out.`,
];

export const REPEAT_NONE_TEMPLATES = [
  'Almost no repetition. You are using a fresh word for nearly every idea.',
  'Very little repetition shows up. Most content words appear only once.',
  'Hardly any content words repeat. The vocabulary stays varied from line to line.',
  'Repetition is minimal. You reach for a new word for almost every idea.',
];

export const LEXICAL_DENSITY_TEMPLATES = [
  'Lexical density is the share of content words (nouns, verbs, adjectives, and adverbs) out of all words in the text. The rest are function words such as "the", "of", "and", and "it" that hold sentences together without carrying much meaning, so your percentage shows how much of the text is doing informational work. Higher density tends to read as more formal and demanding; lower density reads lighter and more conversational.',
  'This percentage measures how many words are content words (nouns, verbs, adjectives, adverbs) rather than function words like articles, prepositions, pronouns, and conjunctions. The number above is that share of your total word count. Higher density reads heavier and more formal; lower density spreads meaning across more glue words and reads more like speech.',
  'Lexical density counts content words (nouns, verbs, adjectives, adverbs) as a fraction of every word. Function words such as "the", "of", and "it" connect the sentence but add little meaning on their own, so your percentage shows how much of the text is content rather than glue. Dense phrasing such as "Breach exposed customer data" scores higher than a padded version with extra function words, and it tends to read more demanding; lower density feels lighter and more conversational.',
  'Lexical density is simply the percentage of content words among all words in your text. The remaining words are function words (articles, prepositions, pronouns, conjunctions) that keep prose flowing without much meaning of their own. Higher density packs more information into each content word and reads more formal; lower density leaves more room and reads lighter.',
];

export function rollCopyPicks(metrics, wordVariety) {
  const posSummary = wordVariety
    ? pick(POS_SUMMARY_TEMPLATES)(wordVariety.pos.dominant)
    : null;
  const repeatSummary =
    wordVariety && wordVariety.repeated.uniqueRepeatCount > 0
      ? pick(REPEAT_HAS_TEMPLATES)(wordVariety.repeated.uniqueRepeatCount)
      : pick(REPEAT_NONE_TEMPLATES);

  return {
    freIntro: pick(FRE_INTROS),
    cliIntro: pick(CLI_INTROS),
    daleIntro: pick(DALE_INTROS),
    gunningIntro: pick(GUNNING_INTROS),
    difficultIntro: pick(DIFFICULT_INTROS),
    sentenceLongLine: pick(SENTENCE_LENGTH_LONG),
    sentenceOkLine: pick(SENTENCE_LENGTH_OK),
    freReader: pick(FRE_READERS[metrics.fleschBand.index]),
    cliReader: pick(CLI_READERS[metrics.cliBucket]),
    gunningReader: pick(CLI_READERS[metrics.gunningBucket]),
    daleReader: pick(DALE_READERS[metrics.daleBand.index]),
    posSummary,
    repeatSummary,
    densityLine: pick(LEXICAL_DENSITY_TEMPLATES),
  };
}
