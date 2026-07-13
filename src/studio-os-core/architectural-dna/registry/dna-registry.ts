import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import {
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY,
  getCanonicalDepartmentRecord,
} from '../../canonical-studio-world/canonical-department-registry';
import { resolveDepartmentCharter } from '../../canonical-studio-world/department-charters';
import { resolveDepartmentFingerprint } from '../../canonical-studio-world/department-architectural-fingerprints';
import type { ArchitecturalDnaProfile, CameraLanguage, MaterialPalette } from '../schemas/dna-profile';
import { ARCHITECTURAL_DNA_VERSION } from '../schemas/dna-profile';
import { resolveDepartmentNegativePrompts } from '../references/negative-prompt-library';
import { FOUNDER_RENDER_PROMPT_COMPILER_VERSION } from '../schemas/compiler-contract';

export const ARCHITECTURAL_DNA_REGISTRY_VERSION = 'architectural-dna-registry.v1' as const;

const DEFAULT_CAMERA: CameraLanguage = {
  desktopComposition: '21:9 hero composition — wide architectural lens, eye-height, signature framing',
  mobileComposition: '9:16 reframe — same room, same architecture, different crop only, no redesign',
  cinematicComposition: '16:9 cinematic interior — photoreal 4K editorial quality',
  framingRules: ['wide interior', 'clear foreground midground background', 'no extreme fisheye', 'no dutch angle'],
  negativeCompositionRules: ['no regenerated room for mobile', 'no architecture redesign for portrait', 'no crop that hides hero object'],
  desktopAspectRatio: '21:9',
  mobileAspectRatio: '9:16',
};

const CANONICAL_MATERIALS: MaterialPalette = {
  floorMaterial: 'founder-marble — white polished marble',
  wallMaterial: 'glass, acrylic, OLED display surfaces',
  ceilingMaterial: 'architectural lighting ceiling with integrated illumination',
  glassProfile: 'premium architectural glass — reflective, illuminated bezels',
  metalPalette: ['champagne brushed aluminum', 'chrome', 'brushed aluminum'],
  glassPalette: ['architectural glass', 'OLED bezels', 'acrylic surfaces'],
  stonePalette: ['founder-marble', 'polished stone accents'],
  woodPalette: ['minimal architectural wood accents'],
  colorPalette: ['white marble', 'champagne', 'chrome', 'subtle red illumination'],
};

type DnaOverride = Partial<ArchitecturalDnaProfile>;

