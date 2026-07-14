/**
 * Draft-only Navigation master icon placeholders — NOT registered into production registry.
 * Sprint 02 Phase 1: metadata prepared for future Icon Builder import.
 */
import type { StudioWorldIconDefinition } from '../../../../studio-os-core/studio-world-icon-system';
import {
  NAVIGATION_MASTER_ICON_NAMES,
  NAVIGATION_MASTER_ICON_REGISTRY,
  type NavigationMasterIconName,
} from './navigation-master-icon-registry';
import {
  NAVIGATION_MASTER_ICON_SOURCES,
  NAVIGATION_MASTER_ICON_DESIGN_LANGUAGE,
} from './navigation-master-icon-source-manifest';
import placeholdersJson from './navigation-master-icon-draft-placeholders.generated.json';

export const NAVIGATION_MASTER_DRAFT_PREFIX = 'navigation.' as const;

const PENDING_THEME_COMPATIBILITY = {
  'studio-dark': false,
  'studio-light': false,
  'luxury-gold': false,
  monochrome: false,
  presentation: false,
  accessibility: false,
} as const;

function buildDraftDefinition(name: NavigationMasterIconName): StudioWorldIconDefinition {
  const entry = NAVIGATION_MASTER_ICON_REGISTRY[name];
  const now = new Date().toISOString();

  return {
    id: `${NAVIGATION_MASTER_DRAFT_PREFIX}${name}`,
    category: 'navigation',
    displayName: entry.accessibleLabel,
    aliases: [entry.sourceLabel, name, `navigation-${name}`],
    keywords: [...entry.keywords, 'navigation', 'sprint-02', 'master-sheet'],
    description: entry.intendedUse,
    version: 'v1',
    certification: 'draft',
    status: 'draft',
    strokeWidth: NAVIGATION_MASTER_ICON_DESIGN_LANGUAGE.strokeWidth,
    cornerRadius: NAVIGATION_MASTER_ICON_DESIGN_LANGUAGE.cornerRadius,
    opticalWeight: NAVIGATION_MASTER_ICON_DESIGN_LANGUAGE.opticalWeight,
    designFamily: NAVIGATION_MASTER_ICON_SOURCES.masterSheet.designFamily,
    renderStyle: 'raster',
    themeCompatibility: { ...PENDING_THEME_COMPATIBILITY },
    provider: 'local-png',
    defaultAsset: null,
    hoverAsset: null,
    activeAsset: null,
    disabledAsset: null,
    futureAnimatedAsset: null,
    futureVariableAsset: null,
    future3DAsset: null,
    svgPath: null,
    pngPath: null,
    thumbnail: null,
    preview: null,
    stateAssets: {},
    future: {
      supportsAnimation: false,
      supportsMorph: false,
      supportsVariable: false,
      supports3D: false,
      supportsParticles: false,
      supportsGlow: true,
      supportsPhysics: false,
    },
    metadata: {
      author: 'studio-world-navigation-master-v1',
      createdAt: now,
      updatedAt: now,
      tags: ['navigation', 'sprint-02', 'draft', 'master-sheet'],
      departmentUsage: ['studio-world'],
      usageCount: 0,
      favorite: false,
      deprecated: false,
      replacement: null,
    },
  };
}

/** Returns draft placeholder definitions — does NOT call registerIcon(). */
export function listNavigationMasterDraftIconDefinitions(): StudioWorldIconDefinition[] {
  return NAVIGATION_MASTER_ICON_NAMES.map(buildDraftDefinition);
}

/** JSON artifact generated alongside master sheet. */
export function getNavigationMasterDraftPlaceholdersArtifact() {
  return placeholdersJson;
}

/** Count check for tests and diagnostics. */
export function getNavigationMasterDraftIconCount(): number {
  return NAVIGATION_MASTER_ICON_NAMES.length;
}
