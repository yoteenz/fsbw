import type { FounderGenomeSnapshot, LiveCollaboratorPresence, SharedInnovationWorkspace } from './types';

const LIVE_ROOMS: { path: string; label: string; test: RegExp }[] = [
  { path: '/admin/studio/creative-direction-studio', label: 'Story Table™', test: /creative-direction|story-table/i },
  { path: '/admin/studio/world-atlas', label: 'Future Merge™', test: /world-atlas|future-merge/i },
  { path: '/admin/studio/creative-direction-studio', label: 'Parallel Futures™', test: /parallel-futures/i },
  { path: '/admin/studio/studio-warehouse', label: 'Studio Warehouse™', test: /warehouse/i },
  { path: '/admin/headquarters', label: 'Headquarters™', test: /headquarters/i },
  { path: '/admin/studio/world-atlas', label: 'Master Planner™', test: /master-plann/i },
  { path: '/admin/studio/campaign-engine', label: 'Campaign Studio™', test: /campaign-engine/i },
  { path: '/admin/studio/innovation-district', label: 'Innovation District™', test: /innovation-district/i },
];

function presenceOffset(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function buildLiveCollaboratorPresences(
  self: FounderGenomeSnapshot,
  partners: FounderGenomeSnapshot[]
): LiveCollaboratorPresence[] {
  const roles = [
    'Marketing Architect™',
    'Operations Designer™',
    'Creative Director™',
    'Campus Architect™',
    'Innovation Catalyst™',
  ];
  const statuses: LiveCollaboratorPresence['status'][] = ['active', 'active', 'observing', 'active', 'idle'];

  const all = [self, ...partners.slice(0, 4)];
  const now = Date.now();

  return all.map((f, i) => {
    const room = LIVE_ROOMS[presenceOffset(f.founderId) % LIVE_ROOMS.length]!;
    const offsetMin = (presenceOffset(f.founderId + 't') % 45) + 1;
    return {
      id: `presence-${f.founderId}`,
      founderId: f.founderId,
      founderName: f.founderName,
      role: i === 0 ? 'Founder' : roles[i % roles.length]!,
      organizationName: f.organizationName,
      currentPath: room.path,
      currentRoomLabel: room.label,
      status: i === 0 ? 'active' : statuses[i % statuses.length]!,
      lastActiveAt: new Date(now - offsetMin * 60_000).toISOString(),
      hasVoice: true,
      hasCursor: true,
      attributionLabel: `${f.founderName} · ${f.organizationName}`,
    };
  });
}

export function buildSharedInnovationWorkspaces(
  self: FounderGenomeSnapshot,
  partners: FounderGenomeSnapshot[],
  genomeIds: string[]
): SharedInnovationWorkspace[] {
  const sessions = [
    { title: 'Future Merge™ Review', path: '/admin/studio/world-atlas', label: 'Future Merge™' },
    { title: 'Story Table™ Co-Invention', path: '/admin/studio/creative-direction-studio', label: 'Story Table™' },
    { title: 'Innovation District™ Campus', path: '/admin/studio/innovation-district', label: 'Innovation District™' },
  ];

  return sessions.slice(0, 2).map((s, i) => ({
    id: `workspace-${i}`,
    title: s.title,
    path: s.path,
    pathLabel: s.label,
    collaboratorIds: [self.founderId, ...partners.slice(0, 2).map((p) => p.founderId)],
    collaborationGenomeId: genomeIds[i] ?? genomeIds[0] ?? '',
    active: i === 0,
    startedAt: new Date(Date.now() - (i + 1) * 3600_000).toISOString(),
  }));
}

export function summarizeLiveCollaboration(presences: LiveCollaboratorPresence[]): string {
  const active = presences.filter((p) => p.status === 'active').length;
  return `${presences.length} founders in Studio World · ${active} active · everyone has presence, voice, cursor, and attribution.`;
}

export function findCollaboratorsInRoom(
  presences: LiveCollaboratorPresence[],
  path: string
): LiveCollaboratorPresence[] {
  const normalized = path.toLowerCase();
  return presences.filter(
    (p) =>
      p.currentPath.toLowerCase() === normalized ||
      normalized.includes(p.currentRoomLabel.toLowerCase().replace(/™/g, ''))
  );
}
