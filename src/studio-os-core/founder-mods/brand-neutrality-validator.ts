import type { IndustryPack, IndustryPackDepartmentSlot } from '../industry-packs/contract';
import type { BrandNeutralityValidationResult, BrandNeutralityViolation } from './contract';
import { FRONTAL_SLAYER_FOUNDER_MODS } from './founder-mod-registry';
import { FOUNDER_PROTECTED_SCENE_IDS } from './content-classification';

const PROTECTED_NAMES = new Set(
  FRONTAL_SLAYER_FOUNDER_MODS.map((m) => m.protectedName.toLowerCase())
);

const PROTECTED_SLOT_IDS = new Set(['atelier', 'build-a-wig-atelier', 'hair-analysis-lab', 'transformation-suite']);

function violation(
  slot: IndustryPackDepartmentSlot,
  remediation: string
): BrandNeutralityViolation {
  const mod = FRONTAL_SLAYER_FOUNDER_MODS.find(
    (m) =>
      m.customSceneId === slot.slotId ||
      m.protectedName.toLowerCase() === slot.displayName.toLowerCase()
  );
  return {
    itemId: slot.slotId,
    displayName: slot.displayName,
    owner: mod?.creatorOrganizationId ?? 'unknown-founder',
    registryClass: 'FOUNDER_CREATED_MODDED_SCENE',
    sourceLineage: mod?.lineage.join(' → ') ?? slot.slotId,
    remediation,
  };
}

export function validateOfficialPackBrandNeutrality(pack: IndustryPack): BrandNeutralityValidationResult {
  if (!pack.official) return { ok: true };

  const violations: BrandNeutralityViolation[] = [];

  for (const slot of pack.defaultDepartments) {
    const nameLower = slot.displayName.toLowerCase();
    if (PROTECTED_SLOT_IDS.has(slot.slotId) || FOUNDER_PROTECTED_SCENE_IDS.has(slot.slotId)) {
      violations.push(violation(slot, 'Remove founder-protected scene from official pack defaults.'));
      continue;
    }
    if (PROTECTED_NAMES.has(nameLower) || nameLower.includes('build-a-wig')) {
      violations.push(violation(slot, 'Remove branded founder scene from official pack defaults.'));
      continue;
    }
    if (nameLower.includes('frontal slayer')) {
      violations.push({
        itemId: slot.slotId,
        displayName: slot.displayName,
        owner: 'frontal-slayer',
        registryClass: 'FOUNDER_CREATED_MODDED_SCENE',
        sourceLineage: slot.slotId,
        remediation: 'Remove company-specific branding from official pack.',
      });
    }
  }

  if (violations.length > 0) {
    return { ok: false, code: 'INDUSTRY_PACK_NOT_BRAND_NEUTRAL', violations };
  }
  return { ok: true };
}
