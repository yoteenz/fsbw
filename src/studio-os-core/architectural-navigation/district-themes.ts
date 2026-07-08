/**
 * District Environmental Identity™ — thematic architecture per destination.
 * Universal layout · district-specific materials, lighting, atmosphere.
 * ERA 2 — WORLD™ · World Graph™ environmental assets
 */

export type DistrictThemeId =
  | 'warehouse'
  | 'museum'
  | 'knowledge-library'
  | 'marketplace'
  | 'creative-direction'
  | 'command-center'
  | 'innovation-district'
  | 'atlas';

export type DistrictWorldGraphAssets = {
  materialLibrary: string;
  lightingProfile: string;
  motionLanguage: string;
  ambientAudio: string;
  particleSystem: string;
  environmentalEffects: string;
  cameraStyle: string;
  colorPalette: string;
};

export type DistrictEnvironmentalIdentity = {
  id: DistrictThemeId;
  displayName: string;
  campusName: string;
  feeling: string;
  materials: string[];
  cssClass: `sw-district--${DistrictThemeId}`;
  worldGraphAssets: DistrictWorldGraphAssets;
};

export const DISTRICT_ENVIRONMENTAL_IDENTITIES: Record<DistrictThemeId, DistrictEnvironmentalIdentity> = {
  warehouse: {
    id: 'warehouse',
    displayName: 'Warehouse Wing™',
    campusName: 'Industrial Design Campus™',
    feeling: 'Luxury industrial design laboratory — Apple ID Lab · Pixar prop workshop · Wētā Workshop.',
    materials: [
      'Brushed aluminum',
      'Titanium',
      'Polished concrete',
      'Blueprint glass',
      'Exposed structural framing',
      'Precision lighting',
      'Blueprint grid',
      'Holographic measurements',
    ],
    cssClass: 'sw-district--warehouse',
    worldGraphAssets: {
      materialLibrary: 'wh-material-industrial-aluminum',
      lightingProfile: 'wh-lighting-precision-lab',
      motionLanguage: 'wh-motion-measured-dolly',
      ambientAudio: 'wh-audio-workshop-hum',
      particleSystem: 'wh-particles-dust-motes',
      environmentalEffects: 'wh-fx-blueprint-grid',
      cameraStyle: 'wh-camera-inspection-orbit',
      colorPalette: 'wh-palette-titanium-concrete',
    },
  },
  museum: {
    id: 'museum',
    displayName: 'Museum™',
    campusName: 'Innovation Museum™',
    feeling: 'The Louvre meets Apple Visitor Center — every object historically significant.',
    materials: [
      'White stone',
      'Premium marble',
      'Bronze accents',
      'Museum lighting',
      'Shadow gaps',
      'Gallery spotlights',
      'Display pedestals',
    ],
    cssClass: 'sw-district--museum',
    worldGraphAssets: {
      materialLibrary: 'mus-material-carrara-marble',
      lightingProfile: 'mus-lighting-gallery-spot',
      motionLanguage: 'mus-motion-slow-reverent',
      ambientAudio: 'mus-audio-gallery-hush',
      particleSystem: 'mus-particles-light-motes',
      environmentalEffects: 'mus-fx-shadow-gap',
      cameraStyle: 'mus-camera-exhibit-dolly',
      colorPalette: 'mus-palette-marble-bronze',
    },
  },
  'knowledge-library': {
    id: 'knowledge-library',
    displayName: 'Knowledge Library™',
    campusName: 'Living Knowledge Archive™',
    feeling: 'Futuristic research library where knowledge is preserved and alive.',
    materials: [
      'Warm walnut',
      'Architectural shelving',
      'Smoked glass',
      'Holographic books',
      'Illuminated drafting tables',
      'Archival lighting',
      'Paper textures',
      'Projection walls',
    ],
    cssClass: 'sw-district--knowledge-library',
    worldGraphAssets: {
      materialLibrary: 'kl-material-walnut-smoked-glass',
      lightingProfile: 'kl-lighting-archival-warm',
      motionLanguage: 'kl-motion-page-turn',
      ambientAudio: 'kl-audio-library-quiet',
      particleSystem: 'kl-particles-paper-dust',
      environmentalEffects: 'kl-fx-holographic-shelf',
      cameraStyle: 'kl-camera-reading-aisle',
      colorPalette: 'kl-palette-walnut-amber',
    },
  },
  marketplace: {
    id: 'marketplace',
    displayName: 'Marketplace™',
    campusName: 'Marketplace Pavilion™',
    feeling: 'Luxury flagship showroom — crystal, chrome, kinetic displays.',
    materials: [
      'Crystal acrylic',
      'Illuminated glass',
      'Polished chrome',
      'Luxury retail displays',
      'Premium showcase lighting',
      'Kinetic display walls',
      'Floating product platforms',
    ],
    cssClass: 'sw-district--marketplace',
    worldGraphAssets: {
      materialLibrary: 'mp-material-crystal-acrylic',
      lightingProfile: 'mp-lighting-showcase-lux',
      motionLanguage: 'mp-motion-kinetic-reveal',
      ambientAudio: 'mp-audio-showroom-ambient',
      particleSystem: 'mp-particles-sparkle',
      environmentalEffects: 'mp-fx-chrome-reflection',
      cameraStyle: 'mp-camera-product-orbit',
      colorPalette: 'mp-palette-chrome-gold',
    },
  },
  'creative-direction': {
    id: 'creative-direction',
    displayName: 'Creative Direction Studio™',
    campusName: 'Creative Campus™',
    feeling: "The world's greatest creative agency — inspiration in motion.",
    materials: [
      'Matte white',
      'Translucent acrylic',
      'Magnetic inspiration walls',
      'Movable partitions',
      'Dynamic lighting',
      'Projection surfaces',
      'Concept tables',
      'Material samples',
    ],
    cssClass: 'sw-district--creative-direction',
    worldGraphAssets: {
      materialLibrary: 'cds-material-matte-acrylic',
      lightingProfile: 'cds-lighting-dynamic-studio',
      motionLanguage: 'cds-motion-creative-flow',
      ambientAudio: 'cds-audio-studio-energy',
      particleSystem: 'cds-particles-idea-sparks',
      environmentalEffects: 'cds-fx-projection-wall',
      cameraStyle: 'cds-camera-story-dolly',
      colorPalette: 'cds-palette-white-red',
    },
  },
  'command-center': {
    id: 'command-center',
    displayName: 'Command Center™',
    campusName: 'Mission Control™',
    feeling: 'NASA Mission Control meets Iron Man — precision command.',
    materials: [
      'Matte black metal',
      'Precision LEDs',
      'Holographic displays',
      'Command consoles',
      'Ambient light strips',
      'Architectural glass',
      'Digital world map',
    ],
    cssClass: 'sw-district--command-center',
    worldGraphAssets: {
      materialLibrary: 'scc-material-matte-black-metal',
      lightingProfile: 'scc-lighting-command-ambient',
      motionLanguage: 'scc-motion-tactical-sweep',
      ambientAudio: 'scc-audio-mission-hum',
      particleSystem: 'scc-particles-data-stream',
      environmentalEffects: 'scc-fx-holo-map',
      cameraStyle: 'scc-camera-command-pan',
      colorPalette: 'scc-palette-black-cyan',
    },
  },
  'innovation-district': {
    id: 'innovation-district',
    displayName: 'Innovation District™',
    campusName: 'Experimental Campus™',
    feeling: 'The future being invented in real time — reactive, kinetic, alive.',
    materials: [
      'Reactive glass',
      'Programmable light',
      'Kinetic walls',
      'Adaptive surfaces',
      'Floating geometry',
      'Experimental materials',
      'Dynamic reflections',
    ],
    cssClass: 'sw-district--innovation-district',
    worldGraphAssets: {
      materialLibrary: 'inv-material-reactive-glass',
      lightingProfile: 'inv-lighting-programmable',
      motionLanguage: 'inv-motion-kinetic-shift',
      ambientAudio: 'inv-audio-lab-experimental',
      particleSystem: 'inv-particles-geometry',
      environmentalEffects: 'inv-fx-adaptive-surface',
      cameraStyle: 'inv-camera-floating-orbit',
      colorPalette: 'inv-palette-spectral-blue',
    },
  },
  atlas: {
    id: 'atlas',
    displayName: 'Atlas™',
    campusName: 'Transportation Hub™',
    feeling: 'The beating heart of Studio World — celestial navigation.',
    materials: [
      'Luminous crystal',
      'Celestial lighting',
      'World projection floor',
      'Holographic routes',
      'Floating navigation rings',
      'Constellation ceiling',
    ],
    cssClass: 'sw-district--atlas',
    worldGraphAssets: {
      materialLibrary: 'atlas-material-luminous-crystal',
      lightingProfile: 'atlas-lighting-celestial',
      motionLanguage: 'atlas-motion-orbit-travel',
      ambientAudio: 'atlas-audio-cosmos',
      particleSystem: 'atlas-particles-constellation',
      environmentalEffects: 'atlas-fx-route-projection',
      cameraStyle: 'atlas-camera-holographic-map',
      colorPalette: 'atlas-palette-crystal-indigo',
    },
  },
};

export function getDistrictIdentity(id: DistrictThemeId): DistrictEnvironmentalIdentity {
  return DISTRICT_ENVIRONMENTAL_IDENTITIES[id];
}

export function districtCssClass(id: DistrictThemeId): string {
  return DISTRICT_ENVIRONMENTAL_IDENTITIES[id].cssClass;
}
