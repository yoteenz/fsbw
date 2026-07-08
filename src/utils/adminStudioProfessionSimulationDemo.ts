import {
  PROFESSION_SIMULATION_FORBIDDEN_LANGUAGE,
  SIMULATION_LOOP_PHASES,
  type SimulationLoopPhase,
} from '../studio-os-core/profession-simulation-engine';

export const ADMIN_STUDIO_PROFESSION_SIMULATION_SUBTITLE =
  'Enter a living workplace · Perform the profession · Progress by shift evidence';

export const PROFESSION_SIMULATION_DEMO_PROFESSION_ID = 'hair';
export const PROFESSION_SIMULATION_DEMO_STAGE_ID = 'shampoo-technician';
export const PROFESSION_SIMULATION_DEMO_SCENE_ID = 'shampoo-station-rush';
export const PROFESSION_SIMULATION_DEMO_LEARNER_ID = 'demo-learner';

export const PROFESSION_SIMULATION_LOOP_STEPS: Array<{
  id: SimulationLoopPhase;
  label: string;
}> = SIMULATION_LOOP_PHASES.map((phase) => ({
  id: phase,
  label: phase
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
}));

export const PROFESSION_SIMULATION_WORKPLACE_COPY = {
  clockIn: 'CLOCK IN',
  continueShift: 'CONTINUE SHIFT',
  chooseAction: 'PERFORM WORK',
  handleSurprise: 'HANDLE SURPRISE',
  endShift: 'END SHIFT',
  forbidden: PROFESSION_SIMULATION_FORBIDDEN_LANGUAGE,
} as const;
