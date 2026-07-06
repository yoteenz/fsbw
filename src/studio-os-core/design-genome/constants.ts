/** Design Genome V1.0 — organizational visual memory for Studio OS. */

export const DESIGN_GENOME_ID = 'design-genome';
export const DESIGN_GENOME_VERSION = '1.0.0';
export const DESIGN_GENOME_STORAGE_KEY = 'studioOsDesignGenome_v1';

export const DESIGN_GENOME_PHILOSOPHY = [
  'Do not memorize layouts — learn design thinking.',
  'Do not copy pixels — learn visual DNA.',
  'Understand WHY a page was approved — not only how it looked.',
  'The Design Genome preserves identity — never standardizes artistry.',
  'Every organization maintains its own independent genome — intelligence never leaks unless explicitly shared.',
  'Before building, consult the genome — inherit before inventing.',
  'Founder approval trains the genome naturally — no folders · no screenshots · no manual documentation.',
] as const;

export const PROMOTION_LEVELS = [
  { id: 'entire-page', label: 'ENTIRE PAGE' },
  { id: 'hero', label: 'HERO' },
  { id: 'section', label: 'SECTION' },
  { id: 'card', label: 'CARD' },
  { id: 'panel', label: 'PANEL' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'graph', label: 'GRAPH' },
  { id: 'table', label: 'TABLE' },
  { id: 'navigation', label: 'NAVIGATION' },
  { id: 'animation', label: 'ANIMATION' },
  { id: 'typography', label: 'TYPOGRAPHY' },
  { id: 'spacing-pattern', label: 'SPACING PATTERN' },
  { id: 'layout-pattern', label: 'LAYOUT PATTERN' },
  { id: 'interaction-pattern', label: 'INTERACTION PATTERN' },
] as const;

export const AUTO_TAGS = [
  'hero',
  'analytics',
  'timeline',
  'customer-experience',
  'publishing',
  'revenue',
  'dashboard',
  'glass-panels',
  'forms',
  'cards',
  'charts',
  'executive-summary',
  'luxury-layout',
  'interactive',
  'editorial',
  'organization',
  'admin',
  'website',
  'headquarters',
] as const;

export const GENOME_SCOPES = [
  { id: 'studio-os-hq', label: 'STUDIO OS HQ' },
  { id: 'customer-website', label: 'CUSTOMER WEBSITE' },
  { id: 'admin-dashboard', label: 'ADMIN DASHBOARD' },
  { id: 'ndxbook', label: 'NDXBOOK' },
  { id: 'vxd', label: 'VXD' },
  { id: 'organization', label: 'ORGANIZATION' },
] as const;

export const FOUNDER_PROMOTION_PHRASES = [
  { pattern: /this page is now canon|promote this page|love this page/i, level: 'entire-page' as const },
  { pattern: /promote this hero|keep this hero|love this hero/i, level: 'hero' as const },
  { pattern: /keep this card|this card style|promote this card/i, level: 'card' as const },
  { pattern: /this timeline|promote this timeline|benchmark timeline/i, level: 'timeline' as const },
  { pattern: /this graph|graph style everywhere|promote this graph/i, level: 'graph' as const },
  { pattern: /this interaction|love this interaction/i, level: 'interaction-pattern' as const },
  { pattern: /use this spacing|spacing going forward/i, level: 'spacing-pattern' as const },
  { pattern: /don't reuse|do not reuse|never reuse/i, level: 'entire-page' as const, deprecate: true },
] as const;

export const PRE_BUILD_QUESTION =
  'Does the Design Genome already contain an approved solution to this design problem?';

export const DESIGN_GENOME_CONNECTED_SYSTEMS = [
  'DESIGN DNA & CANON',
  'EXPERIENCE ARCHITECT',
  'COMPANY GENOME',
  'KNOWLEDGE HUB',
  'STUDIO INTELLIGENCE',
  'CONTENT BRAIN',
] as const;
