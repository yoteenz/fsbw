import { explainGuardianAlertById, queryOrganizationalGuardian } from './discovery-engine';
import { explainGuardianAlert, summarizeGuardian } from './dashboard-engine';
import {
  ensureOrganizationGuardianProfile,
  getOrganizationGuardianProfile,
  selectGuardianAlert,
} from './store';
import type { OrganizationalGuardianDockAdvice } from './types';

export function resolveOrganizationalGuardianAdvice(
  input: string,
  organizationId: string
): OrganizationalGuardianDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationGuardianProfile(organizationId) ?? ensureOrganizationGuardianProfile(organizationId);

  if (/organizational guardian|guardian alert|protect.*organization|executive advisor|guardian dashboard/i.test(trimmed)) {
    return {
      response: summarizeGuardian(profile),
      concierge: 'Chief Concierge',
      guardianScore: profile.guardianScore,
      activeAlerts: profile.activeAlerts,
    };
  }

  if (/profession brain.*inconsistent|workflow capacity|documentation.*declining|onboarding.*dropped|knowledge graph.*weakening/i.test(trimmed)) {
    const match = profile.alerts.find((a) => trimmed.toLowerCase().includes(a.domain.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      selectGuardianAlert(organizationId, match.id);
      return { response: explainGuardianAlert(match), concierge: 'Chief Concierge', activeAlerts: profile.activeAlerts };
    }
  }

  const explainMatch = trimmed.match(/explain (?:guardian|alert) (.+)/i);
  if (explainMatch) {
    const hits = queryOrganizationalGuardian(explainMatch[1], profile, 1);
    if (hits[0]?.type === 'alert') {
      return { response: explainGuardianAlertById(hits[0].id, profile) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryOrganizationalGuardian(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|guardian|alert/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      guardianScore: profile.guardianScore,
      activeAlerts: profile.activeAlerts,
    };
  }

  return null;
}

export function buildProactiveGuardianSuggestion(organizationId: string): string | null {
  const profile = getOrganizationGuardianProfile(organizationId);
  if (!profile) return null;
  return summarizeGuardian(profile);
}

export function buildGuardianOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationGuardianProfile(organizationId);
  return profile.dockGuardianLine;
}
