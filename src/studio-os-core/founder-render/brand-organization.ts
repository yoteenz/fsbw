import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import { getOrganizationBrandVault } from '../creative-production/brand-asset-grounding/vault';

/**
 * Experience Lab preview tabs (studio-os, ndx) compile Construction Plans with their
 * companyId as organizationId. Governed Founder Render still requires vault-backed marble.
 * Inherit Frontal Slayer vault when the plan org has no vault of its own.
 */
const FOUNDER_RENDER_BRAND_VAULT_ALIASES: Record<string, string> = {
  'studio-os': 'frontal-slayer',
  ndx: 'frontal-slayer',
};

export function resolveFounderRenderBrandOrganizationId(plan: ConstructionPlan): string {
  const planOrg = plan.metadata.organizationId;
  if (getOrganizationBrandVault(planOrg).length > 0) return planOrg;

  const alias = FOUNDER_RENDER_BRAND_VAULT_ALIASES[planOrg];
  if (alias && getOrganizationBrandVault(alias).length > 0) return alias;

  return planOrg;
}
