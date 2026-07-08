/**
 * Studio World™ V5 — Architecture Migration Audit
 *
 * Machine-readable inventory of webpage-like routes vs immersive destinations.
 * Canonical report: docs/studio-os/STUDIO_WORLD_ARCHITECTURE_MIGRATION_REPORT_V5.md
 */

import type { StudioNavGroupId } from '../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_MODULES } from '../../utils/adminStudioNavigation';
import type { StudioWorldFlagshipId } from './types';

export type MigrationUiPattern =
  | 'immersive-live'
  | 'immersive-partial-dashboard'
  | 'scrollable-admin-stage'
  | 'executive-lobby'
  | 'module-card-grid'
  | 'platform-admin'
  | 'unclassified';

export type MigrationPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'done';

export type MigrationAuditRow = {
  moduleId: string;
  currentRoute: string;
  navGroupId: StudioNavGroupId;
  currentUiPattern: MigrationUiPattern;
  physicalDestination: string;
  building: string;
  wing: string;
  room: string;
  sceneType: string;
  navigationPath: string;
  requiredSceneStack: string;
  estimatedReusePct: number;
  estimatedNewAssets: 'low' | 'medium' | 'high';
  estimatedGenerationCost: '$' | '$$' | '$$$';
  estimatedComplexity: 'S' | 'M' | 'L' | 'XL';
  migrationPriority: MigrationPriority;
  flaggedAsWebpage: boolean;
  flagshipId: StudioWorldFlagshipId;
};

const GROUP_FLAGSHIP: Record<StudioNavGroupId, StudioWorldFlagshipId> = {
  overview: 'studio-command-center',
  create: 'creative-direction-studio',
  visuals: 'studio-warehouse',
  production: 'headquarters',
  distribution: 'headquarters',
  intelligence: 'headquarters',
  legacy: 'studio-archives',
  settings: 'studio-command-center',
};

const GROUP_WING: Record<StudioNavGroupId, string> = {
  overview: 'Executive District™',
  create: 'Story Table Wing™',
  visuals: 'Production Wing™',
  production: 'Operations Headquarters™',
  distribution: 'Distribution Headquarters™',
  intelligence: 'Intelligence Headquarters™',
  legacy: 'Museum Wing™',
  settings: 'Systems Dock™',
};

const BUILDING_BY_FLAGSHIP: Record<StudioWorldFlagshipId, string> = {
  'studio-command-center': 'Command Center™',
  'creative-direction-studio': 'Creative Direction Studio™',
  'studio-warehouse': 'Studio Warehouse™',
  'studio-archives': 'Studio Archives™',
  marketplace: 'Marketplace™',
  headquarters: 'Headquarters™',
  'expedition-hub': 'Expedition Hub™',
};

/** V5 Room Rule — explicit canon mappings */
const V5_ROOM_CANON: Record<string, { room: string; wing?: string; building?: string }> = {
  overview: {
    room: 'Organization Pulse Core™',
    wing: 'Mission Control™',
    building: 'Executive Operations Headquarters™',
  },
  'experience-observatory': {
    room: 'Experience Observatory™',
    wing: 'Creative Director Wing™',
    building: 'Executive Operations Headquarters™',
  },
  'architecture-observatory': {
    room: 'Architecture Observatory™',
    wing: 'System Health Observatory™',
    building: 'Executive Operations Headquarters™',
  },
  'world-atlas': {
    room: 'Studio World Atlas™',
    wing: 'Executive Atrium™',
    building: 'Command Center™',
  },
  'innovation-district': {
    room: 'Innovation District™',
    wing: 'Innovation Campus™',
    building: 'Studio Archives™',
  },
  'innovation-lineage-gallery': {
    room: 'Innovation Lineage Gallery™',
    wing: 'Museum Wing™',
    building: 'Studio Archives™',
  },
  'innovation-constellations': {
    room: 'Innovation Constellations™',
    wing: 'Living Universe Observatory™',
    building: 'Studio Archives™',
  },
  'innovation-expeditions': {
    room: 'Innovation Expeditions™',
    wing: 'Guided Knowledge Hall™',
    building: 'Studio Archives™',
  },
  'constitution-hall': {
    room: 'Constitution Hall™',
    wing: 'Executive District™',
    building: 'Command Center™',
  },
  'mission-control': { room: 'Mission Control Room™', wing: 'Mission Control™' },
  'company-health-index': { room: 'Financial Observatory™', wing: 'Finance Wing™' },
  'organization-pulse': { room: 'Organization Pulse Core™', wing: 'Mission Control™' },
  analytics: { room: 'Performance Observatory™', wing: 'Intelligence Wing™' },
  'executive-ai-director': { room: 'Intelligence Nexus™', wing: 'Global AI Wing™' },
  marketplace: { room: 'Marketplace Pavilion™', wing: 'Licensing Hall™', building: 'Marketplace™' },
  'ecosystem-marketplace': { room: 'Marketplace Pavilion™', wing: 'Licensing Hall™', building: 'Marketplace™' },
  'qa-headquarters': { room: 'Infrastructure Observatory™', wing: 'System Health Observatory™' },
  'engineering-excellence-dashboard': { room: 'Infrastructure Observatory™', wing: 'System Health Observatory™' },
  'performance-monitor': { room: 'Infrastructure Observatory™', wing: 'System Health Observatory™' },
  'system-registry': { room: 'Systems Dock™', wing: 'Operations Wing™' },
  'studio-warehouse': { room: 'Studio Warehouse™', wing: 'Production Wing™', building: 'Studio Warehouse™' },
  department: { room: 'Creative Direction Studio™', wing: 'Scene Stack™', building: 'Creative Direction Studio™' },
  'expansion-center': { room: 'Expansion Center Atrium™', wing: 'Discovery Atrium™', building: 'Expedition Hub™' },
  'business-discovery-blueprint': { room: 'Business Discovery Expedition™', wing: 'Discovery Atrium™', building: 'Expedition Hub™' },
};

