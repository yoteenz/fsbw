import { whoCanPublishCampaigns } from './capability-catalog';
import { explainCapability, queryPermissionEngine, whoCanPerform } from './discovery-engine';
import { summarizePermissionEngine } from './engine-profile-builder';
import { filterAuditThisWeek, grantTemporaryAccess } from './audit-history';
import { checkAccess } from './registration';
import {
  appendPermissionAuditRecord,
  ensureOrganizationPermissionEngineProfile,
  getOrganizationPermissionEngineProfile,
} from './store';
import type { PermissionEngineDockAdvice, RoleProfileId } from './types';

export function resolvePermissionEngineAdvice(input: string, organizationId: string): PermissionEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPermissionEngineProfile(organizationId) ??
    ensureOrganizationPermissionEngineProfile(organizationId);

  if (/permission engine|show.*permissions|capability-based|who can do what/i.test(trimmed)) {
    return {
      response: summarizePermissionEngine(profile),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/who can publish|publish marketing|marketing campaigns/i.test(trimmed)) {
    const who = whoCanPublishCampaigns();
    return {
      response: `Can publish campaigns: ${who.map((r) => r.label).join(' · ')}. Requires campaigns.publish capability + Policy Engine approval chain.`,
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  if (/temporarily grant|grant.*access.*days|finance access/i.test(trimmed)) {
    const days = trimmed.match(/(\d+)\s*days?/)?.[1] ?? '2';
    const record = grantTemporaryAccess(
      organizationId,
      'Founder',
      'Finance Analyst',
      'financials.view-financials',
      `Temporary delegation for ${days} days from Command Dock`
    );
    appendPermissionAuditRecord(organizationId, record);
    return {
      response: `Granted Finance access for ${days} days to Finance Analyst. Logged to Permission Audit — expires automatically.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/why can't.*approve|can't approve|cannot approve invoices/i.test(trimmed)) {
    const roleMatch = trimmed.match(/employee|contractor|marketing|manager|guest/i);
    const roleId = (roleMatch?.[0]?.toLowerCase() ?? 'contractor') as RoleProfileId;
    const check = checkAccess(roleId, 'invoices.approve', { requiredDepartment: 'Finance', department: roleId === 'manager' ? 'Finance' : 'Marketing' });
    return {
      response: check.allowed ? 'Employee may approve invoices within current context.' : check.explanation,
      concierge: 'Chief Concierge',
    };
  }

  if (/permission changes.*week|changes this week|audit this week/i.test(trimmed)) {
    const week = filterAuditThisWeek(profile.auditHistory);
    return {
      response:
        week.length === 0
          ? 'No permission changes this week.'
          : `This week: ${week.map((a) => `${a.eventType} — ${a.targetUser ?? a.actor} (${a.reason.slice(0, 40)})`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/approval chain|delegated authority|who approved/i.test(trimmed)) {
    const pending = profile.approvalChains.filter((c) => c.status === 'pending' || c.status === 'escalated');
    return {
      response:
        pending.length === 0
          ? `${profile.approvalChains.length} approval chains on record — all traceable.`
          : `Pending: ${pending.map((c) => `${c.action} (${c.currentStep})`).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/contextual|business hours|delegation|emergency mode/i.test(trimmed)) {
    const active = profile.contextualRules.filter((r) => r.active);
    return {
      response: `${active.length} active contextual rules: ${active.slice(0, 4).map((r) => r.label).join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/role composition|founder role|marketing role|customize role/i.test(trimmed)) {
    const roles = profile.roles.slice(0, 5).map((r) => `${r.label} (${r.capabilityIds.length} caps)`);
    return {
      response: `Roles: ${roles.join(' · ')}. Every role customizable except Founder full access.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain (?:capability|permission)\s+(.+)/i);
  if (explainMatch) {
    const hits = queryPermissionEngine(explainMatch[1], 1);
    if (hits[0]?.type === 'capability') {
      const cap = hits[0].entry;
      return {
        response: explainCapability(cap.capabilityId) ?? cap.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  if (/who can (view|create|edit|approve|publish)/i.test(trimmed)) {
    const verbMatch = trimmed.match(/who can (\w+)/i)?.[1];
    if (verbMatch) {
      const roles = whoCanPerform(verbMatch);
      return {
        response: roles.map((r) => r.label).join(' · ') || 'No roles with that capability.',
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryPermissionEngine(trimmed, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits
        .map((h) => (h.type === 'capability' ? h.entry.name : h.type === 'role' ? h.entry.label : ''))
        .filter(Boolean)
        .join(' · '),
      concierge: 'Chief Concierge',
      engineScore: profile.engineScore,
    };
  }

  return null;
}

export function listPermissionEngineDockSuggestions(_organizationId: string): string[] {
  return [
    'Who can publish marketing campaigns?',
    'Temporarily grant Finance access for two days.',
    "Why can't this employee approve invoices?",
    'Show permission changes from this week.',
  ].slice(0, 4);
}

export function buildProactivePermissionEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPermissionEngineProfile(organizationId);
  if (!profile) return null;
  return summarizePermissionEngine(profile);
}

export function buildPermissionEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPermissionEngineProfile(organizationId);
  return profile.dockPermissionLine;
}
