import { listBuildOrderRegistry } from '../../build-order/build-order/registry';
import { computeMetricSnapshotsForRecord, computeOverallScoreFromMetrics } from '../metrics/metric-engine';
import {
  mutateFounderAcceptanceTestingStore,
  readFounderAcceptanceTestingStore,
} from '../persistence';
import type {
  FatDelightSignal,
  FatEvidenceItem,
  FatGateRecord,
  FatGenesisFeedbackPacket,
  FatOutstandingIssue,
  FatReplacementTestResult,
  FatValidationRecord,
  FatWithdrawalTestResult,
} from '../types';
import type { FatGateStatus, FatPipelineStage, FatValidationLevel } from '../constants';

function now(): string {
  return new Date().toISOString();
}

type SeedSpec = {
  systemId: string;
  officialName: string;
  purpose: string;
  pipelineStage: FatPipelineStage;
  gates: Partial<Record<FatValidationLevel, { status: FatGateStatus; score?: number; blocker?: string }>>;
  founderScore: number;
  delight: boolean;
  delightQuote?: string;
  withdrawal?: Partial<FatWithdrawalTestResult>;
  replacement?: Partial<FatReplacementTestResult>;
  genesisFeedback?: Partial<FatGenesisFeedbackPacket>;
  evidence: Omit<FatEvidenceItem, 'evidenceId' | 'systemId'>[];
  issues: Omit<FatOutstandingIssue, 'issueId' | 'systemId'>[];
  articlePath?: string;
  runtimePath?: string;
  graduated?: boolean;
};

