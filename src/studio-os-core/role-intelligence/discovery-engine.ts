import { ROLE_TEMPLATE_LABELS } from './constants';
import { explainRoleById, getSelectedRole } from './role-builder';
import type { OrganizationRoleIntelligenceProfile, RoleIntelligenceSearchHit } from './types';

export function queryRoleIntelligence(
  query: string,
  profile: OrganizationRoleIntelligenceProfile,
  limit = 8
): RoleIntelligenceSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: RoleIntelligenceSearchHit[] = [];

  for (const role of profile.roles) {
    const hay = [
      role.title,
      role.displayTitle,
      role.department,
      role.actualWorkSummary,
      ...role.responsibilities,
      ...role.requiredSkills,
    ]
      .join(' ')
      .toLowerCase();

    if (hay.includes(q) || Object.values(ROLE_TEMPLATE_LABELS).some((label) => label.toLowerCase().includes(q) && role.title === label)) {
      hits.push({
        type: 'role',
        id: role.id,
        label: role.title,
        score: role.evolutionScore,
        matchReason: `${role.department} · ${role.responsibilities.length} responsibilities · ${role.evolutionStageLabel}`,
      });
    }

    for (const responsibility of role.responsibilities) {
      if (responsibility.toLowerCase().includes(q)) {
        hits.push({
          type: 'responsibility',
          id: `${role.id}-${responsibility.slice(0, 24)}`,
          label: `${role.title}: ${responsibility}`,
          score: 70 + role.evolutionScore * 0.2,
          matchReason: `Actual work — not title alone`,
        });
      }
    }

    for (const workflow of role.dailyWorkflows) {
      if (workflow.label.toLowerCase().includes(q) || workflow.steps.some((s) => s.toLowerCase().includes(q))) {
        hits.push({
          type: 'workflow',
          id: workflow.id,
          label: `${role.title}: ${workflow.label}`,
          score: 65 + (workflow.automationEligible ? 10 : 0),
          matchReason: `${workflow.frequency} workflow · ${workflow.steps.length} steps`,
        });
      }
    }
  }

  for (const insight of profile.insights) {
    if (insight.insight.toLowerCase().includes(q) || insight.roleTitle.toLowerCase().includes(q)) {
      hits.push({
        type: 'insight',
        id: insight.id,
        label: insight.insight.slice(0, 72),
        score: insight.severity === 'attention' ? 92 : insight.severity === 'watch' ? 78 : 64,
        matchReason: `${insight.category} · ${insight.roleTitle}`,
      });
    }
  }

  const seen = new Set<string>();
  return hits
    .filter((h) => {
      const key = `${h.type}-${h.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function explainRoleIntelligence(roleId: string, profile: OrganizationRoleIntelligenceProfile): string | null {
  return explainRoleById(roleId, profile);
}

export function summarizeRoleSearch(profile: OrganizationRoleIntelligenceProfile, query: string): string {
  const hits = queryRoleIntelligence(query, profile, 3);
  if (!hits.length) return `No roles or responsibilities matched "${query}".`;
  return hits.map((h) => `${h.label} (${h.matchReason})`).join(' · ');
}

export function getRoleEvolutionSummary(profile: OrganizationRoleIntelligenceProfile): string {
  const evolving = profile.roles.filter((r) => r.evolutionStage === 'evolving' || r.evolutionStage === 'splitting');
  if (!evolving.length) {
    return `${profile.evolutionEventsTotal} evolution events tracked — roles stable as organization grows.`;
  }
  return `${evolving.length} roles evolving: ${evolving.map((r) => r.title).join(', ')}. Role Evolution™ keeps definitions current.`;
}

export function getTitleWorkGapSummary(profile: OrganizationRoleIntelligenceProfile): string {
  const gaps = profile.roles.filter((r) => r.titleVsWorkGap);
  if (!gaps.length) return 'Titles aligned with actual work across all mapped roles.';
  return gaps.map((r) => r.titleVsWorkGap).filter(Boolean).join(' · ');
}

export function getSelectedRoleSummary(profile: OrganizationRoleIntelligenceProfile): string | null {
  const role = getSelectedRole(profile);
  if (!role) return null;
  return [
    `${role.title} — ${role.department}`,
    role.actualWorkSummary,
    `Authority: ${role.decisionAuthorityLabel} · Evolution: ${role.evolutionStageLabel}`,
    role.aiCounterparts.length ? `AI: ${role.aiCounterparts.map((a) => a.name).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}
