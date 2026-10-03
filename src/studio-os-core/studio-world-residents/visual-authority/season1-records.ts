import { SEASON1_ENSEMBLE_RESIDENTS } from '../season1-ensemble/residents';
import { SEASON1_SUPERSEDED_CANON } from '../season1-ensemble/superseded-canon';
import { SEASON1_WORK_UNIFORM_SYSTEM } from '../season1-ensemble/uniform-system';
import type { ResidentId } from '../types';
import {
  INGEST2_IMPORTED_AT,
  INGEST2_SOURCE,
  bindAssetFields,
  listIngestedAssetsForResident,
  mapPackageStatusToAuthorityStatus,
} from './season1-ingest-bindings';
import type {
  ResidentVisualAuthorityBundle,
  ResidentVisualAuthorityRecord,
  VisualAuthorityType,
  VisualFabricationReadiness,
} from './types';

const IMPORTED_AT = INGEST2_IMPORTED_AT;
const SOURCE = INGEST2_SOURCE;

function vaId(residentId: ResidentId, type: VisualAuthorityType): string {
  return `va:${residentId}:${type}`;
}

/** Founder-approved visual continuity extensions (not duplicated personality canon). */
const VISUAL_EXTENSIONS: Record<
  ResidentId,
  {
    hairAuthority: string;
    wardrobeAuthority: string;
    faceAuthority?: string;
    bodyAuthorityExtra?: string;
    signedNotes?: string;
    competencyNotes?: string;
    supersededRefIds?: string[];
  }
> = {
  'SW-RESIDENT-001': {
    hairAuthority: 'Polished dark updo / sophisticated feminine treatment',
    wardrobeAuthority:
      'Ivory sculptural tailoring; corset-like structured bodice; wide-leg trouser; long ivory outer layer; heels; feminine power — not Zuri-style avant-garde tailoring',
    signedNotes: 'Elegant restrained signature “Etta Vale”; possible dry aside “Satisfied?”',
    competencyNotes: 'Creative director presence — final visual judgment, poised authority in studio context',
  },
  'SW-RESIDENT-002': {
    hairAuthority: 'Short edgy black cut; directional; youthful; not generic corporate bob',
    wardrobeAuthority:
      'Taupe/stone/chocolate asymmetric tailoring; sculpted lapels; wide trouser; modern pointed footwear; editorial wearable fashion strategist lane',
    signedNotes: 'Small neat “Zuri Xu”; possible “Done.” / “Approved.”',
    competencyNotes: 'Strategy director — client intelligence, office guide, directional but professional',
    supersededRefIds: ['zuri-hale-surname'],
  },
  'SW-RESIDENT-003': {
    hairAuthority: 'Extremely long locs — canonical natural-habitat direction; do not shorten unless explicit scene continuity',
    wardrobeAuthority:
      'Loose ivory linen shirt; burgundy/wine relaxed tailored trousers; brown boots; subtle jewelry; warm relaxed romantic bohemian',
    signedNotes: 'Loose warm “Jules Mercer :)”; possible playful contact beat — not predatory framing',
    competencyNotes: 'Front office / concierge — hospitality, warmth, tenant relations body language',
  },
  'SW-RESIDENT-004': {
    hairAuthority: 'Neat, minimal grooming consistent with understated systems dad lane',
    wardrobeAuthority:
      'Muted brown/charcoal jacket; dark knit; pleated gray-brown trousers; dark minimal shoes; intentionally plain repetitive wardrobe',
    signedNotes: 'Plain minimal “Noa Kline”; possible “Done.” / “Is this necessary?”',
    competencyNotes: 'Systems architect — Studio OS liaison; surgical minimal presence at work',
    bodyAuthorityExtra: 'Heritage Japanese with Okinawan/Ryukyuan roots — culture via life not costume wardrobe',
  },
  'SW-RESIDENT-005': {
    hairAuthority: 'Longer romantic wavy hair',
    wardrobeAuthority:
      'Burgundy/oxblood long patterned coat; dark silk shirt; tailored dark trousers; boots; sensual masculine jewelry; decadent bohemian aristocrat',
    signedNotes: 'Beautiful expressive “Caspian Reed”; possible flourish — not vampire/fantasy prince',
    competencyNotes: 'World director — environmental storyteller; spatial narrative and atmosphere in frame',
  },
  'SW-RESIDENT-006': {
    hairAuthority: 'Reddish-brown hair; practical updo / clip; tortoiseshell glasses remain important',
    faceAuthority: 'Heavy freckles; intentional grooming; not frumpy or generic pretty redhead',
    wardrobeAuthority:
      'Crisp white collared shirt; refined olive/graphite/stone utility jacket; high-waisted technical trousers; refined work boots',
    signedNotes: 'Careful modest signature; possible correction arrow / micro-note',
    competencyNotes: 'Fabrication lead — character lab, tools, material focus; precision utilitarian competency portrait',
    bodyAuthorityExtra: 'Tall lanky slightly awkward white woman — already beautiful; glamour is alternate mode only',
  },
  'SW-RESIDENT-007': {
    hairAuthority: 'Mature salt-and-pepper curls',
    faceAuthority: 'Fuller face; commanding; lived-in',
    bodyAuthorityExtra:
      'Age 54; larger-bodied; substantial; broad chest; broad shoulders — never slim young fashion-boy Marlowe',
    wardrobeAuthority:
      'Burgundy, black, antique gold; richly patterned scarf/textiles; rings/jewelry; luxury comfort; off-duty cultural icon hybrid',
    signedNotes: 'Large dramatic “Marlowe Saint”; possible “You’re welcome.”',
    competencyNotes: 'Casting director — performance design, persona mapping, seasoned authority',
    supersededRefIds: ['marlowe-slender-young'],
  },
  'SW-RESIDENT-008': {
    hairAuthority: 'Dark wavy hair; controlled stubble; mature Mediterranean grooming',
    wardrobeAuthority:
      'Deep burgundy velvet jacket; black silk/dark shirt; dark tailored trousers; polished loafer; restrained signet/ring',
    signedNotes: 'ONLY “Regards, EV” with underline beneath EV — never “Elio Vahn” as portrait signature',
    competencyNotes: 'Tenancy / expansion — strategic business development presence; controlled unreadable polish',
  },
};

