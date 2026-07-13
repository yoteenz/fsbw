import { STUDIO_WORLD_STYLE_BIBLE } from '../style-bible/registry';

export const WORKBENCH_SYSTEM_VERSION = 'universal-workbench.v1' as const;

export type WorkbenchToolProfile = 'architectural-tools' | 'asset-tools' | 'commercial-tools' | 'operations-tools' | 'governance-tools';

export type UniversalWorkbenchSpec = {
  systemVersion: typeof WORKBENCH_SYSTEM_VERSION;
  objectId: 'StudioWorldWorkbench';
  integration: 'architectural furniture — built into environment — physically believable';
  material: 'modular glass console — placeholder panel slots — no generated words';
  proportions: {
    desktop: { width: '22%', height: '65%', rightOffset: '3%' };
    tablet: { width: '28%', height: '60%', rightOffset: '2%' };
    mobile: { width: '100%', height: '35%', bottomOffset: '12%' };
  };
  rules: string[];
  forbidden: string[];
  toolProfiles: Record<WorkbenchToolProfile, string>;
  overlayRule: 'same furniture language — different React overlays';
};

export const UNIVERSAL_WORKBENCH: UniversalWorkbenchSpec = {
  systemVersion: WORKBENCH_SYSTEM_VERSION,
  objectId: 'StudioWorldWorkbench',
  integration: 'architectural furniture — built into environment — physically believable',
  material: 'modular glass console — placeholder panel slots — no generated words',
  proportions: {
    desktop: { width: '22%', height: '65%', rightOffset: '3%' },
    tablet: { width: '28%', height: '60%', rightOffset: '2%' },
    mobile: { width: '100%', height: '35%', bottomOffset: '12%' },
  },
  rules: [
    'architectural furniture',
    'built into environment',
    'physically believable',
    'modular reusable',
    'AI renders geometry only',
    'placeholders for panels icons labels',
    'no generated words',
    'no fake UI',
  ],
  forbidden: ['floating tool palette', 'detached sidebar', 'AI-rendered text', 'fake readable menus'],
  toolProfiles: {
    'architectural-tools': 'Experience Lab — Blueprint Author — architectural planning tools overlay',
    'asset-tools': 'Creative Director Studio — asset manufacturing tools overlay',
    'commercial-tools': 'Marketplace — commerce and licensing tools overlay',
    'operations-tools': 'Command Center — operations and workforce tools overlay',
    'governance-tools': 'City Council — municipal governance tools overlay',
  },
  overlayRule: 'same furniture language — different React overlays',
};

export function resolveWorkbenchSpec(profile: WorkbenchToolProfile = 'architectural-tools') {
  return {
    ...UNIVERSAL_WORKBENCH,
    activeProfile: profile,
    toolOverlay: UNIVERSAL_WORKBENCH.toolProfiles[profile],
  };
}

export function buildWorkbenchPromptSection(profile: WorkbenchToolProfile = 'architectural-tools'): string {
  const bench = UNIVERSAL_WORKBENCH;
  return [
    `UNIVERSAL WORKBENCH™: ${bench.systemVersion}`,
    `Integration: ${bench.integration}`,
    `Material: ${bench.material}`,
    `Tool overlay profile: ${bench.toolProfiles[profile]}`,
    `Rules: ${bench.rules.join(' · ')}`,
    `Forbidden: ${bench.forbidden.join(', ')}`,
  ].join('\n');
}

export function mapDepartmentToWorkbenchProfile(departmentId: string): WorkbenchToolProfile {
  if (departmentId === 'experience-lab' || departmentId === 'blueprint-author' || departmentId === 'world-compiler') {
    return 'architectural-tools';
  }
  if (departmentId === 'creative-director-studio' || departmentId.includes('studio') || departmentId === 'material-lab') {
    return 'asset-tools';
  }
  if (departmentId === 'marketplace' || departmentId === 'mod-registry' || departmentId === 'certification-center') {
    return 'commercial-tools';
  }
  if (departmentId === 'city-council' || departmentId === 'permit-center' || departmentId === 'quality-guard') {
    return 'governance-tools';
  }
  return 'operations-tools';
}

export function assertWorkbenchMatchesBible(): boolean {
  return UNIVERSAL_WORKBENCH.rules.includes('no generated words') &&
    STUDIO_WORLD_STYLE_BIBLE.worldLanguage.workbenchPlacement.includes('Workbench');
}
