import type { StudioWorldIconDefinition } from '../studio-world-icon-system/StudioWorldIconDefinition';
import { registerIcon, type RegisterIconResult } from '../studio-world-icon-system/StudioWorldIconRegistry';
import type { IconManufacturingCertificationStage } from './IconSheetProfiles';

export type IconCertificationRecord = {
  iconId: string;
  stage: IconManufacturingCertificationStage;
  updatedAt: string;
  updatedBy: string;
  notes: string;
};

const CERTIFICATION_STORAGE_KEY = 'studio-world:icon-manufacturing-certification';

export function loadCertificationRecords(): Record<string, IconCertificationRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CERTIFICATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, IconCertificationRecord>) : {};
  } catch {
    return {};
  }
}

export function saveCertificationRecords(records: Record<string, IconCertificationRecord>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CERTIFICATION_STORAGE_KEY, JSON.stringify(records));
}

export function setIconCertificationStage(
  iconId: string,
  stage: IconManufacturingCertificationStage,
  notes = '',
  updatedBy = 'founder',
): IconCertificationRecord {
  const records = loadCertificationRecords();
  const record: IconCertificationRecord = {
    iconId,
    stage,
    updatedAt: new Date().toISOString(),
    updatedBy,
    notes,
  };
  records[iconId] = record;
  saveCertificationRecords(records);
  return record;
}

export function getIconCertificationStage(iconId: string): IconManufacturingCertificationStage {
  return loadCertificationRecords()[iconId]?.stage ?? 'draft';
}

export function canPromoteToProduction(stage: IconManufacturingCertificationStage): boolean {
  return stage === 'certified' || stage === 'founder-approved';
}

/** Register certified icons into StudioWorldIconRegistry — founder-approved only. */
export function registerCertifiedIconToProduction(
  definition: StudioWorldIconDefinition,
  requiredStage: IconManufacturingCertificationStage = 'certified',
): RegisterIconResult {
  const stage = getIconCertificationStage(definition.id);
  if (stage !== requiredStage && stage !== 'founder-approved' && stage !== 'certified') {
    return {
      ok: false,
      code: 'DUPLICATE_ID',
      message: `Icon ${definition.id} not certified (stage: ${stage})`,
    };
  }
  return registerIcon({
    ...definition,
    certification: 'certified',
    status: 'active',
    version: 'certified',
  });
}

export const CERTIFICATION_PIPELINE: IconManufacturingCertificationStage[] = [
  'draft',
  'calibrated',
  'qa',
  'founder-approved',
  'certified',
  'production',
  'deprecated',
  'archived',
];
