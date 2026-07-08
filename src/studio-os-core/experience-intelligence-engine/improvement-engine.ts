import type { ExperienceImprovement, ExperienceIssue } from './types';

function uid(): string {
  return `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const IMPROVEMENT_MAP: Record<
  ExperienceIssue['category'],
  { category: ExperienceImprovement['category']; template: string }[]
> = {
  'flat-experience': [
    { category: 'atmosphere', template: 'Add atmospheric systems layer — particles, haze, depth haze at thresholds.' },
    { category: 'landmark', template: 'Install a signature hero landmark at room center — orient curiosity immediately.' },
    { category: 'lighting', template: 'Upgrade to cinematic rim lighting with warm key + cool fill contrast.' },
  ],
  'empty-space': [
    { category: 'props', template: 'Populate mid-ground with interactive props — avoid sterile void.' },
    { category: 'storytelling', template: 'Add environmental storytelling vignettes along walk path.' },
  ],
  'generic-template': [
    { category: 'storytelling', template: 'Inject workspace-specific material language from Company Genome™.' },
    { category: 'delight', template: 'Add one founder-only micro surprise — handwriting accent, not UI badge.' },
  ],
  'static-lifeless': [
    { category: 'animation', template: 'Layer ambient motion — idle life, orb pulse, distant activity.' },
    { category: 'sound', template: 'Introduce spatial ambient score shift on zone entry.' },
  ],
  'ui-heavy': [
    { category: 'micro-interaction', template: 'Replace panels with diegetic wall projections and tactile hotspots.' },
    { category: 'pacing', template: 'Reduce visible chrome — one focal interaction per viewport.' },
  ],
  'text-heavy': [
    { category: 'storytelling', template: 'Convert copy blocks to environmental inscriptions and voice concierge lines.' },
  ],
  'no-discovery': [
    { category: 'discovery', template: 'Hide a collectible or memory behind optional exploration path.' },
    { category: 'props', template: 'Add one reward-for-curiosity hotspot without signposting.' },
  ],
  'no-movement': [
    { category: 'transition', template: 'Implement camera track between wings — never navigate() to new page.' },
    { category: 'camera', template: 'Improve arrival framing — threshold → reveal → atrium dolly.' },
  ],
  'no-atmosphere': [
    { category: 'atmosphere', template: 'Stack atmospheric + ambient-motion Scene Stack layers.' },
  ],
  'no-landmark': [
    { category: 'landmark', template: 'Place Organization Pulse Core™-scale sculpture as spatial anchor.' },
  ],
  'weak-emotional-payoff': [
    { category: 'delight', template: 'Design arrival payoff moment — light bloom, sound swell, concierge greeting.' },
    { category: 'atmosphere', template: 'Align emotional atmosphere with Living Headquarters™ preferences.' },
  ],
  'flow-friction': [
    { category: 'arrival', template: 'Extend Threshold sequence — teach the room before exposing controls.' },
    { category: 'transition', template: 'Soften wing boundaries with corridor architecture.' },
  ],
};

export function generateExperienceImprovements(issues: ExperienceIssue[]): ExperienceImprovement[] {
  const improvements: ExperienceImprovement[] = [];

  for (const issue of issues.slice(0, 40)) {
    const templates = IMPROVEMENT_MAP[issue.category] ?? IMPROVEMENT_MAP['flat-experience'];
    for (const t of templates) {
      improvements.push({
        id: uid(),
        issueId: issue.id,
        problem: issue.problem,
        recommendation: t.template,
        category: t.category,
        affectedDestinations: issue.affectedDestinations,
        estimatedImpact: issue.severity === 'critical' ? 'high' : issue.severity === 'major' ? 'medium' : 'low',
      });
    }
  }

  return improvements;
}
