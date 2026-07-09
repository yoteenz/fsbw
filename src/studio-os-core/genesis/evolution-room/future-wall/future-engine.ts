import { listEscapePatterns } from '../../live-validation-system/escape-velocity/escape-velocity-engine';
import { readEvolutionRoomStore, mutateEvolutionRoomStore } from '../persistence';
import type { ErFutureCategory } from '../constants';
import type { ErFutureOpportunity } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildDynamicFutureOpportunities(): ErFutureOpportunity[] {
  const patterns = listEscapePatterns();
  const escapeOpportunities: ErFutureOpportunity[] = patterns
    .filter((p) => p.recommendedOutcome === 'integrate' || p.recommendedOutcome === 'replace')
    .slice(0, 4)
    .map((p) => ({
      opportunityId: id('future'),
      title: `Integrate ${p.destinationCategory} workflow`,
      category: 'automation' as ErFutureCategory,
      description: `${p.occurrenceCount} escape events suggest a Studio OS integration opportunity for ${p.systemId}.`,
      evidence: [`Escape velocity: ${p.escapeVelocityScore}`, `Outcome: ${p.recommendedOutcome}`],
      confidence: Math.min(0.95, 0.6 + p.occurrenceCount * 0.05),
      priority: p.escapeVelocityScore > 60 ? 'high' : 'medium',
      suggestedMonth: 'Next month',
    }));

  const launchStackFuture: ErFutureOpportunity[] = [
    {
      opportunityId: id('future'),
      title: 'Evolution Room monthly cadence',
      category: 'launch-stack',
      description: 'Establish recurring first-week Evolution Room sessions as executive heartbeat.',
      evidence: ['Architecture approved', 'Runtime implementation active'],
      confidence: 0.88,
      priority: 'high',
      suggestedMonth: 'Ongoing',
    },
    {
      opportunityId: id('future'),
      title: 'Genesis proposal review ritual',
      category: 'genesis',
      description: 'Formalize Evolution Council review of all queued Genesis improvement proposals.',
      evidence: ['Constitutional rule: nothing auto-canonizes'],
      confidence: 0.92,
      priority: 'high',
    },
    {
      opportunityId: id('future'),
      title: 'Knowledge graph relationship visualization',
      category: 'knowledge',
      description: 'Interactive relationship graphs during Knowledge Review stage.',
      evidence: ['Knowledge Core integration planned'],
      confidence: 0.72,
      priority: 'medium',
    },
  ];

  return [...escapeOpportunities, ...launchStackFuture];
}

export function seedFutureWall(): void {
  const store = readEvolutionRoomStore();
  if (store.futureWall.length > 0) return;
  mutateEvolutionRoomStore((s) => ({
    ...s,
    futureWall: buildDynamicFutureOpportunities(),
  }));
}

export function listFutureOpportunities(): ErFutureOpportunity[] {
  seedFutureWall();
  const persisted = readEvolutionRoomStore().futureWall;
  const dynamic = buildDynamicFutureOpportunities();
  const merged = [...persisted];
  for (const d of dynamic) {
    if (!merged.some((m) => m.title === d.title)) merged.push(d);
  }
  return merged.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function addFutureOpportunity(input: Omit<ErFutureOpportunity, 'opportunityId'>): ErFutureOpportunity {
  const entry: ErFutureOpportunity = { ...input, opportunityId: id('future') };
  mutateEvolutionRoomStore((s) => ({
    ...s,
    futureWall: [entry, ...s.futureWall],
  }));
  return entry;
}
