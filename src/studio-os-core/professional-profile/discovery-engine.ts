import type { OrganizationProfessionalProfilesProfile } from './types';

export function queryProfessionalProfiles(
  query: string,
  profile: OrganizationProfessionalProfilesProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const p of profile.profiles) {
    const hay = [
      p.displayName,
      p.headline,
      p.currentRole,
      p.department,
      ...p.skills,
      ...p.achievements,
      p.careerSummary,
    ]
      .join(' ')
      .toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'profile' as const,
        id: p.id,
        label: p.displayName,
        score: p.evolutionScore,
        matchReason: `${p.currentRole} · evolution ${p.evolutionScore}%`,
      });
    }
  }

  for (const p of profile.profiles) {
    for (const skill of p.skills) {
      if (skill.toLowerCase().includes(q)) {
        hits.push({
          type: 'skill' as const,
          id: `${p.id}-${skill}`,
          label: `${p.displayName}: ${skill}`,
          score: p.evolutionScore - 5,
          matchReason: `Skill · ${p.currentRole}`,
        });
      }
    }
  }

  for (const p of profile.profiles) {
    for (const event of p.professionalTimeline) {
      const hay = `${event.title} ${event.description} ${event.eventTypeLabel}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          type: 'timeline' as const,
          id: event.id,
          label: event.title,
          score: event.impactScore,
          matchReason: `${event.eventTypeLabel} · ${p.displayName}`,
        });
      }
    }
  }

  for (const p of profile.profiles) {
    for (const cert of p.certifications) {
      if (cert.name.toLowerCase().includes(q)) {
        hits.push({
          type: 'certification' as const,
          id: cert.id,
          label: cert.name,
          score: cert.status === 'earned' ? 85 : 60,
          matchReason: `${cert.issuer} · ${p.displayName}`,
        });
      }
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

export function explainProfessionalProfileById(
  profileId: string,
  registry: OrganizationProfessionalProfilesProfile
): string | null {
  const p = registry.profiles.find((x) => x.id === profileId);
  if (!p) return null;
  return [
    `${p.displayName} — ${p.headline}`,
    `Evolution ${p.evolutionScore}% · ${p.timelineEventCount} timeline events`,
    `Skills: ${p.skills.slice(0, 5).join(', ')}`,
    `Profession Brains™: ${p.professionBrains.map((b) => b.label).join(', ') || 'None linked'}`,
    `Latest: ${p.professionalTimeline[0]?.title ?? 'Building timeline'}`,
  ].join(' · ');
}
