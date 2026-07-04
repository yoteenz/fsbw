/** Simulation Engine v1.0 — demo seeds & UI config. */

import type { SimulationEngineStore } from '../studio-os-core/simulation-engine/types';
import { buildSimulationEngineStorePatch } from '../workspaces/ai-media/simulation-engine/bootstrap';

export const ADMIN_STUDIO_SIMULATION_ENGINE_SUBTITLE =
  'MODEL DECISIONS BEFORE COMMITTING · EXPLORE POSSIBILITIES · NOT PREDICTIONS · NOT GUARANTEES';

export const SIMULATION_ENGINE_INHERITANCE_CHAIN = [
  'SIMULATION CENTER',
  'SIMULATION BUILDER',
  'SCENARIO COMPARISON',
  'RISK & FINANCIAL',
  'MARKETING & CONTENT',
  'ORG & MARKETPLACE',
  'DECISION SUPPORT',
  'LEARNING LOOP',
  'KNOWLEDGE GRAPH',
] as const;

export type SimulationEngineTabId =
  | 'overview'
  | 'builder'
  | 'types'
  | 'scenarios'
  | 'risk'
  | 'financial'
  | 'marketing'
  | 'content'
  | 'organization'
  | 'marketplace'
  | 'timeline'
  | 'decision'
  | 'library'
  | 'learning';

export const SIMULATION_ENGINE_TABS: Array<{ id: SimulationEngineTabId; label: string }> = [
  { id: 'overview', label: 'SIMULATION CENTER' },
  { id: 'builder', label: 'BUILDER' },
  { id: 'types', label: 'SIM TYPES' },
  { id: 'scenarios', label: 'SCENARIOS' },
  { id: 'risk', label: 'RISK ANALYSIS' },
  { id: 'financial', label: 'FINANCIAL' },
  { id: 'marketing', label: 'MARKETING' },
  { id: 'content', label: 'CONTENT' },
  { id: 'organization', label: 'ORGANIZATION' },
  { id: 'marketplace', label: 'MARKETPLACE' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'decision', label: 'DECISION SUPPORT' },
  { id: 'library', label: 'LIBRARY' },
  { id: 'learning', label: 'LEARNING LOOP' },
];

export function buildDemoSimulationEngineStorePatch(): Partial<SimulationEngineStore> {
  return buildSimulationEngineStorePatch();
}
