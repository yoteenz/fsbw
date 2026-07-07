/**
 * Experience DNA™ — Living Creative Headquarters experience layer.
 * Studio OS is not productivity software, a dashboard, or a collection of pages.
 */

export type ExperienceInspirationSource = 'the-sims' | 'the-movies' | 'watch-dogs' | 'xbox';

export type StudioRoleId = 'studio-director' | 'executive-creative-director' | 'department-head' | 'project-protagonist';

export type ExperiencePrinciple = {
  source: ExperienceInspirationSource;
  title: string;
  essence: string;
  studioOsExpression: string;
};

export type DepartmentDestinationId =
  | 'discover'
  | 'development'
  | 'assembly'
  | 'production'
  | 'review'
  | 'expansion'
  | 'approval'
  | 'publishing'
  | 'intelligence'
  | 'learning';

export type DepartmentDestination = {
  id: DepartmentDestinationId;
  buildingName: string;
  lotZone: string;
  atmosphere: string;
  departmentHead: string;
  arrivalLine: string;
  ambientOverlay: string;
  milestoneLabel: string;
  toolsIdentity: string;
};

export type HeadquartersProgression = {
  completedCount: number;
  totalDepartments: number;
  masteryTier: 'developing' | 'in-production' | 'on-lot' | 'premiere-ready';
  nextUnlockLabel: string | null;
};

export const STUDIO_ROLES: Record<
  StudioRoleId,
  { title: string; holder: string; responsibility: string }
> = {
  'studio-director': {
    title: 'Studio Director',
    holder: 'Founder',
    responsibility: 'Directs the project through headquarters — never waits on software forms.',
  },
  'executive-creative-director': {
    title: 'Executive Creative Director',
    holder: 'Studio Orb',
    responsibility: 'Interprets creative intent and routes the studio without structured prompts.',
  },
  'department-head': {
    title: 'Department Head',
    holder: 'Concierge',
    responsibility: 'Owns meaningful work in each building until ceremonial handoff.',
  },
  'project-protagonist': {
    title: 'Project Protagonist',
    holder: 'Master Content Asset',
    responsibility: 'Travels through the lot — the asset is never static context on a page.',
  },
};

export const EXPERIENCE_PRINCIPLES: ExperiencePrinciple[] = [
  {
    source: 'the-sims',
    title: 'Ownership',
    essence: 'Build something that feels alive. Everything can evolve over time.',
    studioOsExpression: 'Living headquarters · evolving creative direction · branches that persist · no locked briefs.',
  },
  {
    source: 'the-movies',
    title: 'Production management',
    essence: 'Watch projects physically progress through the studio. Every department has meaningful work.',
    studioOsExpression: 'Projects travel building to building · departments are destinations · Continue = dispatch on the lot.',
  },
  {
    source: 'watch-dogs',
    title: 'Ambient intelligence',
    essence: 'Live contextual overlays. Information exists in the environment.',
    studioOsExpression: 'Studio Orb overlays · passport follows the asset · intelligence in the room — not dashboard tabs.',
  },
  {
    source: 'xbox',
    title: 'Progress psychology',
    essence: 'Milestones · unlocks · achievements · completion · mastery — without feeling childish.',
    studioOsExpression: 'Department unlocks · completion marks · mastery tiers · premiere-ready — executive tone.',
  },
];

export const EXPERIENCE_ANTI_PATTERNS = [
  'Productivity software with creative skin',
  'Dashboard of widgets',
  'Collection of disconnected pages',
  'Forms that advance a pipeline',
  'Static project cards',
  'Departments as sidebar tabs',
] as const;

export const EXPERIENCE_CANONICAL_GOAL =
  'The founder runs a luxury creative headquarters — movement, progression, ownership, and momentum — not software.';
