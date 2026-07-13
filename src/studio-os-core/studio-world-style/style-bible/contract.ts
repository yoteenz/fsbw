export const STUDIO_WORLD_STYLE_BIBLE_VERSION = 'studio-world-style-bible.v1' as const;

export type StyleBibleAuthority = {
  bibleVersion: typeof STUDIO_WORLD_STYLE_BIBLE_VERSION;
  bibleRevision: number;
  authority: 'highest-visual-authority';
  hierarchy: ['Studio World Style Bible', 'Department DNA', 'Company DNA', 'Founder Assets', 'Prompt Compiler', 'Founder Render'];
};

export type WorldLanguageRules = {
  typography: string;
  iconography: string;
  spacing: string;
  panelGeometry: string;
  glassTreatments: string;
  lightingPhilosophy: string;
  transitionLanguage: string;
  motionLanguage: string;
  dockPlacement: string;
  workbenchPlacement: string;
  navigationRhythm: string;
  statusChips: string;
  informationHierarchy: string;
  visualDensity: string;
  interactionLanguage: string;
  extensionRule: 'departments may extend; never contradict';
};

export type TypographyPlaceholderRules = {
  aiNeverRendersText: true;
  placeholderSurfaces: string[];
  reactInjects: string[];
  guarantees: string[];
};

export type PanelSystemSpec = {
  geometry: string;
  cornerRadius: string;
  glassTreatment: string;
  elevationSystem: string;
  shadowLanguage: string;
  borderTreatment: string;
  blurSystem: string;
  paddingScale: string[];
  contentRule: 'different content only — geometry identical';
};

export type LightingPhilosophy = {
  primary: string;
  accent: string;
  glass: string;
  reflection: string;
  luxury: string;
  forbidden: string[];
};

export type MaterialPhilosophy = {
  universalDefaults: string[];
  brandInjectionRule: 'Only Company DNA injects brand materials';
  forbidden: string[];
};

export type MotionLanguage = {
  panelReveals: string;
  cameraEasing: string;
  dockExpansion: string;
  workbenchExpansion: string;
  modalTransitions: string;
  approvalAnimations: string;
  generationProgress: string;
  loadingSequences: string;
  notificationBehavior: string;
  operatingSystemFeel: string;
};

export type NavigationLanguage = {
  components: string[];
  rule: 'only available actions change — architecture stays familiar';
};

export type StudioWorldStyleBible = {
  authority: StyleBibleAuthority;
  worldLanguage: WorldLanguageRules;
  typographyPlaceholders: TypographyPlaceholderRules;
  panelSystem: PanelSystemSpec;
  lightingPhilosophy: LightingPhilosophy;
  materialPhilosophy: MaterialPhilosophy;
  motionLanguage: MotionLanguage;
  navigationLanguage: NavigationLanguage;
};
