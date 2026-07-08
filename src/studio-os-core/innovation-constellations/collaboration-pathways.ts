import type { CollaborationPathway } from './types';

export function buildCollaborationPathways(organizationId: string): CollaborationPathway[] {
  return [
    {
      id: `path-${organizationId}-1`,
      founderA: 'Founder',
      founderB: 'Elena Voss',
      strength: 88,
      collaborationCount: 12,
      glowing: true,
    },
    {
      id: `path-${organizationId}-2`,
      founderA: 'Founder',
      founderB: 'Marcus Chen',
      strength: 76,
      collaborationCount: 8,
      glowing: true,
    },
    {
      id: `path-${organizationId}-3`,
      founderA: 'Elena Voss',
      founderB: 'Dr. Amara Okonkwo',
      strength: 64,
      collaborationCount: 5,
      glowing: false,
    },
    {
      id: `path-${organizationId}-4`,
      founderA: 'James Whitfield',
      founderB: 'Founder',
      strength: 71,
      collaborationCount: 6,
      glowing: true,
    },
  ];
}

export function summarizePathways(pathways: CollaborationPathway[]): string {
  const strong = pathways.filter((p) => p.glowing).length;
  return `${pathways.length} creator pathways · ${strong} glowing collaboration communities`;
}
