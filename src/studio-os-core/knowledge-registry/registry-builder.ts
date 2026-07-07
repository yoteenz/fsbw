import { DOCUMENTATION_SYSTEM_REGISTRY } from '../documentation-sync/system-registry';
import type { DocumentationSystemEntry } from '../documentation-sync/types';
import {
  getMasterSpecBundleSync,
  reconcileMasterSpecWithLive,
  type MasterSpecBundle,
  type MasterSpecChapter,
  type MasterSpecDesignRevision,
  type MasterSpecMilestone,
  type MasterSpecVolume,
} from '../manifest-reconciliation';
import { IMPLEMENTATION_STATUS_LABELS } from './constants';
import type { KnowledgeRegistryEntry, RegistryCategory, RegistryFeatureStatus } from './types';

function inferCategory(id: string, registryKind: string, volumeId?: string): RegistryCategory {
  if (registryKind === 'constitution') return 'constitution';
  if (registryKind === 'volume') return 'volume';
  if (registryKind === 'chapter') return 'chapter';
  if (registryKind === 'design-revision') return 'design-revision';
  if (volumeId === 'volume-i') return 'platform';
  if (['business-discovery-blueprint', 'profession-brain', 'organization-genome', 'professional-trust-framework'].includes(id)) {
    return 'foundation';
  }
  if (id.includes('legacy') || id === 'succession-mode' || id === 'executive-timeline') return 'legacy';
  if (['studio-institute', 'knowledge-commerce', 'expert-marketplace'].includes(id)) return 'commerce';
  if (['executive-council', 'founder-operating-system', 'founder-cognitive-load', 'organization-pulse'].includes(id)) {
    return 'executive';
  }
  if (
    id.includes('intelligence') ||
    id.includes('orchestrator') ||
    id.includes('foundation-model') ||
    id.includes('memory') ||
    id.includes('consciousness') ||
    volumeId?.includes('intelligence')
  ) {
    return 'intelligence';
  }
  if (id === 'mission-control' || id === 'organization-operating-manual') return 'operations';
  return 'platform';
}

function mapImplementationToLegacyStatus(status: string): RegistryFeatureStatus {
  if (status === 'complete') return 'live';
  if (status === 'in-progress') return 'in-progress';
  if (status === 'deprecated') return 'deprecated';
  return 'planned';
}

function inferOwner(category: RegistryCategory): string {
  switch (category) {
    case 'constitution':
      return 'Studio OS Constitution';
    case 'volume':
      return 'Master Specification';
    case 'foundation':
      return 'Studio OS Platform';
    case 'intelligence':
      return 'Studio Intelligence Team';
    case 'legacy':
      return 'Legacy & Succession';
    case 'commerce':
      return 'Studio Institute';
    case 'executive':
      return 'Executive Council';
    case 'design-revision':
      return 'Design Architecture';
    default:
      return 'Studio OS Platform';
  }
}

function buildEntryBase(
  partial: Pick<KnowledgeRegistryEntry, 'officialName' | 'internalId' | 'purpose' | 'category' | 'implementationStatus'> &
    Partial<KnowledgeRegistryEntry>
): KnowledgeRegistryEntry {
  const implementationStatus = partial.implementationStatus;
  return {
    officialName: partial.officialName,
    internalId: partial.internalId,
    category: partial.category,
    description: partial.description ?? partial.purpose,
    purpose: partial.purpose,
    capabilities: partial.capabilities ?? [],
    dependencies: partial.dependencies ?? partial.dependsOn ?? [],
    relatedSystems: partial.relatedSystems ?? [],
    status: partial.status ?? mapImplementationToLegacyStatus(implementationStatus),
    implementationStatus,
    implementationStatusLabel: IMPLEMENTATION_STATUS_LABELS[implementationStatus],
    registryKind: partial.registryKind ?? 'milestone',
    volumeId: partial.volumeId,
    canonicalMilestone: partial.canonicalMilestone,
    shippedMilestone: partial.shippedMilestone ?? null,
    dependsOn: partial.dependsOn ?? [],
    enables: partial.enables ?? [],
    mergeTargets: partial.mergeTargets,
    owner: partial.owner ?? inferOwner(partial.category),
    version: partial.version ?? partial.canonicalMilestone ?? '1.0.0',
    releaseDate: partial.releaseDate ?? '2026-07-07',
    lastUpdated: partial.lastUpdated ?? new Date().toISOString().slice(0, 10),
    associatedDepartments: partial.associatedDepartments ?? ['Platform'],
    associatedConcierges: partial.associatedConcierges ?? ['Chief Concierge'],
    associatedWorkflows: partial.associatedWorkflows ?? [],
    supportedOrganizations: ['all'],
    requiredPermissions: partial.requiredPermissions ?? ['standard'],
    featureFlags: [],
    keywords: partial.keywords ?? [partial.internalId.replace(/-/g, ' ')],
    aliases: partial.aliases ?? [],
    searchSynonyms: partial.searchSynonyms ?? [],
    documentationLinks: partial.documentationLinks ?? [],
    academyLessons: partial.academyLessons ?? [],
    tutorialReferences: partial.tutorialReferences ?? [],
    walkthroughReferences: partial.walkthroughReferences ?? [],
    tooltips: partial.tooltips ?? [`${partial.officialName} — ${partial.purpose.slice(0, 80)}`],
    faqReferences: partial.faqReferences ?? [],
    commandDockReferences: partial.commandDockReferences ?? [`resolve:${partial.internalId}`],
    developerDocumentation: partial.developerDocumentation ?? [],
    architectureDocumentation: partial.architectureDocumentation ?? ['docs/studio-os/master-spec/MASTER_SPEC_INDEX.md'],
    releaseNotes: partial.releaseNotes ?? [],
    exampleWorkflows: partial.exampleWorkflows ?? [],
    relatedScreens: partial.relatedScreens ?? [],
    relatedComponents: partial.relatedComponents ?? [],
    futureMilestones: partial.futureMilestones ?? [],
    moduleId: partial.moduleId,
    route: partial.route,
    milestone: partial.shippedMilestone ?? partial.milestone ?? undefined,
    docPath: partial.docPath ?? `docs/studio-os/master-spec/`,
    completionPct: partial.completionPct,
    searchableInGlobalSearch: true,
  };
}

