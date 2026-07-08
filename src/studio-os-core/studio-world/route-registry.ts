/**
 * Studio World™ V4 — complete route → physical location registry.
 * Legacy paths preserved; world paths are canonical addresses for navigation.
 */

import type {
  StudioWorldFlagshipId,
  StudioWorldMigrationStatus,
  StudioWorldPhysicalType,
  StudioWorldRouteMapping,
  StudioWorldShellKind,
} from './types';

const BASE = '/admin/studio';
const WORLD = `${BASE}/world`;

function m(
  id: string,
  displayName: string,
  physicalType: StudioWorldPhysicalType,
  flagshipId: StudioWorldFlagshipId,
  parentLocationId: string,
  worldSegments: string,
  legacySlug: string,
  shell: StudioWorldShellKind,
  migrationStatus: StudioWorldMigrationStatus,
  formerFeatureName?: string
): StudioWorldRouteMapping {
  const legacyPath = legacySlug.startsWith('/')
    ? legacySlug
    : `${BASE}/${legacySlug.replace(/^\//, '')}`;
  return {
    id,
    displayName,
    physicalType,
    flagshipId,
    parentLocationId,
    worldPath: `${WORLD}/${worldSegments}`,
    legacyPath,
    legacySlug,
    shell,
    migrationStatus,
    formerFeatureName,
  };
}

