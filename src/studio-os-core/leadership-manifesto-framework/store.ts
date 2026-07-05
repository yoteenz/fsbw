import {
  COLLABORATION_PHILOSOPHY,
  COMMUNICATION_STANDARDS,
  FOUNDER_RELATIONSHIP,
  LEADERSHIP_MANIFESTO_FRAMEWORK_STORAGE_KEY,
  LEADERSHIP_MANIFESTO_FRAMEWORK_VERSION,
  LEGACY_COMMITMENTS,
  MANIFESTO_PHILOSOPHY,
} from './constants';
import type { LeadershipManifestoFrameworkStore, LeadershipManifestoFrameworkWorkspaceId } from './types';

function emptyStore(): LeadershipManifestoFrameworkStore {
  return {
    version: LEADERSHIP_MANIFESTO_FRAMEWORK_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      activeManifestos: 0,
      inheritedExecutives: 0,
      nonNegotiables: 0,
      manifestoHealthPct: 0,
      organizationalWisdomPct: 0,
      futureExecutivesPrepared: 0,
    },
    manifestoPhilosophy: [...MANIFESTO_PHILOSOPHY],
    executiveIdentities: [],
    leadershipPhilosophy: [],
    coreBeliefs: [],
    nonNegotiables: [],
    decisionEvaluations: [],
    executiveCompasses: [],
    excellenceDefinitions: [],
    communicationStandards: COMMUNICATION_STANDARDS.map((s, i) => ({
      id: `cs-${i + 1}`,
      standard: s.split(' · ')[0] ?? s,
      description: s,
    })),
    collaborationPhilosophy: COLLABORATION_PHILOSOPHY.map((p, i) => ({
      id: `cp-${i + 1}`,
      principle: p,
    })),
    learningSources: [],
    founderRelationship: FOUNDER_RELATIONSHIP.map((r, i) => ({
      id: `fr-${i + 1}`,
      responsibility: r.split(' · ')[0] ?? r,
      description: r,
    })),
    legacyCommitments: LEGACY_COMMITMENTS.map((l, i) => ({
      id: `lc-${i + 1}`,
      asset: l.split(' · ')[0] ?? l,
      commitment: l,
    })),
    manifestoInheritance: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readLeadershipManifestoFrameworkStore(): LeadershipManifestoFrameworkStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(LEADERSHIP_MANIFESTO_FRAMEWORK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LeadershipManifestoFrameworkStore;
    return { ...emptyStore(), ...parsed, version: LEADERSHIP_MANIFESTO_FRAMEWORK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeLeadershipManifestoFrameworkStore(store: LeadershipManifestoFrameworkStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    LEADERSHIP_MANIFESTO_FRAMEWORK_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: LEADERSHIP_MANIFESTO_FRAMEWORK_VERSION })
  );
}

export function bootstrapLeadershipManifestoFrameworkStore(seed?: Partial<LeadershipManifestoFrameworkStore>): void {
  const existing = readLeadershipManifestoFrameworkStore();
  if (existing.executiveIdentities.length > 0) return;
  writeLeadershipManifestoFrameworkStore({ ...emptyStore(), ...seed });
}

export function selectLeadershipManifestoFrameworkWorkspace(id: LeadershipManifestoFrameworkWorkspaceId): void {
  const store = readLeadershipManifestoFrameworkStore();
  writeLeadershipManifestoFrameworkStore({ ...store, activeWorkspaceId: id });
}
