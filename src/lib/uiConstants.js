export const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

export const ANALYSIS_DEBOUNCE_MS = 300;

export const SYLLABLE_COLORS = {
  2: '#92d8ff',
  3: '#ffe566',
  4: '#86eeb0',
};

export const POS_BUCKETS = [
  { key: 'noun', label: 'Nouns' },
  { key: 'verb', label: 'Verbs' },
  { key: 'adjective', label: 'Adjectives' },
  { key: 'adverb', label: 'Adverbs' },
  { key: 'other', label: 'Other' },
];

export const FRE_ROWS = [
  { range: '90–100', label: 'Very Easy', min: 90 },
  { range: '80–89', label: 'Easy', min: 80 },
  { range: '70–79', label: 'Fairly Easy', min: 70 },
  { range: '60–69', label: 'Standard', min: 60 },
  { range: '50–59', label: 'Fairly Difficult', min: 50 },
  { range: '30–49', label: 'Difficult', min: 30 },
  { range: '0–29', label: 'Very Confusing', min: 0 },
];

export const DALE_ROWS = [
  { range: '4.9 or lower', label: 'Grade 4 and below', match: (s) => s <= 4.9 },
  { range: '5.0 to 5.9', label: 'Grades 5 to 6', match: (s) => s >= 5.0 && s <= 5.9 },
  { range: '6.0 to 6.9', label: 'Grades 7 to 8', match: (s) => s >= 6.0 && s <= 6.9 },
  { range: '7.0 to 7.9', label: 'Grades 9 to 10', match: (s) => s >= 7.0 && s <= 7.9 },
  { range: '8.0 to 8.9', label: 'Grades 11 to 12', match: (s) => s >= 8.0 && s <= 8.9 },
  { range: '9.0 to 9.9', label: 'College', match: (s) => s >= 9.0 && s <= 9.9 },
  { range: '10.0 and up', label: 'College graduate', match: (s) => s >= 10.0 },
];

export const STACK_PACKAGES = [
  {
    name: 'text-readability',
    href: 'https://www.npmjs.com/package/text-readability',
    role: 'Flesch, Coleman-Liau, Dale-Chall, Gunning Fog, difficult words, syllable counts',
  },
  {
    name: 'sentence-splitter',
    href: 'https://www.npmjs.com/package/sentence-splitter',
    role: 'Sentence boundaries and length checks',
  },
  {
    name: 'compromise',
    href: 'https://www.npmjs.com/package/compromise',
    role: 'Approximate parts of speech, repetition, and lexical density',
  },
  {
    name: 'write-good',
    href: 'https://www.npmjs.com/package/write-good',
    role: 'Style flags in the AI prompt (passive voice, weasel words, wordiness)',
  },
  {
    name: 'Svelte',
    href: 'https://www.npmjs.com/package/svelte',
    role: 'Powers the live analysis UI',
  },
  {
    name: 'Vite',
    href: 'https://www.npmjs.com/package/vite',
    role: 'Build tooling. All analysis stays local in your browser',
  },
];

export const LINK_STYLE =
  'color:#3a3a3a;text-decoration:underline;text-underline-offset:2px';

export const FOOTER_LINK_STYLE =
  'color:#777;text-decoration:underline;text-underline-offset:2px';

export const FOOTER_ICON_LINK_STYLE =
  'color:#777;display:inline-flex;align-items:center;text-decoration:none;line-height:0';

export const H1_STYLE =
  'font-size:1.6rem;font-weight:700;margin:0 0 2rem;color:#212121';

export const H2_STYLE =
  'font-size:1.25rem;font-weight:700;margin:0 0 0.8rem;color:#212121';

export const PROSE_STYLE =
  'font-family:' +
  FONT +
  ';font-size:1rem;line-height:1.6;font-weight:400;color:#3a3a3a;margin:0 0 0.9rem';

export const PAGE_STYLE =
  'font-family:' +
  FONT +
  ';font-size:1.05rem;line-height:1.5;color:#212121;max-width:48rem;margin:0 auto;padding:3rem 1rem 5rem';

export const TEXTAREA_STYLE =
  'width:100%;min-height:220px;resize:vertical;display:block;background:#f5f7ff;border:1px solid #898ea4;border-radius:5px;padding:0.75rem 0.9rem;font:inherit;font-size:1rem;line-height:1.55;color:#212121';

export const BUTTON_STYLE =
  'padding:0.5rem 0.9rem;border:1px solid #898ea4;border-radius:5px;background:#fff;font-size:0.95rem;cursor:pointer;font-family:inherit;color:#212121';

export const IN_TEXT_BOX_STYLE =
  'white-space:normal;word-break:break-word;font-size:1rem;line-height:1.9;padding:1rem 1.1rem;border:1px solid #d9d9d9;border-radius:5px;color:#212121';

export const SECTION_GAP_FIRST = 'padding-top:1.6rem';
export const SECTION_GAP = 'padding-top:2.8rem';
