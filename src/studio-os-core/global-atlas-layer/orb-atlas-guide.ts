/**
 * Global Atlas Layer™ — Orb Atlas Guide navigation intents.
 */

import { buildAtlasCatalog } from '../studio-world-atlas/catalog';
import type { AtlasTravelMode } from '../studio-world-atlas/types';
import type { OrbAtlasNavigationIntent } from './types';

const TRAVEL_VERBS = ['take me to', 'navigate to', 'open', 'show', 'go to', 'bring me to'];

const NODE_ALIASES: Array<{ patterns: string[]; nodeId: string; path: string }> = [
  { patterns: ['story table', 'creative direction'], nodeId: 'flagship-creative-direction-studio', path: '/admin/studio/department/creative-direction' },
  { patterns: ['blueprint archive', 'blueprint manager'], nodeId: 'room-blueprint-manager', path: '/admin/studio/blueprint-manager' },
  { patterns: ['warehouse', 'asset registry'], nodeId: 'flagship-studio-warehouse', path: '/admin/studio/studio-warehouse' },
  { patterns: ['museum', 'archives'], nodeId: 'flagship-studio-archives', path: '/admin/studio/studio-archives' },
  { patterns: ['marketplace'], nodeId: 'flagship-marketplace', path: '/admin/studio/marketplace' },
  { patterns: ['marketing headquarters', 'marketing'], nodeId: 'room-campaign-engine', path: '/admin/studio/campaign-engine' },
  { patterns: ['mission control', 'command center', 'overview'], nodeId: 'flagship-studio-command-center', path: '/admin/studio/overview' },
  { patterns: ['world atlas', 'atlas'], nodeId: 'room-world-atlas', path: '/admin/studio/world-atlas' },
  { patterns: ['innovation district', 'co-invent', 'collaborat'], nodeId: 'room-innovation-district', path: '/admin/studio/innovation-district' },
  { patterns: ['constitution'], nodeId: 'room-constitution-hall', path: '/admin/studio/constitution-hall' },
  { patterns: ['expedition', 'expansion'], nodeId: 'flagship-expedition-hub', path: '/admin/studio/expansion-center' },
];

export function parseOrbAtlasNavigationIntent(text: string): OrbAtlasNavigationIntent | null {
  const raw = text.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();

  const isNav = TRAVEL_VERBS.some((v) => lower.includes(v));
  const isAtlas = lower.includes('atlas') && (lower.includes('open') || lower.includes('show'));
  if (!isNav && !isAtlas) return null;

  if (isAtlas && !TRAVEL_VERBS.some((v) => lower.includes(v))) {
    return { action: 'open', query: raw, confidence: 0.9 };
  }

  for (const alias of NODE_ALIASES) {
    if (alias.patterns.some((p) => lower.includes(p))) {
      const catalog = buildAtlasCatalog();
      const node = catalog.find((n) => n.id === alias.nodeId);
      return {
        action: 'travel',
        query: raw,
        targetNodeId: alias.nodeId,
        targetPath: node?.travelPath ?? alias.path,
        travelMode: lower.includes('walk') ? 'walk' : lower.includes('tour') ? 'guided-tour' : 'fast-travel',
        confidence: 0.88,
      };
    }
  }

  if (lower.includes('last workspace') || lower.includes('where i left')) {
    return { action: 'highlight', query: raw, confidence: 0.75 };
  }

  return { action: 'open', query: raw, confidence: 0.55 };
}

export function formatOrbAtlasGuideLine(intent: OrbAtlasNavigationIntent): string {
  if (intent.action === 'open') {
    return 'Opening Global Atlas Layer™ — one living world, projected from your current anchor.';
  }
  if (intent.action === 'travel' && intent.targetPath) {
    return `Atlas Guide™ — highlighting route to ${intent.query.replace(/take me to/i, '').trim()}. Choose walk, elevator, or fast travel.`;
  }
  return 'Atlas Guide™ — where would you like to go in Studio World™?';
}

export function suggestTravelModeFromIntent(intent: OrbAtlasNavigationIntent): AtlasTravelMode {
  return intent.travelMode ?? 'fast-travel';
}
