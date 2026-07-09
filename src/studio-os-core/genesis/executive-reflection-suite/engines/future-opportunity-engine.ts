import { listFutureOpportunities } from '../../evolution-room/future-wall/future-engine';
import { listEscapePatterns } from '../../live-validation-system/escape-velocity/escape-velocity-engine';
import { readExecutiveReflectionSuiteStore, mutateExecutiveReflectionSuiteStore } from '../persistence';
import type { ErsFutureScenario, ErsOpportunitySignal, ErsBoardroomPacket, ErsDecisionTimelineEntry } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildFutureScenarios(): ErsFutureScenario[] {
  const store = readExecutiveReflectionSuiteStore();
  if (store.futureScenarios.length > 0) return store.futureScenarios;

  const scenarios: ErsFutureScenario[] = [
    {
      scenarioId: id('scenario'),
      title: 'Road Ahead — Current Trajectory',
      mode: 'road-ahead',
      narrative: 'If current Launch Stack validation and reflection cadence continue, Studio OS compounds founder trust and platform maturity.',
      assumptions: ['Monthly Evolution Room maintained', 'Genesis proposals reviewed'],
      confidence: 0.78,
      recommendations: ['Preserve monthly ritual', 'Advance blocked Launch Stack systems'],
    },
    {
      scenarioId: id('scenario'),
      title: 'Bold Future — Full Suite Activation',
      mode: 'bold-future',
      narrative: 'Complete Executive Reflection Suite with Annual Summit and Boardroom becomes Studio OS defining experience.',
      assumptions: ['All wing rooms implemented', 'Founder engages quarterly+ annually'],
      confidence: 0.72,
      recommendations: ['Prioritize Boardroom and Annual Summit ceremonies'],
    },
    {
      scenarioId: id('scenario'),
      title: 'Risk Future — Reflection Neglected',
      mode: 'risk-future',
      narrative: 'Without reflection rituals, validation signals accumulate without founder synthesis; Genesis drifts from operating evidence.',
      assumptions: ['No monthly sessions', 'Proposals queue unreviewed'],
      confidence: 0.85,
      recommendations: ['Schedule Evolution Room', 'Review Genesis queue this month'],
    },
  ];

  mutateExecutiveReflectionSuiteStore((s) => ({ ...s, futureScenarios: scenarios }));
  return scenarios;
}

export function buildOpportunitySignals(): ErsOpportunitySignal[] {
  const future = listFutureOpportunities();
  const escapes = listEscapePatterns();

  const fromFuture: ErsOpportunitySignal[] = future.map((f) => ({
    signalId: f.opportunityId,
    title: f.title,
    category: f.category,
    description: f.description,
    evidence: f.evidence,
    confidence: f.confidence,
    timingWindow: f.suggestedMonth ?? 'Next quarter',
    priority: f.priority,
  }));

  const fromEscapes: ErsOpportunitySignal[] = escapes
    .filter((e) => e.recommendedOutcome === 'integrate' || e.recommendedOutcome === 'replace')
    .slice(0, 4)
    .map((e) => ({
      signalId: id('opp'),
      title: `Integrate ${e.destinationCategory}`,
      category: 'automation',
      description: `${e.occurrenceCount} escapes suggest workflow integration for ${e.systemId}.`,
      evidence: [`Escape velocity ${e.escapeVelocityScore}`],
      confidence: Math.min(0.9, 0.55 + e.occurrenceCount * 0.06),
      timingWindow: 'This month',
      priority: (e.escapeVelocityScore > 60 ? 'high' : 'medium') as 'high' | 'medium',
    }));

  const store = readExecutiveReflectionSuiteStore();
  return [...store.opportunitySignals, ...fromFuture, ...fromEscapes].slice(0, 16);
}

const SEED_BOARDROOM: Omit<ErsBoardroomPacket, 'packetId' | 'createdAt'> = {
  title: 'Genesis §9B.11 Executive Reflection Suite Canon',
  decisionClass: 'constitutional',
  evidence: ['Architecture approved', 'Evolution Room insufficient alone', 'Multi-cadence rituals required'],
  tradeoffs: ['More rooms to build vs richer founder experience', 'Ceremony overhead vs clarity payoff'],
  precedents: ['Evolution Room monthly chamber', 'Live Validation continuous signals'],
  alternativePaths: ['Expand Evolution Room only', 'Dashboard-based reflection'],
  risks: ['Over-engineering before founder usage', 'Ceremony fatigue if too frequent'],
  benefits: ['Complete reflection operating environment', 'Boardroom for permanent decisions'],
  longTermImplications: ['Studio OS becomes founder growth partner', 'Genesis evolves from evidence'],
  dissentingArgument: 'A single monthly room may suffice for early-stage founders with limited time.',
  founderJudgmentQuestions: [
    'Should Boardroom decisions require quarterly review minimum?',
    'Which Suite rooms unlock first based on founder rhythm?',
  ],
  status: 'draft',
};

export function seedBoardroomPackets(): void {
  const store = readExecutiveReflectionSuiteStore();
  if (store.boardroomPackets.length > 0) return;
  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    boardroomPackets: [
      { ...SEED_BOARDROOM, packetId: id('boardroom'), createdAt: new Date().toISOString() },
    ],
    decisionTimeline: [
      {
        entryId: id('decision'),
        title: 'Executive Reflection Suite architecture approved',
        decisionClass: 'genesis',
        rationale: 'Evolution Room alone insufficient; full Suite wing required.',
        outcome: 'Architecture canon drafted',
        agedWell: true,
        decidedAt: '2026-07-09T00:00:00.000Z',
        reviewDate: '2027-07-09',
      },
    ],
  }));
}

export function listBoardroomPackets(): ErsBoardroomPacket[] {
  seedBoardroomPackets();
  return readExecutiveReflectionSuiteStore().boardroomPackets;
}

export function listDecisionTimeline(): ErsDecisionTimelineEntry[] {
  seedBoardroomPackets();
  return readExecutiveReflectionSuiteStore().decisionTimeline.sort(
    (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
  );
}

export function createBoardroomPacket(
  input: Omit<ErsBoardroomPacket, 'packetId' | 'createdAt' | 'status'>
): ErsBoardroomPacket {
  const packet: ErsBoardroomPacket = {
    ...input,
    packetId: id('boardroom'),
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  mutateExecutiveReflectionSuiteStore((s) => ({
    ...s,
    boardroomPackets: [packet, ...s.boardroomPackets],
  }));
  return packet;
}
