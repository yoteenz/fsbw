import type { PresenceRoomFocus } from './types';

/** One Primary Focus™ — each room answers one question first. */
export const ROOM_PRIMARY_FOCUS: PresenceRoomFocus[] = [
  {
    roomId: 'creative-direction',
    primaryQuestion: 'What are we building?',
    narrativeElementId: 'cds-story-table',
  },
  {
    roomId: 'studio-warehouse',
    primaryQuestion: 'What already exists?',
    narrativeElementId: 'warehouse-asset-inspection',
  },
  {
    roomId: 'studio-archives',
    primaryQuestion: 'What already exists?',
    narrativeElementId: 'warehouse-asset-inspection',
  },
  {
    roomId: 'museum-wing',
    primaryQuestion: 'What happened?',
    narrativeElementId: 'museum-legacy-hall',
  },
  {
    roomId: 'marketplace',
    primaryQuestion: 'What can I publish?',
    narrativeElementId: 'marketplace-pavilion',
  },
  {
    roomId: 'world-knowledge-engine',
    primaryQuestion: 'What can I learn?',
    narrativeElementId: 'knowledge-library',
  },
  {
    roomId: 'world-atlas',
    primaryQuestion: 'Where do I go?',
    narrativeElementId: 'atlas-holographic-table',
  },
  {
    roomId: 'studio-command-center',
    primaryQuestion: 'What requires executive attention?',
    narrativeElementId: 'command-deck',
  },
];

export function primaryFocusForRoom(roomId: string): PresenceRoomFocus | null {
  return ROOM_PRIMARY_FOCUS.find((r) => r.roomId === roomId) ?? null;
}
