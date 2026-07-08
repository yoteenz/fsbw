/** Ambient editorial placeholders — room feels alive before founder pins content. */

export type CdsAmbientMoodTile = {
  id: string;
  title: string;
  category: 'Campaign' | 'Packaging' | 'Film' | 'Materials' | 'Motion' | 'Palette';
  accent: string;
};

export const CDS_AMBIENT_MOOD_TILES: CdsAmbientMoodTile[] = [
  { id: 'amb-1', title: 'Luxury Campaign — Noir Editorial', category: 'Campaign', accent: '#3d2e24' },
  { id: 'amb-2', title: 'Packaging System — Soft Touch', category: 'Packaging', accent: '#2a3538' },
  { id: 'amb-3', title: 'Film Still — Golden Hour', category: 'Film', accent: '#4a3828' },
  { id: 'amb-4', title: 'Marble & Bronze Materials', category: 'Materials', accent: '#353230' },
  { id: 'amb-5', title: 'Motion Reference — Slow Reveal', category: 'Motion', accent: '#28303a' },
  { id: 'amb-6', title: 'Brand Palette — Warm Neutrals', category: 'Palette', accent: '#3a3228' },
  { id: 'amb-7', title: 'Editorial Spread — Q4 Launch', category: 'Campaign', accent: '#2e2a32' },
  { id: 'amb-8', title: 'Structural Packaging — Lift', category: 'Packaging', accent: '#32382e' },
  { id: 'amb-9', title: 'Cinematography — Depth Pass', category: 'Film', accent: '#382e28' },
];

export type CdsLibrarySpine = {
  id: string;
  title: string;
  tone: string;
};

export const CDS_LIBRARY_SPINE_DEFAULTS: Record<string, CdsLibrarySpine[]> = {
  Editorial: [
    { id: 'ed-1', title: 'Vogue Archive Vol. XII', tone: '#2a2420' },
    { id: 'ed-2', title: 'Campaign Masters', tone: '#322c28' },
    { id: 'ed-3', title: 'Type & Space', tone: '#282420' },
  ],
  Luxury: [
    { id: 'lx-1', title: 'Maison Reference', tone: '#3a3228' },
    { id: 'lx-2', title: 'Material Library', tone: '#2e2824' },
    { id: 'lx-3', title: 'Heritage Brands', tone: '#342e2a' },
  ],
  Motion: [
    { id: 'mo-1', title: 'Reel Studies', tone: '#283038' },
    { id: 'mo-2', title: 'Transition Canon', tone: '#2c3038' },
    { id: 'mo-3', title: 'Title Sequences', tone: '#303438' },
  ],
  Packaging: [
    { id: 'pk-1', title: 'Structural Forms', tone: '#303228' },
    { id: 'pk-2', title: 'Unboxing Ritual', tone: '#343028' },
    { id: 'pk-3', title: 'Sustainable Luxury', tone: '#2e3228' },
  ],
};

export const CDS_STORY_PROJECTIONS = [
  'Brand World',
  'Golden Build',
  'Packaging Concept',
  'Timeline',
  'Sketches',
] as const;
