import type { ResidentCanonicalIdentity } from '../types';
import { getVisualAuthorityBundle } from '../visual-authority';
import type { Season1ResidentCanonRecord } from './types';

const SYNC_TS = '2026-10-03T00:00:00.000Z';

export function ensembleRecordToIdentity(record: Season1ResidentCanonRecord): ResidentCanonicalIdentity {
  const visualBundle = getVisualAuthorityBundle(record.id);
  return {
    residentId: record.id,
    season: 1,
    displayName: record.canonicalName,
    sortOrder: parseInt(record.id.replace('SW-RESIDENT-', ''), 10),
    identityStatus: 'canonical',
    pronouns: undefined,
    ageBand: String(record.age),
    coreWorldRole: record.role,
    archetype: record.coreSentence,
    biographySummary: record.coreSentence,
    physicalDirection: {
      summary: record.visualEssence.join(' · '),
      bullets: [
        `${record.physicalCanon.height}, ${record.physicalCanon.weightApprox}, ${record.physicalCanon.build}`,
        record.physicalCanon.ethnicityPresentation,
        ...(record.physicalCanon.signatures ?? []),
      ],
      signatureStyling: `${record.naturalWardrobeAuthority} — ${record.naturalWardrobeNotes[0] ?? ''}`,
    },
    personality: {
      traits: record.personality,
      humor: record.humor,
      icks: record.icks,
      privateLifeEnergy: record.contrasts.join('; '),
      ensembleFunction: record.clientValue,
    },
    worldDepartment: record.role.split('/')[0]?.trim(),
    fabricationStatus: 'CANON_APPROVED',
    canonLifecycleStatus: 'approved',
    canonVersion: record.canonVersion,
    versionHistory: [
      {
        version: record.canonVersion,
        status: 'approved',
        changedAt: SYNC_TS,
        approvedBy: 'P0.STUDIOWORLD.SEASON1.CORE-ENSEMBLE-CANON1',
        reason: 'Founder-approved Season 1 core ensemble canon ingestion',
        previousVersion: 'v1.0.0',
        fieldsChanged: ['full_ensemble_canon'],
      },
    ],
    embodimentTargets: [
      {
        kind: 'ue_metahuman',
        status: 'NOT_STARTED',
        referenceLinks: [],
        notes: 'UE / MetaHuman is embodiment target — identity canon in season1-ensemble.',
      },
    ],
    continuityRules: [
      ...record.antiFlattening,
      'Consult season1 visual-authority records before any visual generation or embodiment.',
    ],
    memoryPolicy: `Protected open fields must remain unresolved: ${record.protectedOpenFields.join(', ')}`,
    castingRangeNotes: record.clientValue,
    visualAuthorityRefs: visualBundle?.visualAuthorityRefs,
    primaryNaturalHabitatAuthorityId: visualBundle?.primaryNaturalHabitatAuthorityId,
    visualFabricationReadiness: visualBundle?.fabricationReadiness,
    updatedAt: SYNC_TS,
  };
}