function buildFromManifestMilestone(m: MasterSpecMilestone, live?: DocumentationSystemEntry): KnowledgeRegistryEntry {
  const category = inferCategory(m.internalId, m.registryKind, m.volumeId);
  const notes = m.implementationNotes ? ` ${m.implementationNotes}` : '';
  return buildEntryBase({
    officialName: m.name,
    internalId: m.internalId,
    purpose: m.purpose,
    category,
    implementationStatus: m.implementationStatus,
    registryKind: 'milestone',
    volumeId: m.volumeId,
    chapterId: m.chapterId,
    canonicalMilestone: m.canonicalId,
    shippedMilestone: m.shippedMilestone,
    dependsOn: m.dependsOn,
    enables: m.enables,
    moduleId: m.moduleId ?? live?.moduleId,
    route: live?.route,
    milestone: m.shippedMilestone ?? undefined,
    description: `${live?.overview ?? m.purpose}${notes}`.trim(),
    implementationNotes: m.implementationNotes,
    capabilities: live?.capabilities ?? [],
    relatedSystems: [...new Set([...(m.relatedSystems ?? []), ...(live?.relatedSystems ?? [])])],
    dependencies: m.dependsOn,
    keywords: live?.searchKeywords ?? [m.name.toLowerCase(), m.canonicalId],
    aliases: live?.aliases ?? [m.canonicalId],
    searchSynonyms: [...(live?.aliases ?? []), m.canonicalId, m.name],
    docPath: live?.docPath ?? 'docs/studio-os/master-spec/',
    exampleWorkflows: live?.exampleWorkflows ?? [],
    walkthroughReferences: m.implementationStatus === 'complete' ? [`walkthrough:${m.internalId}`] : [],
    academyLessons: m.implementationStatus === 'complete' ? [`academy:lesson-${m.internalId}`] : [],
  });
}

function buildFromManifestChapter(ch: MasterSpecChapter, bundle: MasterSpecBundle): KnowledgeRegistryEntry {
  const milestones = bundle.milestones.filter(
    (m) => m.chapterId === ch.id || ch.milestoneIds.includes(m.canonicalId)
  );
  return buildEntryBase({
    officialName: ch.title,
    internalId: ch.id,
    purpose: ch.summary,
    category: 'chapter',
    implementationStatus: ch.status,
    registryKind: 'chapter',
    volumeId: ch.volumeId,
    dependsOn: ch.dependsOn,
    completionPct: ch.completionPct,
    description: ch.summary,
    keywords: [ch.title.toLowerCase(), ch.id, `chapter ${ch.number}`],
    aliases: [`Chapter ${ch.number}`, ch.id],
    capabilities: [`${milestones.length} milestones`, `${milestones.filter((m) => m.implementationStatus === 'complete').length} complete`],
    relatedSystems: milestones.slice(0, 6).map((m) => m.internalId),
  });
}

function buildFromManifestVolume(v: MasterSpecVolume, bundle: MasterSpecBundle): KnowledgeRegistryEntry {
  const milestones = bundle.milestones.filter((m) => m.volumeId === v.id);
  const chapters = (bundle.chapters ?? []).filter((c) => c.volumeId === v.id);
  return buildEntryBase({
    officialName: v.title,
    internalId: v.id,
    purpose: v.summary,
    category: 'volume',
    implementationStatus: v.status,
    registryKind: 'volume',
    volumeId: v.id,
    dependsOn: v.dependsOn,
    completionPct: v.completionPct,
    description: v.notes ? `${v.summary} ${v.notes}` : v.summary,
    keywords: [v.title.toLowerCase(), v.id, `volume ${v.number}`],
    aliases: [`Volume ${v.number}`, v.id],
    capabilities: [
      `${chapters.length} chapters`,
      `${milestones.length} milestones`,
      `${milestones.filter((m) => m.implementationStatus === 'complete').length} complete`,
    ],
    relatedSystems: milestones.slice(0, 5).map((m) => m.internalId),
  });
}