const IMMERSIVE_LIVE_IDS = new Set(['studio-warehouse', 'department', 'creative-direction-immersive']);
const IMMERSIVE_PARTIAL_IDS = new Set([
  'overview',
  'architecture-observatory',
  'experience-observatory',
  'world-atlas',
  'constitution-hall',
  'innovation-district',
  'innovation-lineage-gallery',
  'innovation-constellations',
  'innovation-expeditions',
]);

const P0_IDS = new Set([
  'overview',
  'mission-control',
  'executive-command-center',
  'executive-ai-director',
  'company-health-index',
  'organization-pulse',
  'analytics',
  'chief-of-staff',
  'executive-council',
  'work-orchestration',
  'campaign-orchestrator',
  'qa-headquarters',
  'engineering-excellence-dashboard',
  'governance',
  'system-registry',
  'workflow-engine',
  'state-engine',
  'event-bus',
  'permission-engine',
  'policy-engine',
  'performance-monitor',
]);

function titleCaseRoom(id: string): string {
  return `${id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Room™`;
}

function resolveUiPattern(moduleId: string): MigrationUiPattern {
  if (IMMERSIVE_LIVE_IDS.has(moduleId)) return 'immersive-live';
  if (IMMERSIVE_PARTIAL_IDS.has(moduleId)) return 'immersive-partial-dashboard';
  return 'scrollable-admin-stage';
}

function resolvePriority(moduleId: string, groupId: StudioNavGroupId): MigrationPriority {
  if (IMMERSIVE_LIVE_IDS.has(moduleId)) return 'done';
  if (P0_IDS.has(moduleId) || groupId === 'overview') return 'P0';
  if (groupId === 'distribution' || groupId === 'legacy' || groupId === 'production' || groupId === 'create' || groupId === 'visuals') {
    return 'P1';
  }
  if (groupId === 'intelligence') return 'P2';
  return 'P3';
}

function resolveSceneStack(moduleId: string, ui: MigrationUiPattern): string {
  if (moduleId === 'overview') {
    return 'studio-command-center: threshold → executive-atrium → pulse-core → wing-corridors (V5)';
  }
  if (moduleId === 'studio-warehouse') {
    return 'studio-warehouse: production-wing → assembly-bay → asset-registry';
  }
  if (moduleId === 'department') {
    return 'creative-direction: genesis → story-table → scene-stack-9-layer';
  }
  if (ui === 'immersive-live' || ui === 'immersive-partial-dashboard') {
    return 'existing Scene Stack manifest — extend for V5 wings';
  }
  return 'none — AdminStudioStageShell scroll container (forbidden)';
}

