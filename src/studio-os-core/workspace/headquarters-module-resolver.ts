/**
 * Resolve Headquarters module pages for workspace-scoped routes.
 * Uses Vite glob — same page modules as legacy /admin/studio/* (zero UX duplication).
 */

import type { ComponentType } from 'react';

type PageModule = () => Promise<{ default: ComponentType }>;

/** Relative to studio-os-core/workspace/ → pages/admin/studio/ */
const HEADQUARTERS_PAGE_GLOB = import.meta.glob<{ default: ComponentType }>(
  '../../pages/admin/studio/**/page.tsx'
) as Record<string, PageModule>;

const LEGACY_FS_STUDIO_PREFIX = '/admin/studio';

/** Segments that use /detail/page.tsx when a second path segment is present. */
const DETAIL_PARENT_SEGMENTS = new Set([
  'shows',
  'content-packs',
  'show-bible',
  'studio-lot',
  'talent-agency',
  'casting',
  'production',
  'ai-production-engine',
  'distribution-network',
  'blueprint-manager',
  'asset-director',
]);

/** Segments that use /section/page.tsx for dynamic subsection routes. */
const SECTION_PARENT_SEGMENTS = new Set(['content-brain', 'asset-director']);

function normalizeRestPath(rest: string): string {
  return rest.replace(/^\/+/, '').replace(/\/+$/, '');
}

function globKey(relativePath: string): string | null {
  const key = `../../pages/admin/studio/${relativePath}/page.tsx`;
  return key in HEADQUARTERS_PAGE_GLOB ? key : null;
}

function loadModule(relativePath: string): PageModule | null {
  const key = globKey(relativePath);
  if (!key) return null;
  return HEADQUARTERS_PAGE_GLOB[key] ?? null;
}

/**
 * Map workspace-scoped rest path (e.g. mission-control, shows/abc, knowledge-hub/profile/x)
 * to the same page module used by Frontal Slayer legacy routes.
 */
export function resolveHeadquartersPageModule(rest: string): PageModule | null {
  const clean = normalizeRestPath(rest);
  if (!clean || clean === 'hub') {
    return loadModule('mission-control');
  }

  const parts = clean.split('/').filter(Boolean);
  const [head, second, third] = parts;

  if (head === 'knowledge-hub') {
    if (second === 'profile') return loadModule('knowledge-hub/profile');
    if (second === 'workflow') return loadModule('knowledge-hub/workflow');
    return loadModule('knowledge-hub');
  }

  if (head === 'brand-assets') {
    if (second === 'photography-bible') return loadModule('brand-assets/photography-bible');
    if (second === 'asset-factory') return loadModule('brand-assets/asset-factory');
    return loadModule('brand-assets');
  }

  if (head === 'legacy-system' && second === 'museum') {
    return loadModule('legacy-system/museum');
  }

  if (head === 'audience-brain' && second === 'intelligence') {
    return loadModule('audience-brain/intelligence');
  }

  if (head === 'distribution-network') {
    if (second === 'channel') return loadModule('distribution-network/channel');
    if (second) return loadModule('distribution-network');
    return loadModule('distribution-network');
  }

  if (head === 'asset-director') {
    if (second === 'studios' && third) return loadModule('asset-director/studios/detail');
    if (second === 'studios') return loadModule('asset-director/studios');
    if (second === 'talent' && third) return loadModule('asset-director/talent/detail');
    if (second === 'talent') return loadModule('asset-director/talent');
    if (second === 'section') return loadModule('asset-director/section');
    if (second) return loadModule('asset-director/section');
    return loadModule('asset-director');
  }

  if (head === 'casting') {
    if (second === 'talent') return loadModule('casting/talent');
    if (second) return loadModule('casting/detail');
    return loadModule('casting');
  }

  if (head === 'content-brain' && second) {
    return loadModule('content-brain/section');
  }

  if (DETAIL_PARENT_SEGMENTS.has(head) && second) {
    if (head === 'distribution-network') {
      return loadModule('distribution-network');
    }
    if (head === 'blueprint-manager') {
      return loadModule('blueprint-manager/detail');
    }
    if (head === 'asset-director') {
      return loadModule('asset-director/section');
    }
    return loadModule(`${head}/detail`);
  }

  if (SECTION_PARENT_SEGMENTS.has(head) && second) {
    return loadModule(`${head}/section`);
  }

  if (head && !second) {
    const direct = loadModule(head);
    if (direct) return direct;
  }

  if (head === 'section' || parts.length === 1) {
    return loadModule('section');
  }

  return loadModule(head);
}

export function isLegacyFrontalSlayerStudioPath(pathname: string): boolean {
  return (
    pathname.startsWith(`${LEGACY_FS_STUDIO_PREFIX}/`) ||
    pathname === LEGACY_FS_STUDIO_PREFIX
  );
}

export function headquartersModuleCount(): number {
  return Object.keys(HEADQUARTERS_PAGE_GLOB).length;
}
