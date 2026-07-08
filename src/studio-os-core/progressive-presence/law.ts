/**
 * Article K18 — Progressive Presence™
 * Constitutional Behavioral Law #10
 */

export const ARTICLE_K18_ID = 'progressive-presence' as const;

export const ARTICLE_K18_TITLE = 'Progressive Presence™';

export const ARTICLE_K18_PREAMBLE =
  'Information should never exist simply because it exists. Information earns its presence based on the founder\'s intent. The architecture should always remain the primary experience. The interface should appear only when curiosity or interaction requires it. The environment comes first. Knowledge comes second. UI comes last.';

export const ARTICLE_K18_CORE_PRINCIPLE =
  'The architecture IS the interface. The interface should never overpower the architecture. A founder should first feel like they entered a place. Only afterward should they realize how much intelligence exists beneath it.';

export const ARTICLE_K18_DESIGN_LAW =
  'If removing a panel improves the room, remove the panel. If the founder still needs the information, let the Orb, Atlas, or intentional interaction reveal it. Beauty is revealing information at exactly the right moment.';

export const PRESENCE_LEVEL_LABELS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'Architecture™',
  1: 'Ambient™',
  2: 'Context™',
  3: 'Professional™',
  4: 'Architect™',
};

export const MAX_AMBIENT_ELEMENTS = 3;
