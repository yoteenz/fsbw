/**
 * Normalize PSA member-facing copy for chat display — mirrors `api/_lib/psaVoiceFormat.ts`.
 */
export type FormatPsaVoiceOptions = {
  /** When false, keep leading Welcome / I'm your PSA (welcome bubble only). */
  stripGreeting?: boolean;
  /** When false, keep source casing (default uppercases for chat UI). */
  uppercase?: boolean;
};

/** Remove markdown emphasis — PSA chat is plain voice, not markdown. */
function stripMarkdownEmphasis(text: string): string {
  let out = text;
  for (let i = 0; i < 8; i += 1) {
    const next = out.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');
    if (next === out) break;
    out = next;
  }
  return out.replace(/\*([^*\n]+)\*/g, '$1').replace(/_([^_\n]+)_/g, '$1');
}

/** UI welcome bubble already greets — follow-up replies should not repeat it. */
export function stripRedundantPsaGreeting(text: string): string {
  let out = text.trim();
  out = out.replace(
    /^(?:welcome(?:\s+back)?,?\s+[\w'-]+!\s*)+(?:i'?m your psa[.!]?\s*)+/i,
    ''
  );
  out = out.replace(/^i'?m your psa[.!]?\s*/i, '');
  return out.trim();
}

/** Collapse inline spaces but keep paragraph and list line breaks. */
function normalizePsaChatWhitespace(text: string): string {
  let out = text.replace(/,\s*,+/g, ',');
  out = out
    .split('\n')
    .map((line) => line.replace(/[^\S\n]+/g, ' ').trim())
    .join('\n');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

export function formatPsaVoiceText(text: string, options?: FormatPsaVoiceOptions): string {
  if (!text) return text;

  const stripGreeting = options?.stripGreeting !== false;
  const uppercase = options?.uppercase !== false;

  let out = stripMarkdownEmphasis(text)
    .replace(/\s*[\u2014\u2013]\s*/g, ', ')
    .replace(/,\s+and\b/gi, ' and');

  if (stripGreeting) {
    out = stripRedundantPsaGreeting(out);
  }

  out = normalizePsaChatWhitespace(out);

  return uppercase ? out.toUpperCase() : out;
}
