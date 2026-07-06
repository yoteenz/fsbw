import { explainHealingIssue, querySelfHealingEngine } from './discovery-engine';
import { summarizeSelfHealing } from './repair-engine';
import {
  approveRepair,
  ensureOrganizationSelfHealingEngineProfile,
  getOrganizationSelfHealingEngineProfile,
} from './store';
import type { SelfHealingEngineDockAdvice } from './types';

export function resolveSelfHealingEngineAdvice(
  input: string,
  organizationId: string
): SelfHealingEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationSelfHealingEngineProfile(organizationId) ??
    ensureOrganizationSelfHealingEngineProfile(organizationId);

  if (/self.?heal|resilien|auto.?repair|recovery plan|recovery center|healing engine/i.test(trimmed)) {
    return {
      response: summarizeSelfHealing(profile),
      concierge: 'Chief Concierge',
      resilienceScore: profile.resilienceScore,
      pendingApprovals: profile.pendingApprovals,
    };
  }

  if (/approve repair|fix broken link|heal inactive automation/i.test(trimmed)) {
    const pending = profile.issues.find((i) => i.status === 'pending-approval');
    if (pending) {
      approveRepair(organizationId, pending.id);
      return {
        response: `Approved repair for "${pending.title}" — ${pending.rootCause.slice(0, 80)}… Rollback available via audit log.`,
        concierge: 'Chief Concierge',
      };
    }
  }

  const explainMatch = trimmed.match(/explain (?:issue|repair|healing) (.+)/i);
  if (explainMatch) {
    const hits = querySelfHealingEngine(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'issue') {
      return { response: explainHealingIssue(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = querySelfHealingEngine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|what.*broken/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      resilienceScore: profile.resilienceScore,
      pendingApprovals: profile.pendingApprovals,
    };
  }

  return null;
}

export function buildProactiveSelfHealingSuggestion(organizationId: string): string | null {
  const profile = getOrganizationSelfHealingEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeSelfHealing(profile);
}

export function buildSelfHealingOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationSelfHealingEngineProfile(organizationId);
  return profile.dockSelfHealingLine;
}