function buildFromDesignRevision(dr: MasterSpecDesignRevision): KnowledgeRegistryEntry {
  return buildEntryBase({
    officialName: dr.title,
    internalId: dr.id,
    purpose: dr.purpose,
    category: 'design-revision',
    implementationStatus: dr.implementationStatus,
    registryKind: 'design-revision',
    volumeId: dr.volumeId,
    canonicalMilestone: dr.canonicalId,
    dependsOn: dr.dependsOn,
    enables: dr.enables,
    mergeTargets: dr.mergeTargets,
    relatedSystems: [...dr.mergeTargets, ...dr.dependsOn.filter((d) => d.startsWith('M') || d.startsWith('DR-'))],
    keywords: dr.keywords ?? [dr.id, 'design revision', ...dr.mergeTargets],
    aliases: dr.aliases ?? [dr.canonicalId, dr.id],
    owner: dr.id === 'DR-005' ? 'Studio OS Executive Architecture' : undefined,
  });
}

function buildConstitutionEntries(bundle: MasterSpecBundle): KnowledgeRegistryEntry[] {
  return (bundle.constitution?.principles ?? []).map((p) =>
    buildEntryBase({
      officialName: p.title,
      internalId: p.id,
      purpose: p.summary,
      category: 'constitution',
      implementationStatus: 'complete',
      registryKind: 'constitution',
      volumeId: 'volume-0',
      keywords: [p.title.toLowerCase(), 'constitution'],
    })
  );
}

/** Single source: Master Spec manifest — live systems enrich, never duplicate. */
export function buildKnowledgeRegistry(bundle: MasterSpecBundle = getMasterSpecBundleSync()): KnowledgeRegistryEntry[] {
  const byId = new Map<string, KnowledgeRegistryEntry>();
  const liveByModule = new Map(DOCUMENTATION_SYSTEM_REGISTRY.map((s) => [s.moduleId ?? s.id, s]));

  for (const v of bundle.volumes) {
    byId.set(v.id, buildFromManifestVolume(v, bundle));
  }

  for (const p of buildConstitutionEntries(bundle)) {
    byId.set(p.internalId, p);
  }

  for (const dr of bundle.designRevisions) {
    byId.set(dr.id, buildFromDesignRevision(dr));
  }

  for (const ch of bundle.chapters ?? []) {
    byId.set(ch.id, buildFromManifestChapter(ch, bundle));
  }

  for (const m of bundle.milestones) {
    const live = m.moduleId ? liveByModule.get(m.moduleId) : liveByModule.get(m.internalId);
    byId.set(m.internalId, buildFromManifestMilestone(m, live));
  }

  return [...byId.values()];
}

/** @deprecated */
export function buildDocumentationRegistry(): KnowledgeRegistryEntry[] {
  return buildKnowledgeRegistry();
}

export function getRegistryEntryById(internalId: string): KnowledgeRegistryEntry | undefined {
  return buildKnowledgeRegistry().find((e) => e.internalId === internalId || e.moduleId === internalId);
}

export function listRegistryEntriesByCategory(category: RegistryCategory): KnowledgeRegistryEntry[] {
  return buildKnowledgeRegistry().filter((e) => e.category === category);
}

export function getRegistryEntryCount(): number {
  return buildKnowledgeRegistry().length;
}

export function getVolumeSummaries(bundle: MasterSpecBundle = getMasterSpecBundleSync()) {
  const chapters = bundle.chapters ?? [];
  return bundle.volumes.map((v) => {
    const milestones = bundle.milestones.filter((m) => m.volumeId === v.id);
    return {
      volumeId: v.id,
      title: v.title,
      status: v.status,
      completionPct: v.completionPct,
      milestoneCount: milestones.length,
      completeCount: milestones.filter((m) => m.implementationStatus === 'complete').length,
      chapterCount: chapters.filter((c) => c.volumeId === v.id).length,
      dependsOn: v.dependsOn,
    };
  });
}

export function getChapterSummaries(bundle: MasterSpecBundle = getMasterSpecBundleSync()) {
  return (bundle.chapters ?? []).map((ch) => {
    const milestones = bundle.milestones.filter(
      (m) => m.chapterId === ch.id || ch.milestoneIds.includes(m.canonicalId)
    );
    return {
      chapterId: ch.id,
      volumeId: ch.volumeId,
      number: ch.number,
      title: ch.title,
      status: ch.status,
      completionPct: ch.completionPct,
      milestoneCount: milestones.length,
      completeCount: milestones.filter((m) => m.implementationStatus === 'complete').length,
      dependsOn: ch.dependsOn,
    };
  });
}

export function getMasterSpecCoveragePct(): number {
  return reconcileMasterSpecWithLive().masterSpecCoveragePct;
}
