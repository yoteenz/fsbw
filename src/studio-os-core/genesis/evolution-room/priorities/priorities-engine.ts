import { readEvolutionRoomStore, mutateEvolutionRoomStore } from '../persistence';
import type { ErMeetingStage } from '../constants';
import type { ErStrategicPriority } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextMonthLabel(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

const SEED_PRIORITIES: Omit<ErStrategicPriority, 'priorityId'>[] = [
  {
    title: 'Complete Evolution Room monthly ritual',
    rationale: 'Establish executive heartbeat for founder + Studio OS co-evolution.',
    sourceStage: 'orb-greeting',
    status: 'accepted',
    targetMonth: nextMonthLabel(),
  },
  {
    title: 'Review queued Genesis proposals',
    rationale: 'Constitutional gate — nothing becomes canon without founder review.',
    sourceStage: 'genesis-opportunities',
    status: 'pending',
    targetMonth: nextMonthLabel(),
  },
  {
    title: 'Advance blocked Launch Stack systems',
    rationale: 'Graduation pipeline requires validation evidence before canon promotion.',
    sourceStage: 'launch-stack-progress',
    status: 'pending',
    targetMonth: nextMonthLabel(),
  },
];

export function seedStrategicPriorities(): void {
  const store = readEvolutionRoomStore();
  if (store.strategicPriorities.length > 0) return;
  mutateEvolutionRoomStore((s) => ({
    ...s,
    strategicPriorities: SEED_PRIORITIES.map((p) => ({ ...p, priorityId: id('priority') })),
  }));
}

export function listStrategicPriorities(): ErStrategicPriority[] {
  seedStrategicPriorities();
  return readEvolutionRoomStore().strategicPriorities;
}

export function updateStrategicPriorityStatus(
  priorityId: string,
  status: ErStrategicPriority['status']
): void {
  mutateEvolutionRoomStore((s) => ({
    ...s,
    strategicPriorities: s.strategicPriorities.map((p) =>
      p.priorityId === priorityId ? { ...p, status } : p
    ),
  }));
}

export function addStrategicPriority(input: {
  title: string;
  rationale: string;
  sourceStage: ErMeetingStage;
}): ErStrategicPriority {
  const priority: ErStrategicPriority = {
    priorityId: id('priority'),
    title: input.title,
    rationale: input.rationale,
    sourceStage: input.sourceStage,
    status: 'pending',
    targetMonth: nextMonthLabel(),
  };
  mutateEvolutionRoomStore((s) => ({
    ...s,
    strategicPriorities: [priority, ...s.strategicPriorities],
  }));
  return priority;
}
