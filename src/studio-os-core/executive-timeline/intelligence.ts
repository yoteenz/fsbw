import type {
  ExecutiveTimelineStore,
  TimelineEvent,
  TimelineImpactAnalysis,
  ConciergeTimelineCommand,
} from './types';

function findEvent(store: ExecutiveTimelineStore, eventId: string): TimelineEvent | undefined {
  return store.events.find((e) => e.id === eventId);
}

function collectDownstream(event: TimelineEvent, events: TimelineEvent[]): TimelineEvent[] {
  const affected = new Map<string, TimelineEvent>();
  const queue = [...event.blocks];
  while (queue.length) {
    const id = queue.shift()!;
    const next = events.find((e) => e.id === id);
    if (!next || affected.has(id)) continue;
    affected.set(id, next);
    queue.push(...next.blocks);
  }
  return [...affected.values()];
}

/** Analyze what breaks if an event moves — never silently break schedules. */
export function analyzeEventMoveImpact(
  store: ExecutiveTimelineStore,
  eventId: string,
  proposedChange: string
): TimelineImpactAnalysis | null {
  const event = findEvent(store, eventId);
  if (!event) return null;

  const downstream = collectDownstream(event, store.events);
  const categories = new Set<string>();
  for (const dep of event.dependencies) categories.add(dep.category);
  for (const d of downstream) {
    for (const dep of d.dependencies) categories.add(dep.category);
  }

  const conflictCount = downstream.filter((e) => e.status === 'scheduled' || e.status === 'at-risk').length;

  return {
    eventId,
    proposedChange,
    affectedEventIds: downstream.map((e) => e.id),
    affectedCategories: [...categories],
    conflictCount,
    recommendation:
      conflictCount > 0
        ? `Moving "${event.title}" will affect ${conflictCount} downstream item(s). Recommend automatic reorganization with founder approval.`
        : 'Low-impact move — safe to apply with concierge confirmation.',
    autoReorganizeAvailable: conflictCount > 0,
    requiresFounderApproval: conflictCount > 2 || event.priority === 'critical',
    summary:
      conflictCount > 0
        ? `Moving this will affect ${downstream.length} linked tasks across ${categories.size} categories including publishing, production, and concierge workflows.`
        : 'No critical downstream dependencies detected.',
  };
}

const COMMAND_PATTERNS: Array<{ pattern: RegExp; intent: string; action: (m: RegExpMatchArray) => string }> = [
  {
    pattern: /move .+ meeting to (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    intent: 'reschedule-meeting',
    action: (m) => `Reschedule meeting to ${m[1]}`,
  },
  {
    pattern: /push .+ campaign back/i,
    intent: 'delay-campaign',
    action: () => 'Delay campaign timeline by one week with dependency scan',
  },
  {
    pattern: /clear my afternoon/i,
    intent: 'clear-afternoon',
    action: () => 'Clear afternoon blocks and rebalance publishing load',
  },
  {
    pattern: /black friday timeline/i,
    intent: 'build-campaign-timeline',
    action: () => 'Generate Black Friday campaign timeline draft',
  },
  {
    pattern: /schedule .+ interviews/i,
    intent: 'schedule-interviews',
    action: () => 'Find interview slots next month with executive availability',
  },
  {
    pattern: /free afternoon/i,
    intent: 'free-afternoon',
    action: () => 'Protect afternoon for deep work — defer non-critical meetings',
  },
  {
    pattern: /photoshoot next month/i,
    intent: 'find-photoshoot-slot',
    action: () => 'Search photoshoot window with production and concierge alignment',
  },
  {
    pattern: /vacation next week/i,
    intent: 'personal-vacation',
    action: () => 'Adapt publishing, meetings, and executive reviews around vacation',
  },
  {
    pattern: /block every friday morning/i,
    intent: 'recurring-deep-work',
    action: () => 'Block recurring Friday deep-work sessions in timeline memory',
  },
];

/** Parse natural-language concierge / founder timeline commands. */
export function parseConciergeTimelineCommand(
  rawText: string,
  concierge = 'Chief Concierge'
): Omit<ConciergeTimelineCommand, 'id' | 'createdAt' | 'status'> {
  const trimmed = rawText.trim();
  for (const { pattern, intent, action } of COMMAND_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        concierge,
        rawText: trimmed,
        parsedIntent: intent,
        proposedAction: action(match),
      };
    }
  }
  return {
    concierge,
    rawText: trimmed,
    parsedIntent: 'general-timeline-request',
    proposedAction: 'Analyze intent and propose timeline adjustments with impact preview',
  };
}

export function buildRescheduleRecommendation(
  store: ExecutiveTimelineStore,
  eventId: string
): string {
  const impact = analyzeEventMoveImpact(store, eventId, 'Reschedule requested');
  if (!impact) return 'Event not found.';
  if (impact.conflictCount === 0) return 'Safe to move — no downstream conflicts.';
  return `Moving this meeting will affect ${impact.conflictCount} publishing tasks. Would you like me to reorganize everything automatically?`;
}
