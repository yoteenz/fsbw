import {
  ENDURING_LEADERSHIP_PRINCIPLES,
  LEADERSHIP_DNA_CONNECTED_LAYERS,
  LEADERSHIP_DNA_STORAGE_KEY,
  LEADERSHIP_DNA_VERSION,
  LEADERSHIP_PROFILE_SECTION_IDS,
  LEADERSHIP_PROFILE_TITLES,
} from './constants';
import type {
  ChiefOfStaffAlignmentCheck,
  LeadershipDnaStore,
  LeadershipProfileSection,
} from './types';

function emptyStore(): LeadershipDnaStore {
  const founderProfile: LeadershipProfileSection[] = LEADERSHIP_PROFILE_SECTION_IDS.map((id) => ({
    id,
    title: LEADERSHIP_PROFILE_TITLES[id],
    principles: [],
    evolutionNotes: [],
    lastUpdatedAt: new Date().toISOString(),
    confidencePct: 0,
  }));

  return {
    version: LEADERSHIP_DNA_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    cosAlignmentThresholdPct: 82,
    dashboard: {
      summary: '',
      principlesCount: ENDURING_LEADERSHIP_PRINCIPLES.length,
      decisionsLogged: 0,
      approvalPatternsIdentified: 0,
      overallConfidencePct: 0,
      delegationGrowthPct: 0,
      executiveTrustPct: 0,
      organizationalMaturityPct: 0,
      chiefOfStaffTrainingStatus: 'INITIALIZING',
    },
    founderProfile,
    leadershipPrinciples: [...ENDURING_LEADERSHIP_PRINCIPLES],
    decisionJournal: [],
    approvalPatterns: [],
    creativeTaste: [],
    writingIntelligence: [],
    delegationRecommendations: [],
    riskIntelligence: [],
    feedbackIntelligence: [],
    leadershipTimeline: [],
    crossCompanyInsights: [],
    simulatorScenarios: [],
    institutionalLessons: [],
    knowledgeGraphLinks: [],
    connectedLayers: [...LEADERSHIP_DNA_CONNECTED_LAYERS],
  };
}

export function readLeadershipDnaStore(): LeadershipDnaStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(LEADERSHIP_DNA_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LeadershipDnaStore;
    return { ...emptyStore(), ...parsed, version: LEADERSHIP_DNA_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeLeadershipDnaStore(store: LeadershipDnaStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    LEADERSHIP_DNA_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: LEADERSHIP_DNA_VERSION })
  );
}

export function bootstrapLeadershipDnaStore(seed?: Partial<LeadershipDnaStore>): void {
  const existing = readLeadershipDnaStore();
  if (existing.decisionJournal.length > 0) return;
  writeLeadershipDnaStore({ ...emptyStore(), ...seed });
}

function refreshDashboard(store: LeadershipDnaStore): LeadershipDnaStore['dashboard'] {
  const avgProfileConf =
    store.founderProfile.length > 0
      ? Math.round(store.founderProfile.reduce((s, p) => s + p.confidencePct, 0) / store.founderProfile.length)
      : 0;

  return {
    ...store.dashboard,
    principlesCount: store.leadershipPrinciples.length,
    decisionsLogged: store.decisionJournal.length,
    approvalPatternsIdentified: store.approvalPatterns.length,
    overallConfidencePct: avgProfileConf,
  };
}

export function refreshLeadershipDnaDashboard(): void {
  const store = readLeadershipDnaStore();
  writeLeadershipDnaStore({ ...store, dashboard: refreshDashboard(store) });
}

export function evaluateChiefOfStaffAlignment(input: {
  title: string;
  category: string;
  confidencePct: number;
  evaluatedAgainst: string[];
}): ChiefOfStaffAlignmentCheck {
  const store = readLeadershipDnaStore();
  const threshold = store.cosAlignmentThresholdPct;

  const dimensionMatches = input.evaluatedAgainst.filter((src) =>
    store.connectedLayers.some((layer) => src.toLowerCase().includes(layer.toLowerCase().split(' ')[0] ?? ''))
  );
  const hasLeadershipDna = input.evaluatedAgainst.some((s) => s.toLowerCase().includes('leadership'));
  const patternBoost = store.approvalPatterns.filter((p) =>
    input.category.toLowerCase().includes(p.domain.toLowerCase())
  ).length * 3;

  let alignmentPct = input.confidencePct;
  if (hasLeadershipDna) alignmentPct += 4;
  alignmentPct += patternBoost;
  alignmentPct = Math.min(99, alignmentPct);

  const wouldFounderApprove = alignmentPct >= threshold;
  let recommendation: ChiefOfStaffAlignmentCheck['recommendation'] = 'escalate';
  if (wouldFounderApprove) recommendation = 'soft-approve';
  else if (alignmentPct >= threshold - 15) recommendation = 'revise';

  const reasoning =
    recommendation === 'soft-approve'
      ? `Aligns with Leadership DNA · ${dimensionMatches.length} organizational layers matched · founder would likely approve`
      : recommendation === 'revise'
        ? `Partial alignment · revise against ${store.leadershipPrinciples.slice(0, 2).join(' · ')} before escalation`
        : `Below Leadership DNA threshold (${threshold}%) · founder judgment required`;

  return {
    itemTitle: input.title,
    category: input.category,
    alignmentPct,
    wouldFounderApprove,
    recommendation,
    evaluatedDimensions: [...input.evaluatedAgainst, 'Leadership DNA'],
    reasoning,
  };
}

export function recordDecisionOutcome(entryId: string, actualOutcome: string, lessons: string[]): void {
  const store = readLeadershipDnaStore();
  const journal = store.decisionJournal.map((e) =>
    e.id === entryId ? { ...e, actualOutcome, lessonsLearned: [...e.lessonsLearned, ...lessons] } : e
  );
  const timelineEvent = {
    id: `tl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'decision' as const,
    title: 'DECISION OUTCOME RECORDED',
    detail: actualOutcome,
  };
  writeLeadershipDnaStore({
    ...store,
    decisionJournal: journal,
    leadershipTimeline: [timelineEvent, ...store.leadershipTimeline].slice(0, 40),
    dashboard: refreshDashboard({ ...store, decisionJournal: journal }),
  });
}
