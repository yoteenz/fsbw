import { DESIGN_DNA_PERSONALITIES } from './constants';
import type {
  CreativeDirectorCritique,
  DesignHealthCategory,
  ExperienceStudioSession,
  ResolvedCanvasTokens,
} from './types';

function dominantDnaId(session: ExperienceStudioSession): string {
  let best = 'luxury';
  let max = 0;
  for (const [id, pct] of Object.entries(session.designDna)) {
    if (pct > max) {
      max = pct;
      best = id;
    }
  }
  return best;
}

function accentForPersonality(id: string): string {
  return DESIGN_DNA_PERSONALITIES.find((p) => p.id === id)?.accent ?? '#EB1C24';
}

export function resolveCanvasTokens(session: ExperienceStudioSession): ResolvedCanvasTokens {
  const dominant = dominantDnaId(session);
  const dna = session.experienceDna;
  const luxuryWeight = (session.designDna.luxury ?? 0) / 100;
  const editorialWeight = (session.designDna.editorial ?? 0) / 100;
  const minimalWeight = (session.designDna.minimal ?? 0) / 100;

  return {
    headlineSize: 22 + editorialWeight * 6 - minimalWeight * 4,
    bodySize: 9 + luxuryWeight * 1.5 - minimalWeight * 0.5,
    letterSpacing: `${0.08 + editorialWeight * 0.06}em`,
    borderRadius: 8 + (session.designDna.glass ?? 0) * 0.08 + minimalWeight * 4,
    heroPadding: 28 + (100 - dna.density) * 0.35,
    accentHex: accentForPersonality(dominant),
    backgroundTone: dna.lighting > 60 ? 'rgba(255,255,255,0.92)' : 'rgba(248,248,250,0.88)',
    motionClass: dna.animation > 55 ? 'es-motion-expressive' : 'es-motion-calm',
    glassOpacity: Math.min(0.95, 0.55 + dna.glass / 200),
    headlineFont: editorialWeight > 0.35 ? '"Covered By Your Grace", sans-serif' : '"Futura PT Medium", sans-serif',
  };
}

export function resolveCreativeDirectorCritiques(session: ExperienceStudioSession): CreativeDirectorCritique[] {
  const critiques: CreativeDirectorCritique[] = [];
  const tokens = resolveCanvasTokens(session);
  const dna = session.experienceDna;

  if (dna.density > 58) {
    critiques.push({
      id: 'density',
      message: 'The spacing on mobile feels crowded.',
      why: 'Content density is above your Luxury DNA™ threshold — visitors need breathing room to feel premium.',
      severity: 'attention',
    });
  }

  if ((session.designDna.luxury ?? 0) > 50 && dna.animation > 62) {
    critiques.push({
      id: 'motion-dna',
      message: 'Motion intensity competes with your Luxury DNA™.',
      why: 'Luxury experiences reward slow confidence. Reduce animation intensity or shift toward Editorial™.',
      severity: 'note',
    });
  }

  if (session.experienceType === 'store' && dna.density > 45) {
    critiques.push({
      id: 'checkout',
      message: 'Your checkout experience introduces unnecessary friction.',
      why: 'Commerce with hospitality needs fewer decisions per screen — one primary action per viewport.',
      severity: 'attention',
    });
  }

  critiques.push({
    id: 'hero-cta',
    message: 'This hero section competes with your call-to-action.',
    why: 'Two elements share visual priority. Studio Intelligence recommends elevating one decisive action.',
    severity: 'note',
  });

  if (session.styleChoice && session.feelingChoice && session.styleChoice !== session.feelingChoice) {
    critiques.push({
      id: 'typography',
      message: `This typography no longer reflects your ${session.styleChoice} direction.`,
      why: `You asked visitors to feel ${session.feelingChoice} — headline scale (${Math.round(tokens.headlineSize)}px) should align with that emotional contract.`,
      severity: 'note',
    });
  }

  return critiques.slice(0, 4);
}

export function resolveDesignHealth(session: ExperienceStudioSession): DesignHealthCategory[] {
  const dna = session.experienceDna;
  const luxury = session.designDna.luxury ?? 0;
  const editorial = session.designDna.editorial ?? 0;

  const base = 72 + luxury * 0.12 + editorial * 0.08;

  return [
    { id: 'hierarchy', label: 'Visual Hierarchy', score: Math.round(base + (100 - dna.density) * 0.08), note: 'Hero → narrative → action' },
    { id: 'brand', label: 'Brand Consistency', score: Math.round(base + luxury * 0.06), note: 'Design DNA alignment' },
    { id: 'a11y', label: 'Accessibility', score: Math.round(68 + dna.density * -0.05 + dna.glass * 0.04), note: 'Contrast · touch targets' },
    { id: 'perf', label: 'Performance', score: Math.round(74 + dna.glass * -0.06 + dna.animation * -0.04), note: 'Glass · motion budget' },
    { id: 'conversion', label: 'Conversion', score: Math.round(70 + (100 - dna.density) * 0.1), note: 'Clarity of next step' },
    { id: 'motion', label: 'Motion', score: Math.round(65 + dna.motion * 0.2), note: 'Calm · intentional' },
    { id: 'type', label: 'Typography', score: Math.round(base), note: 'Editorial rhythm' },
    { id: 'spacing', label: 'Spacing', score: Math.round(68 + (100 - dna.density) * 0.15), note: 'Whitespace as luxury' },
    { id: 'color', label: 'Color Harmony', score: Math.round(75 + luxury * 0.05), note: 'Accent relationships' },
    { id: 'nav', label: 'Navigation', score: Math.round(71 + dna.navigation * 0.12), note: 'Wayfinding clarity' },
    { id: 'content', label: 'Content Density', score: Math.round(80 - dna.density * 0.25), note: 'Breathing room' },
  ];
}

export function overallDesignHealthScore(categories: DesignHealthCategory[]): number {
  if (!categories.length) return 0;
  return Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
}

export function experienceTypeLabel(type: ExperienceStudioSession['experienceType']): string {
  if (!type) return 'Experience';
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function orbWelcomeLine(session: ExperienceStudioSession, founderName = 'Founder'): string {
  if (session.phase === 'entry') {
    return `Welcome back, ${founderName}.\n\nWhat would you like to create today?`;
  }
  if (session.phase === 'interview') {
    if (session.interviewStep === 'style') return 'What experience are you trying to create?';
    if (session.interviewStep === 'audience') return 'Who is this for?';
    return 'How should visitors feel?';
  }
  return 'Your experience is taking shape. I am watching rhythm, hierarchy, and emotional intent.';
}
