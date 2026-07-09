import { getBrandDnaById } from '../../brand-discovery-engine/engines/brand-dna-registry';
import { getProductDna } from '../../studio-intelligence-layer/registries/intelligence-registries';
import {
  XNI_NARRATIVE_TYPE_LABELS,
  type XniNarrativeType,
} from '../constants';
import { mutateNarrativeIntelligenceStore, readNarrativeIntelligenceStore } from '../persistence';
import type { XniNarrativeBlueprint, XniPlaygroundInput } from '../types';
import { ensureProductionGenomeForBrand } from './production-genome-registry';

const ARC_STAGES = ['Hook', 'Context', 'Tension', 'Proof', 'Resolution', 'CTA'] as const;

function headquartersRoomForType(type: XniNarrativeType, brandId: string): string {
  const rooms: Record<XniNarrativeType, string> = {
    experience: 'Grand Atrium · Experience Wing',
    episode: 'Studio Broadcast Stage',
    campaign: 'Campaign Command Gallery',
    course: 'Institute Lecture Hall',
    launch: 'Launch Observatory',
    commercial: 'Commercial Sound Stage',
    'headquarters-film': 'Executive Grand Atrium',
  };
  return `${rooms[type]} · ${brandId}`;
}

function objectiveForType(type: XniNarrativeType, topic: string): string {
  const label = XNI_NARRATIVE_TYPE_LABELS[type];
  return `Deliver a ${label} narrative that moves the audience from curiosity about "${topic}" to confident action aligned with Brand DNA.`;
}

/** Narrative Blueprint Generator™ — executive creative planning before any asset */
export function generateNarrativeBlueprint(input: XniPlaygroundInput): XniNarrativeBlueprint {
  const now = new Date().toISOString();
  const brand = getBrandDnaById(input.brandId);
  const product = getProductDna(input.companyId);
  const genome = ensureProductionGenomeForBrand(input.brandId);
  const blueprintId = `nb-${input.brandId}-${Date.now()}`;

  const audience =
    brand?.audienceProfile.primaryAudience ??
    'Executive builders seeking institutional clarity';
  const emotion = brand?.emotionalTerritory.slice(0, 2).join(' + ') ?? 'calm + intelligent';
  const hook = `What if ${input.topic} could become permanent operating intelligence — not another forgotten initiative?`;
  const opening = `Establish ${brand?.brandName ?? 'the brand'} territory: ${genome.visualLanguage}. Orb enters as ${genome.orbBehavior}.`;

  const scenes = ARC_STAGES.map((stage, i) => ({
    sceneId: `${blueprintId}-scene-${i + 1}`,
    title: `${stage} — ${input.topic}`,
    arcStage: stage,
    purpose: `${stage} beat for ${XNI_NARRATIVE_TYPE_LABELS[input.narrativeType]}`,
    environment: genome.visualLanguage,
    cameraPlan: genome.cameraStyle,
    lighting: i < 2 ? 'Daylight marble wash' : 'Focused proof lighting',
    motion: genome.motionStyle,
    proofRequired: stage === 'Proof' ? 'Evidence object on screen' : undefined,
  }));

  return {
    blueprintId,
    companyId: input.companyId,
    brandId: input.brandId,
    brandDnaRef: `brand-dna:${input.brandId}`,
    productDnaRef: product ? `product-dna:${input.companyId}` : `product-dna:${input.brandId}`,
    narrativeType: input.narrativeType,
    status: 'draft',
    topic: input.topic,
    objective: objectiveForType(input.narrativeType, input.topic),
    audience,
    desiredEmotion: emotion,
    storyArc: [...ARC_STAGES],
    hook,
    opening,
    scenes,
    environment: genome.visualLanguage,
    headquartersRoom: headquartersRoomForType(input.narrativeType, input.brandId),
    cameraPlan: genome.cameraStyle,
    lighting: 'Marble daylight base · department accent wash · proof spotlight',
    music: genome.themeMusic,
    characters: [
      { role: 'Presenter', name: brand?.brandName ?? 'Founder', function: genome.presenterStyle },
      { role: 'Guide', name: 'Orb™', function: genome.orbBehavior },
    ],
    orbRole: genome.orbBehavior,
    guestRole: input.narrativeType === 'episode' ? 'Expert witness or client story' : undefined,
    visualEffects: ['Glass refraction', 'Subtle depth parallax', 'Department color accents'],
    motion: genome.motionStyle,
    cta:
      input.narrativeType === 'commercial'
        ? 'Book / Buy — single primary action'
        : 'Approve next step · Open headquarters room · Start production after blueprint approval',
    repurposingPlan: [
      {
        itemId: `${blueprintId}-rep-1`,
        sourceMoment: 'Proof scene',
        targetFormat: 'Short-form clip',
        notes: 'Extract 30s proof moment for social',
      },
      {
        itemId: `${blueprintId}-rep-2`,
        sourceMoment: 'Hook',
        targetFormat: 'Thumbnail + headline',
        notes: 'Campaign card hero',
      },
    ],
    distributionPlan: [
      { channelId: 'hq', label: 'Headquarters', format: 'In-app experience', timing: 'Launch day' },
      { channelId: 'email', label: 'Institute', format: 'Essay + embed', timing: 'Day 2' },
      { channelId: 'social', label: 'Social', format: 'Clip + carousel', timing: 'Day 1–7' },
    ],
    successMetrics: [
      { metricId: 'approval', label: 'Blueprint approval', target: 'Founder sign-off before production' },
      { metricId: 'completion', label: 'Narrative completion', target: '≥70% watch-through' },
      { metricId: 'cta', label: 'Primary CTA', target: '≥8% click-through' },
    ],
    requiredAssets: [
      'Hero environment plate',
      'Orb dialogue script',
      'Proof object (product card / metric / testimonial)',
      'Theme music bed',
      'CTA end card',
    ],
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
  };
}