const LAUNCH_STACK_SEEDS: SeedSpec[] = [
  {
    systemId: 'executive-headquarters',
    officialName: 'Executive Headquarters™',
    purpose: 'Spatial executive operating environment for founder daily work.',
    pipelineStage: 'founder-acceptance-testing',
    gates: {
      architectural: { status: 'accepted', score: 92 },
      implementation: { status: 'accepted', score: 88 },
      'founder-acceptance': { status: 'conditional', score: 71, blocker: 'Repeat operating sessions needed' },
      company: { status: 'pending' },
      market: { status: 'pending' },
    },
    founderScore: 71,
    delight: true,
    delightQuote: 'The room map finally feels like operating a company, not clicking admin tabs.',
    articlePath: 'genesis/articles/EXECUTIVE_HEADQUARTERS.md',
    runtimePath: 'src/studio-os-core/genesis/executive-headquarters/',
    evidence: [
      {
        kind: 'architecture-article',
        title: 'Executive Headquarters canonical article',
        detail: 'Genesis architecture sprint approved spatial HQ model.',
        source: 'genesis/articles/EXECUTIVE_HEADQUARTERS.md',
        level: 'architectural',
        createdAt: '2026-07-08T12:00:00.000Z',
      },
      {
        kind: 'build-log',
        title: 'Implementation build pass',
        detail: 'npm run build verified — HQ workspace, rooms, Orb dock shipped.',
        source: 'Vercel production deploy',
        level: 'implementation',
        createdAt: '2026-07-08T18:00:00.000Z',
      },
      {
        kind: 'founder-narrative',
        title: 'First-use operating session',
        detail: 'Founder navigated Founder Office, Mission Control, and Daily Briefing rooms.',
        source: 'Internal founder session',
        level: 'founder-acceptance',
        createdAt: '2026-07-09T02:00:00.000Z',
      },
    ],
    issues: [
      {
        severity: 'major',
        title: 'Withdrawal Test incomplete',
        detail: 'Need repeat-use sessions before founder acceptance can graduate.',
        blocksGraduation: true,
        createdAt: '2026-07-09T04:00:00.000Z',
      },
    ],
    withdrawal: {
      passed: false,
      criteriaMet: 3,
      founderWouldMiss: false,
      frictionWithoutSystem: 'HQ is promising but not yet habit-forming.',
    },
    replacement: {
      passed: true,
      replacedTools: ['Scattered admin tabs', 'Manual mission tracking'],
    },
  },
  {
    systemId: 'orb',
    officialName: 'Orb™',
    purpose: 'Executive intelligence layer — context, memory, recommendations, briefings.',
    pipelineStage: 'founder-acceptance-testing',
    gates: {
      architectural: { status: 'accepted', score: 94 },
      implementation: { status: 'accepted', score: 90 },
      'founder-acceptance': { status: 'pending', score: 68 },
      company: { status: 'pending' },
      market: { status: 'pending' },
    },
    founderScore: 68,
    delight: true,
    delightQuote: 'Recommendations with evidence feel like a chief of staff, not a chatbot.',
    articlePath: 'genesis/articles/ORB.md',
    runtimePath: 'src/studio-os-core/genesis/orb/',
    evidence: [
      {
        kind: 'architecture-article',
        title: 'Orb canonical article',
        detail: 'Genesis §9B.7 Orb rule — projection-only intelligence layer.',
        source: 'genesis/articles/ORB.md',
        level: 'architectural',
        createdAt: '2026-07-08T20:00:00.000Z',
      },
      {
        kind: 'build-log',
        title: 'Orb runtime implementation',
        detail: 'Context, memory, recommendations, briefings, missions, knowledge engines shipped.',
        source: 'npm run build',
        level: 'implementation',
        createdAt: '2026-07-09T00:00:00.000Z',
      },
    ],
    issues: [
      {
        severity: 'major',
        title: 'Founder Acceptance pending',
        detail: 'Orb must become default executive intelligence surface — habit not yet proven.',
        blocksGraduation: true,
        createdAt: '2026-07-09T04:00:00.000Z',
      },
      {
        severity: 'minor',
        title: 'Attention engine tuning',
        detail: 'Interrupt vs silence policy needs founder calibration.',
        blocksGraduation: false,
        createdAt: '2026-07-09T04:00:00.000Z',
      },
    ],
    withdrawal: { passed: false, criteriaMet: 2, founderWouldMiss: false },
    replacement: {
      passed: true,
      replacedTools: ['Ad-hoc ChatGPT threads', 'Separate briefing notes'],
    },
  },
  {
    systemId: 'identity-engine',
    officialName: 'Identity Engine™',
    purpose: 'Canonical identity graph — users, companies, roles, permissions, AI workers.',
    pipelineStage: 'genesis-feedback',
    gates: {
      architectural: { status: 'graduated', score: 95 },
      implementation: { status: 'accepted', score: 86 },
      'founder-acceptance': { status: 'conditional', score: 74 },
      company: { status: 'pending' },
      market: { status: 'pending' },
    },
    founderScore: 74,
    delight: false,
    articlePath: 'genesis/articles/IDENTITY_ENGINE.md',
    runtimePath: 'src/studio-os-core/genesis/identity-engine/',
    evidence: [
      {
        kind: 'architecture-article',
        title: 'Identity Engine architecture',
        detail: 'Identity graph schema and permission engine defined.',
        source: 'genesis/articles/IDENTITY_ENGINE.md',
        level: 'architectural',
        createdAt: '2026-07-07T10:00:00.000Z',
      },
      {
        kind: 'build-log',
        title: 'Identity runtime verified',
        detail: 'Organizations, roles, permissions, audit history implemented.',
        source: 'Implementation sprint',
        level: 'implementation',
        createdAt: '2026-07-07T16:00:00.000Z',
      },
    ],
    issues: [
      {
        severity: 'minor',
        title: 'Company Validation not started',
        detail: 'Multi-company identity boundary audit pending.',
        blocksGraduation: false,
        createdAt: '2026-07-09T04:00:00.000Z',
      },
    ],
  },
  {
    systemId: 'build-order',
    officialName: 'Build Order™',
    purpose: 'Launch Stack sequencing registry — dependencies, readiness, sprint planning.',
    pipelineStage: 'launch-stack-graduation',
    gates: {
      architectural: { status: 'graduated', score: 93 },
      implementation: { status: 'graduated', score: 91 },
      'founder-acceptance': { status: 'accepted', score: 82 },
      company: { status: 'pending' },
      market: { status: 'pending' },
    },
    founderScore: 82,
    delight: true,
    articlePath: 'genesis/build-order/README.md',
    runtimePath: 'src/studio-os-core/genesis/build-order/',
    evidence: [
      {
        kind: 'architecture-article',
        title: 'Build Order canonical registry',
        detail: 'Topological Launch Stack sequencing with dependency engine.',
        source: 'genesis/build-order/',
        level: 'architectural',
        createdAt: '2026-07-06T08:00:00.000Z',
      },
      {
        kind: 'metric-reading',
        title: 'Registry drives sprint planning',
        detail: 'Build Order feeds Genesis workspace and dependency map.',
        source: 'Genesis integration',
        level: 'founder-acceptance',
        createdAt: '2026-07-08T08:00:00.000Z',
      },
    ],
    issues: [],
    graduated: true,
    withdrawal: { passed: true, criteriaMet: 5, founderWouldMiss: true },
    replacement: {
      passed: true,
      replacedTools: ['Informal build sequencing docs'],
    },
  },
  {
    systemId: 'founder-acceptance-testing',
    officialName: 'Founder Acceptance Testing™',
    purpose: 'Internal validation framework — measurable founder evidence before platform canon.',
    pipelineStage: 'implementation',
    gates: {
      architectural: { status: 'accepted', score: 96 },
      implementation: { status: 'accepted', score: 85 },
      'founder-acceptance': { status: 'pending' },
      company: { status: 'pending' },
      market: { status: 'pending' },
    },
    founderScore: 0,
    delight: false,
    articlePath: 'genesis/articles/FOUNDER_ACCEPTANCE_TESTING.md',
    runtimePath: 'src/studio-os-core/genesis/founder-acceptance-testing/',
    evidence: [
      {
        kind: 'architecture-article',
        title: 'FAT canonical methodology',
        detail: 'Five validation levels, gates, scorecard, withdrawal/replacement/delight tests.',
        source: 'genesis/articles/FOUNDER_ACCEPTANCE_TESTING.md',
        level: 'architectural',
        createdAt: '2026-07-09T03:00:00.000Z',
      },
      {
        kind: 'build-log',
        title: 'FAT runtime implementation',
        detail: 'Validation registry, metric engine, evidence engine, graduation engine shipped.',
        source: 'Implementation sprint',
        level: 'implementation',
        createdAt: '2026-07-09T04:30:00.000Z',
      },
    ],
    issues: [
      {
        severity: 'minor',
        title: 'Self-validation pending',
        detail: 'FAT must validate itself through founder operating sessions.',
        blocksGraduation: false,
        createdAt: '2026-07-09T04:30:00.000Z',
      },
    ],
  },
];

