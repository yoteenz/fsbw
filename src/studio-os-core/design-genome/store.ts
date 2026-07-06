import {
  DESIGN_GENOME_PHILOSOPHY,
  DESIGN_GENOME_STORAGE_KEY,
  DESIGN_GENOME_VERSION,
  PRE_BUILD_QUESTION,
} from './constants';
import {
  analyzePromotedDesign,
  buildDesignReasoning,
  captureStructure,
  inferScopeFromRoute,
  inferTags,
  parseFounderPromotionPhrase,
} from './analysis';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import { asModuleTenantId } from '../workspace/tenant-ids';
import type {
  DesignGenomeEntry,
  DesignGenomeNavId,
  DesignGenomeStore,
  DesignMemoryMatch,
  PreBuildReview,
} from './types';

function emptyStore(): DesignGenomeStore {
  const orgId = asModuleTenantId(getRuntimeActiveWorkspaceId());
  return {
    version: DESIGN_GENOME_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    organizationId: orgId,
    organizationName: orgId.toUpperCase().replace(/-/g, ' '),
    genomeLabel: `${orgId.toUpperCase().replace(/-/g, ' ')} DESIGN GENOME`,
    philosophy: [...DESIGN_GENOME_PHILOSOPHY],
    preBuildQuestion: PRE_BUILD_QUESTION,
    selectedEntryId: null,
    selectedReviewId: null,
    activeNavId: 'genome-library',
    memoryQuery: '',
    entries: [],
    pendingPromotions: [],
    preBuildReviews: [],
    dashboard: {
      summary: 'DESIGN GENOME V1.0 — organizational visual memory · learn design thinking · preserve identity.',
      approvedPatterns: 0,
      currentVersions: 0,
      lineageLinks: 0,
      pendingPromotions: 0,
    },
  };
}

function refreshDashboard(store: DesignGenomeStore): DesignGenomeStore['dashboard'] {
  const currentVersions = store.entries.reduce(
    (n, e) => n + e.versions.filter((v) => v.status === 'current').length,
    0
  );
  const lineageLinks = store.entries.reduce((n, e) => n + e.referencedBy.length + e.references.length, 0);
  return {
    ...store.dashboard,
    approvedPatterns: store.entries.length,
    currentVersions,
    lineageLinks,
    pendingPromotions: store.pendingPromotions.filter((p) => p.status === 'pending-capture').length,
  };
}

export function readDesignGenomeStore(): DesignGenomeStore {
  if (typeof window === 'undefined') return emptyStore();
  const parsed = readScopedStore(DESIGN_GENOME_STORAGE_KEY, emptyStore);
  return { ...parsed, dashboard: refreshDashboard(parsed) };
}

