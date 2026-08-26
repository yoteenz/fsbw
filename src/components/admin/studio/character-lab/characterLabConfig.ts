/** Character Lab — shared family shell authority for P0.VR.3L / P0.VR.3L.1 derivation. */

export const CHARACTER_LAB_BASE_PATH = '/admin/studio/character-lab';

export const CHARACTER_LAB_EXPERIENCE_PAGE_ID = 'studio-world:xp:character-lab';
export const CHARACTER_LAB_SECTION_ID = 'studio-world:section:character-lab';
export const CHARACTER_LAB_DESIGN_FAMILY_ID = 'studio-world:dfamily:character-lab';
export const CHARACTER_LAB_SHARED_SHELL_ID = 'studio-world:shell:character-lab-workspace';

export const VOICE_LAB_TARGET_ID = 'studio-world:missing:character-lab:voice-lab';
export const VOICE_LAB_ROUTE = `${CHARACTER_LAB_BASE_PATH}/voice-lab`;

/** Shell geometry baseline — used by family fidelity QA. */
export const CHARACTER_LAB_SHELL_GEOMETRY = {
  headerHeight: 48,
  tabRailHeight: 36,
  tabRailWidth: '100%',
  panelPadding: 12,
  columnGap: 12,
  borderRadius: 0,
} as const;

export type CharacterLabTabId = 'character' | 'visual' | 'wardrobe' | 'voice-lab';

export type CharacterLabTabDefinition = {
  id: CharacterLabTabId;
  label: string;
  route: string;
  /** Best sibling rank for Voice Lab derivation (lower = closer). */
  siblingRank: number;
  isDerivedTarget?: boolean;
};

export const CHARACTER_LAB_TABS: CharacterLabTabDefinition[] = [
  { id: 'character', label: 'CHARACTER', route: `${CHARACTER_LAB_BASE_PATH}/character`, siblingRank: 2 },
  { id: 'visual', label: 'VISUAL', route: `${CHARACTER_LAB_BASE_PATH}/visual`, siblingRank: 1 },
  { id: 'wardrobe', label: 'WARDROBE', route: `${CHARACTER_LAB_BASE_PATH}/wardrobe`, siblingRank: 3 },
  {
    id: 'voice-lab',
    label: 'VOICE LAB',
    route: VOICE_LAB_ROUTE,
    siblingRank: 99,
    isDerivedTarget: true,
  },
];

export const CHARACTER_LAB_SHARED_COMPONENT_PATHS = [
  'src/components/admin/studio/character-lab/CharacterLabShell.tsx',
  'src/components/admin/studio/character-lab/CharacterLabTabs.tsx',
  'src/components/admin/studio/character-lab/CharacterLabPanel.tsx',
  'src/components/admin/studio/character-lab/CharacterLabTabContent.tsx',
] as const;

/** Default source sibling for Voice Lab when scores tie — Visual tab (same panel architecture). */
export const VOICE_LAB_DEFAULT_SOURCE_SIBLING_ID = 'studio-world:character-lab:visual';
