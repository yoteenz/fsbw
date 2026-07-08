import type { AtlasNode } from '../studio-world-atlas/types';
import type { WorldHealthSignal } from './types';
import type { HolographicViewState } from './holographic-views';
import type { MissionControlMode } from './types';

export type EnvironmentalStory = {
  id: string;
  whisper: string;
  mood: 'calm' | 'energized' | 'celebratory' | 'strained' | 'mysterious';
  mapX: number;
  mapY: number;
};

export function buildEnvironmentalStories(input: {
  view: HolographicViewState;
  mode: MissionControlMode;
  focusNode: AtlasNode;
  worldHealth: WorldHealthSignal[];
  worldTicker?: string;
}): EnvironmentalStory[] {
  const { view, mode, focusNode, worldHealth, worldTicker } = input;
  const thriving = worldHealth.filter((s) => s.health === 'thriving').length;
  const opportunity = worldHealth.filter((s) => s.health === 'opportunity').length;
  const strained = worldHealth.filter((s) => s.health === 'strained').length;

  const stories: EnvironmentalStory[] = [];

  if (view.id === 'civilization') {
    stories.push({
      id: 'env-civ-pulse',
      whisper:
        thriving > 2
          ? `${thriving} districts glow — the civilization is alive beneath you.`
          : 'Watch the hologram breathe before you travel.',
      mood: thriving > 2 ? 'energized' : 'calm',
      mapX: 50,
      mapY: 22,
    });
  }

  if (view.id === 'district') {
    stories.push({
      id: 'env-district',
      whisper: `${focusNode.displayName} — commerce and creation interleave in the light.`,
      mood: 'energized',
      mapX: focusNode.mapX,
      mapY: Math.max(10, focusNode.mapY - 18),
    });
  }

  if (view.id === 'building') {
    stories.push({
      id: 'env-building',
      whisper: `Enter ${focusNode.displayName} through the hologram — no panels, only architecture.`,
      mood: 'calm',
      mapX: focusNode.mapX,
      mapY: Math.max(8, focusNode.mapY - 16),
    });
  }

  if (opportunity > 0) {
    stories.push({
      id: 'env-opportunity',
      whisper: `${opportunity} expansion spark${opportunity > 1 ? 's' : ''} shimmer at the edge of discovery.`,
      mood: 'mysterious',
      mapX: 82,
      mapY: 35,
    });
  }

  if (strained > 0) {
    stories.push({
      id: 'env-strained',
      whisper: `${strained} district${strained > 1 ? 's' : ''} dim — knowledge bottlenecks whisper for attention.`,
      mood: 'strained',
      mapX: 18,
      mapY: 40,
    });
  }

  if (mode === 'civilization' && worldTicker) {
    stories.push({
      id: 'env-ticker',
      whisper: worldTicker.slice(0, 72),
      mood: 'calm',
      mapX: 50,
      mapY: 88,
    });
  }

  return stories.slice(0, 4);
}

export function primaryEnvironmentalWhisper(stories: EnvironmentalStory[]): string | null {
  return stories[0]?.whisper ?? null;
}
