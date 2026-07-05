import { loadWorkspace } from '../workspace/loader';
import type { WorkspaceSchema } from '../workspace/types';
import type { HeadquartersProfile, HeadquartersTransitionStyle } from './types';

const STATIC_PROFILES: Record<string, Partial<HeadquartersProfile>> = {
  'frontal-slayer': {
    industryLabel: 'LUXURY BEAUTY',
    maturityTone: 'ESTABLISHED EDITORIAL HOUSE',
    cultureTone: 'HANDCRAFTED · TRUST · MARBLE & GLASS',
    transitionStyle: 'glass-hallway',
    travelCaption: 'Crossing the champagne glass corridor toward the beauty headquarters…',
    revealCaption: 'Marble atrium · cherry accent · editorial light fills the lobby.',
    ambientCues: [
      { id: 'fs-1', label: 'Stylists preparing lace mastery assets', motion: 'production' },
      { id: 'fs-2', label: 'Glass reflections on marble floors', motion: 'reflection' },
      { id: 'fs-3', label: 'Brand displays updating launch week', motion: 'display' },
    ],
    lightingGradient: 'linear-gradient(165deg, #faf8f5 0%, rgba(235,28,36,0.08) 45%, #fff 100%)',
    exteriorAccent: '#EB1C24',
  },
  'ai-media': {
    industryLabel: 'MODERN PUBLISHING',
    maturityTone: 'RAPID EDITORIAL OPERATIONS',
    cultureTone: 'INDEX · RITUAL · READER TRUST',
    transitionStyle: 'skybridge',
    travelCaption: 'Walking the skybridge to the NDXBOOK newsroom tower…',
    revealCaption: 'Indigo glass · editorial boards alive · pages in motion.',
    ambientCues: [
      { id: 'am-1', label: 'Editorial board reviewing Page 028', motion: 'display' },
      { id: 'am-2', label: 'Publishing wing scheduling releases', motion: 'walk' },
      { id: 'am-3', label: 'Render queue processing voice generation', motion: 'production' },
    ],
    lightingGradient: 'linear-gradient(165deg, #eef2ff 0%, rgba(99,102,241,0.12) 50%, #fff 100%)',
    exteriorAccent: '#6366F1',
  },
  'vxd-inc': {
    industryLabel: 'EXECUTIVE INNOVATION',
    maturityTone: 'PLATFORM GOVERNANCE',
    cultureTone: 'PORTFOLIO INTELLIGENCE · STEWARDSHIP',
    transitionStyle: 'elevator',
    travelCaption: 'Executive elevator ascending to the innovation headquarters…',
    revealCaption: 'Slate glass · portfolio intelligence · quiet executive motion.',
    ambientCues: [
      { id: 'vxd-1', label: 'Studio Intelligence cross-workspace insights', motion: 'display' },
      { id: 'vxd-2', label: 'Executive availability indicators updating', motion: 'glow' },
      { id: 'vxd-3', label: 'Knowledge walls indexing portfolio learning', motion: 'reflection' },
    ],
    lightingGradient: 'linear-gradient(165deg, #0f172a 0%, rgba(235,28,36,0.06) 40%, #1e293b 100%)',
    exteriorAccent: '#EB1C24',
  },
  'all-in-one-enterprise': {
    industryLabel: 'ENTERPRISE OPERATIONS',
    maturityTone: 'MULTI-BRAND HOLDING',
    cultureTone: 'SHARED OS · ISOLATED DATA · SCALE',
    transitionStyle: 'courtyard-walk',
    travelCaption: 'Courtyard walk through the enterprise operations campus…',
    revealCaption: 'Blue glass campus · operations already in motion before you arrive.',
    ambientCues: [
      { id: 'aio-1', label: 'CoS coordinating portfolio walkthrough', motion: 'walk' },
      { id: 'aio-2', label: 'Enterprise dashboards refreshing health', motion: 'display' },
      { id: 'aio-3', label: 'Onboarding intelligence configuring DNA', motion: 'production' },
    ],
    lightingGradient: 'linear-gradient(165deg, #eff6ff 0%, rgba(37,99,235,0.1) 50%, #fff 100%)',
    exteriorAccent: '#2563EB',
  },
};

function inferTransitionStyle(schema: WorkspaceSchema): HeadquartersTransitionStyle {
  const industry = schema.metadata.industry ?? '';
  if (industry.includes('beauty') || industry.includes('luxury')) return 'glass-hallway';
  if (industry.includes('media') || industry.includes('publishing')) return 'skybridge';
  if (industry.includes('platform')) return 'elevator';
  if (industry.includes('enterprise')) return 'courtyard-walk';
  return 'atrium';
}

function inferMaturity(schema: WorkspaceSchema): string {
  if (schema.status === 'placeholder') return 'EMERGING ORGANIZATION';
  if (schema.metadata.tags.includes('pilot')) return 'REFERENCE PILOT';
  return 'OPERATIONAL HEADQUARTERS';
}

export function resolveHeadquartersProfile(workspaceId: string): HeadquartersProfile {
  const loaded = loadWorkspace(workspaceId);
  const schema = loaded?.schema;
  const staticPartial = STATIC_PROFILES[workspaceId] ?? {};

  const displayName = schema?.displayName ?? workspaceId.toUpperCase();
  const accent = schema?.colors.primary ?? '#6366F1';
  const industry = schema?.metadata.industry?.replace(/-/g, ' ').toUpperCase() ?? 'ORGANIZATION';

  const transitionStyle =
    staticPartial.transitionStyle ??
    (schema ? inferTransitionStyle(schema) : ('soft-zoom' as HeadquartersTransitionStyle));

  return {
    workspaceId,
    industryLabel: staticPartial.industryLabel ?? industry,
    maturityTone: staticPartial.maturityTone ?? (schema ? inferMaturity(schema) : 'NEW HEADQUARTERS'),
    cultureTone: staticPartial.cultureTone ?? schema?.brandVoice?.slice(0, 48) ?? 'ORGANIZATIONAL IDENTITY',
    transitionStyle,
    travelCaption:
      staticPartial.travelCaption ??
      `Traveling through Studio Campus toward ${displayName} headquarters…`,
    revealCaption:
      staticPartial.revealCaption ??
      `${displayName} exterior emerges · brand atmosphere adapts · the organization is already operating.`,
    ambientCues: staticPartial.ambientCues ?? [
      { id: 'gen-1', label: 'Executive activity in the atrium', motion: 'walk' },
      { id: 'gen-2', label: 'Digital displays updating priorities', motion: 'display' },
      { id: 'gen-3', label: 'Ambient light shifting to brand palette', motion: 'glow' },
    ],
    lightingGradient:
      staticPartial.lightingGradient ??
      `linear-gradient(165deg, #fff 0%, ${accent}14 55%, #fafafa 100%)`,
    exteriorAccent: staticPartial.exteriorAccent ?? accent,
  };
}
