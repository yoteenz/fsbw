/** Modular Studio routing — canonical paths and built-section registry. */

import type { AdminStudioSectionId } from './adminStudioDemo';

export const ADMIN_STUDIO_BASE_PATH = '/admin/studio';

export type AdminStudioBuiltSectionId = Extract<
  AdminStudioSectionId,
  | 'shows'
  | 'content-packs'
  | 'ai-studio'
  | 'prompt-library'
  | 'asset-library'
  | 'publishing-queue'
  | 'analytics'
  | 'content-brain'
  | 'creative-director'
  | 'intelligence-engine'
  | 'ai-orchestrator'
  | 'show-bible'
>;

export const ADMIN_STUDIO_BUILT_SECTIONS: readonly AdminStudioBuiltSectionId[] = [
  'shows',
  'content-packs',
  'ai-studio',
  'prompt-library',
  'asset-library',
  'publishing-queue',
  'analytics',
  'content-brain',
  'creative-director',
  'intelligence-engine',
  'ai-orchestrator',
  'show-bible',
] as const;

export const ADMIN_STUDIO_BUILT_SECTION_SET = new Set<string>(ADMIN_STUDIO_BUILT_SECTIONS);

/** Route definitions for lazy App.tsx wiring (path relative to /admin). */
export const ADMIN_STUDIO_ROUTE_PATHS = {
  hub: 'studio',
  shows: 'studio/shows',
  showDetail: 'studio/shows/:showId',
  contentPacks: 'studio/content-packs',
  contentPackDetail: 'studio/content-packs/:packId',
  aiStudio: 'studio/ai-studio',
  promptLibrary: 'studio/prompt-library',
  assetLibrary: 'studio/asset-library',
  publishingQueue: 'studio/publishing-queue',
  analytics: 'studio/analytics',
  contentBrain: 'studio/content-brain',
  contentBrainSection: 'studio/content-brain/:sectionId',
  creativeDirector: 'studio/creative-director',
  intelligenceEngine: 'studio/intelligence-engine',
  aiOrchestrator: 'studio/ai-orchestrator',
  showBible: 'studio/show-bible',
  showBibleDetail: 'studio/show-bible/:showId',
  sectionPlaceholder: 'studio/:sectionId',
} as const;

export function adminStudioPath(segment: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/${segment.replace(/^\//, '')}`;
}

export function adminStudioShowPath(showId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/shows/${showId}`;
}

export function adminStudioContentPackPath(packId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/content-packs/${packId}`;
}

export function adminStudioShowBiblePath(showId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/show-bible/${showId}`;
}
