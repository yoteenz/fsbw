import { PSA_STARTER_QUICK_REPLIES } from '../constants/psaConfig';
import { isPsaImmediateNavigateReply } from './psaQuickReplyNavigation';

const STARTER_QUICK_REPLY_SET = new Set(
  PSA_STARTER_QUICK_REPLIES.map((chip) => chip.toUpperCase())
);

export function psaFirstLineOfText(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  return text.split(/\r?\n/)[0]!.replace(/\s+/g, ' ').trim();
}

export function truncatePsaHistoryLine(text: string, max = 72): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

export function isPsaQuickReplyFirstMessage(text: string | null | undefined): boolean {
  const line = psaFirstLineOfText(text);
  if (!line) return false;
  const upper = line.toUpperCase();
  if (STARTER_QUICK_REPLY_SET.has(upper)) return true;
  return isPsaImmediateNavigateReply(line);
}

export function psaHistoryPreviewLine(firstUserMessage: string | null | undefined): string {
  return psaFirstLineOfText(firstUserMessage);
}

export function psaActiveHistoryTitle(input: {
  title: string | null;
  firstUserMessage: string | null;
}): string {
  const customTitle = input.title?.trim();
  if (customTitle) return truncatePsaHistoryLine(customTitle);
  const preview = psaFirstLineOfText(input.firstUserMessage);
  if (preview) return truncatePsaHistoryLine(preview);
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
  if (summary) return truncatePsaHistoryLine(summary);
  const title = input.title?.trim();
  if (title) return truncatePsaHistoryLine(title);
  const preview = psaFirstLineOfText(input.firstUserMessage);
  if (preview) return truncatePsaHistoryLine(preview);
  return 'PSA CHAT';
}
