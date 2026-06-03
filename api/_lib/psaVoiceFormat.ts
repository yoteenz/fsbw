/**
 * Normalize PSA member-facing copy — strip typical AI punctuation habits.
 */
export function formatPsaVoiceText(text: string): string {
  if (!text) return text;

  let out = text
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/,\s+and\b/gi, ' and');

  out = out.replace(/,\s*,+/g, ',').replace(/\s{2,}/g, ' ').trim();

  return out;
}
