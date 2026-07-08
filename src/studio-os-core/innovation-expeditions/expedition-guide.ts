/**
 * Innovation Expeditions™ — Orb Expedition Guide (Professor · Historian · Coach).
 */

import type { ExpeditionGuideLine, ExpeditionStop, InnovationExpedition } from './types';

function uid(): string {
  return `exp-guide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const EXPEDITION_GUIDE_ROLE = 'Expedition Guide';
export const EXPEDITION_GUIDE_GREETING =
  'Innovation Expeditions™ — experience business evolution inside Studio World. I walk with you — not documents.';
export const EXPEDITION_GUIDE_ACCENT = '#e8c878';

export function buildExpeditionGuideWelcomeLines(): ExpeditionGuideLine[] {
  return [
    {
      id: uid(),
      message: 'Every expedition tells a story. Every story teaches a principle you can apply to your company.',
      priority: 'high',
    },
    {
      id: uid(),
      message: 'Museum tour + university course + documentary + RPG quest — learning happens by experiencing.',
      priority: 'medium',
    },
    {
      id: uid(),
      message: 'Choose your path: Beginner™, Founder™, Enterprise™, Creative™, Operations™, Strategy™.',
      priority: 'medium',
    },
  ];
}

export function buildExpeditionGuideStopLines(stop: ExpeditionStop): ExpeditionGuideLine[] {
  return [
    {
      id: uid(),
      message: stop.orbPrompt,
      priority: 'high',
    },
    {
      id: uid(),
      message: `Principle: ${stop.principle}`,
      priority: 'high',
    },
    {
      id: uid(),
      message: stop.storyBeat,
      priority: 'medium',
    },
  ];
}

export function buildExpeditionGuideCompleteLines(expedition: InnovationExpedition): ExpeditionGuideLine[] {
  return [
    {
      id: uid(),
      message: `"${expedition.title}" complete — ${expedition.principleSummary}`,
      priority: 'high',
    },
    {
      id: uid(),
      message: 'Rewards unlocked — Knowledge™, Blueprints™, Certificates™, Creative Equity™.',
      priority: 'medium',
    },
  ];
}
