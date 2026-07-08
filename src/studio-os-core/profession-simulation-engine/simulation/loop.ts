import { SIMULATION_LOOP_PHASES, type SimulationLoopPhase } from './schema';

export function phaseIndex(phase: SimulationLoopPhase): number {
  return SIMULATION_LOOP_PHASES.indexOf(phase);
}

export function nextPhase(phase: SimulationLoopPhase): SimulationLoopPhase | null {
  const index = phaseIndex(phase);
  if (index < 0 || index >= SIMULATION_LOOP_PHASES.length - 1) return null;
  return SIMULATION_LOOP_PHASES[index + 1];
}

export function isTerminalPhase(phase: SimulationLoopPhase): boolean {
  return phase === 'promotion-progress';
}

export function canAdvanceFromPhase(
  phase: SimulationLoopPhase,
  context: { hasExecutionChoice?: boolean; hasUnexpectedEvent?: boolean }
): boolean {
  switch (phase) {
    case 'execution':
      return Boolean(context.hasExecutionChoice);
    case 'unexpected-event':
      return Boolean(context.hasUnexpectedEvent);
    default:
      return true;
  }
}

export const SIMULATION_LOOP_LABELS: Record<SimulationLoopPhase, string> = {
  arrival: 'Arrival',
  briefing: 'Briefing',
  mission: 'Mission',
  execution: 'Execution',
  'unexpected-event': 'Unexpected Event',
  evaluation: 'Evaluation',
  feedback: 'Feedback',
  'knowledge-update': 'Knowledge Update',
  rewards: 'Rewards',
  'promotion-progress': 'Promotion Progress',
};

export const SIMULATION_LOOP_DESCRIPTIONS: Record<SimulationLoopPhase, string> = {
  arrival: 'Clock in and enter the workplace.',
  briefing: 'Receive mentor notes and shift context.',
  mission: 'Understand who is waiting and what success looks like.',
  execution: 'Perform the professional work.',
  'unexpected-event': 'Handle a real workplace surprise.',
  evaluation: 'Measure performance against Profession Brain criteria.',
  feedback: 'Receive mentor and client feedback.',
  'knowledge-update': 'Update living knowledge from the shift.',
  rewards: 'Earn reputation and skill evidence.',
  'promotion-progress': 'Advance toward the next career level.',
};
