import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationWisdomProfile } from '../wisdom-capture/store';
import { PRESERVE_CATEGORY_LABELS, LEGACY_EXPERIENCE_TYPES } from './constants';
import type {
  LegacyArchiveEntry,
  LegacyExperience,
  OrganizationLegacyVaultProfile,
  VersionHistoryEntry,
} from './types';

function buildArchiveFromBlueprint(organizationId: string): LegacyArchiveEntry[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  if (!blueprint) return [];

  return [
    {
      id: `archive-blueprint-${organizationId}`,
      category: 'business-discovery-blueprint',
      title: 'Original Business Discovery Blueprint™',
      summary: `${blueprint.companyName} discovery captured ${blueprint.overallProgressPct}% complete — founding intelligence preserved forever.`,
      preservedAt: blueprint.updatedAt ?? new Date().toISOString(),
      sourceModule: 'business-discovery-blueprint',
      version: 1,
      immutable: true,
      mediaType: 'blueprint',
    },
    {
      id: `archive-charter-${organizationId}`,
      category: 'organization-charter',
      title: 'Original Organization Charter',
      summary: `Mission and founding purpose for ${blueprint.companyName} — the story of why this organization exists.`,
      preservedAt: blueprint.startedAt ?? blueprint.updatedAt,
      sourceModule: 'business-discovery-blueprint',
      version: 1,
      immutable: true,
      mediaType: 'document',
    },
    {
      id: `archive-mvv-${organizationId}`,
      category: 'mission-vision-values',
      title: 'Mission · Vision · Core Values',
      summary: 'Original mission, vision, and values — never overwritten, version history preserved.',
      preservedAt: blueprint.updatedAt,
      sourceModule: 'business-discovery-blueprint',
      version: 1,
      immutable: true,
    },
  ];
}

function buildCouncilArchives(organizationId: string): LegacyArchiveEntry[] {
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  if (!council) return [];

  return council.decisionHistory.slice(0, 5).map((d, i) => ({
    id: `archive-decision-${d.id}`,
    category: 'executive-decisions' as const,
    title: d.decision.slice(0, 80),
    summary: d.reasoning.slice(0, 160),
    preservedAt: d.recordedAt,
    sourceModule: 'executive-council',
    version: i + 1,
    immutable: true,
    mediaType: 'document' as const,
  }));
}

function buildBrainMilestones(organizationId: string): LegacyArchiveEntry[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  if (!brain) return [];

  return brain.brains.slice(0, 4).map((b) => ({
    id: `archive-brain-${b.id}`,
    category: 'profession-brain-milestones' as const,
    title: `${b.label} — Milestone v${b.knowledgeEntries.length}`,
    summary: `${b.knowledgeEntries.length} knowledge entries · ${b.judgmentPatterns.length} judgment patterns · maturity ${b.maturityPct}%.`,
    preservedAt: b.lastEvolvedAt,
    sourceModule: 'profession-brain',
    version: b.knowledgeEntries.length,
    immutable: true,
  }));
}

function buildWisdomArchives(organizationId: string): LegacyArchiveEntry[] {
  const wisdom = getOrganizationWisdomProfile(organizationId);
  if (!wisdom || wisdom.wisdomLibrary.length === 0) return [];

  return wisdom.wisdomLibrary.slice(0, 3).map((w) => ({
    id: `archive-wisdom-${w.id}`,
    category: 'historic-milestones' as const,
    title: w.wisdom.slice(0, 80),
    summary: w.whyItMatters.slice(0, 160),
    preservedAt: w.capturedAt,
    sourceModule: 'wisdom-capture',
    version: 1,
    immutable: true,
  }));
}

function buildMemoryArchives(organizationId: string): LegacyArchiveEntry[] {
  const memory = getOrganizationMemoryProfile(organizationId);
  if (!memory) return [];

  return memory.projectArtifacts.slice(0, 2).map((a) => ({
    id: `archive-memory-${a.projectId}`,
    category: 'important-documents' as const,
    title: a.projectTitle,
    summary: a.lessonsLearned.join(' · ').slice(0, 160) || 'Project completion preserved in organizational memory.',
    preservedAt: a.completedAt,
    sourceModule: 'memory-engine',
    version: 1,
    immutable: true,
  }));
}

