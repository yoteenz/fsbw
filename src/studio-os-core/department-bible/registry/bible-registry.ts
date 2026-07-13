import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import {
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY,
  getCanonicalDepartmentRecord,
} from '../../canonical-studio-world/canonical-department-registry';
import { resolveDepartmentCharter } from '../../canonical-studio-world/department-charters';
import type { DepartmentBible } from '../schemas/department-bible';

export const DEPARTMENT_BIBLE_REGISTRY_VERSION = 'department-bible-registry.v1' as const;

type BibleOverride = Partial<DepartmentBible>;

const BIBLE_OVERRIDES: Partial<Record<CanonicalMainDepartmentId, BibleOverride>> = {
  'experience-lab': {
    mission: 'Design Studio World\'s future.',
    purpose: 'Canonical department authoring, Industry Pack governance, and architectural planning.',
    responsibilities: [
      'canonical departments',
      'Industry Packs',
      'Blueprint creation',
      'Founder Render generation',
      'construction planning',
      'architectural governance',
      'Style Bible guardianship',
      'Department Bible authority',
    ],
    nonResponsibilities: [
      'customize founder HQs',
      'manufacture isolated assets',
      'publish marketplace mods',
      'bypass approvals',
    ],
    departmentPhilosophy: 'Plan the world before building it — every canonical department starts here.',
    corePrinciples: ['governance-first', 'no-bypass', 'style-bible-inheritance', 'declarative-departments'],
    requiredAiWorkers: ['Blueprint Architect', 'Architectural Planner', 'Prompt Compiler', 'Lighting Planner'],
    handsWorkTo: ['creative-director-studio'],
    receivesWorkFrom: ['blueprint-author', 'immune-system'],
    downstreamDepartments: ['creative-director-studio', 'studio-world-registry'],
    futureVision: 'Self-documenting canonical infrastructure for unlimited future departments.',
  },
  'creative-director-studio': {
    mission: 'Manufacture everything approved by Experience Lab.',
    purpose: 'Asset production and founder customization on approved architecture.',
    responsibilities: [
      'asset production',
      'asset variants',
      'material changes',
      'lighting changes',
      'founder customization',
      'brand application',
      'marketplace packaging',
    ],
    nonResponsibilities: [
      'invent canonical departments',
      'rewrite Style Bible',
      'bypass Blueprint Author',
      'mutate Department Bible',
    ],
    departmentPhilosophy: 'Manufacture on approved architecture — never invent canonical infrastructure.',
    corePrinciples: ['approved-handoff-only', 'asset-manufacturing', 'brand-overlay-not-architecture'],
    requiredAiWorkers: ['Asset Artist', 'Material Artist', 'Lighting Artist', 'Animation Artist'],
    handsWorkTo: ['construction-mode'],
    receivesWorkFrom: ['experience-lab'],
    upstreamDepartments: ['experience-lab'],
    downstreamDepartments: ['construction-mode'],
    futureVision: 'Premier asset manufacturing facility for all Studio World departments.',
  },
  'command-center': {
    mission: 'Operate Studio World.',
    purpose: 'Global infrastructure operations, monitoring, and incident response.',
    responsibilities: ['Infrastructure', 'Deployments', 'Queues', 'Monitoring', 'Diagnostics', 'Alerts'],
    nonResponsibilities: ['Generate architecture', 'Edit founder brands'],
    departmentPhilosophy: 'The operating bridge — keep Studio World running.',
    corePrinciples: ['operations-first', 'no-architecture-invention', 'global-scope'],
    requiredAiWorkers: ['Operations AI', 'Diagnostics AI', 'Monitoring AI'],
    handsWorkTo: ['ai-workforce-center', 'observatory'],
    receivesWorkFrom: ['immune-system'],
    securityClassification: 'studio-world-admin',
  },
  'city-council': {
    mission: 'Protect Studio World.',
    purpose: 'Municipal governance, mod approval, and IP protection.',
    responsibilities: [
      'Permits',
      'Marketplace approvals',
      'Mod certification',
      'IP validation',
      'Policy enforcement',
      'Licensing',
      'Royalty verification',
    ],
    nonResponsibilities: ['Generate rooms', 'Edit founder assets'],
    departmentPhilosophy: 'Municipal governance chamber — protect the world\'s integrity.',
    corePrinciples: ['governance', 'ip-protection', 'certification-gate'],
    requiredAiWorkers: ['Governance AI', 'IP Validator', 'Permit Reviewer'],
    handsWorkTo: ['permit-center', 'certification-center'],
    receivesWorkFrom: ['marketplace', 'mod-registry'],
    marketplaceParticipation: true,
  },
  marketplace: {
    mission: 'Distribute creator content.',
    purpose: 'Commerce district for industry packs, mods, and licensing.',
    responsibilities: ['Listings', 'Licensing', 'Royalties', 'Downloads', 'Compatibility', 'Versioning'],
    nonResponsibilities: ['Modify creator ownership', 'Rewrite creator lineage'],
    departmentPhilosophy: 'Commerce without compromising creator IP lineage.',
    corePrinciples: ['creator-ip-lineage', 'licensing-integrity', 'no-ownership-rewrite'],
    requiredAiWorkers: ['Commerce AI', 'Licensing Agent', 'Compatibility Checker'],
    handsWorkTo: ['city-council', 'certification-center'],
    receivesWorkFrom: ['certification-center'],
    marketplaceParticipation: true,
  },
};

