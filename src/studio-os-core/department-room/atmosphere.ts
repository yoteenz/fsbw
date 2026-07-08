import type { DepartmentPackage } from '../department-package';
import type { RoomDna } from '../department-package/types';

export type DepartmentRoomAtmosphere = {
  cssVars: Record<string, string>;
  ambientGradient: string;
  floorTone: string;
  accentColor: string;
};

export function resolveRoomAtmosphere(roomDna: RoomDna): DepartmentRoomAtmosphere {
  const luxury = roomDna.sliders.luxuryLevel ?? roomDna.sliders.luxury ?? 0.85;
  const calm = roomDna.sliders.calmLevel ?? roomDna.sliders.calm ?? 0.75;
  const editorial = roomDna.sliders.editorialLevel ?? 0.9;
  const warmth = roomDna.sliders.warmthLevel ?? roomDna.sliders.warmth ?? 0.75;

  const keyWarmth = Math.round(28 + warmth * 18);
  const ambient = Math.round(12 + calm * 10);
  const accent = editorial > 0.85 ? '#C9A962' : '#EB1C24';

  return {
    cssVars: {
      '--dept-luxury': String(luxury),
      '--dept-calm': String(calm),
      '--dept-editorial': String(editorial),
      '--dept-warmth': String(warmth),
      '--dept-key-warm': `${keyWarmth}deg`,
      '--dept-ambient': `${ambient}%`,
    },
    ambientGradient: `linear-gradient(165deg, rgba(18,16,14,0.92) 0%, rgba(32,28,24,0.88) 42%, rgba(24,22,20,0.94) 100%)`,
    floorTone: `rgba(245,240,232,${0.06 + luxury * 0.08})`,
    accentColor: accent,
  };
}

export type WalkableZone = {
  id: string;
  displayName: string;
  type: string;
  position: { x: number; y: number; z: number };
  isHero: boolean;
  isEntry: boolean;
};

export function resolveWalkableZones(pkg: DepartmentPackage): WalkableZone[] {
  const { spatial } = pkg.definition;
  const positions: Record<string, { x: number; y: number; z: number }> = {
    'arrival-threshold': { x: 0, y: 0.85, z: -0.75 },
    'brief-wall': { x: -0.78, y: 0.55, z: 0.1 },
    'mood-wall': { x: 0, y: 0.35, z: 0.82 },
    'observatory': { x: -0.5, y: 0.5, z: 0.25 },
    'timeline-table': { x: 0, y: 0.45, z: 0.35 },
    'sandbox': { x: 0.22, y: 0.42, z: 0.2 },
    'reference-library': { x: 0.72, y: 0.5, z: 0.15 },
    'founder-review': { x: -0.35, y: 0.48, z: 0.55 },
    'orb-command': { x: 0.35, y: 0.55, z: 0.4 },
    'departure-threshold': { x: 0.55, y: 0.85, z: -0.7 },
  };

  return spatial.zones.map((zone) => ({
    id: zone.id,
    displayName: zone.displayName,
    type: zone.type,
    position: positions[zone.id] ?? { x: 0, y: 0.5, z: 0 },
    isHero: zone.id === spatial.heroObjectId || zone.type === 'hero',
    isEntry: zone.id === spatial.entryZoneId,
  }));
}

export function zoneLabelForTeaching(zone: WalkableZone): string {
  if (zone.isEntry) return 'You have arrived. Look around — each zone responds to you.';
  if (zone.type === 'hero') return 'Living Mood Wall — pin inspiration and shape direction.';
  if (zone.type === 'orb') return 'Studio Orb — your creative intelligence partner.';
  if (zone.id.includes('founder')) return 'Founder Notes — capture decisions before they fade.';
  return `${zone.displayName} — explore when ready.`;
}
