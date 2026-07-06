import { PRESERVE_MOMENT_PATTERNS } from './constants';
import type { PreserveMomentSuggestion } from './types';

export function detectPreserveMoments(input: string): PreserveMomentSuggestion | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  for (const { pattern, message } of PRESERVE_MOMENT_PATTERNS) {
    if (pattern.test(trimmed)) {
      let category: PreserveMomentSuggestion['category'] = 'historic-milestones';
      if (/launch/i.test(trimmed)) category = 'launch-campaigns';
      if (/first employee|first hire/i.test(trimmed)) category = 'historic-milestones';
      if (/customer|revenue|million/i.test(trimmed)) category = 'major-announcements';

      return {
        id: `moment-${Date.now()}`,
        message,
        suggestedTitle: trimmed.slice(0, 80),
        category,
        detectedAt: new Date().toISOString(),
      };
    }
  }

  return null;
}

export function listProactivePreserveMessages(legacyDepthScore: number): string[] {
  return [
    "Today's milestone may be worth preserving in the Legacy Vault™.",
    'Studio OS recognizes moments that become history — preserve the story, not just the files.',
    legacyDepthScore < 50
      ? 'Your Legacy Vault is growing — capture founding moments before they fade.'
      : 'Every significant milestone becomes part of permanent organizational history.',
  ];
}
