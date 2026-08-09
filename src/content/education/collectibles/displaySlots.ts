import type { CollectibleDisplaySlot } from '../types';

/** Rewards Gallery certification wall — percentages for responsive overlay calibration. */
export const REWARDS_CERTIFICATION_WALL_SURFACE_ID = 'rewards-gallery-certification-wall';

export const REWARDS_CERTIFICATION_DISPLAY_SLOTS: CollectibleDisplaySlot[] = [
  {
    id: 'cert-slot-01',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 18, y: 28 },
    scale: 1,
    rotation: -2,
    autoAssign: true,
  },
  {
    id: 'cert-slot-02',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 38, y: 26 },
    scale: 0.95,
    rotation: 1,
    autoAssign: true,
  },
  {
    id: 'cert-slot-03',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 58, y: 28 },
    scale: 0.95,
    rotation: -1,
    autoAssign: true,
  },
  {
    id: 'cert-slot-04',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 78, y: 30 },
    scale: 0.9,
    rotation: 2,
    autoAssign: true,
  },
  {
    id: 'cert-slot-05',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 28, y: 52 },
    scale: 0.88,
    rotation: 0,
    autoAssign: true,
  },
  {
    id: 'cert-slot-06',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 50, y: 50 },
    scale: 0.88,
    rotation: -1.5,
    autoAssign: true,
  },
  {
    id: 'cert-slot-07',
    surfaceId: REWARDS_CERTIFICATION_WALL_SURFACE_ID,
    position: { x: 72, y: 52 },
    scale: 0.85,
    rotation: 1.5,
    autoAssign: true,
  },
];

export function getAutoAssignCertificationSlots(): CollectibleDisplaySlot[] {
  return REWARDS_CERTIFICATION_DISPLAY_SLOTS.filter((s) => s.autoAssign !== false);
}
