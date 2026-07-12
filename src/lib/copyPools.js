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

export const TEXT_STANDARD_INTROS = [
  'This is the consensus grade level across several different formulas, so it is a steadier single takeaway than any one score on its own.',
  'Multiple readability formulas voted on your text and this is where they agree. That makes it a more reliable summary than picking one score alone.',
  'Rather than trusting a single formula, this grade reflects agreement across several methods. It is usually the most stable number to share with others.',
  'Several independent readability formulas each produce a grade estimate. This string shows where they converge, which is why it works well as a headline number.',
  'Think of this as the average opinion of multiple readability tests. Because it blends several formulas, it tends to be more consistent than any individual score.',
  'This summary condenses several grade level estimates into one consensus reading level. It is often the best single number to quote.',
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

export function rollCopyPicks(metrics) {
  return {
    freIntro: pick(FRE_INTROS),
    cliIntro: pick(CLI_INTROS),
    daleIntro: pick(DALE_INTROS),
    textStandardIntro: pick(TEXT_STANDARD_INTROS),
    freReader: pick(FRE_READERS[metrics.fleschBand.index]),
    cliReader: pick(CLI_READERS[metrics.cliBucket]),
    daleReader: pick(DALE_READERS[metrics.daleBand.index]),
  };
}
