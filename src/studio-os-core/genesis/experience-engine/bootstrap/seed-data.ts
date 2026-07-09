import { XEE_SUBSYSTEM_VERSION } from '../constants';
import type {
  XeeBrandDna,
  XeeComponentDna,
  XeeDepartmentDna,
  XeeInteractionDna,
  XeeMotionDna,
  XeeSceneDna,
} from '../types';

function brand(
  brandId: string,
  officialName: string,
  partial: Omit<XeeBrandDna, 'brandId' | 'officialName'>
): XeeBrandDna {
  return { brandId, officialName, ...partial };
}

export const SEED_BRAND_DNA: XeeBrandDna[] = [
  brand('studio-os', 'Studio OS™', {
    identity: {
      philosophy: 'Preserve expertise. Build legacy. Empower visionaries.',
      visualPersonality: ['architectural', 'executive', 'crystalline', 'institutional'],
      emotionalPersonality: ['calm', 'intelligent', 'permanent', 'protective'],
      executivePersonality: ['ceremonial', 'strategic', 'precise'],
      environmentalStorytelling: 'Executive headquarters — living institution and legacy archive.',
    },
    colorSystem: {
      primary: '#EB1C24',
      secondary: '#1A1A1A',
      accent: '#C9A962',
      background: '#F8F6F3',
      textPrimary: '#1A1A1A',
      textSecondary: '#808080',
      semanticInfo: '#2563EB',
      semanticSuccess: '#16A34A',
      semanticWarning: '#D97706',
      semanticRisk: '#DC2626',
    },
    typography: {
      displayFont: '"Covered By Your Grace", sans-serif',
      labelFont: '"Futura PT Medium", sans-serif',
      bodyFont: '"Futura PT Book", sans-serif',
      displaySize: '18px',
      labelSize: '10px',
      bodySize: '14px',
      labelTransform: 'uppercase',
    },
    glassStyle: {
      panelBackground: 'rgba(255,255,255,0.55)',
      panelStrong: 'rgba(255,255,255,0.85)',
      backdropBlur: '12px',
      border: '1.3px solid rgba(0,0,0,0.12)',
      tintRule: 'clear white + department edge',
    },
    lighting: {
      ambientGradient: 'linear-gradient(165deg, #f8f6f3 0%, #efeae4 40%, #faf8f5 100%)',
      horizonGlow: 'linear-gradient(90deg, transparent, #EB1C2422)',
      keyLight: 'warm marble daylight',
      departmentWash: 'radial-gradient(ellipse at top, var(--xee-dept-primary)18, transparent 70%)',
    },
    motion: {
      philosophy: 'Calm executive reveal — motion communicates state, never decoration.',
      entrance: 'fade + scale 0.98→1',
      exit: 'fade 250ms',
      hover: 'translateY(-1px)',
      timingMs: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    materials: ['marble', 'glass', 'crystal', 'chrome', 'manuscript paper'],
    particles: 'crystal dust restrained',
    icons: { treatment: 'department-bound silhouette', style: 'line-symbol' },
    writingVoice: {
      tone: 'concise executive clarity',
      cadence: 'measured, institutional',
      sampleGreeting: 'Welcome to Headquarters. Your operating civilization awaits.',
    },
    orbOverrides: {
      variant: 'executive crystal',
      personality: 'Chief of Staff — living crystal intelligence',
      glowColor: '#C9A962',
      recommendationTone: 'strategic, calm, evidence-backed',
    },
    navigationStyle: {
      tone: 'executive rail — spatial movement',
      activeIndicator: 'decisive red underline + gold approval edge',
      breadcrumbStyle: 'ADMIN > STUDIO > DEPARTMENT',
    },
    experienceRules: [
      'No SaaS dashboard regression',
      'Orb persistent bottom-right',
      'Department color visible before body text',
      'One primary action per viewport',
    ],
  }),
  brand('frontal-slayer', 'Frontal Slayer™', {
    identity: {
      philosophy: 'Luxury hair concierge meets digital mansion.',
      visualPersonality: ['editorial beauty', 'mansion luxury', 'red-carpet polish'],
      emotionalPersonality: ['cared for', 'glamorous', 'confident', 'personally known'],
      executivePersonality: ['founder-led concierge authority'],
      environmentalStorytelling: 'Every page is a room in a luxury beauty headquarters.',
    },
    colorSystem: {
      primary: '#EB1C24',
      secondary: '#1A1A1A',
      accent: '#F5E6D3',
      background: '#FFFBF7',
      textPrimary: '#1A1A1A',
      textSecondary: '#6B6B6B',
      semanticInfo: '#2563EB',
      semanticSuccess: '#16A34A',
      semanticWarning: '#D97706',
      semanticRisk: '#DC2626',
    },
    typography: {
      displayFont: '"Covered By Your Grace", sans-serif',
      labelFont: '"Futura PT Medium", sans-serif',
      bodyFont: '"Futura PT Book", sans-serif',
      displaySize: '20px',
      labelSize: '10px',
      bodySize: '14px',
      labelTransform: 'uppercase',
    },
    glassStyle: {
      panelBackground: 'rgba(255,255,255,0.72)',
      panelStrong: 'rgba(255,255,255,0.92)',
      backdropBlur: '14px',
      border: '1.3px solid rgba(235,28,36,0.15)',
      tintRule: 'glossy clear/white with beauty editorial reflections',
    },
    lighting: {
      ambientGradient: 'linear-gradient(165deg, #fffbf7 0%, #fceee4 35%, #fff9f5 100%)',
      horizonGlow: 'linear-gradient(90deg, transparent, #EB1C2418)',
      keyLight: 'salon daylight + mirror glow',
      departmentWash: 'radial-gradient(ellipse at top, #EB1C2414, transparent 65%)',
    },
    motion: {
      philosophy: 'Polished reveal with soft shimmer — never gimmicky.',
      entrance: 'fade + soft shimmer',
      exit: 'dissolve 300ms',
      hover: 'material glow + 1px lift',
      timingMs: 500,
      easing: 'cubic-bezier(0.34, 1.1, 0.64, 1)',
    },
    materials: ['marble', 'glass', 'chrome', 'vanity mirror', 'velvet', 'product cards'],
    particles: 'soft neon drift restrained',
    icons: { treatment: 'beauty silhouette', style: 'concierge glyph' },
    writingVoice: {
      tone: 'intimate, stylish, direct',
      cadence: 'concierge warmth',
      sampleGreeting: 'Welcome back, bestie. Your mansion is ready.',
    },
    orbOverrides: {
      variant: 'salon crystal',
      personality: 'Hair bestie + executive concierge',
      glowColor: '#F5E6D3',
      recommendationTone: 'protective, stylish, personally known',
    },
    navigationStyle: {
      tone: 'mansion corridors — concierge rooms',
      activeIndicator: 'red glam underline + mirror shimmer',
      breadcrumbStyle: 'MANSION > ROOM > SERVICE',
    },
    experienceRules: [
      'Luxury editorial spacing',
      'Concierge warmth in copy',
      'No generic SaaS language',
      'Mirror-light hero zones',
    ],
  }),
  brand('ndx', 'NDX™', {
    identity: {
      philosophy: 'Independent media intelligence and cultural signal command.',
      visualPersonality: ['broadcast', 'editorial', 'cinematic', 'kinetic'],
      emotionalPersonality: ['informed', 'current', 'sharp', 'culturally aware'],
      executivePersonality: ['newsroom director', 'media strategist'],
      environmentalStorytelling: 'Media command center — signal detection and publishing command.',
    },
    colorSystem: {
      primary: '#2563EB',
      secondary: '#0F172A',
      accent: '#FACC15',
      background: '#0B1220',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      semanticInfo: '#38BDF8',
      semanticSuccess: '#22C55E',
      semanticWarning: '#F59E0B',
      semanticRisk: '#EF4444',
    },
    typography: {
      displayFont: '"Futura PT Demi", sans-serif',
      labelFont: '"Futura PT Medium", sans-serif',
      bodyFont: '"Futura PT Book", sans-serif',
      displaySize: '16px',
      labelSize: '9px',
      bodySize: '13px',
      labelTransform: 'uppercase',
    },
    glassStyle: {
      panelBackground: 'rgba(15,23,42,0.72)',
      panelStrong: 'rgba(30,41,59,0.88)',
      backdropBlur: '16px',
      border: '1px solid rgba(148,163,184,0.25)',
      tintRule: 'dark acrylic + screen reflections',
    },
    lighting: {
      ambientGradient: 'linear-gradient(165deg, #0b1220 0%, #111827 45%, #0f172a 100%)',
      horizonGlow: 'linear-gradient(90deg, transparent, #2563EB33)',
      keyLight: 'studio lights + neon edge',
      departmentWash: 'radial-gradient(ellipse at top, #2563EB22, transparent 70%)',
    },
    motion: {
      philosophy: 'Switcher cuts and signal pulses — cinematic but controlled.',
      entrance: 'slide-from-right 400ms',
      exit: 'cut 200ms',
      hover: 'signal pulse edge',
      timingMs: 400,
      easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    },
    materials: ['dark glass', 'broadcast panels', 'paper stacks', 'monitors', 'metal'],
    particles: 'signal orbit motes',
    icons: { treatment: 'broadcast glyph', style: 'editorial symbol' },
    writingVoice: {
      tone: 'crisp media language, headline-aware',
      cadence: 'analytical, urgent when needed',
      sampleGreeting: 'Signal desk live. Here is what matters now.',
    },
    orbOverrides: {
      variant: 'broadcast crystal',
      personality: 'Producer / research editor / signal analyst',
      glowColor: '#FACC15',
      recommendationTone: 'analytical, current, culturally aware',
    },
    navigationStyle: {
      tone: 'rundown desk — story map',
      activeIndicator: 'signal blue glow + ticker underline',
      breadcrumbStyle: 'DESK > STORY > SIGNAL',
    },
    experienceRules: [
      'High contrast legibility on dark surfaces',
      'Broadcast urgency without panic loops',
      'Editorial metadata always visible',
      'Signal-first hierarchy',
    ],
  }),
];

function deptRow(
  brandId: string,
  departmentId: string,
  officialName: string,
  primary: string,
  lighting: string,
  mood: string,
  identity: string,
  extras: Partial<XeeDepartmentDna> = {}
): XeeDepartmentDna {
  return {
    departmentDnaId: `${brandId}-${departmentId}`,
    brandId,
    departmentId,
    officialName,
    departmentColor: primary,
    departmentLighting: lighting,
    ambientMood: mood,
    sceneIdentity: identity,
    particleSystem: extras.particleSystem ?? 'none',
    notificationStyle: extras.notificationStyle ?? 'soft reveal',
    executiveMood: extras.executiveMood ?? 'decisive',
    knowledgeMood: extras.knowledgeMood ?? 'archival',
    creativeMood: extras.creativeMood ?? 'expressive',
    animationPersonality: extras.animationPersonality ?? 'calm executive reveal',
  };
}

export const SEED_DEPARTMENT_DNA: XeeDepartmentDna[] = [
  deptRow('studio-os', 'headquarters', 'Headquarters', '#EB1C24', 'warm marble horizon', 'executive calm', 'marble institution', { particleSystem: 'crystal dust', animationPersonality: 'calm executive reveal' }),
  deptRow('studio-os', 'knowledge', 'Institute of Knowledge', '#4F46E5', 'museum/library light', 'reverent scholarly', 'museum-library archive', { knowledgeMood: 'reverent', animationPersonality: 'quiet archival' }),
  deptRow('studio-os', 'command-center', 'Command Center', '#EF4444', 'alert-ready calm', 'decisive operations', 'executive operations room', { executiveMood: 'command-ready', animationPersonality: 'precise quick' }),
  deptRow('studio-os', 'creative', 'Creative', '#EC4899', 'studio stage wash', 'studio expression', 'creative stage', { creativeMood: 'fluid', animationPersonality: 'expressive fluid' }),
  deptRow('studio-os', 'operations', 'Operations', '#0D9488', 'workflow stream', 'workflow clarity', 'operations stream', { animationPersonality: 'efficient steady' }),
  deptRow('studio-os', 'ai', 'Artificial Intelligence', '#7C3AED', 'neural horizon glow', 'intelligent calm', 'AI operations wing', { animationPersonality: 'precise neural pulse' }),
  deptRow('studio-os', 'executive', 'Executive', '#EB1C24', 'warm marble horizon', 'executive calm', 'marble institution', { particleSystem: 'crystal dust', animationPersonality: 'calm executive reveal' }),
  deptRow('studio-os', 'command', 'Command', '#EF4444', 'alert-ready calm', 'decisive operations', 'executive operations room', { executiveMood: 'command-ready', animationPersonality: 'precise quick' }),

  deptRow('frontal-slayer', 'headquarters', 'The Mansion™', '#EB1C24', 'salon mirror glow', 'concierge warmth', 'beauty mansion lobby', { particleSystem: 'soft shimmer', animationPersonality: 'polished reveal' }),
  deptRow('frontal-slayer', 'knowledge', 'Salon Education Atelier', '#EC4899', 'atelier skylight', 'intimate learning', 'beauty education archive', { knowledgeMood: 'intimate', animationPersonality: 'guided uplifting' }),
  deptRow('frontal-slayer', 'command-center', 'Concierge Operations', '#EB1C24', 'appointment glow', 'service readiness', 'concierge operations salon', { executiveMood: 'concierge-direct', animationPersonality: 'helpful light' }),
  deptRow('frontal-slayer', 'creative', 'Editorial Studio', '#F43F5E', 'campaign glow', 'editorial energy', 'beauty editorial studio', { creativeMood: 'glamorous', animationPersonality: 'energetic polished' }),
  deptRow('frontal-slayer', 'operations', 'Service Operations', '#14B8A6', 'concierge warmth', 'care flow', 'service workflow', { animationPersonality: 'empathetic soft' }),

  deptRow('ndx', 'headquarters', 'Media Command', '#2563EB', 'newsroom horizon', 'broadcast urgency', 'media command floor', { particleSystem: 'signal motes', animationPersonality: 'switcher cut' }),
  deptRow('ndx', 'knowledge', 'Editorial Research Vault', '#0891B2', 'observatory light', 'investigative focus', 'source vault', { knowledgeMood: 'investigative', animationPersonality: 'investigative smooth' }),
  deptRow('ndx', 'command-center', 'Assignment Desk', '#EF4444', 'alert desk glow', 'desk readiness', 'newsroom assignment desk', { executiveMood: 'deadline-aware', animationPersonality: 'precise quick' }),
  deptRow('ndx', 'creative', 'Content Engine', '#F97316', 'studio wash', 'production energy', 'media publishing command', { creativeMood: 'kinetic', animationPersonality: 'broadcast energy' }),
  deptRow('ndx', 'operations', 'Publishing Ops', '#06B6D4', 'control room glow', 'stream efficiency', 'publishing pipeline', { animationPersonality: 'rhythmic reliable' }),
];

export const SEED_SCENE_DNA: XeeSceneDna[] = [
  {
    sceneId: 'executive-headquarters',
    officialName: 'Executive Headquarters',
    layoutTemplateId: 'hq-master-scene-v1',
    heroObject: 'Primary Focal Object — shared anatomy',
    capabilityPanels: ['Capability Panel A', 'Capability Panel B', 'Capability Panel C'],
    orbPlacement: 'bottom-right persistent',
    environmentalRules: [
      'Same 10-layer scene template for all brands',
      'Layout anatomy identical — only DNA inheritance changes',
      'Hero zone 68% viewport',
      'Nav rail 260px',
    ],
    sharedAcrossBrands: true,
  },
  {
    sceneId: 'institute-of-knowledge',
    officialName: 'Institute of Knowledge',
    layoutTemplateId: 'hq-master-scene-v1',
    heroObject: 'Knowledge focal archive',
    capabilityPanels: ['Curriculum Panel', 'Archive Panel', 'Canon Panel'],
    orbPlacement: 'bottom-right persistent',
    environmentalRules: ['Shared HQ template — institute DNA inheritance only'],
    sharedAcrossBrands: true,
  },
  {
    sceneId: 'command-center',
    officialName: 'Command Center',
    layoutTemplateId: 'hq-master-scene-v1',
    heroObject: 'Operations command focal',
    capabilityPanels: ['Mission Panel', 'Signal Panel', 'Decision Panel'],
    orbPlacement: 'bottom-right persistent',
    environmentalRules: ['Shared HQ template — command DNA inheritance only'],
    sharedAcrossBrands: true,
  },
  {
    sceneId: 'content-engine',
    officialName: 'Content Engine',
    layoutTemplateId: 'hq-master-scene-v1',
    heroObject: 'Creative production focal',
    capabilityPanels: ['Campaign Panel', 'Asset Panel', 'Publish Panel'],
    orbPlacement: 'bottom-right persistent',
    environmentalRules: ['Shared HQ template — creative DNA inheritance only'],
    sharedAcrossBrands: true,
  },
  {
    sceneId: 'orb-room',
    officialName: 'Orb Room',
    layoutTemplateId: 'hq-master-scene-v1',
    heroObject: 'Orb briefing focal',
    capabilityPanels: ['Briefing Panel', 'Context Panel', 'Action Panel'],
    orbPlacement: 'center-stage persistent',
    environmentalRules: ['Shared HQ template — Orb DNA inheritance only'],
    sharedAcrossBrands: true,
  },
];

const COMPONENT_IDS = ['executive-header', 'capability-card', 'spatial-nav-rail', 'orb-mount', 'context-ribbon'] as const;

function comp(brandId: string, componentId: string, variant: string, layer: string): XeeComponentDna {
  return {
    componentDnaId: `${brandId}-${componentId}`,
    brandId,
    componentId,
    officialName: componentId.replace(/-/g, ' '),
    variant,
    tokenBindings: ['glass.panel', 'type.label', 'color.primary'],
    sceneLayer: layer,
  };
}

export const SEED_COMPONENT_DNA: XeeComponentDna[] = [
  ...(['studio-os', 'frontal-slayer', 'ndx'] as const).flatMap((brandId) => {
    const variants: Record<string, string> =
      brandId === 'studio-os'
        ? { 'executive-header': 'constitutional', 'capability-card': 'glass-executive', 'spatial-nav-rail': 'executive-rail', 'orb-mount': 'crystal-chief', 'context-ribbon': 'provenance' }
        : brandId === 'frontal-slayer'
          ? { 'executive-header': 'concierge-editorial', 'capability-card': 'salon-glass', 'spatial-nav-rail': 'mansion-corridor', 'orb-mount': 'hair-bestie', 'context-ribbon': 'service-state' }
          : { 'executive-header': 'broadcast-desk', 'capability-card': 'dark-acrylic', 'spatial-nav-rail': 'story-rundown', 'orb-mount': 'signal-producer', 'context-ribbon': 'signal-metrics' };
    return COMPONENT_IDS.map((id) => comp(brandId, id, variants[id], id.includes('header') ? 'executive-header' : 'capability-panels'));
  }),
];

export const SEED_MOTION_DNA: XeeMotionDna[] = [
  {
    motionDnaId: 'motion-studio-os',
    brandId: 'studio-os',
    presetName: 'Executive Calm',
    entrance: 'fade + scale 0.98→1 over 600ms',
    transition: 'department color carry 500ms',
    hover: 'translateY(-1px) 150ms',
    focus: 'department tint ring 2px',
    loading: 'calm pulse bar',
    reducedMotionFallback: 'instant state change',
  },
  {
    motionDnaId: 'motion-frontal-slayer',
    brandId: 'frontal-slayer',
    presetName: 'Polished Salon Reveal',
    entrance: 'fade + soft shimmer 500ms',
    transition: 'mirror dissolve 400ms',
    hover: 'material glow 200ms',
    focus: 'rose edge glow',
    loading: 'shimmer skeleton',
    reducedMotionFallback: 'opacity fade only',
  },
  {
    motionDnaId: 'motion-ndx',
    brandId: 'ndx',
    presetName: 'Broadcast Switcher',
    entrance: 'slide-from-right 400ms',
    transition: 'cut + signal pulse 200ms',
    hover: 'signal edge pulse',
    focus: 'blue ticker underline',
    loading: 'ticker progress',
    reducedMotionFallback: 'crossfade 150ms',
  },
];

export const SEED_INTERACTION_DNA: XeeInteractionDna[] = [
  {
    interactionDnaId: 'interaction-studio-os',
    brandId: 'studio-os',
    hover: 'decisive underline + gold edge',
    focus: 'executive ring',
    selected: 'red underline + department glow',
    success: 'brief green glow',
    warning: 'still amber edge',
    approval: 'gold ceremonial reveal',
    disabled: 'muted glass, no motion loop',
  },
  {
    interactionDnaId: 'interaction-frontal-slayer',
    brandId: 'frontal-slayer',
    hover: 'mirror shimmer + rose edge',
    focus: 'concierge ring',
    selected: 'glam underline',
    success: 'soft celebration pulse',
    warning: 'gentle amber note',
    approval: 'salon approval shimmer',
    disabled: 'frosted inactive',
  },
  {
    interactionDnaId: 'interaction-ndx',
    brandId: 'ndx',
    hover: 'signal pulse edge',
    focus: 'broadcast ring',
    selected: 'ticker highlight',
    success: 'green signal tick',
    warning: 'amber still frame',
    approval: 'desk lock confirmation',
    disabled: 'dim slate panel',
  },
];

export const XEE_SUBSYSTEM_SEED_VERSION = XEE_SUBSYSTEM_VERSION;
