import { buildStudioWorldIconManifest } from '../studio-world-icon-system/StudioWorldIconManifest';
import type { StudioWorldIconDefinition } from '../studio-world-icon-system/StudioWorldIconDefinition';
import {
  canPromoteToProduction,
  registerCertifiedIconToProduction,
  setIconCertificationStage,
} from './IconManufacturingCertification';
import { recordManufacturingEvent } from './IconManufacturingHistory';
import type { IconSheetProfile } from './IconSheetProfiles';

export type ProductionPromotionPlan = {
  sheetId: string;
  iconCount: number;
  certifiedCount: number;
  manifestChecksum: string;
  steps: string[];
  approved: boolean;
  founderApprovalRequired: true;
};

export type ProductionPromotionResult = {
  plan: ProductionPromotionPlan;
  registered: string[];
  skipped: string[];
  errors: string[];
};

export function buildProductionPromotionPlan(
  profile: IconSheetProfile,
  definitions: StudioWorldIconDefinition[],
  founderApproved: boolean,
): ProductionPromotionPlan {
  const manifest = buildStudioWorldIconManifest();
  const certifiedCount = definitions.filter((d) => canPromoteToProduction(
    d.certification as Parameters<typeof canPromoteToProduction>[0],
  )).length;

  return {
    sheetId: profile.id,
    iconCount: definitions.length,
    certifiedCount,
    manifestChecksum: manifest.checksum,
    steps: [
      'Certified',
      'Registry Updated',
      'Manifest Updated',
      'Version Tagged',
      'Runtime Swapped',
      'Cache Invalidated',
      'Deployment',
    ],
    approved: founderApproved,
    founderApprovalRequired: true,
  };
}

/**
 * Promote certified icons to production registry.
 * Does NOT swap Experience Lab runtime — registers metadata only until founder deploys.
 */
export function promoteCertifiedCategoryToProduction(
  profile: IconSheetProfile,
  definitions: StudioWorldIconDefinition[],
  founderApproved: boolean,
): ProductionPromotionResult {
  const registered: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  if (!founderApproved) {
    return {
      plan: buildProductionPromotionPlan(profile, definitions, false),
      registered,
      skipped: definitions.map((d) => d.id),
      errors: ['Founder approval required before production promotion'],
    };
  }

  for (const def of definitions) {
    if (!canPromoteToProduction(def.certification as Parameters<typeof canPromoteToProduction>[0])) {
      skipped.push(def.id);
      continue;
    }
    const result = registerCertifiedIconToProduction(def);
    if (result.ok) {
      registered.push(def.id);
      setIconCertificationStage(def.id, 'production', 'Promoted via manufacturing pipeline');
    } else {
      errors.push(`${def.id}: ${result.message}`);
      skipped.push(def.id);
    }
  }

  recordManufacturingEvent({
    sheetId: profile.id,
    type: 'promoted',
    actor: 'founder',
    summary: `Promoted ${registered.length} icons to production registry`,
    details: { registered, skipped, errors },
  });

  return {
    plan: buildProductionPromotionPlan(profile, definitions, true),
    registered,
    skipped,
    errors,
  };
}
