const weasels = [
  'are a number',
  'clearly',
  'completely',
  'exceedingly',
  'excellent',
  'extremely',
  'fairly',
  'few',
  'huge',
  'interestingly',
  'is a number',
  'largely',
  'many',
  'mostly',
  'obviously',
  'quite',
  'relatively',
  'remarkably',
  'several',
  'significantly',
  'substantially',
  'surprisingly',
  'tiny',
  'various',
  'vast',
  'very',
];

const exceptions = ['many', 'few'];

const re = new RegExp(`\\b(${weasels.join('|')})\\b`, 'gi');

export default function weaselWords(text) {
  const suggestions = [];
  let match;

  while ((match = re.exec(text)) !== null) {
    const weasel = match[0].toLowerCase();
    if (
      exceptions.indexOf(weasel) === -1 ||
      text.substr(match.index - 4, 4) !== 'too '
    ) {
      suggestions.push({
        index: match.index,
        offset: weasel.length,
      });
    }
  }

  return suggestions;
}