function baseBody(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number], extra?: string): string {
  const pc = record.physicalCanon;
  return [pc.height, pc.weightApprox, pc.build, pc.ethnicityPresentation, extra].filter(Boolean).join('; ');
}

function buildNaturalHabitat(
  record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]
): ResidentVisualAuthorityRecord {
  const ext = VISUAL_EXTENSIONS[record.id];
  const base: ResidentVisualAuthorityRecord = {
    id: vaId(record.id, 'NATURAL_HABITAT_FULL_BODY'),
    residentId: record.id,
    authorityType: 'NATURAL_HABITAT_FULL_BODY',
    status: 'FOUNDER_APPROVED',
    canonVersion: 'season1-v1',
    isPrimaryIdentityAuthority: true,
    identityLocked: true,
    faceAuthority: ext.faceAuthority ?? `${record.visualEssence.join(', ')}; ${record.physicalCanon.ethnicityPresentation}`,
    bodyAuthority: baseBody(record, ext.bodyAuthorityExtra),
    hairAuthority: ext.hairAuthority,
    wardrobeAuthority: `${record.naturalWardrobeAuthority}: ${ext.wardrobeAuthority}`,
    allowedVariation: ['Scene-specific wardrobe swaps off-duty', 'Documentary lighting only — not identity change'],
    prohibitedDrift: record.antiFlattening,
    notes: record.naturalWardrobeNotes.join(' '),
    source: SOURCE,
    founderApproved: true,
    importedAt: IMPORTED_AT,
  };
  const [asset] = listIngestedAssetsForResident(record.id, 'natural-authority');
  return asset ? bindAssetFields(base, asset) : base;
}

