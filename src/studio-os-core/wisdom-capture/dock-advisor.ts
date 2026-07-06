import {
  ensureOrganizationWisdomProfile,
  getOrganizationWisdomProfile,
  preserveWisdomEntry,
  queueWisdomDetection,
  searchOrganizationWisdom,
} from './store';
import { detectWisdomInText } from './wisdom-detector';
import type { WisdomCaptureDockAdvice } from './types';

export function resolveWisdomCaptureAdvice(
  input: string,
  organizationId: string
): WisdomCaptureDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationWisdomProfile(organizationId) ?? ensureOrganizationWisdomProfile(organizationId);

  const detection = detectWisdomInText(trimmed);
  if (detection) {
    queueWisdomDetection(organizationId, trimmed);
    return {
      response: `${detection.prompt}\n\n"${detection.extractedWisdom.slice(0, 120)}"\n\nReply "preserve wisdom" to save to the Wisdom Library forever.`,
      concierge: 'Chief Concierge',
      detection,
      wisdomCount: profile.totalWisdomCaptured,
    };
  }

  if (/wisdom library|organizational wisdom|search wisdom|find wisdom|wisdom capture/i.test(trimmed)) {
    const results = searchOrganizationWisdom(organizationId, trimmed.replace(/wisdom library|search|find/gi, '').trim());
    const top = results[0];
    return {
      response: top
        ? `Wisdom Library: ${profile.totalWisdomCaptured} entries. Top match: "${top.wisdom.slice(0, 100)}" — ${top.whyItMatters.slice(0, 80)}`
        : `Wisdom Library: ${profile.totalWisdomCaptured} entries preserved. Wisdom depth ${profile.wisdomDepthScore}%.`,
      concierge: 'Chief Concierge',
      wisdomCount: profile.totalWisdomCaptured,
    };
  }

  if (/preserve wisdom|save wisdom|yes preserve/i.test(trimmed)) {
    const pending = profile.pendingDetections.find((p) => p.status === 'pending');
    if (pending) {
      preserveWisdomEntry(organizationId, {
        wisdom: pending.extractedWisdom,
        category: pending.suggestedCategory,
        sourceText: pending.sourceText,
        pendingId: pending.id,
      });
      return {
        response: `Organizational Wisdom preserved forever. "${pending.extractedWisdom.slice(0, 100)}" — synced to Memory Engine and learning targets.`,
        concierge: 'Chief Concierge',
        wisdomCount: profile.totalWisdomCaptured + 1,
      };
    }
    return {
      response: 'No pending wisdom detection — share a lesson using phrases like "I learned…" or "Next time…"',
      concierge: 'Chief Concierge',
      wisdomCount: profile.totalWisdomCaptured,
    };
  }

  if (/how much wisdom|wisdom depth|lessons preserved/i.test(trimmed)) {
    return {
      response: `${profile.totalWisdomCaptured} wisdom entries · depth ${profile.wisdomDepthScore}% · ${profile.pendingDetections.filter((p) => p.status === 'pending').length} pending capture(s). Processes explain what; wisdom explains why.`,
      concierge: 'Chief Concierge',
      wisdomCount: profile.totalWisdomCaptured,
    };
  }

  return null;
}

export function listWisdomCaptureDockSuggestions(organizationId: string): string[] {
  ensureOrganizationWisdomProfile(organizationId);
  const profile = getOrganizationWisdomProfile(organizationId);

  const suggestions = [
    'I learned that onboarding friction destroys trust before scale.',
    'Search the Wisdom Library for customer experience lessons.',
    'How much organizational wisdom have we preserved?',
  ];

  if (profile?.pendingDetections.some((p) => p.status === 'pending')) {
    suggestions.unshift('Preserve wisdom — yes preserve');
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveWisdomSuggestion(organizationId: string): string | null {
  const profile = getOrganizationWisdomProfile(organizationId);
  if (!profile) return null;

  const pending = profile.pendingDetections.find((p) => p.status === 'pending');
  if (pending) {
    return `Wisdom detected: "${pending.extractedWisdom.slice(0, 70)}…" — ${pending.prompt}`;
  }

  if (profile.wisdomDepthScore < 40) {
    return `Wisdom depth ${profile.wisdomDepthScore}% — preserve small lessons before they fade. Try: "I learned…" or "Next time…"`;
  }

  const recent = profile.wisdomLibrary[0];
  if (recent) {
    return `${profile.totalWisdomCaptured} lessons preserved — latest: "${recent.wisdom.slice(0, 60)}…" Processes explain what; wisdom explains why.`;
  }

  return 'Wisdom Capture™ — no important lesson should ever be forgotten.';
}

/** Check any founder input for wisdom — used by Command Dock before routing. */
export function interceptWisdomDetection(input: string, organizationId: string): WisdomCaptureDockAdvice | null {
  const detection = detectWisdomInText(input);
  if (!detection) return null;
  queueWisdomDetection(organizationId, input);
  const profile = getOrganizationWisdomProfile(organizationId);
  return {
    response: `${detection.prompt}\n\n"${detection.extractedWisdom}"\n\nSay "preserve wisdom" to add to the Wisdom Library.`,
    concierge: 'Chief Concierge',
    detection,
    wisdomCount: profile?.totalWisdomCaptured ?? 0,
  };
}
