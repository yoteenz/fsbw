import type { ExperienceProfile } from './types';

/**
 * Experience Profile Registry™ — departments declare metadata only.
 * New Discovery Packs™, professions, and expansions register here.
 */
export const STUDIO_WORLD_EXPERIENCE_PROFILES: ExperienceProfile[] = [
  {
    departmentId: 'creative-direction',
    displayName: 'Creative Direction Studio™',
    primaryStory: "We're creating.",
    primaryQuestion: 'What are we building?',
    primaryOrbMode: 'creative',
    defaultPresenceLevel: 0,
    ambientInformation: ['Creative Queue', 'Current Project'],
    contextModules: ['Story Table™', 'Mood Wall™', 'Warehouse™', 'Timeline™'],
    deepSystems: ['Knowledge Graph™', 'Scene Graph™', 'Budget™', 'Dependencies™'],
    sceneModules: ['arrival', 'story-table', 'mood-wall', 'founder-notes', 'pipeline-board', 'reference-library'],
    narrativeElementId: 'cds-story-table',
  },
  {
    departmentId: 'studio-warehouse',
    displayName: 'Studio Archives™',
    primaryStory: 'What already exists endures here.',
    primaryQuestion: 'What already exists?',
    primaryOrbMode: 'archival',
    defaultPresenceLevel: 0,
    ambientInformation: ['Current District', 'Active Asset'],
    contextModules: ['Warehouse Wing™', 'Material Library™', 'Asset Shelf™'],
    deepSystems: ['Scene Recipe™', 'Blueprint Lineage™', 'World Graph™', 'Production Queue™'],
    narrativeElementId: 'warehouse-asset-inspection',
  },
  {
    departmentId: 'studio-command-center',
    displayName: 'Command Center™',
    primaryStory: 'Executive attention flows from clarity.',
    primaryQuestion: 'What requires executive attention?',
    primaryOrbMode: 'executive',
    defaultPresenceLevel: 0,
    ambientInformation: ['Priority Signal', 'Council Brief'],
    contextModules: ['Executive District™', 'Operations Wing™', 'Finance Command™'],
    deepSystems: ['Performance Observatory™', 'World Graph™', 'Timeline™'],
    narrativeElementId: 'command-deck',
  },
  {
    departmentId: 'world-atlas',
    displayName: 'Mission Control™',
    primaryStory: 'Stand above a living civilization.',
    primaryQuestion: 'Where does the world want you?',
    primaryOrbMode: 'navigation',
    defaultPresenceLevel: 0,
    ambientInformation: ['World Health™', 'Civilization Pulse'],
    contextModules: ['Atlas Table™', 'Constellation™', 'Continuous Scale™'],
    deepSystems: ['World Graph™', 'Atlas Subsystem™', 'Fog of Discovery™'],
    narrativeElementId: 'atlas-holographic-table',
  },
  {
    departmentId: 'knowledge-core',
    displayName: 'Knowledge Core Observatory™',
    primaryStory: 'The civilization remembers.',
    primaryQuestion: 'What does Studio World know?',
    primaryOrbMode: 'knowledge',
    defaultPresenceLevel: 0,
    ambientInformation: ['Canon Count', 'Active Domain'],
    contextModules: ['Domain Shelves™', 'Memory Monument™', 'Archivist Ticker™'],
    deepSystems: ['Knowledge Graph™', 'World Graph™', 'Prompt Memory™', 'Version Lineage™'],
    narrativeElementId: 'knowledge-core-observatory',
  },
  {
    departmentId: 'world-knowledge-engine',
    displayName: 'Knowledge Library™',
    primaryStory: 'Understanding compounds.',
    primaryQuestion: 'What can I learn?',
    primaryOrbMode: 'knowledge',
    defaultPresenceLevel: 0,
    ambientInformation: ['Reading Path', 'Active Canon'],
    contextModules: ['Historical Layer™', 'Knowledge Review™'],
    deepSystems: ['Knowledge Graph™', 'Canon Registry™'],
    narrativeElementId: 'knowledge-library',
  },
  {
    departmentId: 'marketplace',
    displayName: 'Marketplace Pavilion™',
    primaryStory: 'Value travels when work is shared.',
    primaryQuestion: 'What can I publish?',
    primaryOrbMode: 'marketplace',
    defaultPresenceLevel: 0,
    ambientInformation: ['Publish Queue', 'Revenue Signal'],
    contextModules: ['Licensing Hall™', 'Import Pavilion™'],
    deepSystems: ['Blueprint Lineage™', 'Budget Analysis™'],
    narrativeElementId: 'marketplace-pavilion',
  },
  {
    departmentId: 'museum-wing',
    displayName: 'Museum Wing™',
    primaryStory: 'Legacy is lived, not archived.',
    primaryQuestion: 'What happened?',
    primaryOrbMode: 'museum',
    defaultPresenceLevel: 0,
    ambientInformation: ['Featured Exhibit', 'Historian Insight'],
    contextModules: ['Legacy Hall™', 'Time Machine™', 'Memory Sphere™'],
    deepSystems: ['Innovation Lineage™', 'Timeline™'],
    narrativeElementId: 'museum-legacy-hall',
  },
];

export const DEFAULT_EXPERIENCE_PROFILE: ExperienceProfile = {
  departmentId: 'studio-world',
  displayName: 'Studio World™',
  primaryStory: 'Enter a place; discover intelligence beneath.',
  primaryQuestion: 'Where am I, and what can I do here?',
  primaryOrbMode: 'neutral',
  defaultPresenceLevel: 0,
  ambientInformation: ['Current District'],
  contextModules: ['Navigation™', 'Scene Tray™'],
  deepSystems: ['World Graph™', 'Knowledge™'],
};

export function getExperienceProfile(departmentId: string): ExperienceProfile {
  return (
    STUDIO_WORLD_EXPERIENCE_PROFILES.find((p) => p.departmentId === departmentId) ??
    DEFAULT_EXPERIENCE_PROFILE
  );
}

export function registerExperienceProfile(profile: ExperienceProfile): void {
  const idx = STUDIO_WORLD_EXPERIENCE_PROFILES.findIndex((p) => p.departmentId === profile.departmentId);
  if (idx >= 0) STUDIO_WORLD_EXPERIENCE_PROFILES[idx] = profile;
  else STUDIO_WORLD_EXPERIENCE_PROFILES.push(profile);
}