const DNA_OVERRIDES: Partial<Record<CanonicalMainDepartmentId, DnaOverride>> = {
  'experience-lab': {
    profileRevision: 1,
    purpose: 'Architectural visualization laboratory for canonical Studio World departments.',
    architecturalCharter: 'Monumental architecture studio — holographic planning, never reception.',
    visualIdentity: 'monumental futuristic architecture studio',
    signatureMood: 'futuristic luxury — cinematic architecture visualization',
    architecturalStyle: 'monumental architecture studio with holographic volumes',
    signatureGeometry: 'floating holographic room blueprint, construction holograms, planning surfaces',
    spatialComposition: 'central holographic room model, surrounding planning tables, integrated command dock and workbench',
    heroObject: 'floating holographic room blueprint with construction holograms',
    materials: {
      ...CANONICAL_MATERIALS,
      metalPalette: ['champagne', 'brushed aluminum', 'chrome'],
      colorPalette: ['white marble', 'bronze/champagne accents', 'chrome', 'holographic blue glow'],
    },
    lightingProfile: 'ExperienceLabLighting — architectural study lighting, holographic accent glow',
    accentLighting: 'holographic blue accent + champagne uplighting',
    signatureFurniture: [
      'architectural planning surfaces',
      'construction hologram tables',
      'material study stations',
      'integrated blank command dock',
      'integrated blank workbench',
    ],
    signatureTechnology: ['holographic room model', 'floating blueprint volumes', 'lighting study rigs'],
    environmentFX: ['holographic projections', 'subtle particle glow', 'architectural light rays'],
    atmosphere: 'bright futuristic architecture atelier with premium glass and bronze accents',
    motionLanguage: 'slow cinematic drift — holographic elements subtly animated',
    positivePromptTemplate: 'monumental architecture studio with holographic room model and floating blueprint volumes',
    forbiddenElements: [
      'reception desk',
      'waiting room',
      'receptionist furniture',
      'corporate lobby',
      'ReceptionShell',
    ],
  },
  'creative-director-studio': {
    profileRevision: 1,
    purpose: 'Asset manufacturing facility on approved architecture.',
    architecturalCharter: 'Luxury production facility — isolated stages, never reception.',
    visualIdentity: 'luxury production facility with dark premium environment',
    signatureMood: 'luxury dark environment with premium showcase lighting',
    architecturalStyle: 'asset manufacturing production studio',
    signatureGeometry: 'isolated production stages, material testing bays, version wall',
    spatialComposition: 'production stages along perimeter, central material testing, reference wall backdrop',
    heroObject: 'isolated production stage with asset version wall',
    materials: {
      floorMaterial: 'dark stone — luxury production floor',
      wallMaterial: 'black architectural glass, dark brushed metal panels',
      ceilingMaterial: 'luxury production lighting grid',
      glassProfile: 'black architectural glass with showcase reflections',
      metalPalette: ['dark brushed metal', 'matte black steel', 'chrome accents'],
      glassPalette: ['black architectural glass', 'showcase glass panels'],
      stonePalette: ['dark stone', 'charcoal polished stone'],
      woodPalette: ['dark production wood accents'],
      colorPalette: ['dark stone', 'black glass', 'premium showcase lighting', 'subtle warm accents'],
    },
    lightingProfile: 'CdsProductionLighting — luxury showcase rigs, material testing spots',
    accentLighting: 'premium showcase spotlights on production stages',
    signatureFurniture: [
      'production workbench',
      'material testing stations',
      'lighting rigs',
      'camera rigs',
      'asset version wall',
      'integrated blank command dock',
      'integrated blank workbench',
    ],
    signatureTechnology: ['lighting rigs', 'camera rigs', 'asset turntable', 'version tracking displays'],
    environmentFX: ['showcase spotlight beams', 'subtle production haze'],
    atmosphere: 'luxury dark production atelier with premium showcase lighting',
    motionLanguage: 'subtle spotlight sweep — production-ready stillness',
    positivePromptTemplate: 'luxury asset manufacturing studio with isolated production stages and material testing',
    forbiddenElements: [
      'Reception',
      'waiting room',
      'blueprint holograms',
      'medical furniture',
      'restaurant furniture',
      'ReceptionShell',
    ],
  },
  'command-center': {
    profileRevision: 1,
    visualIdentity: 'executive command bridge with mission wall',
    signatureMood: 'spaceship command bridge — operational intensity',
    architecturalStyle: 'operations command center',
    heroObject: 'mission wall with city telemetry displays',
    positivePromptTemplate: 'operations command bridge with mission wall and municipal command tables',
    forbiddenElements: ['reception desk', 'waiting lounge', 'retail storefront'],
  },
  marketplace: {
    profileRevision: 1,
    visualIdentity: 'commercial district with storefronts and creator kiosks',
    signatureMood: 'bustling commerce plaza',
    architecturalStyle: 'marketplace commercial district',
    heroObject: 'featured mod storefront with licensing displays',
    positivePromptTemplate: 'commercial marketplace district with storefronts and creator kiosks',
    forbiddenElements: ['conference room', 'reception', 'corporate office', 'executive boardroom'],
  },
  'founder-suite': {
    profileRevision: 1,
    visualIdentity: 'monumental executive atrium',
    signatureMood: 'premium executive headquarters',
    architecturalStyle: 'executive atrium gathering space',
    heroObject: 'monumental central gathering space with presentation areas',
    positivePromptTemplate: 'monumental executive atrium with premium architecture and presentation areas',
    forbiddenElements: ['reception desk', 'concierge desk', 'waiting lounge'],
  },
};

