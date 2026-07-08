export const STUDIO_MUSEUM_ACCENT = '#9B7BB8';
export const STUDIO_MUSEUM_STORAGE_KEY = 'adminStudioMuseum_v1';

export const MUSEUM_PHILOSOPHY = [
  'Warehouse™ builds the future. Museum™ preserves it.',
  'Every Golden Build™, launch, and milestone becomes an immersive exhibit — not a screenshot folder.',
  'Walking through Studio Museum™ should feel like your company\'s visual autobiography.',
] as const;

export const LEGACY_WALL_KIND_META: Record<
  string,
  { icon: string; frameClass: string }
> = {
  'first-sale': { icon: '🏆', frameClass: 'sm-legacy--gold' },
  'first-launch': { icon: '🚀', frameClass: 'sm-legacy--launch' },
  'golden-build': { icon: '💎', frameClass: 'sm-legacy--diamond' },
  'headquarters-complete': { icon: '🏢', frameClass: 'sm-legacy--hq' },
  'campaign-of-year': { icon: '🎬', frameClass: 'sm-legacy--campaign' },
  'customer-milestone': { icon: '⭐', frameClass: 'sm-legacy--star' },
  'revenue-milestone': { icon: '💰', frameClass: 'sm-legacy--revenue' },
  'founder-milestone': { icon: '✍️', frameClass: 'sm-legacy--founder' },
};

export const REPLAY_PIPELINE_LABELS = [
  'Founder Intent™',
  'Creative Direction™',
  'Mood Wall™',
  'Approvals™',
  'Scene Generation™',
  'Golden Build™',
  'Launch™',
] as const;