export function listNarrativeBlueprints(): XniNarrativeBlueprint[] {
  return readNarrativeIntelligenceStore().blueprintRegistry;
}

export function getNarrativeBlueprint(blueprintId: string): XniNarrativeBlueprint | undefined {
  return listNarrativeBlueprints().find((b) => b.blueprintId === blueprintId);
}

export function saveNarrativeBlueprint(blueprint: XniNarrativeBlueprint): void {
  mutateNarrativeIntelligenceStore((store) => {
    const idx = store.blueprintRegistry.findIndex((b) => b.blueprintId === blueprint.blueprintId);
    const next = [...store.blueprintRegistry];
    if (idx >= 0) next[idx] = blueprint;
    else next.unshift(blueprint);
    return { ...store, blueprintRegistry: next };
  });
}

export function submitBlueprintForApproval(blueprintId: string): XniNarrativeBlueprint | undefined {
  const blueprint = getNarrativeBlueprint(blueprintId);
  if (!blueprint) return undefined;
  const updated = { ...blueprint, status: 'pending-approval' as const, updatedAt: new Date().toISOString() };
  saveNarrativeBlueprint(updated);
  return updated;
}

export function approveNarrativeBlueprint(blueprintId: string, note?: string): XniNarrativeBlueprint | undefined {
  const blueprint = getNarrativeBlueprint(blueprintId);
  if (!blueprint) return undefined;
  const updated: XniNarrativeBlueprint = {
    ...blueprint,
    status: 'approved',
    approvalNote: note ?? 'Founder approved — production may proceed.',
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveNarrativeBlueprint(updated);
  return updated;
}

export function rejectNarrativeBlueprint(blueprintId: string, note?: string): XniNarrativeBlueprint | undefined {
  const blueprint = getNarrativeBlueprint(blueprintId);
  if (!blueprint) return undefined;
  const updated: XniNarrativeBlueprint = {
    ...blueprint,
    status: 'rejected',
    approvalNote: note ?? 'Revise narrative direction before resubmitting.',
    updatedAt: new Date().toISOString(),
  };
  saveNarrativeBlueprint(updated);
  return updated;
}