function buildGates(
  spec: SeedSpec,
  evidenceIds: string[]
): FatGateRecord[] {
  const levels: FatValidationLevel[] = [
    'architectural',
    'implementation',
    'founder-acceptance',
    'company',
    'market',
  ];

  return levels.map((level) => {
    const gate = spec.gates[level] ?? { status: 'pending' as FatGateStatus };
    return {
      level,
      status: gate.status,
      score: gate.score,
      blocker: gate.blocker,
      evidenceIds: evidenceIds.filter((_, i) => i < 3),
      passedAt:
        gate.status === 'accepted' || gate.status === 'graduated'
          ? spec.evidence[0]?.createdAt ?? now()
          : undefined,
    };
  });
}

function seedWithdrawal(spec: SeedSpec): FatWithdrawalTestResult {
  return {
    testId: `withdrawal-${spec.systemId}`,
    systemId: spec.systemId,
    passed: spec.withdrawal?.passed ?? spec.founderScore >= 75,
    criteriaMet: spec.withdrawal?.criteriaMet ?? (spec.founderScore >= 75 ? 5 : 2),
    criteriaTotal: 8,
    founderWouldMiss: spec.withdrawal?.founderWouldMiss ?? spec.founderScore >= 75,
    frictionWithoutSystem:
      spec.withdrawal?.frictionWithoutSystem ??
      (spec.founderScore >= 75
        ? 'Founder workflow regresses without the system.'
        : 'System is optional today — founder can revert without major friction.'),
    notes: spec.withdrawal?.notes ?? [],
    completedAt: spec.withdrawal?.completedAt,
  };
}