/** Authoritative mapping — extend as rooms gain immersive shells. */
export const STUDIO_WORLD_ROUTE_REGISTRY: StudioWorldRouteMapping[] = [
  // ── Studio Command Center™ ──
  m('studio-command-center-entry', 'Studio Command Center™', 'command-center', 'studio-command-center', 'scc-executive-district', 'command-center', 'overview', 'immersive', 'immersive-partial'),
  m('mission-control', 'Mission Control Room™', 'command-center', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/mission-control', 'overview', 'immersive', 'immersive-partial', 'Mission Control'),
  m('executive-command-center', 'Executive Command Center™', 'command-center', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/executive-command', 'executive-command-center', 'standard', 'standard-room'),
  m('chief-of-staff', 'Chief of Staff Office™', 'room', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/chief-of-staff', 'chief-of-staff', 'standard', 'standard-room'),
  m('executive-council', 'Executive Council Chamber™', 'room', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/executive-council', 'executive-council', 'standard', 'standard-room'),
  m('executive-ai-director', 'Executive AI Director Observatory™', 'observatory', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/ai-director', 'executive-ai-director', 'standard', 'standard-room'),
  m('executive-timeline', 'Executive Timeline Gallery™', 'gallery', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/timeline', 'executive-timeline', 'standard', 'standard-room'),
  m('analytics', 'Performance Observatory™', 'observatory', 'studio-command-center', 'scc-performance-observatory', 'command-center/performance-observatory/analytics', 'analytics', 'standard', 'standard-room', 'Analytics'),
  m('company-health-index', 'Company Health Observatory™', 'observatory', 'studio-command-center', 'scc-performance-observatory', 'command-center/performance-observatory/health', 'company-health-index', 'standard', 'standard-room'),
  m('organization-pulse', 'Organization Pulse Observatory™', 'observatory', 'studio-command-center', 'scc-performance-observatory', 'command-center/performance-observatory/pulse', 'organization-pulse', 'standard', 'standard-room'),
  m('work-orchestration', 'Operations Coordination Room™', 'room', 'studio-command-center', 'scc-operations-wing', 'command-center/operations-wing/orchestration', 'work-orchestration', 'standard', 'standard-room'),
  m('campaign-orchestrator', 'Campaign Operations Theater™', 'theater', 'studio-command-center', 'scc-operations-wing', 'command-center/operations-wing/campaign-ops', 'campaign-orchestrator', 'standard', 'standard-room'),
  m('governance', 'Security Center™', 'room', 'studio-command-center', 'scc-security-center', 'command-center/security-center/governance', 'governance', 'standard', 'standard-room'),
  m('qa-headquarters', 'QA Command Center™', 'command-center', 'studio-command-center', 'scc-security-center', 'command-center/security-center/qa-headquarters', 'qa-headquarters', 'standard', 'standard-room'),
  m('engineering-excellence-dashboard', 'Engineering Excellence Observatory™', 'observatory', 'studio-command-center', 'scc-performance-observatory', 'command-center/performance-observatory/engineering', 'engineering-excellence-dashboard', 'standard', 'standard-room'),
  m('studio-overview', 'Campus Map Atrium™', 'atrium', 'studio-command-center', 'scc-executive-district', 'command-center/campus-map', 'overview', 'layout', 'standard-room', 'Overview'),
  m('studio-hub', 'Legacy Campus Map™', 'atrium', 'studio-command-center', 'scc-executive-district', 'command-center/legacy-hub', 'hub', 'layout', 'standard-room', 'Hub'),

  // ── Creative Direction Studio™ ──
  m('creative-direction-immersive', 'Creative Direction Studio™', 'studio', 'creative-direction-studio', 'cds-story-table', 'creative-direction-studio', 'department/creative-direction', 'immersive', 'immersive-live'),
  m('creative-director', 'Creative Director Briefing Room™', 'room', 'creative-direction-studio', 'cds-story-table', 'creative-direction-studio/briefing', 'creative-director', 'standard', 'immersive-partial'),
  m('director-mode', 'Director Mode Theater™', 'theater', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/director-mode', 'director-mode', 'standard', 'standard-room'),
  m('production-builder', 'Production Builder Workshop™', 'workshop', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/production-builder', 'production-builder', 'standard', 'standard-room'),
  m('content-brain', 'Content Brain Library™', 'library', 'creative-direction-studio', 'cds-story-table', 'creative-direction-studio/content-brain', 'content-brain', 'standard', 'standard-room'),
  m('design-dna-canon', 'Design DNA Canon Vault™', 'vault', 'creative-direction-studio', 'cds-story-table', 'creative-direction-studio/design-dna', 'design-dna-canon', 'standard', 'standard-room'),
  m('prompt-library', 'Prompt Library™', 'library', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/prompt-library', 'prompt-library', 'standard', 'standard-room'),
  m('ai-studio', 'AI Studio Laboratory™', 'laboratory', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/ai-studio', 'ai-studio', 'standard', 'standard-room'),
  m('concierge-approval-flow', 'Approval Gallery™', 'gallery', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/approval-flow', 'concierge-approval-flow', 'standard', 'standard-room'),
  m('screening-room', 'Screening Theater™', 'theater', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/screening-room', 'screening-room', 'standard', 'standard-room'),
  m('render-queue', 'Render Queue Bay™', 'room', 'creative-direction-studio', 'cds-scene-stack', 'creative-direction-studio/render-queue', 'render-queue', 'standard', 'standard-room'),

  // ── Studio Warehouse™ ──
  m('studio-warehouse-entry', 'Studio Warehouse™', 'workshop', 'studio-warehouse', 'warehouse-production-wing', 'warehouse', 'studio-warehouse', 'immersive', 'immersive-live'),
  m('studio-warehouse-alias', 'Studio Warehouse™ (legacy path)', 'workshop', 'studio-warehouse', 'warehouse-production-wing', 'warehouse/legacy', 'studio-warehouse', 'immersive', 'immersive-live'),
  m('asset-registry', 'Asset Registry Vault™', 'vault', 'studio-warehouse', 'warehouse-production-wing', 'warehouse/production-wing/asset-registry', 'asset-registry', 'standard', 'standard-room'),
  m('asset-library', 'Media Vault™', 'vault', 'studio-warehouse', 'warehouse-production-wing', 'warehouse/production-wing/media-vault', 'asset-library', 'standard', 'standard-room', 'Asset Library'),
  m('asset-factory', 'Generation Bay™', 'laboratory', 'studio-warehouse', 'warehouse-production-wing', 'warehouse/production-wing/generation-bay', 'asset-factory', 'standard', 'immersive-partial', 'Asset Factory'),
  m('asset-director', 'Asset Director Gallery™', 'gallery', 'studio-warehouse', 'warehouse-production-wing', 'warehouse/production-wing/asset-director', 'asset-director', 'standard', 'standard-room'),

  // ── Studio Archives™ ──
  m('studio-archives', 'Studio Archives™', 'building', 'studio-archives', 'archives-grand-entrance', 'archives', 'studio-archives', 'immersive', 'immersive-live'),
  m('archives-museum-wing', 'Museum Wing™', 'museum', 'studio-archives', 'archives-museum-wing', 'archives/museum-wing', '/admin/studio/studio-archives?zone=museum-wing', 'immersive', 'immersive-live'),
  m('blueprint-manager', 'Blueprint Archive™', 'library', 'studio-archives', 'archives-blueprint-archive', 'archives/blueprint-archive', 'blueprint-manager', 'standard', 'immersive-partial', 'Blueprint Manager'),
  m('legacy-system', 'Legacy Museum Hall™', 'museum', 'studio-archives', 'archives-museum-wing', 'archives/museum-wing/legacy-system', 'legacy-system', 'standard', 'standard-room'),
  m('legacy-vault', 'Legacy Vault™', 'vault', 'studio-archives', 'archives-museum-wing', 'archives/museum-wing/legacy-vault', 'legacy-vault', 'module', 'standard-room'),
  m('organization-genome-archives', 'Company Genome Vault™', 'vault', 'studio-archives', 'archives-genome-vault', 'archives/genome-vault', 'organization-genome', 'standard', 'immersive-partial'),
  m('innovation-lab-archives', 'Hall of Innovation™', 'gallery', 'studio-archives', 'archives-innovation-hall', 'archives/hall-of-innovation', 'innovation-lab', 'standard', 'immersive-partial'),
  m('innovation-district', 'Innovation District™', 'district', 'studio-archives', 'archives-innovation-district', 'archives/innovation-district', 'innovation-district', 'immersive', 'immersive-partial', 'Collaborative Innovation Network'),
  m('innovation-lineage-gallery', 'Innovation Lineage Gallery™', 'gallery', 'studio-archives', 'archives-museum-wing', 'archives/museum-wing/innovation-lineage-gallery', 'innovation-lineage-gallery', 'immersive', 'immersive-partial', 'Innovation Lineage'),
  m('innovation-constellations', 'Innovation Constellations™', 'observatory', 'studio-archives', 'archives-innovation-constellations', 'archives/innovation-constellations', 'innovation-constellations', 'immersive', 'immersive-partial', 'Innovation Constellations'),

  // ── Marketplace™ ──
  m('marketplace-entry', 'Marketplace™', 'pavilion', 'marketplace', 'marketplace-pavilion', 'marketplace', 'marketplace', 'standard', 'immersive-partial', 'Marketplace'),
  m('marketplace-nav', 'Marketplace Pavilion™', 'pavilion', 'marketplace', 'marketplace-pavilion', 'marketplace/pavilion', 'marketplace', 'standard', 'immersive-partial', 'Marketplace'),

  // ── Headquarters™ (department immersive offices) ──
  m('headquarters-entry', 'Headquarters™', 'headquarters', 'headquarters', 'hq-operations-headquarters', 'headquarters', '/admin/headquarters', 'standard', 'immersive-partial'),
  m('distribution-network', 'Distribution Headquarters™', 'headquarters', 'headquarters', 'hq-distribution-headquarters', 'headquarters/distribution', 'distribution-network', 'standard', 'standard-room'),
  m('distribution-engine', 'Distribution Operations Wing™', 'wing', 'headquarters', 'hq-distribution-headquarters', 'headquarters/distribution/operations', 'distribution-engine', 'standard', 'standard-room'),
  m('publishing-queue', 'Distribution Dock™', 'room', 'headquarters', 'hq-distribution-headquarters', 'headquarters/distribution/dock', 'publishing-queue', 'standard', 'standard-room', 'Publishing Queue'),
  m('social-accounts', 'Social Publishing Studio™', 'studio', 'headquarters', 'hq-distribution-headquarters', 'headquarters/distribution/social-studio', 'social-accounts', 'standard', 'standard-room'),
  m('campaign-engine', 'Campaign Studio™', 'studio', 'headquarters', 'hq-marketing-headquarters', 'headquarters/marketing/campaign-studio', 'campaign-engine', 'standard', 'standard-room'),
  m('brand-architect', 'Brand Headquarters™', 'headquarters', 'headquarters', 'hq-marketing-headquarters', 'headquarters/marketing/brand', 'brand-architect', 'standard', 'standard-room'),
  m('brand-assets', 'Brand Asset Vault™', 'vault', 'headquarters', 'hq-marketing-headquarters', 'headquarters/marketing/brand-vault', 'brand-assets', 'standard', 'standard-room'),
  m('intelligence-engine', 'Intelligence Headquarters™', 'headquarters', 'headquarters', 'hq-intelligence-headquarters', 'headquarters/intelligence', 'intelligence-engine', 'standard', 'standard-room'),
  m('audience-brain', 'Audience Brain Observatory™', 'observatory', 'headquarters', 'hq-intelligence-headquarters', 'headquarters/intelligence/audience', 'audience-brain', 'standard', 'standard-room'),
  m('profession-brain', 'Profession Brain Library™', 'library', 'headquarters', 'hq-intelligence-headquarters', 'headquarters/intelligence/profession-brain', 'profession-brain', 'standard', 'standard-room'),
  m('memory-engine', 'Memory Engine Vault™', 'vault', 'headquarters', 'hq-intelligence-headquarters', 'headquarters/intelligence/memory', 'memory-engine', 'standard', 'standard-room'),
  m('knowledge-hub', 'Knowledge Library™', 'library', 'headquarters', 'hq-intelligence-headquarters', 'headquarters/intelligence/knowledge-hub', 'knowledge-hub', 'standard', 'standard-room', 'Knowledge Hub'),
  m('studio-institute', 'Studio Institute Academy™', 'building', 'headquarters', 'hq-intelligence-headquarters', 'headquarters/intelligence/institute', 'studio-institute', 'standard', 'standard-room'),
  m('production', 'Production Wall™', 'room', 'headquarters', 'hq-operations-headquarters', 'headquarters/operations/production-wall', 'production', 'standard', 'standard-room', 'Pipeline'),
  m('ai-production-engine', 'AI Production Engine™', 'laboratory', 'headquarters', 'hq-operations-headquarters', 'headquarters/operations/ai-production', 'ai-production-engine', 'standard', 'standard-room'),
  m('shows', 'Shows Theater™', 'theater', 'headquarters', 'hq-marketing-headquarters', 'headquarters/marketing/shows', 'shows', 'standard', 'standard-room'),
  m('content-packs', 'Content Pack Workshop™', 'workshop', 'headquarters', 'hq-marketing-headquarters', 'headquarters/marketing/content-packs', 'content-packs', 'standard', 'standard-room'),
  m('talent-agency', 'Talent Theater™', 'theater', 'headquarters', 'hq-operations-headquarters', 'headquarters/operations/talent-theater', 'talent-agency', 'standard', 'standard-room', 'Hiring'),
  m('casting', 'Casting Studio™', 'studio', 'headquarters', 'hq-operations-headquarters', 'headquarters/operations/casting', 'casting', 'standard', 'standard-room'),

  // ── Expedition Hub™ ──
  m('expansion-center', 'Expansion Center Atrium™', 'atrium', 'expedition-hub', 'exp-discovery-atrium', 'expedition-hub/expansion-center', 'expansion-center', 'standard', 'standard-room'),
  m('business-discovery-blueprint', 'Business Discovery Expedition™', 'studio', 'expedition-hub', 'exp-discovery-atrium', 'expedition-hub/business-discovery', 'business-discovery-blueprint', 'standard', 'standard-room'),
  m('organization-inauguration', 'Inauguration Ceremony Hall™', 'theater', 'expedition-hub', 'exp-discovery-atrium', 'expedition-hub/inauguration', 'organization-inauguration', 'standard', 'standard-room'),
  m('business-simulation-lab', 'Simulation Laboratory™', 'laboratory', 'expedition-hub', 'exp-growth-corridor', 'expedition-hub/simulation-lab', 'business-simulation-lab', 'module', 'standard-room'),
  m('organization-digital-twin', 'Digital Twin Observatory™', 'observatory', 'expedition-hub', 'exp-growth-corridor', 'expedition-hub/digital-twin', 'organization-digital-twin', 'module', 'standard-room'),
  m('simulation-engine', 'Strategy Simulation Workshop™', 'workshop', 'expedition-hub', 'exp-growth-corridor', 'expedition-hub/simulation-engine', 'simulation-engine', 'standard', 'standard-room'),
  m('business-model-engine', 'Business Model Laboratory™', 'laboratory', 'expedition-hub', 'exp-growth-corridor', 'expedition-hub/business-model', 'business-model-engine', 'standard', 'standard-room'),
  m('company-onboarding-intelligence', 'Onboarding Expedition™', 'studio', 'expedition-hub', 'exp-discovery-atrium', 'expedition-hub/onboarding', 'company-onboarding-intelligence', 'standard', 'standard-room'),
  m('arrival-experience', 'Arrival Experience Garden™', 'garden', 'expedition-hub', 'exp-discovery-atrium', 'expedition-hub/arrival', 'arrival-experience', 'standard', 'standard-room'),
  m('tutorial-os', 'Learning Path Library™', 'library', 'expedition-hub', 'exp-growth-corridor', 'expedition-hub/tutorial-os', 'tutorial-os', 'standard', 'standard-room'),

  // ── Platform infrastructure (Systems Dock™ under Command Center) ──
  m('system-registry', 'Systems Registry Room™', 'room', 'studio-command-center', 'scc-operations-wing', 'command-center/operations-wing/systems-dock/registry', 'system-registry', 'standard', 'standard-room', 'Integrations'),
  m('workflow-engine', 'Workflow Engine Room™', 'room', 'studio-command-center', 'scc-operations-wing', 'command-center/operations-wing/systems-dock/workflow', 'workflow-engine', 'standard', 'standard-room'),
  m('state-engine', 'State Engine Room™', 'room', 'studio-command-center', 'scc-operations-wing', 'command-center/operations-wing/systems-dock/state', 'state-engine', 'standard', 'standard-room'),
  m('event-bus', 'Event Bus Room™', 'room', 'studio-command-center', 'scc-operations-wing', 'command-center/operations-wing/systems-dock/events', 'event-bus', 'standard', 'standard-room'),
  m('permission-engine', 'Permission Control Room™', 'room', 'studio-command-center', 'scc-security-center', 'command-center/security-center/permissions', 'permission-engine', 'standard', 'standard-room'),
  m('policy-engine', 'Policy Control Room™', 'room', 'studio-command-center', 'scc-security-center', 'command-center/security-center/policy', 'policy-engine', 'standard', 'standard-room'),
  m('performance-monitor', 'Infrastructure Observatory™', 'observatory', 'studio-command-center', 'scc-performance-observatory', 'command-center/performance-observatory/monitor', 'performance-monitor', 'standard', 'standard-room'),
  m('architecture-observatory', 'Architecture Observatory™', 'observatory', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/architecture-observatory', 'architecture-observatory', 'immersive', 'immersive-partial', 'Architecture Auditor'),
  m('experience-observatory', 'Experience Observatory™', 'observatory', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/experience-observatory', 'experience-observatory', 'immersive', 'immersive-partial', 'Experience Intelligence'),
  m('world-atlas', 'Studio World Atlas™', 'observatory', 'studio-command-center', 'scc-executive-district', 'command-center/executive-district/world-atlas', 'world-atlas', 'immersive', 'immersive-partial', 'World Atlas'),
  m('constitution-hall', 'Constitution Hall™', 'theater', 'studio-command-center', 'scc-constitution-hall', 'command-center/constitution-hall', 'constitution-hall', 'immersive', 'immersive-partial', 'Studio World Constitution'),
];

const worldPathIndex = new Map<string, StudioWorldRouteMapping>();
const legacyPathIndex = new Map<string, StudioWorldRouteMapping>();

for (const entry of STUDIO_WORLD_ROUTE_REGISTRY) {
  worldPathIndex.set(entry.worldPath, entry);
  worldPathIndex.set(entry.worldPath.replace(/\/$/, ''), entry);
  const normalizedLegacy = entry.legacyPath.split('?')[0]!;
  legacyPathIndex.set(normalizedLegacy, entry);
  legacyPathIndex.set(entry.legacySlug, entry);
}

export function resolveWorldRouteByPath(pathname: string): StudioWorldRouteMapping | null {
  const clean = pathname.replace(/\/$/, '') || pathname;
  const direct = worldPathIndex.get(clean);
  if (direct) return direct;

  // Longest-prefix match for nested world paths not yet individually registered
  let best: StudioWorldRouteMapping | null = null;
  let bestLen = 0;
  for (const entry of STUDIO_WORLD_ROUTE_REGISTRY) {
    if (clean.startsWith(entry.worldPath) && entry.worldPath.length > bestLen) {
      best = entry;
      bestLen = entry.worldPath.length;
    }
  }
  return best;
}

export function resolveLegacyRouteLocation(pathname: string): StudioWorldRouteMapping | null {
  const clean = pathname.replace(/\/$/, '');
  const direct = legacyPathIndex.get(clean);
  if (direct) return direct;
  const slug = clean.replace(`${BASE}/`, '').replace(/^\/admin\//, '');
  const bySlug = legacyPathIndex.get(slug);
  if (bySlug) return bySlug;
  if (clean.startsWith('/admin/headquarters')) {
    return legacyPathIndex.get('/admin/headquarters') ?? null;
  }
  return null;
}

export function listRoutesForFlagship(flagshipId: StudioWorldFlagshipId): StudioWorldRouteMapping[] {
  return STUDIO_WORLD_ROUTE_REGISTRY.filter((r) => r.flagshipId === flagshipId);
}

export function countRoutesByMigrationStatus(): Record<StudioWorldMigrationStatus, number> {
  const counts: Record<string, number> = {};
  for (const r of STUDIO_WORLD_ROUTE_REGISTRY) {
    counts[r.migrationStatus] = (counts[r.migrationStatus] ?? 0) + 1;
  }
  return counts as Record<StudioWorldMigrationStatus, number>;
}
