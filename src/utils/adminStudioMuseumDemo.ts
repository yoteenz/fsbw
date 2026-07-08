import type {
  MuseumExhibit,
  MuseumLegacyWallItem,
  MuseumTimelineNode,
} from '../studio-os-core/studio-museum';

export const STUDIO_MUSEUM_SUBTITLE =
  'Permanent archive of your greatest achievements — Golden Builds™, launches, milestones, and legacy.';

export const STUDIO_MUSEUM_INHERITANCE_CHAIN =
  'Studio Warehouse™ (active) → Studio Museum™ (preserved) → Legacy Vault™ → Company Genome™';

const GRADIENTS = [
  'linear-gradient(145deg, #0d0b14 0%, #2a1f3d 45%, #9b7bb8 100%)',
  'linear-gradient(160deg, #101018 0%, #1a2838 55%, #6b8cae 100%)',
  'linear-gradient(135deg, #14100c 0%, #3d2e1a 50%, #c9a962 100%)',
  'linear-gradient(170deg, #0a0c10 0%, #243040 70%, #8ba4c4 100%)',
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % GRADIENTS.length;
  return GRADIENTS[hash]!;
}

const MANSION_TIMELINE: MuseumTimelineNode[] = [
  { id: 'mar', label: 'March', date: '2026-03-01', era: 'Genesis', summary: 'Company Genome™ seeded · first Story Table™ sketch' },
  { id: 'apr', label: 'April', date: '2026-04-01', era: 'Foundation', summary: 'Arrival Zone™ bronze arch · Mansion shell approved' },
  { id: 'may', label: 'May', date: '2026-05-01', era: 'Assembly', summary: 'Scene Stack™ 6/6 stations · Living Mood Wall™ live' },
  { id: 'launch', label: 'Launch', date: '2026-06-15', era: 'Golden Build™', summary: 'The Mansion™ public debut · 1,742 reusable assets registered' },
  { id: 'holiday', label: 'Holiday', date: '2026-11-28', era: 'Seasonal', summary: 'Holiday atmosphere pack · campaign of the year candidate' },
  { id: 'v2', label: 'Version 2', date: '2027-02-01', era: 'Evolution', summary: 'Headquarters V2 · retired environments archived to Museum' },
];