function mapRecordToRoles(accessClass: string, adminOnly: boolean): DepartmentBible['allowedRoles'] {
  if (adminOnly) return ['admin', 'system', 'ai-worker', 'automation'];
  if (accessClass === 'founder-read') return ['admin', 'founder', 'ai-worker', 'automation', 'system'];
  return ['admin', 'founder', 'guest', 'ai-worker', 'automation', 'system'];
}

function synthesizeDependencies(
  record: NonNullable<ReturnType<typeof getCanonicalDepartmentRecord>>,
  charter: ReturnType<typeof resolveDepartmentCharter>,
  override: BibleOverride
): string[] {
  if (override.dependencies?.length) return override.dependencies;
  const tokens = new Set<string>([
    ...record.dependencies,
    ...charter.upstreamDependencies,
    ...charter.downstreamDependencies,
    ...charter.handoffDestinations,
    ...record.requiredCapabilities,
  ]);
  return [...tokens].filter(Boolean);
}

function buildBible(departmentId: CanonicalMainDepartmentId): DepartmentBible {
  const record = getCanonicalDepartmentRecord(departmentId)!;
  const charter = resolveDepartmentCharter(departmentId);
  const override = BIBLE_OVERRIDES[departmentId] ?? {};

  return {
    bibleVersion: 'department-bible.v1',
    bibleRevision: 1,
    departmentId,
    officialName: record.name,
    mission: override.mission ?? charter.mission,
    purpose: override.purpose ?? record.purpose,
    responsibilities: override.responsibilities ?? charter.responsibilities,
    nonResponsibilities: override.nonResponsibilities ?? charter.nonResponsibilities,
    primaryUsers: override.primaryUsers ?? charter.userClasses.slice(0, 2),
    secondaryUsers: override.secondaryUsers ?? charter.userClasses.slice(2),
    allowedRoles: override.allowedRoles ?? mapRecordToRoles(record.accessClass, record.adminOnly),
    restrictedRoles: override.restrictedRoles ?? (record.adminOnly ? ['guest', 'marketplace-creator'] : []),
    departmentPhilosophy: override.departmentPhilosophy ?? `Operate ${record.name} within Studio World canon.`,
    corePrinciples: override.corePrinciples ?? ['architecture-law-001', 'canonical-scope-only', 'no-tenant-ownership'],
    inputs: override.inputs ?? ['approved-handoffs', 'blueprint-specifications'],
    outputs: override.outputs ?? charter.handoffDestinations.map((d) => `${d}-handoff`),
    dependencies: synthesizeDependencies(record, charter, override),
    upstreamDepartments: override.upstreamDepartments ?? (charter.upstreamDependencies as CanonicalMainDepartmentId[]),
    downstreamDepartments: override.downstreamDepartments ?? (charter.handoffDestinations as CanonicalMainDepartmentId[]),
    requiredAiWorkers: override.requiredAiWorkers ?? [`${departmentId}-worker`],
    requiredServices: override.requiredServices ?? record.requiredCapabilities,
    requiredInfrastructure: override.requiredInfrastructure ?? [record.blueprintTemplateId, record.commandDockProfile, record.workbenchProfile],
    lifecycleStates: [...['DRAFT', 'BLUEPRINT_READY', 'FOUNDER_RENDER', 'APPROVED', 'MANUFACTURING', 'CONSTRUCTION', 'INSPECTION', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED']],
    requiredApprovals: override.requiredApprovals ?? charter.permitRequirements.length ? charter.permitRequirements : ['founder-preview'],
    failureModes: override.failureModes ?? ['render-failure', 'approval-timeout', 'quality-guard-rejection'],
    recoveryStrategy: override.recoveryStrategy ?? 'Return to Blueprint Author or Experience Lab for revision.',
    securityClassification: override.securityClassification ?? (record.adminOnly ? 'studio-world-admin' : record.founderAccessible ? 'founder-read' : 'system'),
    marketplaceParticipation: override.marketplaceParticipation ?? record.marketplaceEligibility,
    auditRules: override.auditRules ?? ['immune-system-audit', 'architecture-law-001-enforcement'],
    costModel: override.costModel ?? 'canonical-infrastructure — studio-world-global budget',
    performanceTargets: override.performanceTargets ?? ['founder-render-under-120s', 'queue-capacity-4'],
    accessibilityTargets: override.accessibilityTargets ?? ['react-ui-injection', 'wcag-aa-overlays'],
    expansionRules: override.expansionRules ?? ['additive-sockets-only', 'department-bible-required'],
    futureVision: override.futureVision ?? `Evolve ${record.name} within canonical Studio World infrastructure.`,
    handsWorkTo: override.handsWorkTo ?? (charter.handoffDestinations as CanonicalMainDepartmentId[]),
    receivesWorkFrom: override.receivesWorkFrom ?? (charter.upstreamDependencies as CanonicalMainDepartmentId[]),
  };
}

export const DEPARTMENT_BIBLE_REGISTRY: Record<CanonicalMainDepartmentId, DepartmentBible> =
  Object.fromEntries(
    CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((r) => [r.departmentId, buildBible(r.departmentId)])
  ) as Record<CanonicalMainDepartmentId, DepartmentBible>;

export function resolveDepartmentBible(departmentId: CanonicalMainDepartmentId): DepartmentBible {
  return DEPARTMENT_BIBLE_REGISTRY[departmentId];
}

export function listDepartmentBibles(): DepartmentBible[] {
  return Object.values(DEPARTMENT_BIBLE_REGISTRY);
}