function buildDnaProfile(departmentId: CanonicalMainDepartmentId): ArchitecturalDnaProfile {
  const record = getCanonicalDepartmentRecord(departmentId)!;
  const charter = resolveDepartmentCharter(departmentId);
  const fingerprint = resolveDepartmentFingerprint(departmentId);
  const override = DNA_OVERRIDES[departmentId] ?? {};
  const forbidden = override.forbiddenElements ?? resolveDepartmentNegativePrompts(departmentId);

  return {
    dnaVersion: ARCHITECTURAL_DNA_VERSION,
    profileRevision: override.profileRevision ?? 1,
    departmentId,
    departmentName: record.name,
    purpose: override.purpose ?? charter.mission,
    architecturalCharter: override.architecturalCharter ?? charter.mission,
    visualIdentity: override.visualIdentity ?? charter.visualIdentity,
    signatureMood: override.signatureMood ?? charter.atmosphere,
    architecturalStyle: override.architecturalStyle ?? charter.architecturalMetaphor,
    signatureGeometry: override.signatureGeometry ?? fingerprint.signatureElements.slice(0, 3).join(', '),
    spatialComposition: override.spatialComposition ?? `department-specific layout for ${record.name}`,
    heroObject: override.heroObject ?? fingerprint.signatureElements[0] ?? 'department hero object',
    materials: override.materials ?? CANONICAL_MATERIALS,
    lightingProfile: override.lightingProfile ?? `${fingerprint.shellId}Lighting`,
    accentLighting: override.accentLighting ?? 'architectural accent lighting',
    cameraLanguage: override.cameraLanguage ?? DEFAULT_CAMERA,
    signatureFurniture: override.signatureFurniture ?? fingerprint.signatureElements,
    signatureTechnology: override.signatureTechnology ?? ['integrated blank command dock', 'integrated blank workbench'],
    environmentFX: override.environmentFX ?? ['architectural ambient lighting'],
    atmosphere: override.atmosphere ?? charter.atmosphere,
    motionLanguage: override.motionLanguage ?? 'cinematic stillness',
    futureExpansionRules: override.futureExpansionRules ?? ['additive socket expansion only', 'no architecture redesign'],
    layoutRules: override.layoutRules ?? {
      commandDockLayout: `${record.commandDockProfile} — physical shell, blank displays`,
      workbenchLayout: `${record.workbenchProfile} — physical console, blank tool housings`,
      socketRules: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT'],
      assetRules: ['socket-placement-only', 'approved-materials-only'],
      brandInjectionZones: ['floor-material', 'accent-lighting', 'hero-object-brand-mount'],
      placeholderZones: ['command-dock-displays', 'workbench-tool-slots', 'viewport-stage'],
    },
    referencePackId: `golden-ref-${departmentId}-v1`,
    positivePromptTemplate:
      override.positivePromptTemplate ??
      `canonical ${record.name} environment — ${charter.visualIdentity}`,
    negativePromptTemplate: forbidden.join(', '),
    qualityTargets: override.qualityTargets ?? [
      '4K photoreal',
      'luxury editorial interior photography',
      'Architecture Law #001 compliant',
      'department-identity-distinct',
    ],
    forbiddenElements: forbidden,
    promptCompilerVersion: FOUNDER_RENDER_PROMPT_COMPILER_VERSION,
  };
}

export const ARCHITECTURAL_DNA_REGISTRY: Record<CanonicalMainDepartmentId, ArchitecturalDnaProfile> =
  Object.fromEntries(
    CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((r) => [r.departmentId, buildDnaProfile(r.departmentId)])
  ) as Record<CanonicalMainDepartmentId, ArchitecturalDnaProfile>;

export function resolveArchitecturalDna(departmentId: CanonicalMainDepartmentId): ArchitecturalDnaProfile {
  return ARCHITECTURAL_DNA_REGISTRY[departmentId];
}

export function listArchitecturalDnaProfiles(): ArchitecturalDnaProfile[] {
  return Object.values(ARCHITECTURAL_DNA_REGISTRY);
}
