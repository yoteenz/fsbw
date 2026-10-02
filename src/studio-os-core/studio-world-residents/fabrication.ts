import type {
  FabricationStatus,
  FabricationSheetKind,
  ReferenceAngleRequirement,
  ReferenceAngleRequirementId,
} from './types';

export const FABRICATION_STATUS_VALUES: readonly FabricationStatus[] = [
  'NOT_STARTED',
  'CANON_DRAFT',
  'CANON_APPROVED',
  'PHYSICAL_BRIEF_DRAFT',
  'PHYSICAL_BRIEF_APPROVED',
  'REFERENCE_PACK_PENDING',
  'REFERENCE_PACK_APPROVED',
  'UE_RECONSTRUCTION_PENDING',
  'UE_RECONSTRUCTION_IN_PROGRESS',
  'UE_RECONSTRUCTION_APPROVED',
  'VOICE_PENDING',
  'VOICE_APPROVED',
  'WORLD_INTEGRATION_PENDING',
  'WORLD_READY',
] as const;

export const REFERENCE_ANGLE_REQUIREMENTS: readonly {
  id: ReferenceAngleRequirementId;
  label: string;
}[] = [
  { id: 'FRONTAL_CLOSEUP_NEUTRAL', label: 'Frontal close-up neutral' },
  { id: 'FRONTAL_CLOSEUP_SMILING', label: 'Frontal close-up smiling' },
  { id: 'LEFT_THREE_QUARTER_CLOSEUP', label: 'Left 3/4 close-up' },
  { id: 'RIGHT_THREE_QUARTER_CLOSEUP', label: 'Right 3/4 close-up' },
  { id: 'LEFT_PROFILE', label: 'Left profile' },
  { id: 'RIGHT_PROFILE', label: 'Right profile' },
  { id: 'FRONT_FULL_BODY', label: 'Front full body' },
  { id: 'THREE_QUARTER_FULL_BODY', label: '3/4 full body' },
  { id: 'PROFILE_FULL_BODY', label: 'Profile full body' },
  { id: 'SEATED_WORKING', label: 'Seated working shot' },
  { id: 'EXPRESSIVE_CANDID', label: 'Expressive candid shot' },
] as const;

export const FABRICATION_SHEET_KINDS: readonly FabricationSheetKind[] = [
  'CANON_CHARACTER_SHEET',
  'PHYSICAL_FABRICATION_BRIEF',
  'UE_METAHUMAN_ANGLE_PACK',
  'PERFORMANCE_CASTING_SHEET',
  'DOCUMENTARY_PERFORMANCE_PROFILE',
] as const;

export function isValidFabricationStatus(value: string): value is FabricationStatus {
  return (FABRICATION_STATUS_VALUES as readonly string[]).includes(value);
}

export function buildDefaultReferenceAngleChecklist(): ReferenceAngleRequirement[] {
  return REFERENCE_ANGLE_REQUIREMENTS.map((r) => ({
    id: r.id,
    label: r.label,
    status: 'pending' as const,
  }));
}

export function buildDefaultFabricationSheets(): Record<FabricationSheetKind, import('./types').FabricationSheetStatus> {
  return {
    CANON_CHARACTER_SHEET: 'not_started',
    PHYSICAL_FABRICATION_BRIEF: 'not_started',
    UE_METAHUMAN_ANGLE_PACK: 'not_started',
    PERFORMANCE_CASTING_SHEET: 'not_started',
    DOCUMENTARY_PERFORMANCE_PROFILE: 'not_started',
  };
}
