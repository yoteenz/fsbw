/** Studio Intelligence v1.0 — demo seeds & UI config. */

import type { StudioIntelligenceStore } from '../studio-os-core/studio-intelligence/types';
import { buildStudioIntelligenceStorePatch } from '../workspaces/ai-media/studio-intelligence/bootstrap';

export const ADMIN_STUDIO_STUDIO_INTELLIGENCE_SUBTITLE =
  'OPERATING INTELLIGENCE · PROACTIVE RECOMMENDATIONS · CHIEF INTELLIGENCE OFFICER · NOT ANOTHER AI ASSISTANT';

export const STUDIO_INTELLIGENCE_INHERITANCE_CHAIN = [
  'INTELLIGENCE DASHBOARD',
  'EXECUTIVE BRIEFING',
  'OPPORTUNITY & RISK ENGINES',
  'EXECUTIVE SYNTHESIS',
  'RECOMMENDATION CENTER',
  'BUSINESS HEALTH & DECISIONS',
  'LEARNING & CONFIDENCE',
  'KNOWLEDGE GRAPH',
] as const;

export type StudioIntelligenceTabId =
  | 'overview'
  | 'briefing'
  | 'workspace'
  | 'opportunities'
  | 'risks'
  | 'executive'
  | 'cross-workspace'
  | 'institutional'
  | 'recommendations'
  | 'health'
  | 'decisions'
  | 'learning'
  | 'confidence'
  | 'knowledge';

export const STUDIO_INTELLIGENCE_TABS: Array<{ id: StudioIntelligenceTabId; label: string }> = [
  { id: 'overview', label: 'INTELLIGENCE DASHBOARD' },
  { id: 'briefing', label: 'EXECUTIVE BRIEFING' },
  { id: 'workspace', label: 'WORKSPACE INTEL' },
  { id: 'opportunities', label: 'OPPORTUNITIES' },
  { id: 'risks', label: 'RISK ENGINE' },
  { id: 'executive', label: 'EXEC SYNTHESIS' },
  { id: 'cross-workspace', label: 'CROSS-WORKSPACE' },
  { id: 'institutional', label: 'INSTITUTIONAL' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'health', label: 'BUSINESS HEALTH' },
  { id: 'decisions', label: 'DECISION JOURNAL' },
  { id: 'learning', label: 'LEARNING ENGINE' },
  { id: 'confidence', label: 'CONFIDENCE' },
  { id: 'knowledge', label: 'KG INTEGRATION' },
];

export function buildDemoStudioIntelligenceStorePatch(): Partial<StudioIntelligenceStore> {
  return buildStudioIntelligenceStorePatch();
}
