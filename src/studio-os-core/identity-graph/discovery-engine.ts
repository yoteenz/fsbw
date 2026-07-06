import type { OrganizationIdentityGraphProfile } from './types';

export function queryIdentityGraph(query: string, profile: OrganizationIdentityGraphProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const person of profile.people) {
    const hay = [
      person.displayName,
      person.role,
      person.department,
      person.identityTypeLabel,
      ...person.skills,
      ...person.expertise,
      ...person.responsibilities,
      person.personalSummary,
    ]
      .join(' ')
      .toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'person' as const,
        id: person.id,
        label: person.displayName,
        score: person.trustScore,
        matchReason: `${person.identityTypeLabel} · ${person.role} · ${person.department}`,
      });
    }
  }

  for (const edge of profile.relationships) {
    const hay = `${edge.fromPersonName} ${edge.toPersonName} ${edge.edgeTypeLabel} ${edge.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'relationship' as const,
        id: edge.id,
        label: `${edge.fromPersonName} → ${edge.toPersonName}`,
        score: edge.strength,
        matchReason: `${edge.edgeTypeLabel} · strength ${edge.strength}`,
      });
    }
  }

  for (const person of profile.people) {
    for (const skill of [...person.skills, ...person.expertise]) {
      if (skill.toLowerCase().includes(q)) {
        hits.push({
          type: 'expertise' as const,
          id: `${person.id}-${skill}`,
          label: `${person.displayName}: ${skill}`,
          score: person.trustScore - 5,
          matchReason: `Expertise · ${person.role}`,
        });
      }
    }
  }

  const departments = new Set(profile.people.map((p) => p.department));
  for (const dept of departments) {
    if (dept.toLowerCase().includes(q)) {
      const count = profile.people.filter((p) => p.department === dept).length;
      hits.push({
        type: 'department' as const,
        id: `dept-${dept}`,
        label: dept,
        score: 70 + count * 3,
        matchReason: `${count} people in department`,
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

export function explainPersonById(personId: string, profile: OrganizationIdentityGraphProfile): string | null {
  const person = profile.people.find((p) => p.id === personId);
  if (!person) return null;
  const rels = profile.relationships.filter((r) => r.fromPersonId === personId || r.toPersonId === personId);
  return [
    `${person.displayName} — ${person.identityTypeLabel} · ${person.role} · ${person.department}`,
    person.personalSummary,
    `Skills: ${person.skills.join(', ')}`,
    `Relationships: ${rels.length} connected edges`,
    `Trust score: ${person.trustScore}%`,
  ].join(' · ');
}
