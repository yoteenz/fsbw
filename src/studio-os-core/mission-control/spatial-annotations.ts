import type { AtlasNode } from '../studio-world-atlas/types';
import type { WorldHealthSignal } from './types';
import type { HolographicViewState } from './holographic-views';

export type SpatialAnnotationKind =
  | 'destination'
  | 'health'
  | 'memory'
  | 'travel'
  | 'environment'
  | 'district';

export type SpatialAnnotation = {
  id: string;
  nodeId: string;
  mapX: number;
  mapY: number;
  kind: SpatialAnnotationKind;
  title: string;
  lines: string[];
  healthClass?: string;
  emphasis: boolean;
  actionLabel?: string;
};

export type SpatialAnnotationInput = {
  selectedNode: AtlasNode;
  focusNode: AtlasNode;
  visibleNodes: AtlasNode[];
  worldHealth: WorldHealthSignal[];
  view: HolographicViewState;
  travelPreviewLine?: string;
  memoryReason?: string;
  environmentalWhisper?: string;
};

function healthForNode(nodeId: string, signals: WorldHealthSignal[]): WorldHealthSignal | undefined {
  return signals.find((s) => s.nodeId === nodeId);
}

export function buildSpatialAnnotations(input: SpatialAnnotationInput): SpatialAnnotation[] {
  const {
    selectedNode,
    focusNode,
    visibleNodes,
    worldHealth,
    view,
    travelPreviewLine,
    memoryReason,
    environmentalWhisper,
  } = input;

  const annotations: SpatialAnnotation[] = [];

  if (environmentalWhisper && view.annotationDensity === 'sparse') {
    annotations.push({
      id: 'mc-env-whisper',
      nodeId: focusNode.id,
      mapX: 50,
      mapY: 18,
      kind: 'environment',
      title: 'World Health™',
      lines: [environmentalWhisper],
      emphasis: false,
    });
  }

  const selectedHealth = healthForNode(selectedNode.id, worldHealth);
  annotations.push({
    id: `mc-dest-${selectedNode.id}`,
    nodeId: selectedNode.id,
    mapX: selectedNode.mapX,
    mapY: Math.max(8, selectedNode.mapY - 14),
    kind: 'destination',
    title: selectedNode.displayName,
    lines: [
      selectedNode.isConcept
        ? 'FUTURE VISION™ CONCEPT'
        : selectedNode.isPlanned
          ? 'RESERVED LAND™'
          : selectedNode.activity.toUpperCase(),
      ...(travelPreviewLine ? [travelPreviewLine] : []),
      ...(memoryReason ? [memoryReason] : []),
    ],
    healthClass: selectedHealth ? `mc-health-${selectedHealth.health}` : undefined,
    emphasis: true,
    actionLabel: selectedNode.isPlanned || selectedNode.isConcept ? undefined : 'TRAVEL',
  });

  if (view.showBuildingDetail) {
    for (const node of visibleNodes) {
      if (node.id === selectedNode.id || node.hidden) continue;
      const health = healthForNode(node.id, worldHealth);
      if (!health || (health.health !== 'opportunity' && health.health !== 'strained')) continue;
      annotations.push({
        id: `mc-health-${node.id}`,
        nodeId: node.id,
        mapX: node.mapX,
        mapY: node.mapY - 10,
        kind: 'health',
        title: node.displayName,
        lines: [health.label],
        healthClass: `mc-health-${health.health}`,
        emphasis: false,
      });
    }
  }

  if (view.showDistrictOrbits && view.id === 'civilization') {
    const districts = visibleNodes.filter((n) => n.level === 2).slice(0, 6);
    for (const district of districts) {
      annotations.push({
        id: `mc-district-${district.id}`,
        nodeId: district.id,
        mapX: district.mapX,
        mapY: district.mapY - 12,
        kind: 'district',
        title: district.displayName,
        lines: ['DISTRICT ORBIT'],
        emphasis: false,
      });
    }
  }

  const cap = view.annotationDensity === 'sparse' ? 4 : view.annotationDensity === 'normal' ? 8 : 12;
  return annotations.slice(0, cap);
}
