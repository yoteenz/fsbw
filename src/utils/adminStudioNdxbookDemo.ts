/** NDXBook v1.0 — demo seeds & UI config (Milestone 29.5). */

import type { NdxbookStore } from '../studio-os-core/ndxbook/types';
import { buildNdxbookStorePatch } from '../workspaces/ai-media/ndxbook/bootstrap';

export const ADMIN_STUDIO_NDXBOOK_SUBTITLE =
  'PUBLIC MEDIA BRAND — INDEXED EDUCATIONAL CONTENT · AI MEDIA PILOT · EVERY PAGE = LABS EXPERIMENT';

export const NDXBOOK_INHERITANCE_CHAIN = [
  'BRAND IDENTITY',
  'CONTENT TAXONOMY',
  'LAUNCH VOLUMES',
  'PROGRAMMING SCHEDULE',
  'PAGE REGISTRY',
  'BRAND VOICE',
  'CREATIVE DNA',
  'TALENT HOSTS',
  'SOCIAL PLACEHOLDERS',
  'STUDIO OS LABS',
  'KNOWLEDGE GRAPH',
] as const;

export type NdxbookTabId =
  | 'overview'
  | 'brand'
  | 'taxonomy'
  | 'volumes'
  | 'programming'
  | 'pages'
  | 'voice'
  | 'visual'
  | 'talent'
  | 'socials'
  | 'labs'
  | 'checklist';

export const NDXBOOK_TABS: Array<{ id: NdxbookTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'brand', label: 'BRAND' },
  { id: 'taxonomy', label: 'TAXONOMY' },
  { id: 'volumes', label: 'VOLUMES' },
  { id: 'programming', label: 'PROGRAMMING' },
  { id: 'pages', label: 'PAGES' },
  { id: 'voice', label: 'VOICE' },
  { id: 'visual', label: 'VISUAL DNA' },
  { id: 'talent', label: 'TALENT' },
  { id: 'socials', label: 'SOCIALS' },
  { id: 'labs', label: 'LABS' },
  { id: 'checklist', label: 'LAUNCH CHECKLIST' },
];

export function buildDemoNdxbookStorePatch(): Partial<NdxbookStore> {
  return buildNdxbookStorePatch();
}
