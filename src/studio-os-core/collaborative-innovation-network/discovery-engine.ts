import type { CollaboratorRecommendation, FounderGenomeSnapshot } from './types';

function complementScore(self: FounderGenomeSnapshot, partner: FounderGenomeSnapshot): number {
  const selfSet = new Set(self.primaryStrengths.map((s) => s.toLowerCase()));
  const partnerSet = new Set(partner.primaryStrengths.map((s) => s.toLowerCase()));
  let overlap = 0;
  partnerSet.forEach((s) => {
    if (selfSet.has(s)) overlap += 1;
  });
  const unique = partner.primaryStrengths.filter((s) => !selfSet.has(s.toLowerCase())).length;
  return Math.min(99, 62 + unique * 8 - overlap * 5);
}

export function buildCollaboratorRecommendations(
  self: FounderGenomeSnapshot,
  partners: FounderGenomeSnapshot[]
): CollaboratorRecommendation[] {
  const headlines = [
    'This founder excels at luxury retail environments.',
    'This company has solved a workflow similar to yours.',
    'Your Creative Genome™ strongly complements theirs.',
    'You both frequently invent Marketplace bestsellers.',
  ];
  const workspaces = [
    { ws: 'Future Merge™', path: '/admin/studio/world-atlas' },
    { ws: 'Story Table™', path: '/admin/studio/creative-direction-studio' },
    { ws: 'Innovation District™', path: '/admin/studio/innovation-district' },
    { ws: 'Marketplace Pavilion™', path: '/admin/studio/marketplace' },
  ];

  return partners.slice(0, 4).map((p, i) => {
    const score = complementScore(self, p);
    const ws = workspaces[i % workspaces.length]!;
    return {
      id: `rec-${p.founderId}`,
      founderName: p.founderName,
      organizationName: p.organizationName,
      headline: headlines[i % headlines.length]!,
      rationale: `${p.founderName} brings ${p.primaryStrengths.join(', ')} — ${score}% genome complement with ${self.organizationName}.`,
      complementScore: score,
      sharedInterests: p.primaryStrengths.slice(0, 2),
      suggestedWorkspace: ws.ws,
      suggestedPath: ws.path,
    };
  });
}

export function summarizeDiscovery(recommendations: CollaboratorRecommendation[]): string {
  if (recommendations.length === 0) return 'No collaborator recommendations yet.';
  const top = recommendations.sort((a, b) => b.complementScore - a.complementScore)[0]!;
  return `${recommendations.length} recommended collaborators — top match: ${top.founderName} (${top.complementScore}% complement).`;
}
