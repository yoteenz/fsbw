import { listValidationRegistry } from '../../founder-acceptance-testing/validation/registry';
import { computeAdoptionReading } from '../adoption/adoption-engine';
import { computeConfidenceScore } from '../system-confidence/confidence-engine';
import { detectEscapePatterns } from '../escape-velocity/escape-velocity-engine';
import { createGenesisImprovementProposal } from '../genesis-learning/proposal-engine';
import { buildSystemHealthScore, recomputeAllSystemHealth } from '../system-health/health-engine';
import { computeValueReading } from '../value-tracking/value-engine';
import {
  mutateLiveValidationSystemStore,
  readLiveValidationSystemStore,
} from '../persistence';
import type {
  LvsDiaryAnswer,
  LvsDiaryPrompt,
  LvsEscapeEvent,
  LvsValidationSignal,
  LvsWeeklyReview,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

const ESCAPE_SEED: Omit<LvsEscapeEvent, 'eventId' | 'frequency' | 'createdAt'>[] = [
  {
    systemId: 'orb',
    destinationCategory: 'external-ai',
    destinationLabel: 'ChatGPT',
    reason: 'Deep research thread outside Orb context',
    classification: 'integration-need',
    outcome: 'integrate',
    confidence: 0.78,
    context: 'Executive research during mission planning',
    urgency: 'medium',
    replacementOpportunity: false,
    integrationOpportunity: true,
    frictionScore: 42,
  },
  {
    systemId: 'executive-headquarters',
    destinationCategory: 'calendar',
    destinationLabel: 'Apple Calendar',
    reason: 'Scheduling outside HQ calendar projection',
    classification: 'intentional-boundary',
    outcome: 'accept-boundary',
    confidence: 0.82,
    context: 'Personal scheduling during operating day',
    urgency: 'low',
    replacementOpportunity: false,
    integrationOpportunity: true,
    frictionScore: 18,
  },
  {
    systemId: 'orb',
    destinationCategory: 'notes',
    destinationLabel: 'Apple Notes',
    reason: 'Quick capture before Orb memory write available',
    classification: 'poor-workflow',
    outcome: 'investigate',
    confidence: 0.71,
    context: 'Founder captured decision notes during briefing review',
    urgency: 'medium',
    replacementOpportunity: true,
    integrationOpportunity: false,
    frictionScore: 55,
  },
  {
    systemId: 'content-engine',
    destinationCategory: 'creative-tool',
    destinationLabel: 'External creative suite',
    reason: 'Specialist creative finishing',
    classification: 'creative-preference',
    outcome: 'integrate',
    confidence: 0.85,
    context: 'Final creative polish for campaign asset',
    urgency: 'low',
    replacementOpportunity: false,
    integrationOpportunity: true,
    frictionScore: 22,
  },
];

function buildDiarySeed(timestamp: string): { prompts: LvsDiaryPrompt[]; answers: LvsDiaryAnswer[] } {
  const prompts: LvsDiaryPrompt[] = [
    {
      promptId: 'diary-seed-1',
      question:
        'When you moved to ChatGPT for research, was Orb missing depth — or was that the right external tool?',
      triggerKind: 'escape-event',
      systemIds: ['orb'],
      quickAnswers: ['Missing capability', 'Faster elsewhere', 'Intentional external tool', 'Not sure yet'],
      askedAt: timestamp,
      answeredAt: timestamp,
      skipped: false,
    },
    {
      promptId: 'diary-seed-2',
      question: 'What felt most useful in Studio OS today — and what still pulled you elsewhere?',
      triggerKind: 'daily-reflection',
      systemIds: ['orb', 'executive-headquarters'],
      quickAnswers: ['Orb helped', 'HQ helped', 'Both helped', 'Still pulled elsewhere'],
      askedAt: timestamp,
      skipped: false,
    },
  ];

  const answers: LvsDiaryAnswer[] = [
    {
      answerId: 'diary-answer-seed-1',
      promptId: 'diary-seed-1',
      response:
        'Orb was fine for executive summary, but I wanted a longer research thread without losing Studio context.',
      quickAnswer: 'Intentional external tool',
      sentiments: ['confidence', 'calm'],
      sentimentConfidence: 0.8,
      systemIds: ['orb'],
      shouldAffectValidation: true,
      shouldBecomeGenesisLearning: true,
      recordedAt: timestamp,
    },
  ];

  return { prompts, answers };
}

function buildSignals(timestamp: string): LvsValidationSignal[] {
  return [
    {
      signalId: 'signal-hq-usage',
      systemId: 'executive-headquarters',
      companyId: 'frontal-slayer',
      kind: 'usage',
      metricId: 'daily-active-workflows',
      strength: 0.72,
      confidence: 0.85,
      evidence: ['Founder opened HQ rooms during operating session'],
      createdAt: timestamp,
    },
    {
      signalId: 'signal-orb-completion',
      systemId: 'orb',
      companyId: 'frontal-slayer',
      kind: 'completion',
      metricId: 'mission-completion',
      strength: 0.68,
      confidence: 0.8,
      evidence: ['Mission advice viewed and acted upon'],
      createdAt: timestamp,
    },
    {
      signalId: 'signal-orb-friction',
      systemId: 'orb',
      companyId: 'frontal-slayer',
      kind: 'friction',
      metricId: 'flow-interruptions',
      strength: 0.55,
      confidence: 0.7,
      evidence: ['Escape to Apple Notes during briefing'],
      createdAt: timestamp,
    },
  ];
}

function buildWeeklyReview(timestamp: string): LvsWeeklyReview {
  return {
    reviewId: 'weekly-review-seed-1',
    weekOf: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    systemsImproved: ['build-order', 'founder-acceptance-testing'],
    systemsWithFriction: ['orb', 'content-engine'],
    notableEscapes: ['ChatGPT research', 'Apple Notes quick capture'],
    missionsCompletedFaster: 2,
    proposalsCreated: 2,
    proposalsAccepted: 0,
    proposalsRejected: 0,
    founderConfidenceTrend: 'up',
    summary:
      'Studio OS is becoming habitual for executive operating, but Orb still shares research and capture workflows with external tools.',
    generatedAt: timestamp,
  };
}

export function seedLiveValidationSystemStore(): void {
  const existing = readLiveValidationSystemStore();
  if (existing.seededAt && existing.signals.length > 0) {
    recomputeAllSystemHealth();
    return;
  }

  const timestamp = now();
  const fatRecords = listValidationRegistry().filter((r) => r.launchStackMilestone);
  const { prompts, answers } = buildDiarySeed(timestamp);

  const escapeEvents: LvsEscapeEvent[] = ESCAPE_SEED.map((seed, i) => ({
    ...seed,
    eventId: `escape-seed-${i}`,
    frequency: 1,
    createdAt: timestamp,
  }));

  const adoptionReadings = fatRecords.map((r) =>
    computeAdoptionReading(r.systemId, r.founderAcceptanceScore || r.overallScore)
  );
  const valueReadings = fatRecords.map((r) =>
    computeValueReading(r.systemId, r.founderAcceptanceScore || r.overallScore)
  );
  const confidenceReadings = fatRecords.map((r) =>
    computeConfidenceScore(r.systemId, r.founderAcceptanceScore || r.overallScore)
  );

  const systemHealth = fatRecords.map((r) =>
    buildSystemHealthScore(r.systemId, r.officialName, r.founderAcceptanceScore || r.overallScore)
  );

  mutateLiveValidationSystemStore(() => ({
    version: existing.version,
    signals: buildSignals(timestamp),
    diaryPrompts: prompts,
    diaryAnswers: answers,
    escapeEvents,
    escapePatterns: detectEscapePatterns(escapeEvents),
    systemHealth,
    confidenceReadings,
    adoptionReadings,
    valueReadings,
    genesisProposals: [],
    architecturalHistory: [],
    weeklyReviews: [buildWeeklyReview(timestamp)],
    diaryPaused: false,
    seededAt: timestamp,
    bootstrappedAt: timestamp,
  }));

  createGenesisImprovementProposal({
    title: 'Orb research thread integration',
    systemIds: ['orb'],
    signalSummary:
      'Founder repeatedly uses ChatGPT for deep research after Orb briefing — integration may reduce Escape Velocity.',
    evidenceQuality: 'medium',
    proposedGenesisChange:
      'Add Orb deep-research handoff mode with Studio context preservation and return path.',
    escapeClassifications: ['integration-need'],
    recommendedOutcome: 'integrate',
    graduationImpact: 'May improve Orb Founder Acceptance and reduce external AI escapes.',
    risksOfInaction: 'Orb remains optional for executive research workflows.',
    diaryExcerpts: [
      'Orb was fine for executive summary, but I wanted a longer research thread without losing Studio context.',
    ],
  });

  createGenesisImprovementProposal({
    title: 'Orb quick-capture workflow',
    systemIds: ['orb'],
    signalSummary:
      'Escape to Apple Notes during briefing suggests missing low-friction memory capture.',
    evidenceQuality: 'medium',
    proposedGenesisChange:
      'Add one-tap Orb memory capture from briefing and recommendation cards.',
    escapeClassifications: ['poor-workflow'],
    recommendedOutcome: 'replace',
    graduationImpact: 'Could improve withdrawal dependency for Orb memory tier.',
    risksOfInaction: 'Founder continues parallel note-taking outside Studio OS.',
  });
}

export function ensureLiveValidationSystemStore() {
  const store = readLiveValidationSystemStore();
  if (!store.seededAt || store.signals.length === 0) {
    seedLiveValidationSystemStore();
    return readLiveValidationSystemStore();
  }
  if (!store.bootstrappedAt) {
    mutateLiveValidationSystemStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
  }
  recomputeAllSystemHealth();
  return readLiveValidationSystemStore();
}

export function recordLiveValidationOpened(): void {
  mutateLiveValidationSystemStore((store) => ({
    ...store,
    lastOpenedAt: now(),
  }));
}

export function setDiaryPaused(paused: boolean): void {
  mutateLiveValidationSystemStore((store) => ({
    ...store,
    diaryPaused: paused,
  }));
}
