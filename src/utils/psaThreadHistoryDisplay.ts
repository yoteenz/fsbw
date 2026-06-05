import { PSA_STARTER_QUICK_REPLIES } from '../constants/psaConfig';
import { isPsaImmediateNavigateReply } from './psaQuickReplyNavigation';

const PSA_HISTORY_TOPIC_MAX_WORDS = 4;

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'between',
  'can',
  'could',
  'do',
  'does',
  'for',
  'from',
  'help',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'please',
  'should',
  'tell',
  'that',
  'the',
  'this',
  'to',
  'what',
  'whats',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'would',
  'you',
  'your',
]);

const UNIT_PHRASES: { pattern: RegExp; label: string }[] = [
  { pattern: /\bsoft[\s-]?wave\b/i, label: 'SOFT WAVE' },
  { pattern: /\bbeach[\s-]?wave\b/i, label: 'BEACH WAVE' },
  { pattern: /\bsoft[\s-]?curl\b/i, label: 'SOFT CURL' },
  { pattern: /\bocean[\s-]?curl\b/i, label: 'OCEAN CURL' },
  { pattern: /\bnoir\b/i, label: 'NOIR' },
  { pattern: /\bblanco\b/i, label: 'BLANCO' },
];

const TOPIC_PHRASES: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(jet\s*black|off\s*black|color|colour|swatch|shade|tone)\b/i, label: 'COLOR' },
  { pattern: /\b(difference|compare|comparison|versus|\bvs\b)\b/i, label: 'COMPARISON' },
  { pattern: /\b(install|installation|appointment)\b/i, label: 'INSTALL' },
  { pattern: /\b(consult|consultation)\b/i, label: 'CONSULT' },
  { pattern: /\b(book|booking)\b/i, label: 'BOOKING' },
  { pattern: /\b(track|tracking|status)\b/i, label: 'TRACKING' },
  { pattern: /\b(order|orders)\b/i, label: 'ORDER' },
  { pattern: /\b(length|density|lace|hairline|styling|texture|cap)\b/i, label: '' },
  { pattern: /\b(price|cost|pricing)\b/i, label: 'PRICING' },
  { pattern: /\b(stock|restock|available|sold\s*out)\b/i, label: 'STOCK' },
  { pattern: /\b(membership|premium|rewards|subscribe)\b/i, label: 'MEMBERSHIP' },
  { pattern: /\b(wishlist|bag|cart)\b/i, label: 'BAG' },
  { pattern: /\b(return|exchange|refund)\b/i, label: 'RETURN' },
  { pattern: /\b(care|wash|maintain)\b/i, label: 'CARE' },
];

export function psaNormalizeQuickReplyText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toUpperCase();
}

export function psaFirstLineOfText(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  return text.split(/\r?\n/)[0]!.replace(/\s+/g, ' ').trim();
}

export function psaShortTopicSummary(text: string, maxWords = PSA_HISTORY_TOPIC_MAX_WORDS): string {
  const words = text.replace(/\s+/g, ' ').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ').toUpperCase();
}

export function truncatePsaHistoryLine(text: string, max = 72): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

export function isPsaQuickReplyFirstMessage(text: string | null | undefined): boolean {
  const line = psaFirstLineOfText(text);
  if (!line) return false;
  const normalized = psaNormalizeQuickReplyText(line);
  const normalizedPlain = normalized.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  for (const chip of PSA_STARTER_QUICK_REPLIES) {
    const chipNorm = psaNormalizeQuickReplyText(chip);
    if (chipNorm === normalized) return true;
    const chipPlain = chipNorm.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (chipPlain && chipPlain === normalizedPlain) return true;
  }
  return isPsaImmediateNavigateReply(line);
}

function tokenizeForTopic(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/-/g, ' '))
    .join(' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function pushTopicWord(words: string[], word: string): void {
  const upper = word.toUpperCase();
  if (!upper || words.includes(upper)) return;
  if (words.length >= PSA_HISTORY_TOPIC_MAX_WORDS) return;
  words.push(upper);
}

