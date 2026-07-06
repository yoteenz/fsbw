import { SIMULATION_PERSONA_LABELS, SIMULATION_PERSONAS } from './constants';
import { PAGE_SEEDS } from './audit-engine';
import type { ExperiencePageReport, PersonaSimulationResult, SimulationPersona } from './types';

const PERSONA_MODIFIERS: Record<
  SimulationPersona,
  { friction: number; confidence: number; note: string }
> = {
  'first-time-user': { friction: -12, confidence: -10, note: 'Unfamiliar with Studio OS navigation patterns' },
  'returning-user': { friction: 4, confidence: 6, note: 'Knows core navigation · expects consistency' },
  'power-user': { friction: 8, confidence: 4, note: 'High expectations for speed and density tolerance' },
  executive: { friction: -8, confidence: -6, note: 'Zero tolerance for cognitive load and decision fatigue' },
  employee: { friction: -4, confidence: -2, note: 'Needs clear task paths without executive jargon' },
  customer: { friction: -10, confidence: -8, note: 'External user · must feel premium and trustworthy immediately' },
  expert: { friction: 6, confidence: 2, note: 'Domain expert · sensitive to inaccurate or vague guidance' },
  'mobile-user': { friction: -14, confidence: -12, note: 'Reduced viewport · touch targets and scroll burden critical' },
  'desktop-user': { friction: 2, confidence: 2, note: 'Full viewport · expects architectural layout breathing room' },
  'accessibility-user': { friction: -16, confidence: -14, note: 'Screen reader and keyboard navigation must be flawless' },
};

export function buildPersonaSimulations(
  pageReports: ExperiencePageReport[]
): PersonaSimulationResult[] {
  const simulations: PersonaSimulationResult[] = [];
  const pages = pageReports.length > 0 ? pageReports : PAGE_SEEDS.map((p) => ({
    pageId: p.pageId,
    pageLabel: p.pageLabel,
    experienceScore: 78,
    clarityScore: 80,
  }));

  for (const page of pages.slice(0, 6)) {
    for (const persona of SIMULATION_PERSONAS) {
      const mod = PERSONA_MODIFIERS[persona];
      const base = 'experienceScore' in page ? page.experienceScore : 78;
      const experienceScore = Math.max(35, Math.min(99, base + mod.confidence + Math.round(mod.friction / 2)));
      const frictionScore = Math.max(20, Math.min(95, 100 - base + Math.abs(mod.friction)));
      const confidenceScore = Math.max(30, Math.min(99, base + mod.confidence));
      const passed = experienceScore >= 78 && confidenceScore >= 75 && frictionScore <= 35;

      simulations.push({
        id: `sim-${persona}-${page.pageId}`,
        persona,
        personaLabel: SIMULATION_PERSONA_LABELS[persona],
        pageId: page.pageId,
        pageLabel: page.pageLabel,
        experienceScore,
        frictionScore,
        confidenceScore,
        summary: `${SIMULATION_PERSONA_LABELS[persona]} on ${page.pageLabel}: ${mod.note}. ${passed ? 'Experience feels effortless and trustworthy.' : 'Friction or confidence gaps detected.'}`,
        passed,
      });
    }
  }

  return simulations;
}

export function getFailedSimulations(simulations: PersonaSimulationResult[]): PersonaSimulationResult[] {
  return simulations.filter((s) => !s.passed);
}

export function getSimulationsForPage(simulations: PersonaSimulationResult[], pageId: string): PersonaSimulationResult[] {
  return simulations.filter((s) => s.pageId === pageId);
}

export function getSimulationsForPersona(simulations: PersonaSimulationResult[], persona: SimulationPersona): PersonaSimulationResult[] {
  return simulations.filter((s) => s.persona === persona);
}