function seedReplacement(spec: SeedSpec): FatReplacementTestResult {
  return {
    testId: `replacement-${spec.systemId}`,
    systemId: spec.systemId,
    passed: spec.replacement?.passed ?? (spec.replacement?.replacedTools?.length ?? 0) >= 1,
    replacedTools: spec.replacement?.replacedTools ?? [],
    retainedTools: spec.replacement?.retainedTools ?? ['Prior workflow tools'],
    workflowComparison:
      spec.replacement?.workflowComparison ?? 'Replacement evidence pending founder sessions.',
    completedAt: spec.replacement?.completedAt,
  };
}

function seedGenesisFeedback(spec: SeedSpec, timestamp: string): FatGenesisFeedbackPacket {
  const defaults: FatGenesisFeedbackPacket = {
    packetId: `genesis-feedback-${spec.systemId}`,
    systemId: spec.systemId,
    assumptionsChanged: ['Operating evidence still accumulating.'],
    genesisUpdates: ['Complete founder acceptance before Genesis promotion.'],
    promote: false,
    revise: true,
    block: false,
    learningSummary: 'Genesis feedback pending.',
    submittedAt: spec.gates.implementation?.status === 'accepted' ? timestamp : undefined,
  };
  return { ...defaults, ...spec.genesisFeedback, packetId: defaults.packetId, systemId: spec.systemId };
}

function seedDelight(spec: SeedSpec, timestamp: string): FatDelightSignal {
  return {
    signalId: `delight-${spec.systemId}`,
    systemId: spec.systemId,
    present: spec.delight,
    signals: spec.delight ? ['confidence', 'calm', 'momentum'] : [],
    founderQuote: spec.delightQuote,
    recordedAt: spec.delight ? timestamp : undefined,
  };
}

function buildRecord(spec: SeedSpec, timestamp: string): FatValidationRecord {
  const evidence: FatEvidenceItem[] = spec.evidence.map((e, i) => ({
    ...e,
    evidenceId: `evidence-${spec.systemId}-${i}`,
    systemId: spec.systemId,
  }));

  const evidenceIds = evidence.map((e) => e.evidenceId);
  const gates = buildGates(spec, evidenceIds);
  const metrics = computeMetricSnapshotsForRecord(spec.systemId);
  const overallScore = computeOverallScoreFromMetrics(metrics);

  const baseRecord: FatValidationRecord = {
    recordId: `fat-record-${spec.systemId}`,
    systemId: spec.systemId,
    officialName: spec.officialName,
    purpose: spec.purpose,
    pipelineStage: spec.pipelineStage,
    gates,
    overallScore,
    founderAcceptanceScore: spec.founderScore,
    metrics,
    withdrawalTest: seedWithdrawal(spec),
    replacementTest: seedReplacement(spec),
    delight: seedDelight(spec, timestamp),
    genesisFeedback: seedGenesisFeedback(spec, timestamp),
    evidence,
    outstandingIssues: spec.issues.map((issue, i) => ({
      ...issue,
      issueId: `issue-${spec.systemId}-${i}`,
      systemId: spec.systemId,
    })),
    graduated: spec.graduated ?? false,
    graduatedAt: spec.graduated ? timestamp : undefined,
    launchStackMilestone: true,
    articlePath: spec.articlePath,
    runtimePath: spec.runtimePath,
    updatedAt: timestamp,
  };

  return baseRecord;
}

