/** Studio OS Labs v1.0 — demo seeds & UI config. */

import type { LabsStore } from '../studio-os-core/labs/types';
import { AI_MEDIA_DEMO_EXPERIMENTS, buildAiMediaLabsStorePatch } from '../workspaces/ai-media/labs/bootstrap';

export const ADMIN_STUDIO_LABS_SUBTITLE =
  'RESEARCH & EXPERIMENTATION DIVISION — EVERY PUBLISHED ASSET BECOMES AN EXPERIMENT · LEARNING ENGINE · NOT ANALYTICS';

export const LABS_INHERITANCE_CHAIN = [
  'MEMORY BIBLE',
  'EXPERIMENT ENGINE',
  'PERFORMANCE TRACKING',
  'LEARNING ENGINE',
  'KNOWLEDGE GRAPH',
  'INSTITUTIONAL MEMORY',
] as const;

export type LabsTabId =
  | 'overview'
  | 'experiments'
  | 'learnings'
  | 'hooks'
  | 'thumbnails'
  | 'captions'
  | 'series'
  | 'pillars'
  | 'compare'
  | 'recommendations'
  | 'benchmarks'
  | 'promotion'
  | 'executives'
  | 'knowledge';

export const LABS_TABS: Array<{ id: LabsTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'experiments', label: 'EXPERIMENTS' },
  { id: 'learnings', label: 'LEARNINGS' },
  { id: 'hooks', label: 'HOOK LIBRARY' },
  { id: 'thumbnails', label: 'THUMBNAIL INTEL' },
  { id: 'captions', label: 'CAPTION INTEL' },
  { id: 'series', label: 'SERIES INTEL' },
  { id: 'pillars', label: 'PILLAR INTEL' },
  { id: 'compare', label: 'COMPARE' },
  { id: 'recommendations', label: 'RECOMMENDATIONS' },
  { id: 'benchmarks', label: 'BENCHMARKS' },
  { id: 'promotion', label: 'PROMOTION' },
  { id: 'executives', label: 'LABS EXECUTIVES' },
  { id: 'knowledge', label: 'KNOWLEDGE GAINED' },
];

export function buildDemoLabsStorePatch(): Partial<LabsStore> {
  return buildAiMediaLabsStorePatch();
}

export { AI_MEDIA_DEMO_EXPERIMENTS };

export const LABS_DASHBOARD_SURPRISES = [
  'AI TOOLS affiliate CTR 63% above pillar average — unexpected for early-stage experiment.',
  'Voice B on finance hooks drove 18% higher conversion vs Voice A baseline.',
  'Tuesday 18:00 posts beat Saturday posts by 2.1× engagement on CREDIT SECRETS series.',
] as const;