function buildSignedPortrait(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord {
  const ext = VISUAL_EXTENSIONS[record.id];
  return {
    id: vaId(record.id, 'SIGNED_WALL_PORTRAIT'),
    residentId: record.id,
    authorityType: 'SIGNED_WALL_PORTRAIT',
    status: 'FOUNDER_APPROVED',
    canonVersion: 'season1-v1',
    isPrimaryIdentityAuthority: false,
    identityLocked: true,
    faceAuthority: 'Direct-camera essence — separate from full-body natural habitat or competency portrait',
    notes: `${record.signedPortraitBehavior}. ${ext.signedNotes ?? ''}`.trim(),
    prohibitedDrift: record.antiFlattening,
    source: SOURCE,
    founderApproved: true,
    importedAt: IMPORTED_AT,
  };
}

function buildRoleCompetency(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord {
  const ext = VISUAL_EXTENSIONS[record.id];
  return {
    id: vaId(record.id, 'ROLE_COMPETENCY_FULL_BODY'),
    residentId: record.id,
    authorityType: 'ROLE_COMPETENCY_FULL_BODY',
    status: 'FOUNDER_APPROVED',
    canonVersion: 'season1-v1',
    isPrimaryIdentityAuthority: false,
    identityLocked: false,
    wardrobeAuthority: `Role-aligned presentation for ${record.role} — may echo natural lane but demonstrates competency context`,
    notes: `${ext.competencyNotes ?? record.clientValue}. Question: “Why are you here, and how do you operate?”`,
    prohibitedDrift: record.antiFlattening,
    source: SOURCE,
    founderApproved: true,
    importedAt: IMPORTED_AT,
  };
}

function buildCloseups(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord[] {
  const assets = listIngestedAssetsForResident(record.id, 'closeups');
  return assets.map((asset, index) => {
    const suffix = String(index + 1).padStart(2, '0');
    const base: ResidentVisualAuthorityRecord = {
      id: `va:${record.id}:IDENTITY_CLOSEUP:${suffix}`,
      residentId: record.id,
      authorityType: 'IDENTITY_CLOSEUP',
      status: mapPackageStatusToAuthorityStatus(asset.packageStatus, 'IDENTITY_CLOSEUP'),
      canonVersion: 'season1-v1',
      isPrimaryIdentityAuthority: false,
      identityLocked: asset.packageStatus === 'FOUNDER_APPROVED_REFERENCE',
      faceAuthority: 'Identity continuity close-up — not a complete MetaHuman angle pack',
      prohibitedDrift: record.antiFlattening,
      source: SOURCE,
      founderApproved:
        asset.packageStatus === 'FOUNDER_APPROVED_REFERENCE' || asset.packageStatus === 'FOUNDER_APPROVED',
      importedAt: IMPORTED_AT,
      notes:
        asset.packageStatus === 'REFERENCE_ONLY'
          ? 'Retained reference; manifest does not promote a single sole face authority over siblings.'
          : undefined,
    };
    return bindAssetFields(base, asset);
  });
}

function buildAnglePack(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord {
  const closeups = listIngestedAssetsForResident(record.id, 'closeups');
  return {
    id: vaId(record.id, 'IDENTITY_ANGLE_PACK'),
    residentId: record.id,
    authorityType: 'IDENTITY_ANGLE_PACK',
    status: closeups.length > 0 ? 'PROVISIONAL' : 'PROVISIONAL',
    canonVersion: 'season1-v1',
    isPrimaryIdentityAuthority: false,
    identityLocked: false,
    notes: closeups.length
      ? `Partial identity references ingested (${closeups.length} close-up(s)). Full angle pack NOT complete — do not mark anglesComplete.`
      : 'Angle pack slot reserved for facial/body continuity (MetaHuman/UE).',
    prohibitedDrift: record.antiFlattening,
    source: SOURCE,
    founderApproved: false,
    importedAt: IMPORTED_AT,
  };
}

function buildWorkUniformRef(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord {
  const customization = SEASON1_WORK_UNIFORM_SYSTEM.customizationExamples[record.id];
  const base: ResidentVisualAuthorityRecord = {
    id: vaId(record.id, 'WORK_UNIFORM_REFERENCE'),
    residentId: record.id,
    authorityType: 'WORK_UNIFORM_REFERENCE',
    status: 'CONCEPT_LOCKED_VISUAL_PENDING',
    canonVersion: 'season1-v1',
    isPrimaryIdentityAuthority: false,
    identityLocked: false,
    wardrobeAuthority: `Shared SW uniform system — personalize only: ${customization}`,
    notes: `${SEASON1_WORK_UNIFORM_SYSTEM.summary}. Final uniform visual NOT founder-approved; candidate imagery is CONCEPT_REFERENCE_ONLY.`,
    prohibitedDrift: ['Eight unrelated outfits with SW badge only', 'Replacing natural habitat as default identity'],
    source: SOURCE,
    founderApproved: false,
    importedAt: IMPORTED_AT,
  };
  const [asset] = listIngestedAssetsForResident(record.id, 'work-uniform-candidates');
  return asset ? bindAssetFields(base, asset) : base;
}

function buildAlternateModes(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord[] {
  const assets = listIngestedAssetsForResident(record.id, 'alternate-modes');
  return assets.map((asset, index) => {
    const isIonaGlam = record.id === 'SW-RESIDENT-006';
    const authorityType: VisualAuthorityType = isIonaGlam ? 'GLAMOUR_OR_ALTERNATE_MODE' : 'ALTERNATE_MODE';
    const base: ResidentVisualAuthorityRecord = {
      id: `va:${record.id}:${authorityType}:${String(index + 1).padStart(2, '0')}`,
      residentId: record.id,
      authorityType,
      status: mapPackageStatusToAuthorityStatus(asset.packageStatus, authorityType),
      canonVersion: 'season1-v1',
      isPrimaryIdentityAuthority: false,
      identityLocked: false,
      notes: isIonaGlam
        ? `${record.glamourArc?.principle ?? ''} MUST NOT replace natural Precision Utilitarian authority.`
        : 'Alternate mode reference — not primary identity.',
      prohibitedDrift: isIonaGlam
        ? ['Permanent glam makeover endpoint', 'Ugly-duckling reveal', ...record.antiFlattening]
        : ['Replacing natural-habitat primary authority', ...record.antiFlattening],
      source: SOURCE,
      founderApproved: asset.packageStatus === 'ALTERNATE_MODE_REFERENCE',
      importedAt: IMPORTED_AT,
    };
    return bindAssetFields(base, asset);
  });
}

function buildSupersededRefs(residentId: ResidentId, refIds: string[] | undefined): ResidentVisualAuthorityRecord[] {
  if (!refIds?.length) return [];
  return refIds.flatMap((refId) => {
    const entry = SEASON1_SUPERSEDED_CANON.find((s) => s.id === refId);
    if (!entry) return [];
    return [
      {
        id: `va:${residentId}:SUPERSEDED:${refId}`,
        residentId,
        authorityType: 'SUPERSEDED_REFERENCE' as const,
        status: 'REFERENCE_ONLY' as const,
        canonVersion: 'season1-v1' as const,
        isPrimaryIdentityAuthority: false,
        identityLocked: false,
        notes: `Superseded: ${entry.label} → active: ${entry.supersededBy}`,
        supersedes: [entry.label],
        supersededBy: entry.supersededBy,
        prohibitedDrift: [`Using ${entry.label} as default visual authority`],
        source: SOURCE,
        founderApproved: false,
        importedAt: IMPORTED_AT,
      },
    ];
  });
}

function fabricationReadinessFor(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): VisualFabricationReadiness {
  const hasNatural = listIngestedAssetsForResident(record.id, 'natural-authority').length > 0;
  const closeups = listIngestedAssetsForResident(record.id, 'closeups');
  return {
    portraitLocked: closeups.some((c) => c.packageStatus === 'FOUNDER_APPROVED_REFERENCE'),
    bodyLocked: hasNatural,
    anglesPartial: closeups.length > 0,
    anglesComplete: false,
    uePending: true,
    metahumanPending: true,
    ueReconstructed: false,
  };
}

function buildAllForResident(record: (typeof SEASON1_ENSEMBLE_RESIDENTS)[number]): ResidentVisualAuthorityRecord[] {
  const ext = VISUAL_EXTENSIONS[record.id];
  return [
    buildNaturalHabitat(record),
    buildSignedPortrait(record),
    buildRoleCompetency(record),
    buildAnglePack(record),
    ...buildCloseups(record),
    buildWorkUniformRef(record),
    ...buildAlternateModes(record),
    ...buildSupersededRefs(record.id, ext.supersededRefIds),
  ];
}

export const SEASON1_VISUAL_AUTHORITY_RECORDS: ResidentVisualAuthorityRecord[] =
  SEASON1_ENSEMBLE_RESIDENTS.flatMap(buildAllForResident);

export const SEASON1_VISUAL_AUTHORITY_BY_ID: Record<string, ResidentVisualAuthorityRecord> =
  Object.fromEntries(SEASON1_VISUAL_AUTHORITY_RECORDS.map((r) => [r.id, r]));

export const SEASON1_VISUAL_AUTHORITY_BUNDLES: ResidentVisualAuthorityBundle[] =
  SEASON1_ENSEMBLE_RESIDENTS.map((record) => {
    const records = buildAllForResident(record);
    const primary = records.find(
      (r) => r.authorityType === 'NATURAL_HABITAT_FULL_BODY' && r.isPrimaryIdentityAuthority
    )!;
    return {
      residentId: record.id,
      visualAuthorityRefs: records.map((r) => r.id),
      primaryNaturalHabitatAuthorityId: primary.id,
      fabricationReadiness: fabricationReadinessFor(record),
    };
  });

export function getVisualAuthorityBundle(residentId: ResidentId): ResidentVisualAuthorityBundle | undefined {
  return SEASON1_VISUAL_AUTHORITY_BUNDLES.find((b) => b.residentId === residentId);
}

export function getVisualAuthorityRefsForResident(residentId: ResidentId): string[] {
  return getVisualAuthorityBundle(residentId)?.visualAuthorityRefs ?? [];
}

export function getPrimaryNaturalHabitatAuthority(
  residentId: ResidentId
): ResidentVisualAuthorityRecord | undefined {
  const bundle = getVisualAuthorityBundle(residentId);
  if (!bundle) return undefined;
  return SEASON1_VISUAL_AUTHORITY_BY_ID[bundle.primaryNaturalHabitatAuthorityId];
}

export function listVisualAuthoritiesForResident(residentId: ResidentId): ResidentVisualAuthorityRecord[] {
  const refs = getVisualAuthorityRefsForResident(residentId);
  return refs.map((id) => SEASON1_VISUAL_AUTHORITY_BY_ID[id]).filter(Boolean);
}
