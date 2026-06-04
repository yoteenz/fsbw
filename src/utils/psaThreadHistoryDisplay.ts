import { PSA_STARTER_QUICK_REPLIES } from '../constants/psaConfig';
import { isPsaImmediateNavigateReply } from './psaQuickReplyNavigation';

export function psaNormalizeQuickReplyText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toUpperCase();
}

export function psaFirstLineOfText(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  return text.split(/\r?\n/)[0]!.replace(/\s+/g, ' ').trim();
}

function psaThreeWordUpperSummary(text: string): string {
  const words = text.replace(/\s+/g, ' ').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 3).join(' ').toUpperCase();
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

export function psaHistoryPreviewLine(firstUserMessage: string | null | undefined): string {
  return psaFirstLineOfText(firstUserMessage).toUpperCase();
}

export function psaActiveHistoryTitle(input: {
  title: string | null;
  firstUserMessage: string | null;
}): string {
  const customTitle = input.title?.trim();
  if (customTitle) return truncatePsaHistoryLine(customTitle).toUpperCase();
  const preview = psaFirstLineOfText(input.firstUserMessage);
  if (preview) return truncatePsaHistoryLine(preview).toUpperCase();
  return 'PSA CHAT';
}

export function psaArchivedHistoryTitle(input: {
  title: string | null;
  firstUserMessage: string | null;
  threadSummary: string | null;
}): string {
  if (isPsaQuickReplyFirstMessage(input.firstUserMessage)) {
    return 'QUICK REPLY';
  }
  const summary = input.threadSummary?.trim();
  if (summary) return psaThreeWordUpperSummary(summary);
  const title = input.title?.trim();
  if (title && !isPsaQuickReplyFirstMessage(title)) {
    return psaThreeWordUpperSummary(title);
  }
  const preview = psaFirstLineOfText(input.firstUserMessage);
  if (preview) return psaThreeWordUpperSummary(preview);
  return 'PSA CHAT';
}
