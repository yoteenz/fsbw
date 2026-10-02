import type { ResidentId } from '../../types';
import { getResidentLifeTwin, getResidentMemories, getResidentGoals } from '../life-os-services';
import { getLifeOsStore } from '../life-os-store';

export type MindInspectorSnapshot = {
  currentIntent: string;
  currentGoals: string[];
  currentConcerns: string[];
  openLoops: string[];
  needPressure: Record<string, number>;
  relevantMemories: string[];
  decisionSummary: string;
};

export function getMindInspectorSnapshot(residentId: ResidentId): MindInspectorSnapshot {
  const twin = getResidentLifeTwin(residentId);
  const goals = getResidentGoals(residentId);
  const mems = getResidentMemories(residentId)
    .filter((m) => m.resolutionState === 'OPEN')
    .slice(-5);
  const store = getLifeOsStore();
  const recentDecision = store.decisions.filter((d) => d.residentId === residentId).slice(-1)[0];

  const needPressure: Record<string, number> = {};
  for (const [k, v] of Object.entries(twin.needs.levels)) {
    if (typeof v === 'number' && v <= 2) needPressure[k] = 3 - v;
  }

  return {
    currentIntent: twin.current.currentIntent,
    currentGoals: [...goals.personalObjectives, ...goals.currentWants].slice(0, 6),
    currentConcerns: twin.current.blockers,
    openLoops: mems.map((m) => m.summary),
    needPressure,
    relevantMemories: mems.map((m) => m.summary),
    decisionSummary: recentDecision?.reasoningSummary ?? 'No recent structured decision recorded',
  };
}
