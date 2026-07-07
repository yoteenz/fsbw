import type { OrganizationSkillGraphProfile } from './types';

export function querySkillGraph(query: string, profile: OrganizationSkillGraphProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const skill of profile.skills) {
    const hay = `${skill.name} ${skill.categoryLabel} ${skill.description}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'skill' as const,
        id: skill.id,
        label: skill.name,
        score: skill.demandScore,
        matchReason: `${skill.categoryLabel} · ${skill.holderCount} holders · demand ${skill.demandScore}%`,
      });
    }
  }

  for (const skill of profile.skills) {
    for (const holder of skill.holders) {
      if (holder.personName.toLowerCase().includes(q) || holder.department.toLowerCase().includes(q)) {
        hits.push({
          type: 'person' as const,
          id: `${skill.id}-${holder.personId}`,
          label: `${holder.personName} — ${skill.name}`,
          score: holder.proficiencyScore,
          matchReason: `${holder.proficiency} · ${holder.department}${holder.canTeach ? ' · can teach' : ''}`,
        });
      }
    }
  }

  for (const dept of profile.departmentSummaries) {
    if (dept.department.toLowerCase().includes(q)) {
      hits.push({
        type: 'department' as const,
        id: `dept-${dept.department}`,
        label: dept.department,
        score: 70 + dept.skillCount * 2,
        matchReason: `${dept.skillCount} skills · ${dept.gapCount} gaps`,
      });
    }
  }

  for (const insight of profile.insights) {
    if (insight.insight.toLowerCase().includes(q)) {
      hits.push({
        type: 'insight' as const,
        id: insight.id,
        label: insight.insight.slice(0, 60),
        score: insight.severity === 'urgent' ? 95 : insight.severity === 'attention' ? 80 : 65,
        matchReason: `${insight.category} · ${insight.severity}`,
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

export function explainSkillById(skillId: string, profile: OrganizationSkillGraphProfile): string | null {
  const skill = profile.skills.find((s) => s.id === skillId);
  if (!skill) return null;
  const mentors = skill.holders.filter((h) => h.canTeach).map((h) => h.personName);
  return [
    `${skill.name} — ${skill.categoryLabel}`,
    `${skill.holderCount} holders · ${skill.expertCount} experts · demand ${skill.demandScore}%`,
    mentors.length ? `Can teach: ${mentors.join(', ')}` : 'No mentors identified yet',
    `Gap: ${skill.gapSeverity}`,
  ].join(' · ');
}
