import { ACTIVATION_PHASES, ACTIVATION_PHASE_LABELS } from './constants';
import type { ActivationPhase, MissionControlActivationState } from './types';

const PHASE_MS: Record<ActivationPhase, number> = {
  darkening: 400,
  'orb-brightens': 350,
  'light-beam': 450,
  'glass-particles': 500,
  'light-ribbons': 400,
  'holographic-grid': 550,
  'foundations-rise': 500,
  'buildings-assemble': 650,
  'roads-illuminate': 450,
  'energy-flows': 400,
  'knowledge-streams': 400,
  'civilization-alive': 500,
  'navigation-ready': 350,
};

export function activationPhaseDuration(phase: ActivationPhase): number {
  return PHASE_MS[phase];
}

export function activationTotalDurationMs(): number {
  return ACTIVATION_PHASES.reduce((s, p) => s + PHASE_MS[p], 0);
}

export function activationPhaseLabel(phase: ActivationPhase): string {
  return ACTIVATION_PHASE_LABELS[phase];
}

export function activationProgressForPhase(phase: ActivationPhase): number {
  const idx = ACTIVATION_PHASES.indexOf(phase);
  return Math.round(((idx + 1) / ACTIVATION_PHASES.length) * 100);
}

export function initialActivationState(): MissionControlActivationState {
  return { phase: 'darkening', progress: 0, ready: false };
}

export function nextActivationPhase(current: ActivationPhase): ActivationPhase | null {
  const idx = ACTIVATION_PHASES.indexOf(current);
  if (idx < 0 || idx >= ACTIVATION_PHASES.length - 1) return null;
  return ACTIVATION_PHASES[idx + 1]!;
}

export function activationStateForPhase(phase: ActivationPhase): MissionControlActivationState {
  return {
    phase,
    progress: activationProgressForPhase(phase),
    ready: phase === 'navigation-ready',
  };
}

export function shouldShowNavigation(activation: MissionControlActivationState): boolean {
  return activation.ready;
}