/** Short topic line (≤4 words) for history card black title from a user message. */
export function psaTopicTitleFromUserMessage(text: string | null | undefined): string {
  const line = psaFirstLineOfText(text);
  if (!line) return 'PSA CHAT';

  const lower = line.toLowerCase();
  const words: string[] = [];

  for (const { pattern, label } of UNIT_PHRASES) {
    if (pattern.test(lower)) {
      for (const part of label.split(' ')) pushTopicWord(words, part);
      break;
    }
  }

  if (
    /\b(difference|compare|comparison|versus|\bvs\b)\b/i.test(lower) &&
    /\b(color|colour|black|jet|off|swatch|shade)\b/i.test(lower)
  ) {
    pushTopicWord(words, 'COLOR');
    pushTopicWord(words, 'COMPARISON');
  } else {
    for (const { pattern, label } of TOPIC_PHRASES) {
      if (!label) continue;
      if (pattern.test(lower)) pushTopicWord(words, label);
    }
  }

  for (const token of tokenizeForTopic(line)) {
    pushTopicWord(words, token);
    if (words.length >= PSA_HISTORY_TOPIC_MAX_WORDS) break;
  }

  if (words.length > 0) return words.slice(0, PSA_HISTORY_TOPIC_MAX_WORDS).join(' ');
  return psaShortTopicSummary(line);
}

function psaTopicFromThreadSummary(summary: string | null | undefined): string | null {
  if (!summary?.trim()) return null;
  const match = summary.match(/Opening question:\s*(.+?)(?:\n|$)/i);
  if (!match?.[1]?.trim()) return null;
  const topic = psaTopicTitleFromUserMessage(match[1]);
  return topic === 'PSA CHAT' ? null : topic;
}

function isAutoThreadTitle(title: string, firstUserMessage: string | null): boolean {
  const preview = psaFirstLineOfText(firstUserMessage);
  if (!preview) return false;
  const normalizedPreview = preview.replace(/\s+/g, ' ').trim();
  const normalizedTitle = title.replace(/\s+/g, ' ').trim();
  if (normalizedTitle.toUpperCase() === normalizedPreview.toUpperCase()) return true;
  return normalizedTitle.toUpperCase() === truncatePsaHistoryLine(normalizedPreview, 72).toUpperCase();
}

export function psaHistoryPreviewLine(firstUserMessage: string | null | undefined): string {
  return psaFirstLineOfText(firstUserMessage).toUpperCase();
}

/** Black header on PSA history cards — quick reply label or ≤4-word topic. */
export function psaHistoryCardTitle(input: {
  title: string | null;
  firstUserMessage: string | null;
  threadSummary?: string | null;
}): string {
  if (isPsaQuickReplyFirstMessage(input.firstUserMessage)) {
    return 'QUICK REPLY';
  }

  const customTitle = input.title?.trim();
  if (customTitle && !isAutoThreadTitle(customTitle, input.firstUserMessage)) {
    return psaShortTopicSummary(customTitle);
  }

  const fromSummary = psaTopicFromThreadSummary(input.threadSummary);
  if (fromSummary) return fromSummary;

  const preview = psaFirstLineOfText(input.firstUserMessage);
  if (preview) return psaTopicTitleFromUserMessage(preview);

  return 'PSA CHAT';
}

/** @deprecated Use psaHistoryCardTitle — same behavior for active + archived lists. */
export function psaActiveHistoryTitle(input: {
  title: string | null;
  firstUserMessage: string | null;
  threadSummary?: string | null;
}): string {
  return psaHistoryCardTitle(input);
}

/** @deprecated Use psaHistoryCardTitle — same behavior for active + archived lists. */
export function psaArchivedHistoryTitle(input: {
  title: string | null;
  firstUserMessage: string | null;
  threadSummary: string | null;
}): string {
  return psaHistoryCardTitle(input);
}
