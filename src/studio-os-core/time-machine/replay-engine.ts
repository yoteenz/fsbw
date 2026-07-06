import { RECONSTRUCTION_LAYER_LABELS, RECONSTRUCTION_LAYERS, REPLAY_EVENT_TYPES, REPLAY_EVENT_TYPE_LABELS } from './constants';
import type { ReconstructedLayer, ReplayEvent, ReplayEventType, ReplayStep, StudioIntelligenceCommentary } from './types';

const EVENT_SEEDS: {
  eventType: ReplayEventType;
  title: string;
  durationMinutes: number;
  whatHappened: string;
  whyItHappened: string;
}[] = [
  {
    eventType: 'customer-purchase',
    title: 'Customer Purchase · Order #4821',
    durationMinutes: 4,
    whatHappened: 'Customer completed checkout · payment authorized · confirmation email queued.',
    whyItHappened: 'Standard purchase flow triggered after cart validation · Stripe webhook confirmed payment.',
  },
  {
    eventType: 'appointment-booking',
    title: 'Appointment Booking · March 14 2:30 PM',
    durationMinutes: 3,
    whatHappened: 'Customer selected time slot · calendar synced · reminder automation scheduled.',
    whyItHappened: 'Booking workflow passed availability check · Profession Brain scheduling rules applied.',
  },
  {
    eventType: 'permit-approval',
    title: 'Permit Approval · Building Permit BP-2026-0412',
    durationMinutes: 12,
    whatHappened: 'Reviewer approved permit · Policy Engine validated compliance · notification sent to applicant.',
    whyItHappened: 'All required documents present · Legal Brain confirmed jurisdiction rules · approval node executed.',
  },
  {
    eventType: 'quarterly-fuel-tax-filing',
    title: 'Quarterly Fuel Tax Filing · Q1 2026',
    durationMinutes: 18,
    whatHappened: 'Tax documents uploaded · calculations verified · filing submitted to authority portal.',
    whyItHappened: 'Tax Brain guided calculation · integration with filing portal succeeded · automation completed chain.',
  },
  {
    eventType: 'knowledge-publication',
    title: 'Knowledge Publication · Operations Handbook v3',
    durationMinutes: 6,
    whatHappened: 'Author published revision · Knowledge Graph updated · documentation sync triggered.',
    whyItHappened: 'Documentation governance approved change · graph edges rebuilt for new content nodes.',
  },
  {
    eventType: 'marketplace-transaction',
    title: 'Marketplace Transaction · Expert Package Purchase',
    durationMinutes: 5,
    whatHappened: 'Buyer purchased expert package · escrow initiated · expert notified.',
    whyItHappened: 'Marketplace trust score passed threshold · payment split automation triggered.',
  },
  {
    eventType: 'expert-consultation',
    title: 'Expert Consultation · Legal Advisory Session',
    durationMinutes: 45,
    whatHappened: 'Expert accepted request · session conducted · Professional Trust Framework boundaries enforced.',
    whyItHappened: 'Expert Brain escalation rules active · jurisdiction captured before advice rendered.',
  },
  {
    eventType: 'automation-failure',
    title: 'Automation Failure · Welcome Email Chain',
    durationMinutes: 2,
    whatHappened: 'Welcome automation failed at step 3 · retry exhausted · manual queue created.',
    whyItHappened: 'CRM sync lag caused duplicate trigger · race condition between signup and sync automations.',
  },
  {
    eventType: 'revenue-spike',
    title: 'Revenue Spike · +340% Daily Revenue',
    durationMinutes: 8,
    whatHappened: 'Unusual transaction volume detected · analytics flagged spike · founder notified.',
    whyItHappened: 'Marketing campaign conversion exceeded forecast · no system failure — legitimate surge.',
  },
  {
    eventType: 'security-event',
    title: 'Security Event · Permission Anomaly Detected',
    durationMinutes: 1,
    whatHappened: 'Unusual export attempt blocked · Policy Engine denied action · security alert raised.',
    whyItHappened: 'Editor role attempted bulk PII export · Permission Engine capability check rejected.',
  },
];

function buildLayersForEvent(eventType: ReplayEventType): ReconstructedLayer[] {
  return RECONSTRUCTION_LAYERS.map((layer) => ({
    layer,
    label: RECONSTRUCTION_LAYER_LABELS[layer],
    snapshot: buildLayerSnapshot(layer, eventType),
    active: true,
  }));
}

