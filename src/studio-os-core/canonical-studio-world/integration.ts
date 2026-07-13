import type { CompanyHqEditableLayer, ExperienceLabEntryContext, ExperienceLabIndustryPackOptionId } from './contract';
import { getExperienceLabPackOption } from './experience-lab-entry';
import { getIndustryPack } from '../industry-packs/industry-pack-registry';
import { planExperienceLabHeadquartersGeneration } from '../industry-packs/integration';
import { CANONICAL_DEPARTMENT_REGISTRY } from './canonical-departments-registry';

/** Layers founders may customize — everything else is canonical. */
export const COMPANY_HQ_EDITABLE_LAYERS: CompanyHqEditableLayer[] = [
  'company-hq',
  'hq-departments',
  'rooms',
  'scenes',
  'decor',
  'materials',
  'furniture',
  'lighting',
  'brand-assets',
  'architecture',
  'custom-additions',
];

/**
 * Resolve founder company HQ organization — tenant scope for customization.
 * Canonical departments use Studio World global scope, not this ID.
 */
export function resolveCompanyHqOrganizationId(fallbackOrganizationId?: string): string {
  return fallbackOrganizationId ?? 'founder-company-hq';
}

export function resolveExperienceLabEntry(input: {
  packOptionId: ExperienceLabIndustryPackOptionId;
  companyHqOrganizationId?: string;
}): { ok: true; context: ExperienceLabEntryContext } | { ok: false; code: string; message: string } {
  const option = getExperienceLabPackOption(input.packOptionId);
  if (!option) {
    return { ok: false, code: 'PACK_OPTION_UNKNOWN', message: `Unknown Industry Pack option: ${input.packOptionId}` };
  }

  const pack = getIndustryPack(option.industryPackId);
  if (!pack) {
    return { ok: false, code: 'PACK_NOT_REGISTERED', message: `Industry Pack ${option.industryPackId} not in registry.` };
  }

  return {
    ok: true,
    context: {
      selectedPackOptionId: input.packOptionId,
      industryPackId: pack.packId,
      companyHqOrganizationId: resolveCompanyHqOrganizationId(input.companyHqOrganizationId),
      canonicalDepartmentsInUse: CANONICAL_DEPARTMENT_REGISTRY.map((d) => d.departmentId),
    },
  };
}

export function planExperienceLabHeadquartersFromPack(input: {
  packOptionId: ExperienceLabIndustryPackOptionId;
  companyHqOrganizationId?: string;
}) {
  const entry = resolveExperienceLabEntry(input);
  if (!entry.ok) return entry;

  const pack = getIndustryPack(entry.context.industryPackId)!;
  const plan = planExperienceLabHeadquartersGeneration({
    pack,
    organizationId: entry.context.companyHqOrganizationId,
  });
  if (!plan.ok) return plan;

  return { ok: true as const, entry: entry.context, plan: plan.plan, pack };
}

/** @deprecated Company-based EL preview IDs — use Industry Pack selection instead. */
export const DEPRECATED_COMPANY_SELECTOR_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;

export function isDeprecatedCompanySelector(id: string): boolean {
  return (DEPRECATED_COMPANY_SELECTOR_IDS as readonly string[]).includes(id);
}
