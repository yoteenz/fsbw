/**
 * Seeds Studio World Icon Registry from existing Experience Lab v6 icons.
 * Does NOT modify runtime visuals — bridge only registers canonical metadata objects.
 */
import {
  registerIcon,
  resetStudioWorldIconRegistry,
  type StudioWorldIconCategoryId,
  type StudioWorldIconDefinition,
} from '../../../studio-os-core/studio-world-icon-system';
import {
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  type ExperienceLabIconName,
} from './experience-lab-icon-registry';
import {
  resolveExperienceLabIconAssetPath,
  EXPERIENCE_LAB_ICON_BRIDGE_LOCKDOWN_CERTIFIED,
} from './studio-world-icon-asset-paths';
import { WORKBENCH_TOOL_ICON } from '../experience-lab-v2/experience-lab-v2-icon-bindings';

let bridgeInitialized = false;

function inferCategory(intendedUse: string): StudioWorldIconCategoryId {
  const text = intendedUse.toLowerCase();
  if (text.includes('marketplace') || text.includes('commerce')) return 'marketplace';
  if (text.includes('security') || text.includes('permission')) return 'security';
  if (text.includes('analytics') || text.includes('performance')) return 'analytics';
  if (text.includes('review') || text.includes('approval') || text.includes('revision')) return 'review';
  if (text.includes('playback') || text.includes('capture') || text.includes('fullscreen')) return 'media';
  if (text.includes('team') || text.includes('share') || text.includes('comment')) return 'collaboration';
  if (text.includes('cloud') || text.includes('sync') || text.includes('database')) return 'cloud';
  if (text.includes('blueprint') || text.includes('material') || text.includes('construction')) return 'assets';
  if (text.includes('workbench') || text.includes('viewport') || text.includes('inspector')) return 'workspace';
  if (text.includes('diagnostic') || text.includes('terminal') || text.includes('settings')) return 'system';
  if (text.includes('experience lab')) return 'studio-world-exclusive';
  return 'navigation';
}

function buildDefinitionFromExperienceLab(name: ExperienceLabIconName): StudioWorldIconDefinition {
  const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
  const assetPath = resolveExperienceLabIconAssetPath(name);
  const now = new Date().toISOString();

  return {
    id: name,
    category: inferCategory(entry.intendedUse),
    displayName: entry.accessibleLabel,
    aliases: [entry.sourceLabel, name],
    keywords: entry.intendedUse.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    description: entry.intendedUse,
    version: 'certified',
    certification: EXPERIENCE_LAB_ICON_BRIDGE_LOCKDOWN_CERTIFIED ? 'certified' : 'qa',
    status: 'active',
    strokeWidth: 1,
    cornerRadius: 2,
    opticalWeight: 1,
    designFamily: 'studio-world-grid-v6',
    renderStyle: 'raster',
    themeCompatibility: {
      'studio-dark': true,
      'studio-light': true,
      monochrome: true,
      presentation: true,
      accessibility: true,
    },
    provider: 'experience-lab-v6',
    defaultAsset: assetPath,
    hoverAsset: null,
    activeAsset: null,
    disabledAsset: null,
    futureAnimatedAsset: null,
    futureVariableAsset: null,
    future3DAsset: null,
    svgPath: null,
    pngPath: assetPath,
    thumbnail: assetPath,
    preview: assetPath,
    stateAssets: {
      default: { pngPath: assetPath, provider: 'experience-lab-v6' },
    },
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
      author: 'studio-world-icon-grid-v6',
      createdAt: now,
      updatedAt: now,
      tags: ['experience-lab', 'v6-grid'],
      departmentUsage: ['experience-lab'],
      usageCount: 0,
      favorite: false,
      deprecated: false,
      replacement: null,
    },
    legacyExperienceLabIconName: name,
  };
}

function registerWorkbenchAliases(): void {
  for (const [toolId, iconName] of Object.entries(WORKBENCH_TOOL_ICON)) {
    const source = buildDefinitionFromExperienceLab(iconName);
    registerIcon({
      ...source,
      id: `workbench.${toolId}`,
      aliases: [`workbench.${toolId}`, `workbench-${toolId}`],
      keywords: [...source.keywords, 'workbench', toolId],
      metadata: {
        ...source.metadata,
        departmentUsage: [...source.metadata.departmentUsage, 'workbench'],
        tags: [...source.metadata.tags, 'workbench-alias'],
      },
    });
  }
}

function registerCommandDockAliases(): void {
  const slots: Array<{ slotId: string; iconName: ExperienceLabIconName }> = [
    { slotId: 'program', iconName: 'orbit' },
    { slotId: 'department', iconName: 'projects' },
    { slotId: 'environment', iconName: 'experienceLab' },
    { slotId: 'variant', iconName: 'grid' },
  ];
  for (const { slotId, iconName } of slots) {
    const source = buildDefinitionFromExperienceLab(iconName);
    registerIcon({
      ...source,
      id: `command-dock.${slotId}`,
      aliases: [`command-dock.${slotId}`, `command-dock-${slotId}`],
      keywords: [...source.keywords, 'command-dock', slotId],
      metadata: {
        ...source.metadata,
        tags: [...source.metadata.tags, 'command-dock-alias'],
      },
    });
  }
}

/** Idempotent bridge — registers existing Experience Lab icons into canonical registry. */
export function ensureStudioWorldIconSystemBridge(): { registered: number } {
  if (bridgeInitialized) {
    return { registered: EXPERIENCE_LAB_ICON_NAMES.length };
  }

  for (const name of EXPERIENCE_LAB_ICON_NAMES) {
    registerIcon(buildDefinitionFromExperienceLab(name));
  }
  registerWorkbenchAliases();
  registerCommandDockAliases();
  bridgeInitialized = true;

  return { registered: EXPERIENCE_LAB_ICON_NAMES.length };
}

/** Test-only */
export function resetStudioWorldIconSystemBridge(): void {
  bridgeInitialized = false;
  resetStudioWorldIconRegistry();
}