function buildRow(mod: (typeof ADMIN_STUDIO_MODULES)[number]): MigrationAuditRow {
  const flagshipId = GROUP_FLAGSHIP[mod.groupId];
  const canon = V5_ROOM_CANON[mod.id];
  const building = canon?.building ?? BUILDING_BY_FLAGSHIP[flagshipId];
  const wing = canon?.wing ?? GROUP_WING[mod.groupId];
  const room = canon?.room ?? titleCaseRoom(mod.id);
  const ui = resolveUiPattern(mod.id);
  const priority = resolvePriority(mod.id, mod.groupId);
  const flagged = ui === 'scrollable-admin-stage' || ui === 'immersive-partial-dashboard';

  let reuse = 20;
  if (ui === 'immersive-live') reuse = 90;
  else if (ui === 'immersive-partial-dashboard') reuse = 45;
  else if (mod.groupId === 'create') reuse = 35;

  const complexity: MigrationAuditRow['estimatedComplexity'] =
    mod.id === 'overview' || mod.id === 'mission-control'
      ? 'XL'
      : mod.groupId === 'intelligence'
        ? 'L'
        : reuse > 70
          ? 'S'
          : 'M';

  return {
    moduleId: mod.id,
    currentRoute: mod.route,
    navGroupId: mod.groupId,
    currentUiPattern: ui,
    physicalDestination: room,
    building,
    wing,
    room,
    sceneType:
      ui === 'immersive-live'
        ? 'immersive-walk'
        : ui === 'immersive-partial-dashboard'
          ? 'immersive-partial-dashboard-hybrid'
          : 'admin-scroll-panel',
    navigationPath: `Studio World™ → ${building} → ${wing} → walk`,
    requiredSceneStack: resolveSceneStack(mod.id, ui),
    estimatedReusePct: reuse,
    estimatedNewAssets: reuse > 70 ? 'low' : reuse > 40 ? 'medium' : 'high',
    estimatedGenerationCost: reuse > 70 ? '$' : reuse > 40 ? '$$' : '$$$',
    estimatedComplexity: complexity,
    migrationPriority: priority,
    flaggedAsWebpage: flagged,
    flagshipId,
  };
}

/** All 191 nav modules with migration metadata */
export const STUDIO_WORLD_MIGRATION_AUDIT: MigrationAuditRow[] = ADMIN_STUDIO_MODULES.map(buildRow);

export type MigrationAuditSummary = {
  totalModules: number;
  flaggedWebpageLike: number;
  immersiveLive: number;
  immersivePartial: number;
  byPriority: Record<MigrationPriority, number>;
  byFlagship: Record<StudioWorldFlagshipId, number>;
  byUiPattern: Record<MigrationUiPattern, number>;
  registryMapped: number;
  registryGap: number;
  completionPctArchitectural: number;
  completionPctExperiential: number;
};

export function getMigrationAuditSummary(): MigrationAuditSummary {
  const byPriority = { P0: 0, P1: 0, P2: 0, P3: 0, done: 0 } as Record<MigrationPriority, number>;
  const byFlagship = {} as Record<StudioWorldFlagshipId, number>;
  const byUiPattern = {} as Record<MigrationUiPattern, number>;

  for (const row of STUDIO_WORLD_MIGRATION_AUDIT) {
    byPriority[row.migrationPriority]++;
    byFlagship[row.flagshipId] = (byFlagship[row.flagshipId] ?? 0) + 1;
    byUiPattern[row.currentUiPattern] = (byUiPattern[row.currentUiPattern] ?? 0) + 1;
  }

  const flagged = STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.flaggedAsWebpage).length;
  const live = STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.currentUiPattern === 'immersive-live').length;
  const partial = STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.currentUiPattern === 'immersive-partial-dashboard').length;

  return {
    totalModules: STUDIO_WORLD_MIGRATION_AUDIT.length,
    flaggedWebpageLike: flagged,
    immersiveLive: live,
    immersivePartial: partial,
    byPriority,
    byFlagship,
    byUiPattern,
    registryMapped: 76,
    registryGap: STUDIO_WORLD_MIGRATION_AUDIT.length - 76,
    /** V4 law + registry + flagships defined */
    completionPctArchitectural: 70,
    /** Immersive-live modules / total */
    completionPctExperiential: Math.round((live / STUDIO_WORLD_MIGRATION_AUDIT.length) * 100),
  };
}

export function listMigrationRowsByPriority(priority: MigrationPriority): MigrationAuditRow[] {
  return STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.migrationPriority === priority);
}

export function listFlaggedWebpageRoutes(): MigrationAuditRow[] {
  return STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.flaggedAsWebpage);
}