function buildVersionHistory(
  organizationId: string,
  existing?: VersionHistoryEntry[]
): VersionHistoryEntry[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const seeded: VersionHistoryEntry[] = [];

  if (blueprint) {
    seeded.push({
      id: `ver-mission-${organizationId}-1`,
      versionType: 'mission',
      label: 'Original Mission',
      versionNumber: 1,
      capturedAt: blueprint.startedAt ?? blueprint.updatedAt,
      summary: `${blueprint.companyName} founding mission — preserved, never overwritten.`,
    });
    seeded.push({
      id: `ver-hq-${organizationId}-1`,
      versionType: 'headquarters',
      label: 'Original Headquarters',
      versionNumber: 1,
      capturedAt: blueprint.updatedAt,
      summary: 'First Headquarters configuration — evolution tracked in Legacy Vault™.',
    });
  }

  if (brain) {
    for (const b of brain.brains.slice(0, 3)) {
      seeded.push({
        id: `ver-brain-${b.id}-1`,
        versionType: 'profession-brain',
        label: `${b.label} v1`,
        versionNumber: 1,
        capturedAt: b.lastEvolvedAt,
        summary: `Earlier Profession Brain™ snapshot — ${b.knowledgeEntries.length} entries at capture.`,
        supersededBy: `${b.label} current`,
      });
    }
  }

  const merged = [...seeded, ...(existing ?? [])];
  const seen = new Set<string>();
  return merged.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

function buildLegacyExperiences(archiveCount: number): LegacyExperience[] {
  return LEGACY_EXPERIENCE_TYPES.map((type) => ({
    id: `exp-${type}`,
    experienceType: type,
    title: type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Immersive ${type.replace(/-/g, ' ')} — experience the organization's journey.`,
    entryCount: Math.max(1, Math.floor(archiveCount / 3)),
    immersive: true,
  }));
}

export function computeLegacyDepthScore(
  archives: LegacyArchiveEntry[],
  versions: VersionHistoryEntry[],
  founderCount: number,
  capsules: number
): number {
  let score = 30;
  score += Math.min(35, archives.length * 3);
  score += Math.min(15, versions.length * 2);
  score += Math.min(10, founderCount * 3);
  score += Math.min(10, capsules * 4);
  return Math.min(98, score);
}

export function buildOrganizationLegacyVaultProfile(
  organizationId: string,
  existing?: OrganizationLegacyVaultProfile | null
): OrganizationLegacyVaultProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const autoArchives = [
    ...buildArchiveFromBlueprint(organizationId),
    ...buildCouncilArchives(organizationId),
    ...buildBrainMilestones(organizationId),
    ...buildWisdomArchives(organizationId),
    ...buildMemoryArchives(organizationId),
  ];

  const manualArchives = existing?.archiveEntries.filter((a) => a.sourceModule === 'manual') ?? [];
  const autoIds = new Set(autoArchives.map((a) => a.id));
  const preservedManual = manualArchives.filter((a) => !autoIds.has(a.id));

  const archiveEntries = [...autoArchives, ...preservedManual].slice(0, 50);
  const versionHistory = buildVersionHistory(organizationId, existing?.versionHistory);
  const founderArchive = existing?.founderArchive ?? [];
  const familyLegacy = existing?.familyLegacy ?? [];
  const timeCapsules = existing?.timeCapsules ?? [];

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    legacyDepthScore: computeLegacyDepthScore(
      archiveEntries,
      versionHistory,
      founderArchive.length,
      timeCapsules.filter((c) => c.status === 'sealed').length
    ),
    totalArchiveEntries: archiveEntries.length,
    versionHistoryCount: versionHistory.length,
    timeCapsulesSealed: timeCapsules.filter((c) => c.status === 'sealed').length,
    founderArchiveCount: founderArchive.length,
    archiveEntries,
    versionHistory,
    legacyExperiences: buildLegacyExperiences(archiveEntries.length),
    founderArchive,
    familyLegacy,
    timeCapsules,
    pendingPreserveSuggestions: existing?.pendingPreserveSuggestions ?? [],
    syncedSources: [
      'business-discovery-blueprint',
      'profession-brain',
      'executive-council',
      'memory-engine',
      'wisdom-capture',
      'organization-inauguration',
      'knowledge-commerce',
      'studio-institute',
    ],
  };
}

export function categoryLabel(category: LegacyArchiveEntry['category']): string {
  return PRESERVE_CATEGORY_LABELS[category];
}
