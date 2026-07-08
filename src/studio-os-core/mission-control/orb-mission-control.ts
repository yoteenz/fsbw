/**
 * Mission Control™ — Orb intelligence core narration.
 */

import type { MissionControlOrbLine } from './types';
import type { ActivationPhase } from './types';
import { activationPhaseLabel } from './activation-sequence';

function uid(): string {
  return `mc-orb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const MISSION_CONTROL_ORB_ROLE = 'Mission Control Intelligence';
export const MISSION_CONTROL_ORB_GREETING =
  'Mission Control™ — stand above a living civilization. I narrate what matters; the world speaks the rest.';
export const MISSION_CONTROL_ORB_ACCENT = '#c9e8ff';

export function buildMissionControlWelcomeLines(): MissionControlOrbLine[] {
  return [
    {
      id: uid(),
      message: 'The World Is The Interface™ — navigation happens by interacting with a living miniature civilization.',
      priority: 'high',
    },
    {
      id: uid(),
      message: 'Watch the world come alive. Then travel deeper — no page transitions, only camera descent.',
      priority: 'medium',
    },
  ];
}

export function buildActivationOrbLine(phase: ActivationPhase): MissionControlOrbLine {
  return {
    id: uid(),
    message: activationPhaseLabel(phase),
    priority: phase === 'navigation-ready' ? 'high' : 'medium',
  };
}

export function buildMissionControlDestinationLines(destinationTitle: string): MissionControlOrbLine[] {
  return [
    {
      id: uid(),
      message: `Highlighting ${destinationTitle} — travel corridors illuminating.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: 'Preview the destination. Choose Walk™, Glass Elevator™, Fast Travel™, Guided Tour™, or Observer Mode™.',
      priority: 'medium',
    },
  ];
}

export function buildMissionControlModeLine(modeLabel: string): MissionControlOrbLine {
  return {
    id: uid(),
    message: `${modeLabel} mode — the hologram transforms; the civilization remains.`,
    priority: 'high',
  };
}
