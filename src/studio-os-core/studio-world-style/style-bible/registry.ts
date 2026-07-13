import type { StudioWorldStyleBible } from './contract';
import { STUDIO_WORLD_STYLE_BIBLE_VERSION } from './contract';

export const STYLE_BIBLE_REGISTRY_VERSION = 'style-bible-registry.v1' as const;

export const STUDIO_WORLD_STYLE_BIBLE: StudioWorldStyleBible = {
  authority: {
    bibleVersion: STUDIO_WORLD_STYLE_BIBLE_VERSION,
    bibleRevision: 1,
    authority: 'highest-visual-authority',
    hierarchy: [
      'Studio World Constitution',
      'Studio World Style Bible',
      'Department Bible',
      'Department DNA',
      'Golden Reference Library',
      'Blueprint Author',
      'Construction Plan',
      'Founder Render',
      'Creative Director Studio',
      'Construction Mode',
      'Published Department',
    ],
  },
  worldLanguage: {
    typography: 'React-injected only — AI renders blank acrylic title bars and panel headers',
    iconography: 'placeholder icon sockets — React mounts icons after render',
    spacing: '8px base grid — 4/8/12/16/24/32/48/64 scale',
    panelGeometry: 'unified glass panel — 12px radius, 1px border, elevation-2 shadow',
    glassTreatments: 'premium architectural glass — subtle edge glow, controlled reflection',
    lightingPhilosophy: 'bright white architectural primary + brand accent illumination',
    transitionLanguage: 'ease-out-cubic 240ms standard — ease-in-out 360ms for modals',
    motionLanguage: 'one operating system feel — panel reveals, dock expansion, approval animations',
    dockPlacement: 'bottom-center integrated Command Dock — same proportions every department',
    workbenchPlacement: 'right-rail integrated Workbench — architectural furniture, modular',
    navigationRhythm: 'Top Navigation Rail + Bottom Command Dock + Workbench + Department Identifier',
    statusChips: 'blank acrylic chip housings — React injects status text and color',
    informationHierarchy: 'primary action → context → metadata → diagnostics',
    visualDensity: 'executive luxury — breathable spacing, never cramped corporate UI',
    interactionLanguage: 'spatial computing — furniture-first, UI overlays second',
    extensionRule: 'departments may extend; never contradict',
  },
  typographyPlaceholders: {
    aiNeverRendersText: true,
    placeholderSurfaces: [
      'blank acrylic title bars',
      'blank panel headers',
      'blank chips',
      'blank menu rails',
      'blank tabs',
      'blank workbench labels',
      'blank command dock labels',
      'blank status zones',
      'blank navigation rails',
    ],
    reactInjects: ['fonts', 'icons', 'labels', 'numbers', 'translations', 'status', 'accessibility labels'],
    guarantees: [
      'perfect typography',
      'brand consistency',
      'localization',
      'accessibility',
      'future redesigns without re-render',
    ],
  },
  panelSystem: {
    geometry: 'rounded-rect glass panel — consistent aspect-friendly proportions',
    cornerRadius: '12px',
    glassTreatment: 'frosted architectural glass — 24px blur, 8% white tint',
    elevationSystem: 'elevation-0 floor · elevation-1 dock/workbench · elevation-2 panels · elevation-3 modals',
    shadowLanguage: 'soft architectural shadow — 0 8px 32px rgba(0,0,0,0.12)',
    borderTreatment: '1px rgba(255,255,255,0.18) inner glow border',
    blurSystem: 'backdrop-blur 24px standard · 40px for modals',
    paddingScale: ['4px', '8px', '12px', '16px', '24px', '32px'],
    contentRule: 'different content only — geometry identical',
  },
  lightingPhilosophy: {
    primary: 'bright white architectural light — 4200-5000K executive illumination',
    accent: 'brand-colored illumination — founder red accent slots via Company DNA',
    glass: 'subtle edge glow on architectural glass and OLED bezels',
    reflection: 'controlled — premium editorial, never mirror chaos',
    luxury: 'premium cinematic — soft bounce, architectural shadows',
    forbidden: ['yellow offices', 'flat corporate lighting', 'random HDRI', 'inconsistent brightness'],
  },
  materialPhilosophy: {
    universalDefaults: [
      'glass',
      'acrylic',
      'chrome',
      'premium stone',
      'founder-marble slots',
      'OLED',
      'transparent displays',
    ],
    brandInjectionRule: 'Only Company DNA injects brand materials',
    forbidden: ['generic random marble', 'unapproved material substitutes', 'tenant-specific branding in canonical departments'],
  },
  motionLanguage: {
    panelReveals: 'slide-up fade 240ms ease-out-cubic',
    cameraEasing: 'cinematic ease-in-out 600ms for room transitions',
    dockExpansion: 'vertical expand 280ms ease-out-cubic',
    workbenchExpansion: 'horizontal slide 280ms ease-out-cubic',
    modalTransitions: 'scale 0.96→1 + fade 360ms ease-in-out',
    approvalAnimations: 'pulse glow 400ms on approve confirmation',
    generationProgress: 'ambient shimmer on viewport bezel during NBP generation',
    loadingSequences: 'skeleton glass panels — never spinner-only',
    notificationBehavior: 'toast slide from status bar 240ms',
    operatingSystemFeel: 'every department feels like one Studio World operating system',
  },
  navigationLanguage: {
    components: [
      'Top Navigation Rail™',
      'Bottom Command Dock™',
      'Workbench™',
      'Department Identifier™',
      'Breadcrumb™',
      'World Location™',
      'Founder Identity™',
      'Department Status™',
    ],
    rule: 'only available actions change — architecture stays familiar',
  },
};

export function resolveStyleBible(): StudioWorldStyleBible {
  return STUDIO_WORLD_STYLE_BIBLE;
}

export function buildStyleBiblePromptSection(): string {
  const bible = STUDIO_WORLD_STYLE_BIBLE;
  return [
    `STUDIO WORLD STYLE BIBLE™: ${bible.authority.bibleVersion} r${bible.authority.bibleRevision}`,
    `WORLD LANGUAGE: ${bible.worldLanguage.glassTreatments}. ${bible.worldLanguage.lightingPhilosophy}. ${bible.worldLanguage.interactionLanguage}.`,
    `TYPOGRAPHY: AI NEVER renders text. Render ${bible.typographyPlaceholders.placeholderSurfaces.slice(0, 4).join(', ')} only. React injects all labels.`,
    `PANEL SYSTEM: ${bible.panelSystem.geometry}. Radius ${bible.panelSystem.cornerRadius}. ${bible.panelSystem.glassTreatment}.`,
    `LIGHTING PHILOSOPHY: Primary ${bible.lightingPhilosophy.primary}. Accent ${bible.lightingPhilosophy.accent}. Forbidden: ${bible.lightingPhilosophy.forbidden.join(', ')}.`,
    `MATERIAL PHILOSOPHY: ${bible.materialPhilosophy.universalDefaults.join(', ')}. ${bible.materialPhilosophy.brandInjectionRule}.`,
    `MOTION: ${bible.motionLanguage.operatingSystemFeel}.`,
    `NAVIGATION: ${bible.navigationLanguage.components.slice(0, 4).join(' · ')}.`,
  ].join('\n');
}
