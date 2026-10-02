/** Resident Workspace — information architecture (not final public UI). */
export const RESIDENT_WORKSPACE_SECTIONS = [
  'OVERVIEW',
  'NOW',
  'DAY',
  'LIVE',
  'MIND',
  'SOCIAL',
  'WORK',
  'LIFE',
  'HOME',
  'MEMORY',
  'DOCUMENTARY',
  'CAREER',
  'DEVELOPMENT',
  'RELATIONSHIPS',
  'POSSESSIONS',
  'COMMUNICATION',
  'DECISION_HISTORY',
  'INTERVENTIONS',
  'HISTORY',
] as const;

export type ResidentWorkspaceSection = (typeof RESIDENT_WORKSPACE_SECTIONS)[number];

export type ResidentWorkspaceSectionContract = {
  section: ResidentWorkspaceSection;
  dataKeys: string[];
  description: string;
};

export const RESIDENT_WORKSPACE_CONTRACT: ResidentWorkspaceSectionContract[] = [
  { section: 'OVERVIEW', dataKeys: ['identity', 'career', 'current.presence'], description: 'Cinematic dossier entry' },
  { section: 'NOW', dataKeys: ['current', 'workNow', 'needs'], description: 'Live operational window' },
  { section: 'WORK', dataKeys: ['workNow', 'career', 'autonomy'], description: 'Work command center' },
  { section: 'MIND', dataKeys: ['needs', 'goals', 'decisionWeights'], description: 'Psychological map' },
  { section: 'SOCIAL', dataKeys: ['relationships', 'rumors', 'beliefs'], description: 'Social graph + belief fragments' },
  { section: 'MEMORY', dataKeys: ['memories'], description: 'Life archive slices' },
  { section: 'DOCUMENTARY', dataKeys: ['documentaryProfile'], description: 'Camera layer (observes simulation)' },
  { section: 'INTERVENTIONS', dataKeys: ['interventions'], description: 'Founder director audit trail' },
  { section: 'CAREER', dataKeys: ['career', 'employmentEvents'], description: 'Career record' },
];
