/** Design DNA & Canon System — permanent creative compass for Frontal Slayer Headquarters. */

export const DESIGN_DNA_CANON_ID = 'design-dna-canon';
export const DESIGN_DNA_CANON_VERSION = '1.0.0';
export const DESIGN_DNA_CANON_STORAGE_KEY = 'studioOsDesignDnaCanon_v1';

export const DESIGN_DNA_PHILOSOPHY = [
  'Frontal Slayer is not a website — it is a luxury digital headquarters.',
  'Every page represents a room inside the Headquarters — handcrafted · intentional.',
  'The objective is emotional consistency — not visual uniformity.',
  'Study canon pages · understand them · inherit their design language · extend naturally.',
  'Never recreate pages by measuring margins — identify visual relationships instead.',
  'Favor optical alignment over mathematical balance — luxury brands prioritize harmony by eye.',
  'Some elements should intentionally break grids if it creates a more luxurious experience.',
  'Future pages should feel as though they have always belonged inside the Headquarters.',
] as const;

export const CANON_PROTECTION_RULES = [
  'Existing Frontal Slayer pages are protected — do not modify them to satisfy future design decisions.',
  'Future pages evolve toward the canon — the canon does not evolve toward future pages.',
  'Never attempt to redesign or modernize canon pages simply for consistency.',
  'Canon pages are architectural references — not templates to copy pixel-for-pixel.',
] as const;

export const HEADQUARTERS_REVIEW_CRITERIA = [
  { id: 'luxury', label: 'LUXURY', question: 'Does this page feel handcrafted and restrained?' },
  { id: 'brand-consistency', label: 'BRAND CONSISTENCY', question: 'Does it inherit Frontal Slayer identity without cloning?' },
  { id: 'visual-hierarchy', label: 'VISUAL HIERARCHY', question: 'Is attention guided with editorial clarity?' },
  { id: 'breathing-room', label: 'BREATHING ROOM', question: 'Does negative space create calm and luxury?' },
  { id: 'editorial-composition', label: 'EDITORIAL COMPOSITION', question: 'Is the layout composed — not stacked cards?' },
  { id: 'interaction-quality', label: 'INTERACTION QUALITY', question: 'Are transitions soft · glass · intentional — never abrupt?' },
  { id: 'emotional-alignment', label: 'EMOTIONAL ALIGNMENT', question: 'Does one dominant feeling support the room\'s purpose?' },
  { id: 'optical-balance', label: 'OPTICAL BALANCE', question: 'Does it feel correct to the eye — even if measurements differ?' },
  { id: 'immersion', label: 'IMMERSION', question: 'Does entering feel like walking into another room?' },
  { id: 'design-dna-alignment', label: 'DESIGN DNA ALIGNMENT', question: 'Would anyone notice this page was built later?' },
] as const;

export const VISUAL_RELATIONSHIP_PATTERNS = [
  'Hero sections feel spacious — never cramped administrative headers.',
  'Glass panels float naturally — layered depth · not flat dashboards.',
  'Handwritten annotations guide attention — editorial · not decorative noise.',
  'Marble creates calm — white translucency · breathing room.',
  'Red accents direct the eye — cherry #EB1C24 · never scattered.',
  'Negative space creates luxury — restraint over density.',
] as const;

export const FINAL_DESIGN_TEST =
  'If this page were shown beside every existing Frontal Slayer page, would it feel like it has always lived here?';

export const DESIGN_DNA_CONNECTED_SYSTEMS = [
  'CONTENT BRAIN',
  'EXPERIENCE ARCHITECT',
  'PHOTOGRAPHY CREATIVE DNA',
  'PRODUCTION STUDIO',
  'CONCIERGE APPROVAL FLOW',
  'KNOWLEDGE HUB',
  'TUTORIAL OS',
] as const;
