import { franc } from 'franc-min';

/** @typedef {'eng' | 'deu' | 'und'} DetectedLanguage */

/**
 * @param {string} text
 * @returns {DetectedLanguage}
 */
export function detectLanguage(text) {
  const trimmed = text.trim();
  if (trimmed.length < 10) return 'und';

  const code = franc(trimmed, { only: ['eng', 'deu'], minLength: 10 });
  if (code === 'eng' || code === 'deu') return code;
  return 'und';
}
