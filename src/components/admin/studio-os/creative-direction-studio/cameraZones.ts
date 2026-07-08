/** Creative Direction Studio™ V2 — camera zone definitions (movement, not scroll). */

export type CdsCameraZoneId =
  | 'arrival'
  | 'story-table'
  | 'mood-wall'
  | 'founder-notes'
  | 'pipeline-board'
  | 'reference-library';

export type CdsCameraZone = {
  id: CdsCameraZoneId;
  label: string;
  shortLabel: string;
  index: number;
  /** Visible in nav only after arrival ceremony completes */
  requiresArrival: boolean;
  teaching: string;
};

export const CDS_CAMERA_ZONES: CdsCameraZone[] = [
  {
    id: 'arrival',
    label: 'Arrival Zone™',
    shortLabel: 'Arrival',
    index: 0,
    requiresArrival: false,
    teaching: 'Threshold · partial sightlines · the atelier opens before you.',
  },
  {
    id: 'story-table',
    label: 'Story Table™',
    shortLabel: 'Story Table',
    index: 1,
    requiresArrival: false,
    teaching: 'Studio Orb hosts above the table — speak your creative intent.',
  },
  {
    id: 'mood-wall',
    label: 'Living Mood Wall™',
    shortLabel: 'Mood Wall',
    index: 2,
    requiresArrival: true,
    teaching: 'Double-height wall — pin inspiration and shape editorial direction.',
  },
  {
    id: 'founder-notes',
    label: 'Founder Notes™',
    shortLabel: 'Notes Desk',
    index: 3,
    requiresArrival: true,
    teaching: 'Illuminated desk — capture decisions before they fade.',
  },
  {
    id: 'pipeline-board',
    label: 'Creative Pipeline™',
    shortLabel: 'Pipeline',
    index: 4,
    requiresArrival: true,
    teaching: 'Production board on the wall — approve each Golden Build™ stage.',
  },
  {
    id: 'reference-library',
    label: 'Reference Library™',
    shortLabel: 'Library',
    index: 5,
    requiresArrival: true,
    teaching: 'Shelving gallery — pull references into the Mood Wall.',
  },
];

export function getCdsZone(id: CdsCameraZoneId): CdsCameraZone {
  return CDS_CAMERA_ZONES.find((z) => z.id === id) ?? CDS_CAMERA_ZONES[0];
}

export function cdsZonePanVw(zone: CdsCameraZone): number {
  return zone.index * 100;
}