function syncBuildOrderSystems(timestamp: string): FatValidationRecord[] {
  const buildOrder = listBuildOrderRegistry();
  const seededIds = new Set(LAUNCH_STACK_SEEDS.map((s) => s.systemId));

  const additional: FatValidationRecord[] = buildOrder
    .filter((s) => !seededIds.has(s.systemId) && s.architecturalPhase <= 2)
    .slice(0, 8)
    .map((system) => {
      const hasArch = system.currentStatus !== 'planned';
      const hasImpl = system.currentStatus === 'implemented';

      return buildRecord(
        {
          systemId: system.systemId,
          officialName: system.officialName,
          purpose: system.purpose,
          pipelineStage: hasImpl ? 'implementation' : 'architecture',
          gates: {
            architectural: hasArch
              ? { status: 'conditional', score: 70 }
              : { status: 'pending' },
            implementation: hasImpl
              ? { status: 'accepted', score: 80 }
              : { status: 'pending' },
            'founder-acceptance': { status: 'pending' },
            company: { status: 'pending' },
            market: { status: 'pending' },
          },
          founderScore: hasImpl ? 55 : 0,
          delight: false,
          evidence: hasArch
            ? [
                {
                  kind: 'architecture-article',
                  title: `${system.officialName} in Build Order registry`,
                  detail: system.purpose,
                  source: 'Build Order registry',
                  level: 'architectural',
                  createdAt: timestamp,
                },
              ]
            : [],
          issues: [
            {
              severity: 'minor',
              title: 'Validation not started',
              detail: 'Awaiting architecture and implementation sprints.',
              blocksGraduation: false,
              createdAt: timestamp,
            },
          ],
        },
        timestamp
      );
    });

  return additional;
}

export function seedFounderAcceptanceTestingStore(): void {
  const existing = readFounderAcceptanceTestingStore();
  if (existing.seededAt && existing.records.length > 0) {
    return;
  }

  const timestamp = now();
  const primaryRecords = LAUNCH_STACK_SEEDS.map((spec) => buildRecord(spec, timestamp));
  const additionalRecords = syncBuildOrderSystems(timestamp);

  const history = primaryRecords.flatMap((record) => {
    const entries = [];
    const arch = record.gates.find((g) => g.level === 'architectural');
    if (arch?.status === 'accepted' || arch?.status === 'graduated') {
      entries.push({
        entryId: `history-${record.systemId}-arch`,
        systemId: record.systemId,
        action: 'gate-pass' as const,
        level: 'architectural' as const,
        detail: 'Architectural Validation accepted',
        actor: 'genesis-reviewer',
        timestamp: record.evidence[0]?.createdAt ?? timestamp,
      });
    }
    const impl = record.gates.find((g) => g.level === 'implementation');
    if (impl?.status === 'accepted' || impl?.status === 'graduated') {
      entries.push({
        entryId: `history-${record.systemId}-impl`,
        systemId: record.systemId,
        action: 'gate-pass' as const,
        level: 'implementation' as const,
        detail: 'Implementation Validation verified',
        actor: 'platform-steward',
        timestamp: timestamp,
      });
    }
    if (record.graduated) {
      entries.push({
        entryId: `history-${record.systemId}-grad`,
        systemId: record.systemId,
        action: 'graduation' as const,
        detail: 'System graduated from founder acceptance review',
        actor: 'graduation-engine',
        timestamp: record.graduatedAt ?? timestamp,
      });
    }
    return entries;
  });

  mutateFounderAcceptanceTestingStore(() => ({
    version: existing.version,
    records: [...primaryRecords, ...additionalRecords],
    history,
    seededAt: timestamp,
    bootstrappedAt: timestamp,
  }));
}

export function ensureFounderAcceptanceTestingStore() {
  const store = readFounderAcceptanceTestingStore();
  if (!store.seededAt || store.records.length === 0) {
    seedFounderAcceptanceTestingStore();
    return readFounderAcceptanceTestingStore();
  }
  if (!store.bootstrappedAt) {
    mutateFounderAcceptanceTestingStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
  }
  return readFounderAcceptanceTestingStore();
}

export function recordFatOpened(): void {
  mutateFounderAcceptanceTestingStore((store) => ({
    ...store,
    lastOpenedAt: now(),
  }));
}
