import type { AtlasNode } from '../studio-world-atlas/types';
import type { WorldHealthSignal } from './types';

function healthFromNode(node: AtlasNode): WorldHealthSignal['health'] {
  if (node.isPlanned || node.isConcept) return 'opportunity';
  if (node.activity === 'generating' || node.activity === 'pulse') return 'thriving';
  if (node.activity === 'active') return 'growing';
  if (node.activity === 'idle') return 'stable';
  if (node.fogged) return 'opportunity';
  return 'strained';
}

function glowFromHealth(health: WorldHealthSignal['health'], extrusion: number): number {
  const base = { thriving: 95, growing: 78, stable: 55, strained: 32, opportunity: 68 }[health];
  return Math.min(100, base + extrusion * 12);
}

export function resolveWorldHealthSignals(nodes: AtlasNode[]): WorldHealthSignal[] {
  return nodes
    .filter((n) => !n.hidden)
    .map((node) => {
      const health = healthFromNode(node);
      return {
        nodeId: node.id,
        title: node.displayName,
        health,
        glowIntensity: glowFromHealth(health, node.extrusion),
        label:
          health === 'opportunity'
            ? `${node.displayName} — expansion opportunity`
            : health === 'strained'
              ? `${node.displayName} — knowledge bottleneck`
              : `${node.displayName} — ${health}`,
      };
    });
}

export function formatWorldHealthAmbient(signals: WorldHealthSignal[]): string | null {
  const thriving = signals.filter((s) => s.health === 'thriving').length;
  const opportunity = signals.filter((s) => s.health === 'opportunity').length;
  if (signals.length === 0) return null;
  return `World Health™ — ${thriving} districts glowing · ${opportunity} expansion sparks`;
}

export function worldHealthClass(health: WorldHealthSignal['health']): string {
  return `mc-health-${health}`;
}
