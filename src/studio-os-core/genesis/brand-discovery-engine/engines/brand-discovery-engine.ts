import { mutateBrandDiscoveryEngineStore, readBrandDiscoveryEngineStore } from '../persistence';
import { buildAudienceDirection } from './audience-discovery-engine';
import {
  buildContentDirection,
  buildHeadquartersDirection,
  buildWebsiteDirection,
} from './content-direction-engine';
import { buildPackagingDirection } from './packaging-strategy-engine';
import type {
  XbdBrandDirections,
  XbdBrandDnaRecord,
  XbdDiscoveryInput,
  XbdDiscoverySession,
} from '../types';

function synthesizeDirectionsFromInputs(
  inputs: XbdDiscoveryInput,
  brandName: string
): XbdBrandDirections {
  const audience = inputs.audienceDetails || 'Founder-defined primary audience';
  const visual = inputs.visualPreferences.join(', ') || 'Founder visual preferences pending';

  return {
    audienceProfile: `${audience} · Psychology inferred from founder answers`,
    visualDirection: `${visual} · References: ${inputs.brandReferences.slice(0, 3).join(', ') || 'none yet'}`,
    packagingDirection: `Product: ${inputs.productDetails || 'TBD'} · Packaging cues from visual prefs`,
    contentDirection: inputs.copySamples.length
      ? `Voice derived from samples: "${inputs.copySamples[0]?.slice(0, 80)}…"`
      : 'Content voice pending copy samples',
    websiteDirection: `Website hero for ${brandName} — ${visual}`,
    headquartersDirection: `HQ expression for ${brandName} — emotional territory from founder story`,
  };
}

function draftBrandFromDiscovery(
  session: XbdDiscoverySession,
  directions: XbdBrandDirections
): XbdBrandDnaRecord {
  const name =
    session.inputs.founderAnswers['brandName'] ??
    session.inputs.founderAnswers['companyName'] ??
    'Discovered Brand';
  const brandId = `discovered-${session.sessionId.slice(0, 8)}`;
  const now = new Date().toISOString();

  return {
    brandId,
    companyId: session.companyId,
    brandName: name,
    brandPhilosophy: session.inputs.founderAnswers['philosophy'] ?? directions.audienceProfile,
    mission: session.inputs.founderAnswers['mission'] ?? 'Mission synthesized from discovery',
    vision: session.inputs.founderAnswers['vision'] ?? 'Vision synthesized from discovery',
    values: (session.inputs.founderAnswers['values'] ?? 'Integrity, Clarity, Legacy')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
    audienceProfile: {
      primaryAudience: session.inputs.audienceDetails || 'Primary audience from discovery',
      secondaryAudiences: [],
      psychology: session.inputs.founderAnswers['psychology'] ?? 'Founder-defined psychology',
      customerDesire: session.inputs.founderAnswers['desire'] ?? 'Customer desire from interview',
      identitySignals: session.inputs.visualPreferences.slice(0, 4),
    },
    emotionalTerritory: session.inputs.visualPreferences.slice(0, 4).length
      ? session.inputs.visualPreferences.slice(0, 4)
      : ['trust', 'clarity'],
    visualPersonality: session.inputs.visualPreferences.length
      ? session.inputs.visualPreferences
      : ['founder-defined'],
    writingVoice: {
      tone: session.inputs.copySamples[0] ? 'derived from samples' : 'pending',
      cadence: 'founder interview',
      vocabulary: session.inputs.copySamples.flatMap((s) => s.split(' ').slice(0, 3)).slice(0, 6),
      forbiddenLanguage: session.inputs.competitorReferences.slice(0, 3),
      sampleLine: session.inputs.copySamples[0]?.slice(0, 120) ?? directions.contentDirection,
    },
    colorSystem: {
      primary: '#EB1C24',
      secondary: '#1A1A1A',
      accent: '#C9A962',
      background: '#F8F6F3',
      textPrimary: '#1A1A1A',
      textSecondary: '#808080',
    },
    typography: {
      displayFont: '"Covered By Your Grace", sans-serif',
      labelFont: '"Futura PT Medium", sans-serif',
      bodyFont: '"Futura PT Book", sans-serif',
      displaySize: '18px',
      labelSize: '10px',
      bodySize: '14px',
    },
    materials: session.inputs.brandReferences.slice(0, 5),
    photographyStyle: directions.visualDirection,
    packagingStyle: directions.packagingDirection,
    contentStyle: directions.contentDirection,
    luxuryLevel: 70,
    positioning:
      session.inputs.founderAnswers['positioning'] ??
      `Positioning vs ${session.inputs.competitorReferences.join(', ') || 'category alternatives'}`,
    competitors: session.inputs.competitorReferences,
    antiPatterns: ['Generic SaaS dashboard', 'Discount language'],
    brandRules: ['One primary action per viewport', 'Orb speaks with evidence'],
    createdAt: now,
    updatedAt: now,
    version: '0.1.0-draft',
    status: 'draft',
  };
}

/** Brand Discovery Engine™ — Orb-led synthesis from founder evidence */
export function synthesizeBrandDirections(
  inputs: XbdDiscoveryInput,
  brandName = 'New Brand'
): XbdBrandDirections {
  return synthesizeDirectionsFromInputs(inputs, brandName);
}

export function runDiscoverySynthesis(): XbdDiscoverySession {
  const store = readBrandDiscoveryEngineStore();
  const session = store.discoverySession;
  const brandName =
    session.inputs.founderAnswers['brandName'] ??
    session.inputs.founderAnswers['companyName'] ??
    'New Brand';
  const directions = synthesizeDirectionsFromInputs(session.inputs, brandName);
  const draft = draftBrandFromDiscovery(session, directions);

  mutateBrandDiscoveryEngineStore((s) => {
    const registry = s.brandRegistry.filter((b) => b.brandId !== draft.brandId);
    return {
      ...s,
      brandRegistry: [...registry, draft],
      discoverySession: {
        ...session,
        status: 'review',
        stepIndex: 3,
        generatedDirections: directions,
        draftBrandId: draft.brandId,
        orbPrompt: `Review synthesized Brand DNA for ${brandName}. Approve or refine before canonical lock.`,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  return readBrandDiscoveryEngineStore().discoverySession;
}

export function buildDirectionsForBrand(brand: XbdBrandDnaRecord): XbdBrandDirections {
  return {
    audienceProfile: buildAudienceDirection(brand),
    visualDirection: `${brand.visualPersonality.join(', ')} · ${brand.photographyStyle}`,
    packagingDirection: buildPackagingDirection(brand),
    contentDirection: buildContentDirection(brand),
    websiteDirection: buildWebsiteDirection(brand),
    headquartersDirection: buildHeadquartersDirection(brand),
  };
}

export function getOrbPromptForStep(session: XbdDiscoverySession): string {
  const steps = [
    'Tell me why this brand exists — and who it refuses to serve.',
    'Upload assets and references that feel like you — not your competitors.',
    'Describe your audience psychology and the desire you fulfill.',
    'Review synthesized Brand DNA. What must change before approval?',
    'Brand DNA approved. Strategic intelligence is now available to all Studio OS engines.',
  ];
  return steps[Math.min(session.stepIndex, steps.length - 1)] ?? steps[0];
}