export const MUSEUM_EXHIBITS: MuseumExhibit[] = [
  {
    id: 'sm-exhibit-mansion-v1',
    type: 'historic-headquarters',
    title: 'The Mansion™',
    subtitle: 'Frontal Slayer™ Headquarters · Golden Build™ V1',
    company: 'Frontal Slayer™',
    launchDate: '2026-06-15',
    heroGradient: gradientFor('mansion'),
    heroEnvironment: 'Editorial luxury headquarters — marble, bronze arch, Story Table™ atrium',
    rooms: [
      'Arrival Zone™',
      'Story Table™',
      'Living Mood Wall™',
      'Founder Notes Desk™',
      'Creative Pipeline™',
      'Reference Library™',
    ],
    generationCostUsd: 847.2,
    revenueImpactUsd: 2840000,
    runtimeStats: { sessions: 12840, avgDurationMin: 18, reuseAssets: 1742 },
    creativeDecisions: [
      'Signature lighting: Luxury Editorial White — never flat overhead',
      'White Marble Collection as primary surface DNA',
      'Studio Orb V3 as permanent hero landmark',
      'Rejected: dark industrial shell (Genome mismatch 34%)',
    ],
    founderNotes: [
      'This headquarters must feel like walking into our brand, not opening a dashboard.',
      'Story Table is the soul — everything else supports the table.',
    ],
    moodReferences: ['Apple Park visitor center', 'Pixar atrium', 'Editorial loft photography'],
    voiceNoteLabels: ['Launch day reflection · 2:14 AM', 'Lighting approval · Apr 22'],
    originalPromptExcerpt:
      'Bronze arch arrival threshold, double-height editorial atelier, Story Table visible in distance, luxury idle atmosphere…',
    iterationCount: 47,
    approvalHistory: [
      '2026-04-18 — Shell layer approved',
      '2026-05-02 — Full Scene Stack™ 6/6 ready',
      '2026-06-14 — Golden Build™ founder sign-off',
      '2026-06-15 — Launch archived to Museum',
    ],
    sceneRecipe: [
      { role: 'Environment Shell™', assetName: 'Editorial Loft V2', version: 'v2.4' },
      { role: 'Lighting™', assetName: 'Luxury Editorial White', version: 'v1.8' },
      { role: 'Furniture™', assetName: 'Executive Glass Collection', version: 'v3.1' },
      { role: 'Materials™', assetName: 'White Marble Collection', version: 'v2.0' },
      { role: 'Atmosphere™', assetName: 'Soft Dust', version: 'v1.2' },
      { role: 'Hero Object™', assetName: 'Studio Orb V3', version: 'v3.0' },
      { role: 'Runtime™', assetName: 'Luxury Idle', version: 'v2.1' },
    ],
    assetRecipe: [
      { category: 'Environment Shells', count: 6, reusableCount: 6 },
      { category: 'Lighting Packs', count: 8, reusableCount: 8 },
      { category: 'Furniture', count: 12, reusableCount: 11 },
      { category: 'Materials', count: 24, reusableCount: 24 },
      { category: 'Atmosphere', count: 9, reusableCount: 9 },
      { category: 'Hero Objects', count: 3, reusableCount: 2 },
    ],
    companyGenomeSnapshot: 'PRESERVE EXPERTISE. BUILD LEGACY. · Editorial luxury · White marble · Bronze accents',
    marketplace: {
      downloads: 4820,
      revenueUsd: 186400,
      creator: 'Frontal Slayer™',
      forks: 312,
      companiesUsing: 847,
      communityRating: 4.92,
      evolutionBranches: ['Beauty HQ Clone', 'Creator Studio Fork', 'Agency White Label'],
    },
    timeline: MANSION_TIMELINE,
    replaySteps: [
      { id: 'intent', label: 'Founder Intent™', durationSec: 45 },
      { id: 'direction', label: 'Creative Direction™', durationSec: 120 },
      { id: 'mood', label: 'Mood Wall™', durationSec: 90 },
      { id: 'approvals', label: 'Approvals™', durationSec: 180 },
      { id: 'scene', label: 'Scene Generation™', durationSec: 240 },
      { id: 'golden', label: 'Golden Build™', durationSec: 60 },
      { id: 'launch', label: 'Launch™', durationSec: 30 },
    ],
    historianQuotes: [
      'This was your first Golden Build™ — the moment Frontal Slayer™ became a place, not a product.',
      'This launch introduced your signature lighting: Luxury Editorial White.',
      'This room became the highest-performing marketplace environment.',
      'This headquarters generated 1,742 reusable assets for every future generation.',
    ],
    tags: ['golden-build', 'headquarters', 'frontal-slayer', 'mansion', 'launch'],
    archivedAt: '2026-06-15T18:00:00.000Z',
  },
  {
    id: 'sm-exhibit-launch-campaign-01',
    type: 'launch-campaign',
    title: 'Summer Slay Launch™',
    subtitle: 'First viral campaign · 2.4M impressions',
    company: 'Frontal Slayer™',
    launchDate: '2026-07-01',
    heroGradient: gradientFor('summer-slay'),
    heroEnvironment: 'Campaign war room reconstructed — mood boards, pipeline board, distribution network',
    rooms: ['Campaign Command', 'Distribution Network', 'Screening Room'],
    generationCostUsd: 312.5,
    revenueImpactUsd: 890000,
    runtimeStats: { sessions: 4200, avgDurationMin: 12, reuseAssets: 186 },
    creativeDecisions: ['Hero talent: NOIR unit', 'Distribution: TikTok + Instagram primary'],
    founderNotes: ['First campaign where Studio OS felt like a real studio lot.'],
    moodReferences: ['Vogue summer editorial', 'Luxury campaign BTS'],
    voiceNoteLabels: ['Campaign retrospective'],
    originalPromptExcerpt: 'Summer luxury campaign headquarters, screening room glow, distribution dashboards…',
    iterationCount: 22,
    approvalHistory: ['2026-06-28 — Creative approved', '2026-07-01 — Launch archived'],
    sceneRecipe: [
      { role: 'Environment', assetName: 'Campaign Command Shell', version: 'v1.0' },
      { role: 'Lighting', assetName: 'Screening Room Warm', version: 'v1.2' },
    ],
    assetRecipe: [{ category: 'Campaign Assets', count: 48, reusableCount: 32 }],
    companyGenomeSnapshot: 'Editorial luxury · High-contrast red accent',
    timeline: [
      { id: 'plan', label: 'Planning', date: '2026-06-01', era: 'Pre-launch', summary: 'Campaign Orchestrator™ plan generated' },
      { id: 'launch', label: 'Launch', date: '2026-07-01', era: 'Live', summary: '2.4M impressions in 72 hours' },
    ],
    replaySteps: [
      { id: 'intent', label: 'Founder Intent™', durationSec: 30 },
      { id: 'direction', label: 'Creative Direction™', durationSec: 60 },
      { id: 'launch', label: 'Launch™', durationSec: 45 },
    ],
    historianQuotes: [
      'Your first campaign that proved Studio OS could ship at market speed.',
    ],
    tags: ['launch', 'campaign', 'viral'],
    archivedAt: '2026-07-01T12:00:00.000Z',
  },
  {
    id: 'sm-exhibit-first-million',
    type: 'revenue-milestone',
    title: 'First Million Dollars™',
    subtitle: 'Revenue milestone · June 2026',
    company: 'Frontal Slayer™',
    launchDate: '2026-06-22',
    heroGradient: gradientFor('first-million'),
    heroEnvironment: 'Financial milestone gallery — revenue timeline, order artifacts',
    rooms: ['Revenue Gallery', 'Order Archive'],
    generationCostUsd: 0,
    revenueImpactUsd: 1000000,
    runtimeStats: { sessions: 890, avgDurationMin: 8, reuseAssets: 0 },
    creativeDecisions: ['Milestone auto-captured by Mission Control™'],
    founderNotes: ['Quiet night. Checked dashboard. Cried a little.'],
    moodReferences: [],
    voiceNoteLabels: ['Founder voice note · milestone night'],
    originalPromptExcerpt: '',
    iterationCount: 0,
    approvalHistory: ['Auto-archived by Living History™'],
    sceneRecipe: [],
    assetRecipe: [],
    companyGenomeSnapshot: 'Build-a-Wig commerce · Premium membership · Studio OS',
    timeline: [
      { id: 'milestone', label: 'First $1M', date: '2026-06-22', era: 'Milestone', summary: 'Cumulative revenue crosses $1,000,000' },
    ],
    replaySteps: [],
    historianQuotes: ['Every empire has a first million. This one is yours.'],
    tags: ['revenue', 'milestone', 'founder'],
    archivedAt: '2026-06-22T23:59:00.000Z',
  },
  {
    id: 'sm-exhibit-brand-refresh-v2',
    type: 'brand-refresh',
    title: 'Brand Refresh™ V2',
    subtitle: 'Design Genome™ evolution · retired brand system archived',
    company: 'Frontal Slayer™',
    launchDate: '2027-02-01',
    heroGradient: gradientFor('brand-v2'),
    heroEnvironment: 'Side-by-side brand evolution — V1 marble red vs V2 bronze gold',
    rooms: ['Brand Timeline', 'Retired Systems Vault'],
    generationCostUsd: 124.0,
    revenueImpactUsd: 0,
    runtimeStats: { sessions: 2100, avgDurationMin: 14, reuseAssets: 88 },
    creativeDecisions: ['Retired: flat red panels', 'Adopted: bronze + marble depth system'],
    founderNotes: ['V1 will always live here. We do not delete — we preserve.'],
    moodReferences: ['Apple rebrand archives'],
    voiceNoteLabels: [],
    originalPromptExcerpt: 'Evolve brand system while preserving editorial luxury DNA…',
    iterationCount: 18,
    approvalHistory: ['2027-01-28 — V2 approved', 'V1 retired to Museum'],
    sceneRecipe: [{ role: 'Brand System', assetName: 'Design Genome V2', version: 'v2.0' }],
    assetRecipe: [{ category: 'Brand Kits', count: 16, reusableCount: 14 }],
    companyGenomeSnapshot: 'PRESERVE EXPERTISE. BUILD LEGACY.',
    timeline: MANSION_TIMELINE.filter((n) => n.id === 'v2' || n.id === 'launch'),
    replaySteps: [
      { id: 'direction', label: 'Creative Direction™', durationSec: 90 },
      { id: 'approvals', label: 'Approvals™', durationSec: 60 },
    ],
    historianQuotes: ['Watch the branding evolve — V1 preserved, V2 building the next chapter.'],
    tags: ['brand', 'retired', 'design-genome'],
    archivedAt: '2027-02-01T09:00:00.000Z',
  },
  {
    id: 'sm-exhibit-website-v1',
    type: 'website-version',
    title: 'Website V1',
    subtitle: 'First public storefront · Build-a-Wig launch',
    company: 'Frontal Slayer™',
    launchDate: '2025-11-01',
    heroGradient: gradientFor('website-v1'),
    heroEnvironment: 'Reconstructed mobile-first storefront — marble, NOIR hero, bag flow',
    rooms: ['Shop', 'Build-a-Wig', 'Checkout'],
    generationCostUsd: 0,
    revenueImpactUsd: 420000,
    runtimeStats: { sessions: 98400, avgDurationMin: 4, reuseAssets: 0 },
    creativeDecisions: ['Mobile-only first — desktop deferred by design'],
    founderNotes: ['The site that started everything.'],
    moodReferences: [],
    voiceNoteLabels: [],
    originalPromptExcerpt: '',
    iterationCount: 0,
    approvalHistory: ['Historic archive import'],
    sceneRecipe: [],
    assetRecipe: [{ category: 'Product Photography', count: 6, reusableCount: 6 }],
    companyGenomeSnapshot: 'Marble texture · Futura PT · Brand red #EB1C24',
    timeline: [
      { id: 'v1', label: 'Website V1', date: '2025-11-01', era: 'Origin', summary: 'First public Build-a-Wig storefront' },
    ],
    replaySteps: [],
    historianQuotes: ['Before the Mansion, there was the storefront. This is where customers first met you.'],
    tags: ['website', 'origin', 'commerce'],
    archivedAt: '2025-11-01T00:00:00.000Z',
  },
];

