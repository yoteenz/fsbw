import { listModulesRequiringUpdate } from './configuration-engine';
import { explainRuntimeComponent, queryWorkspaceRuntime } from './discovery-engine';
import { summarizeWorkspaceRuntime } from './engine-profile-builder';
import { detectIncreasedActivity } from './health-engine';
import { isDevelopmentReady, isTestingHealthy } from './sandbox-engine';
import {
  ensureOrganizationWorkspaceRuntimeProfile,
  getOrganizationWorkspaceRuntimeProfile,
} from './store';
import type { WorkspaceRuntimeDockAdvice } from './types';

export function resolveWorkspaceRuntimeAdvice(input: string, organizationId: string): WorkspaceRuntimeDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationWorkspaceRuntimeProfile(organizationId) ??
    ensureOrganizationWorkspaceRuntimeProfile(organizationId);

  if (/workspace runtime|organization runtime|digital headquarters|isolated runtime/i.test(trimmed)) {
    return {
      response: summarizeWorkspaceRuntime(profile),
      concierge: 'Chief Concierge',
      runtimeScore: profile.runtimeScore,
    };
  }

  if (/development workspace.*ready|dev workspace ready|development environment/i.test(trimmed)) {
    const ready = isDevelopmentReady();
    return {
      response: ready
        ? 'Your development workspace is ready — safe to test automations, policies, and modules.'
        : 'Development workspace initializing — sync Workspace Runtime.',
      concierge: 'Chief Concierge',
    };
  }

  if (/modules require updates|module updates|three modules/i.test(trimmed)) {
    const modules = listModulesRequiringUpdate();
    return {
      response:
        profile.modulesRequiringUpdate === 0
          ? 'All runtime modules synced.'
          : `${profile.modulesRequiringUpdate} modules require updates: ${modules.join(' · ')}.`,
      concierge: 'Chief Concierge',
      runtimeScore: profile.runtimeScore,
    };
  }

  if (/testing environment.*healthy|testing sandbox|is testing healthy/i.test(trimmed)) {
    const healthy = isTestingHealthy();
    return {
      response: healthy
        ? 'Testing environment is healthy — ready for automation and policy validation.'
        : 'Testing environment degraded — review Runtime Health dashboard.',
      concierge: 'Chief Concierge',
    };
  }

  if (/increased runtime activity|runtime activity|automation load/i.test(trimmed)) {
    const increased = detectIncreasedActivity(profile.healthMetrics);
    return {
      response: increased
        ? "I've detected increased runtime activity — automation load and AI requests trending up. Review Runtime Health."
        : 'Runtime activity stable — no unusual load detected.',
      concierge: 'Chief Concierge',
    };
  }

  if (/sandbox|production|preview|training environment/i.test(trimmed)) {
    const env = profile.sandboxes.find((s) => trimmed.includes(s.environment)) ?? profile.sandboxes[0];
    return {
      response: `${env?.label ?? 'Production'}: ${env?.status ?? 'healthy'} — ${env?.description ?? 'isolated sandbox.'}`,
      concierge: 'Chief Concierge',
    };
  }

  if (/isolation|cross.?org|leak|never interfere/i.test(trimmed)) {
    return {
      response: `${profile.isolationScorePct}% isolation — organizations share the platform, never the runtime. ${profile.isolationFindings[0]?.message ?? ''}`,
      concierge: 'Chief Concierge',
      runtimeScore: profile.runtimeScore,
    };
  }

  if (/runtime health|health dashboard|performance|memory usage/i.test(trimmed)) {
    const top = profile.healthMetrics.slice(0, 3).map((m) => `${m.label} ${m.scorePct}%`);
    return {
      response: `Runtime Health ${profile.healthDashboardScore}% — ${top.join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/configuration|feature flags|ai provider|brand identity/i.test(trimmed)) {
    const cfg = profile.configuration.slice(0, 4).map((c) => c.label);
    return {
      response: `Runtime config (org-scoped): ${cfg.join(' · ')} — never affects other organizations.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain (?:runtime|component)\s+(.+)/i);
  if (explainMatch) {
    const hits = queryWorkspaceRuntime(explainMatch[1], 1);
    if (hits[0]?.type === 'component') {
      return {
        response: explainRuntimeComponent(hits[0].id) ?? hits[0].label,
        concierge: 'Chief Concierge',
      };
    }
  }

  const hits = queryWorkspaceRuntime(trimmed, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => h.label).join(' · '),
      concierge: 'Chief Concierge',
      runtimeScore: profile.runtimeScore,
    };
  }

  return null;
}

export function listWorkspaceRuntimeDockSuggestions(_organizationId: string): string[] {
  return [
    'Your development workspace is ready.',
    'Three modules require updates.',
    'Testing environment is healthy.',
    "I've detected increased runtime activity.",
  ].slice(0, 4);
}

export function buildProactiveWorkspaceRuntimeSuggestion(organizationId: string): string | null {
  const profile = getOrganizationWorkspaceRuntimeProfile(organizationId);
  if (!profile) return null;
  return summarizeWorkspaceRuntime(profile);
}

export function buildWorkspaceRuntimeOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationWorkspaceRuntimeProfile(organizationId);
  return profile.dockRuntimeLine;
}