export function writeDesignGenomeStore(store: DesignGenomeStore): void {
  if (typeof window === 'undefined') return;
  writeScopedStore(DESIGN_GENOME_STORAGE_KEY, {
    ...store,
    dashboard: refreshDashboard(store),
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function bootstrapDesignGenomeStore(seed?: Partial<DesignGenomeStore>): void {
  const existing = readDesignGenomeStore();
  if (existing.entries.length > 0 && !seed) return;
  const entries = seed?.entries ?? [];
  writeDesignGenomeStore({
    ...emptyStore(),
    ...seed,
    entries,
    pendingPromotions: seed?.pendingPromotions ?? [],
    preBuildReviews: seed?.preBuildReviews ?? [],
    selectedEntryId: seed?.selectedEntryId ?? entries[0]?.id ?? null,
    philosophy: seed?.philosophy ?? [...DESIGN_GENOME_PHILOSOPHY],
  });
}

export function selectGenomeEntry(entryId: string): void {
  const store = readDesignGenomeStore();
  writeDesignGenomeStore({ ...store, selectedEntryId: entryId, activeNavId: 'genome-library' });
}

export function setDesignGenomeNav(navId: DesignGenomeNavId): void {
  const store = readDesignGenomeStore();
  writeDesignGenomeStore({ ...store, activeNavId: navId });
}

export function setMemoryQuery(query: string): void {
  const store = readDesignGenomeStore();
  writeDesignGenomeStore({ ...store, memoryQuery: query });
}

function slugId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function promoteDesignFromFounderPhrase(
  founderPhrase: string,
  route: string,
  pageLabel: string,
  referenceEntryIds: string[] = []
): DesignGenomeEntry {
  const store = readDesignGenomeStore();
  const { level, deprecate } = parseFounderPromotionPhrase(founderPhrase);
  const scope = inferScopeFromRoute(route, store.organizationId);
  const input = { route, pageLabel, level, scope, founderPhrase };
  const analysis = analyzePromotedDesign(input);
  const reasoning = buildDesignReasoning(input);
  const capture = captureStructure(input);
  const tags = inferTags(input);

  const existingEntry = store.entries.find((e) => {
    const current = e.versions.find((v) => v.status === 'current');
    return current?.capture.route === route && e.level === level;
  });

  if (existingEntry && !deprecate) {
    const nextVersion = existingEntry.versions.length + 1;
    const updatedVersions = existingEntry.versions.map((v) =>
      v.status === 'current' ? { ...v, status: 'superseded' as const } : v
    );
    updatedVersions.push({
      versionNumber: nextVersion,
      promotedAt: new Date().toISOString(),
      founderPhrase,
      reasoning,
      analysis,
      capture,
      status: 'current',
    });
    const updated: DesignGenomeEntry = {
      ...existingEntry,
      tags: [...new Set([...existingEntry.tags, ...tags])],
      versions: updatedVersions,
      references: [...new Set([...existingEntry.references, ...referenceEntryIds])],
    };
    const entries = store.entries.map((e) => (e.id === existingEntry.id ? updated : e));
    writeDesignGenomeStore({ ...store, entries, selectedEntryId: updated.id });
    return updated;
  }

  const entry: DesignGenomeEntry = {
    id: slugId('dg'),
    organizationId: store.organizationId,
    genomeLabel: store.genomeLabel,
    scope,
    level,
    title: `${pageLabel} · ${level.replace(/-/g, ' ').toUpperCase()}`,
    tags,
    versions: [
      {
        versionNumber: 1,
        promotedAt: new Date().toISOString(),
        founderPhrase,
        reasoning,
        analysis,
        capture,
        status: deprecate ? 'deprecated' : 'current',
      },
    ],
    referencedBy: [],
    references: referenceEntryIds,
    searchKeywords: [pageLabel, route, level, scope, ...tags],
  };

  // Link lineage on reference entries
  const entries = store.entries.map((e) =>
    referenceEntryIds.includes(e.id) ? { ...e, referencedBy: [...new Set([...e.referencedBy, entry.id])] } : e
  );
  entries.push(entry);
  writeDesignGenomeStore({ ...store, entries, selectedEntryId: entry.id });
  return entry;
}

export function queuePendingPromotion(
  founderPhrase: string,
  route: string,
  pageLabel: string
): void {
  const store = readDesignGenomeStore();
  const { level } = parseFounderPromotionPhrase(founderPhrase);
  const scope = inferScopeFromRoute(route, store.organizationId);
  writeDesignGenomeStore({
    ...store,
    pendingPromotions: [
      {
        id: slugId('promo'),
        founderPhrase,
        route,
        pageLabel,
        detectedLevel: level,
        detectedScope: scope,
        status: 'pending-capture',
        createdAt: new Date().toISOString(),
      },
      ...store.pendingPromotions,
    ],
    activeNavId: 'promotions',
  });
}

export function capturePendingPromotion(promotionId: string): DesignGenomeEntry | null {
  const store = readDesignGenomeStore();
  const pending = store.pendingPromotions.find((p) => p.id === promotionId);
  if (!pending) return null;
  const entry = promoteDesignFromFounderPhrase(pending.founderPhrase, pending.route, pending.pageLabel);
  writeDesignGenomeStore({
    ...readDesignGenomeStore(),
    pendingPromotions: store.pendingPromotions.map((p) =>
      p.id === promotionId ? { ...p, status: 'captured' as const } : p
    ),
  });
  return entry;
}

export function searchDesignMemory(query: string): DesignMemoryMatch[] {
  const store = readDesignGenomeStore();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return store.entries
    .map((entry) => {
      const current = entry.versions.find((v) => v.status === 'current');
      if (!current || current.reasoning.avoidReuse) return null;
      const hay = [
        entry.title,
        entry.level,
        entry.scope,
        ...entry.tags,
        ...entry.searchKeywords,
        current.analysis.purpose,
        current.analysis.sectionType,
        ...current.reasoning.approvedBecause,
      ]
        .join(' ')
        .toLowerCase();

      let score = 0;
      for (const token of q.split(/\s+/)) {
        if (token.length < 2) continue;
        if (hay.includes(token)) score += 15;
        if (entry.tags.some((t) => t.includes(token))) score += 20;
      }
      if (score === 0) return null;

      const recommendation: DesignMemoryMatch['recommendation'] =
        score >= 40 ? 'inherit' : score >= 25 ? 'evolve' : 'reference-only';

      return {
        entryId: entry.id,
        title: entry.title,
        relevanceScore: Math.min(98, score + 10),
        matchReason: `Matches ${entry.level} pattern · ${entry.tags.slice(0, 3).join(', ')}`,
        recommendation,
      } satisfies DesignMemoryMatch;
    })
    .filter((m): m is DesignMemoryMatch => m !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6);
}

export function runPreBuildReview(problem: string): PreBuildReview {
  const store = readDesignGenomeStore();
  const matches = searchDesignMemory(problem);
  const top = matches[0];
  const recommendation: PreBuildReview['recommendation'] =
    top && top.relevanceScore >= 45
      ? top.recommendation === 'inherit'
        ? 'inherit'
        : 'evolve'
      : 'create-new';

  const reasoning =
    recommendation === 'inherit'
      ? `Design Genome contains approved pattern "${top?.title}" — inherit visual DNA before inventing.`
      : recommendation === 'evolve'
        ? `Partial match "${top?.title}" — evolve from approved foundation · do not start from blank.`
        : 'No sufficient approved pattern — create new solution for founder approval.';

  const review: PreBuildReview = {
    id: slugId('pbr'),
    problem,
    queriedAt: new Date().toISOString(),
    matches,
    recommendation,
    reasoning,
  };

  writeDesignGenomeStore({
    ...store,
    preBuildReviews: [review, ...store.preBuildReviews].slice(0, 20),
    selectedReviewId: review.id,
    activeNavId: 'pre-build-review',
  });

  return review;
}

export function getSelectedEntry(store: DesignGenomeStore): DesignGenomeEntry | null {
  return store.entries.find((e) => e.id === store.selectedEntryId) ?? store.entries[0] ?? null;
}

export function getCurrentVersion(entry: DesignGenomeEntry) {
  return (
    entry.versions.find((v) => v.status === 'current') ??
    entry.versions[entry.versions.length - 1] ??
    null
  );
}

export function getSelectedReview(store: DesignGenomeStore): PreBuildReview | null {
  return store.preBuildReviews.find((r) => r.id === store.selectedReviewId) ?? store.preBuildReviews[0] ?? null;
}
