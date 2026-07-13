/**
 * Founder Review™ — Live Room Assembly sequence.
 */
import type { WorldPreviewModel } from '../construction-mode/world-preview';
import type { LiveConstructionView } from '../construction-mode/live-construction';

export const ROOM_ASSEMBLY_VERSION = 'room-assembly.v1';

export type RoomAssemblyLayerId =
  | 'empty'
  | 'walls'
  | 'floor'
  | 'desk'
  | 'sculpture'
  | 'seating'
  | 'lighting'
  | 'glass'
  | 'plants'
  | 'atmosphere'
  | 'final';

export type RoomAssemblyLayer = {
  layerId: RoomAssemblyLayerId;
  label: string;
  visible: boolean;
  assetIds: string[];
};

export type RoomAssemblyState = {
  assemblyVersion: typeof ROOM_ASSEMBLY_VERSION;
  planId: string;
  layers: RoomAssemblyLayer[];
  currentLayerId: RoomAssemblyLayerId;
  progressPercent: number;
  narrative: string;
};

const ASSEMBLY_ORDER: Array<{ layerId: RoomAssemblyLayerId; label: string; match: (id: string) => boolean }> = [
  { layerId: 'empty', label: 'Empty room', match: () => false },
  { layerId: 'walls', label: 'Walls appear', match: (id) => id.includes('architecture') || id.includes('shell') },
  { layerId: 'floor', label: 'Floor appears', match: (id) => id === 'floor-plane' },
  { layerId: 'desk', label: 'Desk appears', match: (id) => id.toLowerCase().includes('desk') },
  { layerId: 'sculpture', label: 'Sculpture appears', match: (id) => id.toLowerCase().includes('landmark') || id.toLowerCase().includes('crystal') },
  { layerId: 'seating', label: 'Seating appears', match: (id) => id.toLowerCase().includes('seat') || id.toLowerCase().includes('chair') || id.toLowerCase().includes('table') },
  { layerId: 'lighting', label: 'Lighting appears', match: (id) => id.toLowerCase().includes('light') },
  { layerId: 'glass', label: 'Glass appears', match: (id) => id.toLowerCase().includes('monitor') || id.toLowerCase().includes('glass') },
  { layerId: 'plants', label: 'Plants appear', match: (id) => id.toLowerCase().includes('decor') || id.toLowerCase().includes('plant') },
  { layerId: 'atmosphere', label: 'Atmosphere appears', match: (id) => id === 'atmosphere-layer' },
  { layerId: 'final', label: 'Final render', match: () => true },
];

export function buildRoomAssemblyState(input: {
  preview: WorldPreviewModel;
  phase: 'review' | 'manufacturing' | 'complete';
  liveView?: LiveConstructionView | null;
}): RoomAssemblyState {
  const assetIds = [
    input.preview.architecture.shellId,
    'floor-plane',
    ...input.preview.placeholderAssets.map((a) => a.assetId),
    'atmosphere-layer',
  ];

  let activeIndex = 0;
  if (input.phase === 'review') {
    activeIndex = ASSEMBLY_ORDER.length - 1;
  } else if (input.phase === 'manufacturing' && input.liveView) {
    const pct = input.liveView.overallProgressPercent;
    activeIndex = Math.min(
      ASSEMBLY_ORDER.length - 1,
      Math.max(1, Math.floor((pct / 100) * (ASSEMBLY_ORDER.length - 1)))
    );
  } else if (input.phase === 'complete') {
    activeIndex = ASSEMBLY_ORDER.length - 1;
  }

  const layers: RoomAssemblyLayer[] = ASSEMBLY_ORDER.map((layer, i) => ({
    layerId: layer.layerId,
    label: layer.label,
    visible: i <= activeIndex,
    assetIds: assetIds.filter((id) => layer.match(id)),
  }));

  const current = ASSEMBLY_ORDER[activeIndex];

  return {
    assemblyVersion: ROOM_ASSEMBLY_VERSION,
    planId: input.preview.planId,
    layers,
    currentLayerId: current.layerId,
    progressPercent: Math.round((activeIndex / (ASSEMBLY_ORDER.length - 1)) * 100),
    narrative: current.label,
  };
}

export function visibleAssetIdsForAssembly(assembly: RoomAssemblyState): Set<string> {
  const visible = new Set<string>();
  for (const layer of assembly.layers) {
    if (!layer.visible) continue;
    for (const id of layer.assetIds) visible.add(id);
  }
  if (assembly.currentLayerId === 'final') {
    assembly.layers.forEach((l) => l.assetIds.forEach((id) => visible.add(id)));
  }
  return visible;
}
