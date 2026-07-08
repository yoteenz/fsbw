/**
 * Global Atlas Layer™ — live collaborator presence for Atlas overlay.
 */

import type { LiveCollaboratorPresence } from './types';
import { ensureOrganizationCollaborativeInnovationNetworkProfile } from './store';

export type AtlasCollaboratorMarker = {
  id: string;
  label: string;
  roomLabel: string;
  path: string;
  status: LiveCollaboratorPresence['status'];
  role: string;
};

export function resolveAtlasCollaboratorMarkers(organizationId: string): AtlasCollaboratorMarker[] {
  const profile = ensureOrganizationCollaborativeInnovationNetworkProfile(organizationId);
  return profile.liveCollaborators.map((p) => ({
    id: p.id,
    label: p.attributionLabel,
    roomLabel: p.currentRoomLabel,
    path: p.currentPath,
    status: p.status,
    role: p.role,
  }));
}

export function formatAtlasCollaboratorLine(markers: AtlasCollaboratorMarker[]): string | null {
  const active = markers.filter((m) => m.status === 'active');
  if (active.length === 0) return null;
  const sample = active
    .slice(0, 3)
    .map((m) => `${m.role} inside ${m.roomLabel}`)
    .join(' · ');
  return `Live collaborators — ${sample}`;
}
