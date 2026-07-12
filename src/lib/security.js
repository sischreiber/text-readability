const HARMFUL_PATTERNS = [
  /<script\b/i,
  /<\/script>/i,
  /javascript:/i,
  /vbscript:/i,
  /on\w+\s*=/i,
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /<link\b/i,
  /<meta\b/i,
  /data:text\/html/i,
  /<\?php/i,
  /<%/,
  /\beval\s*\(/i,
  /\bdocument\.(cookie|write|domain)\b/i,
  /\bwindow\.(location|open)\b/i,
  /\blocalStorage\b/i,
  /\bsessionStorage\b/i,
];

const CODE_LINE_PATTERN =
  /(?:^|\s)(?:function|const|let|var|import|export|class|return|if|else|for|while|switch|#include|def |public |private |package |using |SELECT |INSERT |UPDATE |DELETE |<!DOCTYPE)/i;

const CODE_SYMBOL_DENSITY = /[{}();[\]<>]=/g;

export function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '');
}

export function removeControlChars(text) {
  return text.replace(/\0/g, '').replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function sanitizePastedText(text) {
  return removeControlChars(stripHtml(text)).trimEnd();
}

export function containsHarmfulContent(text) {
  return HARMFUL_PATTERNS.some((pattern) => pattern.test(text));
}

export function looksLikeCode(text) {
  const trimmed = text.trim();
  if (trimmed.length < 24) return false;

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 3) return false;

  const codeLikeLines = lines.filter(
    (line) => CODE_LINE_PATTERN.test(line) || (line.match(CODE_SYMBOL_DENSITY) ?? []).length >= 4,
  ).length;

  return codeLikeLines / lines.length >= 0.45;
}

export function evaluatePasteSecurity(text) {
  const sanitized = sanitizePastedText(text);

  if (!sanitized.trim()) {
    return { allowed: true, sanitized, reason: null };
  }

  if (containsHarmfulContent(text) || containsHarmfulContent(sanitized)) {
    return { allowed: false, sanitized, reason: 'harmful' };
  }

  if (looksLikeCode(sanitized)) {
    return { allowed: false, sanitized, reason: 'code' };
  }

  return { allowed: true, sanitized, reason: null };
}
