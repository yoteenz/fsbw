import { explainAutomation, queryAutomationRegistry } from './discovery-engine';
import { summarizeAutomationRegistry } from './engine-profile-builder';
import { filterExecutionsToday, filterFailedToday } from './execution-history';
import { listAutomationsByStatus } from './automation-catalog';
import {
  ensureOrganizationAutomationRegistryProfile,
  getOrganizationAutomationRegistryProfile,
  pauseAutomationsMatching,
} from './store';
import type { AutomationRegistryDockAdvice } from './types';

export function resolveAutomationRegistryAdvice(input: string, organizationId: string): AutomationRegistryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAutomationRegistryProfile(organizationId) ??
    ensureOrganizationAutomationRegistryProfile(organizationId);

  if (/automation registry|show my automations|my automations|registered automations/i.test(trimmed)) {
    return {
      response: summarizeAutomationRegistry(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/pause payroll|pause.*automation/i.test(trimmed)) {
    const dept = trimmed.toLowerCase().includes('payroll') ? 'payroll' : trimmed.match(/pause\s+(\w+)/i)?.[1]?.toLowerCase();
    if (dept) {
      pauseAutomationsMatching(organizationId, (_n, _c, d) => d.toLowerCase().includes(dept) || _n.toLowerCase().includes(dept));
      return {
        response: `Paused automations matching "${dept}". Review Automation Registry dashboard to resume.`,
        concierge: 'Chief Concierge',
        registryScore: profile.registryScore,
      };
    }
    return {
      response: `${profile.pausedCount} automations currently paused. Specify department to pause — e.g. "Pause payroll automations."`,
      concierge: 'Chief Concierge',
    };
  }

  if (/executed this morning|what ran today|what executed today/i.test(trimmed)) {
    const today = filterExecutionsToday(profile.executionHistory);
    return {
      response:
        today.length === 0
          ? 'No automations executed yet today.'
          : `Today: ${today.map((e) => `${e.automationName} (${e.status})`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/failed today|which automations failed|automation.*fail/i.test(trimmed)) {
    const failed = filterFailedToday(profile.executionHistory);
    const failedCatalog = listAutomationsByStatus('failed');
    const lines = [
      ...failed.map((e) => e.automationName),
      ...failedCatalog.map((a) => a.name),
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    return {
      response:
        lines.length === 0
          ? 'No automation failures today.'
          : `Failed: ${lines.join(' · ')}. Review Automation Registry execution history.`,
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/automate next|what can be automated|automation opportunity/i.test(trimmed)) {
    const recs = profile.recommendations.slice(0, 3);
    return {
      response: recs.map((r) => r.title).join(' · ') || 'Review Automation Registry recommendations dashboard.',
      concierge: 'Chief Concierge',
    };
  }

  if (/active automation|paused automation|pending approval/i.test(trimmed)) {
    const status = trimmed.includes('paused') ? 'paused' : trimmed.includes('pending') ? 'pending-approval' : 'active';
    const list = listAutomationsByStatus(status as Parameters<typeof listAutomationsByStatus>[0]).slice(0, 4);
    return {
      response: `${status}: ${list.map((a) => a.name).join(' · ') || 'none'}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/governance|hidden logic|transparent|who approved/i.test(trimmed)) {
    const warnings = profile.governanceFindings.filter((f) => f.severity !== 'info');
    return {
      response:
        warnings.length === 0
          ? 'All automations registered and transparent — nothing executes without registration.'
          : `${warnings.length} findings — ${warnings[0]?.recommendation ?? 'review Automation Registry.'}`,
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  const explainMatch = trimmed.match(/explain automation\s+(.+)/i);
  if (explainMatch) {
    const hits = queryAutomationRegistry(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainAutomation(hits[0].entry.automationId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryAutomationRegistry(trimmed, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.name} (${h.entry.status})`).join(' · '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  return null;
}

export function listAutomationRegistryDockSuggestions(_organizationId: string): string[] {
  return [
    'Show my automations.',
    'What executed this morning?',
    'Which automations failed today?',
    'What can be automated next?',
  ].slice(0, 4);
}

export function buildProactiveAutomationRegistrySuggestion(organizationId: string): string | null {
  const profile = getOrganizationAutomationRegistryProfile(organizationId);
  if (!profile) return null;
  return summarizeAutomationRegistry(profile);
}

export function buildAutomationRegistryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationAutomationRegistryProfile(organizationId);
  return profile.dockRegistryLine;
}