function buildLayerSnapshot(layer: (typeof RECONSTRUCTION_LAYERS)[number], eventType: ReplayEventType): string {
  const snapshots: Partial<Record<(typeof RECONSTRUCTION_LAYERS)[number], string>> = {
    'user-actions': 'User navigated workflow · submitted form · confirmed action',
    'ai-reasoning': 'Studio Intelligence weighed 3 signals · confidence 86% · recommendation grounded',
    'profession-brain-decisions': 'Relevant Profession Brain™ activated · boundaries enforced · escalation checked',
    'automation-triggers': '2 automations fired · Event Bus delivered · 1 subscriber reacted',
    'knowledge-graph-state': '14 nodes active · 3 edges traversed · no orphaned references',
    'active-integrations': 'Stripe · Calendar · CRM connected · OAuth valid',
    'organization-settings': 'Org config v2.4 · feature flags stable · timezone America/Chicago',
    permissions: 'Role: Customer · capabilities: read, purchase · Policy Engine: allowed',
    notifications: 'Email queued · in-app alert sent · Command Dock summary prepared',
    'timeline-events': 'Executive Timeline entry created · pulse signal updated',
    'environmental-context': 'Business hours · normal load · founder not in focus mode',
  };
  if (eventType === 'automation-failure') {
    snapshots['automation-triggers'] = 'Automation chain broke at step 3 · retry failed · dead letter queue';
  }
  if (eventType === 'security-event') {
    snapshots.permissions = 'Editor role · export capability DENIED by Policy Engine';
  }
  return snapshots[layer] ?? 'Layer reconstructed from event log';
}

function buildSteps(seed: (typeof EVENT_SEEDS)[number], occurredAt: string): ReplayStep[] {
  const base = Date.parse(occurredAt);
  return [
    {
      stepIndex: 0,
      timestamp: new Date(base).toISOString(),
      label: 'INITIATION',
      actor: 'User',
      action: 'Event initiated',
      layerHighlights: ['user-actions', 'environmental-context'],
      detail: `${seed.title} — workflow entry point reached.`,
    },
    {
      stepIndex: 1,
      timestamp: new Date(base + 30000).toISOString(),
      label: 'VALIDATION',
      actor: 'Policy Engine',
      action: 'Permissions and rules checked',
      layerHighlights: ['permissions', 'organization-settings'],
      detail: 'Capability check passed · org settings applied.',
    },
    {
      stepIndex: 2,
      timestamp: new Date(base + 60000).toISOString(),
      label: 'INTELLIGENCE',
      actor: 'Profession Brain™',
      action: 'Brain guidance applied',
      layerHighlights: ['profession-brain-decisions', 'ai-reasoning', 'knowledge-graph-state'],
      detail: 'Relevant brain activated · AI reasoning logged · KG state captured.',
    },
    {
      stepIndex: 3,
      timestamp: new Date(base + 90000).toISOString(),
      label: 'AUTOMATION',
      actor: 'Automation Registry',
      action: 'Automations triggered',
      layerHighlights: ['automation-triggers', 'active-integrations'],
      detail: 'Event Bus published · integrations called · chain progressing.',
    },
    {
      stepIndex: 4,
      timestamp: new Date(base + 120000).toISOString(),
      label: 'COMPLETION',
      actor: 'System',
      action: 'Event completed',
      layerHighlights: ['notifications', 'timeline-events'],
      detail: seed.whatHappened,
    },
  ];
}

function buildCommentary(seed: (typeof EVENT_SEEDS)[number]): StudioIntelligenceCommentary {
  return {
    whatHappened: seed.whatHappened,
    whyItHappened: seed.whyItHappened,
    alternativeOutcomes: [
      'If validation had failed, user would see inline error — no downstream automations.',
      'If integration unavailable, event would queue for retry — customer sees pending state.',
    ],
    whatCouldHavePrevented: seed.eventType === 'automation-failure'
      ? ['Idempotency key on signup automation', 'Deduplication window on CRM sync trigger']
      : ['Pre-flight Digital Twin simulation', 'QA Simulation Engine customer journey rehearsal'],
    recommendedImprovements: seed.eventType === 'security-event'
      ? ['Audit Editor role export capabilities', 'Enable MFA for bulk data operations']
      : ['Document event in Knowledge Library', 'Add to Scenario Library for future training'],
  };
}

export function buildReplayEvents(now: string): ReplayEvent[] {
  return EVENT_SEEDS.map((seed, idx) => {
    const occurredAt = new Date(Date.parse(now) - (idx + 1) * 86400000 * 2).toISOString();
    const steps = buildSteps(seed, occurredAt);
    return {
      id: `replay-${seed.eventType}-${idx}`,
      eventType: seed.eventType,
      eventLabel: REPLAY_EVENT_TYPE_LABELS[seed.eventType],
      title: seed.title,
      occurredAt,
      durationMinutes: seed.durationMinutes,
      stepCount: steps.length,
      reconstructedLayers: buildLayersForEvent(seed.eventType),
      steps,
      commentary: buildCommentary(seed),
      replayable: true,
    };
  });
}

export function computeReplayScore(events: ReplayEvent[]): number {
  const avgSteps = events.reduce((s, e) => s + e.stepCount, 0) / Math.max(1, events.length);
  return Math.min(99, Math.round(85 + avgSteps));
}

export { REPLAY_EVENT_TYPES, REPLAY_EVENT_TYPE_LABELS };
