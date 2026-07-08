import type { MergeCollaborator, MergeComment } from './types';

export function defaultMergeCollaborators(): MergeCollaborator[] {
  const now = new Date().toISOString();
  return [
    { id: 'collab-founder', name: 'Founder', role: 'founder', lastActiveAt: now },
    { id: 'collab-cd', name: 'Creative Director', role: 'creative-director', lastActiveAt: now },
    { id: 'collab-arch', name: 'Campus Architect', role: 'architect', lastActiveAt: now },
    { id: 'collab-design', name: 'Experience Designer', role: 'designer', lastActiveAt: now },
    { id: 'collab-ops', name: 'Operations Lead', role: 'operations-lead', lastActiveAt: now },
  ];
}

export function defaultMergeComments(): MergeComment[] {
  return [
    {
      id: 'mc-1',
      authorId: 'collab-cd',
      authorName: 'Creative Director',
      text: 'Pull Creative Direction Studio from Future C — strongest Scene Stack adjacency.',
      targetLabel: 'Creative Direction Studio™',
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      status: 'approved',
    },
    {
      id: 'mc-2',
      authorId: 'collab-arch',
      authorName: 'Campus Architect',
      text: 'Campus layout from Future A preserves navigation spine — recommend keeping.',
      targetLabel: 'Campus Layout',
      createdAt: new Date(Date.now() - 7200_000).toISOString(),
      status: 'approved',
    },
    {
      id: 'mc-3',
      authorId: 'collab-ops',
      authorName: 'Operations Lead',
      text: 'Alternative: Lean budget from Future C instead of D if reuse priority rises.',
      targetLabel: 'Budget Strategy',
      createdAt: new Date(Date.now() - 1800_000).toISOString(),
      status: 'alternative',
    },
  ];
}
