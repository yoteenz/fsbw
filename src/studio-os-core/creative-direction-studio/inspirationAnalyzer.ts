import type {
  ExtractedReferenceIntelligence,
  InspirationReference,
  InspirationSourceType,
  MoodBoardSectionId,
} from './types';

const SOURCE_SECTIONS: Partial<Record<InspirationSourceType, MoodBoardSectionId[]>> = {
  'instagram-reel': ['visual-style', 'motion', 'color'],
  tiktok: ['motion', 'visual-style'],
  pinterest: ['visual-style', 'photography', 'color'],
  behance: ['visual-style', 'typography', 'ui'],
  dribbble: ['ui', 'visual-style'],
  packaging: ['packaging', 'materials', 'typography'],
  'luxury-campaign': ['brand-references', 'photography', 'lighting'],
  'product-photo': ['products', 'photography', 'lighting'],
  'ui-screenshot': ['ui', 'typography'],
  film: ['motion', 'lighting', 'audio'],
  music: ['audio', 'motion'],
  photography: ['photography', 'lighting'],
};

function paletteForSource(type: InspirationSourceType): string[] {
  switch (type) {
    case 'luxury-campaign':
      return ['#0F172A', '#F8FAFC', '#C4B5A8', '#1E1B4B'];
    case 'packaging':
      return ['#FAFAF9', '#78716C', '#DC2626', '#0F172A'];
    case 'instagram-reel':
    case 'tiktok':
      return ['#6366F1', '#0F172A', '#F8FAFC', '#EB1C24'];
    default:
      return ['#6366F1', '#0F172A', '#94A3B8', '#F8FAFC'];
  }
}

export function analyzeInspirationReference(input: {
  title: string;
  sourceType: InspirationSourceType;
  url: string;
  caption?: string;
}): Pick<InspirationReference, 'analysis' | 'moodBoardSections'> {
  const text = `${input.title} ${input.caption ?? ''} ${input.url}`.toLowerCase();
  const luxury = /luxury|apple|vision|editorial|fashion|premium|haute/.test(text);
  const energetic = /energy|social|reel|tiktok|fast|hype/.test(text);
  const minimal = /minimal|clean|apple|swiss|editorial/.test(text);

  const analysis: ExtractedReferenceIntelligence = {
    lighting: luxury ? ['Soft key · controlled contrast', 'Product halo · no harsh fill'] : ['Natural daylight · balanced exposure'],
    composition: ['Center-weighted hero', 'Generous negative space'],
    mood: luxury ? ['Authoritative calm', 'Premium restraint'] : energetic ? ['High energy · social-native'] : ['Educational · approachable'],
    materials: input.sourceType === 'packaging' ? ['Matte paper · foil stamp · tactile uncoated'] : ['Glass · brushed metal · fabric texture'],
    typography: minimal ? ['Neo-grotesk · tight tracking · large display'] : ['Futura-class sans · uppercase labels'],
    motion: input.sourceType === 'instagram-reel' || input.sourceType === 'tiktok' ? ['Quick cuts · 1.2s beats · punch-in typography'] : ['Slow reveal · ease-out · hold on product'],
    cameraAngle: ['Three-quarter product · eye-level founder'],
    pacing: energetic ? ['Hook in 1.5s · payoff by 8s'] : ['Breathing room · 12–15s narrative arc'],
    luxuryCues: luxury ? ['Whisper not shout', 'Single accent color', 'Editorial crop'] : ['Clear hierarchy · readable captions'],
    colorPalette: paletteForSource(input.sourceType),
    brandPersonality: luxury ? ['Confident · precise · timeless'] : ['Helpful · factual · ndxbook index voice'],
    emotionalDirection: luxury ? ['Aspiration without anxiety'] : ['Clarity over panic'],
    visualHierarchy: ['Headline → proof → CTA', 'One idea per frame'],
    designLanguage: minimal ? ['Apple-class restraint · material honesty'] : ['Studio OS indigo frame · educational carousel'],
  };

  const moodBoardSections =
    SOURCE_SECTIONS[input.sourceType] ??
    (luxury ? (['brand-references', 'visual-style'] as MoodBoardSectionId[]) : (['visual-style'] as MoodBoardSectionId[]));

  return { analysis, moodBoardSections };
}

export function mergeReferenceIntoMoodBoard(
  sections: Record<MoodBoardSectionId, string[]>,
  ref: InspirationReference
): Record<MoodBoardSectionId, string[]> {
  const next = { ...sections };
  for (const sectionId of ref.moodBoardSections) {
    const chips = [
      ref.title,
      ...ref.analysis.mood.slice(0, 1),
      ...ref.analysis.colorPalette.slice(0, 2),
    ];
    next[sectionId] = [...new Set([...(next[sectionId] ?? []), ...chips])].slice(-12);
  }
  return next;
}

function emptyMoodSections(): Record<MoodBoardSectionId, string[]> {
  return {
    'visual-style': [],
    photography: [],
    packaging: [],
    products: [],
    ui: [],
    animation: [],
    lighting: [],
    materials: [],
    typography: [],
    motion: [],
    'brand-references': [],
    competitors: [],
    audio: [],
    color: [],
  };
}

export function createEmptyMoodBoard(): { updatedAt: string; sections: Record<MoodBoardSectionId, string[]> } {
  return { updatedAt: new Date().toISOString(), sections: emptyMoodSections() };
}