export const MUSEUM_LEGACY_WALL: MuseumLegacyWallItem[] = [
  {
    id: 'lw-first-sale',
    kind: 'first-sale',
    icon: '🏆',
    title: 'First Sale™',
    date: '2025-11-03',
    caption: 'ORDER #001 — NOIR unit · the beginning',
    exhibitId: 'sm-exhibit-website-v1',
  },
  {
    id: 'lw-first-launch',
    kind: 'first-launch',
    icon: '🚀',
    title: 'First Launch™',
    date: '2026-06-15',
    caption: 'The Mansion™ Golden Build™ goes live',
    exhibitId: 'sm-exhibit-mansion-v1',
  },
  {
    id: 'lw-golden-build',
    kind: 'golden-build',
    icon: '💎',
    title: 'Golden Build™',
    date: '2026-06-14',
    caption: 'Scene Stack™ 6/6 · founder sign-off',
    exhibitId: 'sm-exhibit-mansion-v1',
  },
  {
    id: 'lw-hq-complete',
    kind: 'headquarters-complete',
    icon: '🏢',
    title: 'Headquarters Complete™',
    date: '2026-06-15',
    caption: 'Creative Direction Studio™ fully operational',
    exhibitId: 'sm-exhibit-mansion-v1',
  },
  {
    id: 'lw-campaign-year',
    kind: 'campaign-of-year',
    icon: '🎬',
    title: 'Campaign of the Year™',
    date: '2026-07-01',
    caption: 'Summer Slay Launch™ · 2.4M impressions',
    exhibitId: 'sm-exhibit-launch-campaign-01',
  },
  {
    id: 'lw-first-million',
    kind: 'revenue-milestone',
    icon: '💰',
    title: 'First Million Dollars™',
    date: '2026-06-22',
    caption: 'Cumulative revenue milestone',
    exhibitId: 'sm-exhibit-first-million',
  },
  {
    id: 'lw-founder-note',
    kind: 'founder-milestone',
    icon: '✍️',
    title: 'Founder Milestone™',
    date: '2026-06-22',
    caption: 'Voice note archived — milestone night',
    exhibitId: 'sm-exhibit-first-million',
  },
];

export function buildMuseumCatalog(): MuseumExhibit[] {
  return [...MUSEUM_EXHIBITS];
}

export function getMuseumExhibitById(id: string): MuseumExhibit | null {
  return MUSEUM_EXHIBITS.find((e) => e.id === id) ?? null;
}

export function exportMuseumSnapshot() {
  const exhibits = buildMuseumCatalog();
  return {
    totalExhibits: exhibits.length,
    totalLegacyFrames: MUSEUM_LEGACY_WALL.length,
    totalPreservedAssets: exhibits.reduce((s, e) => s + e.runtimeStats.reuseAssets, 0),
    totalRevenueImpactUsd: exhibits.reduce((s, e) => s + e.revenueImpactUsd, 0),
    exhibits,
    legacyWall: MUSEUM_LEGACY_WALL,
  };
}
