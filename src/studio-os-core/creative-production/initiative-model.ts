/**
 * Creative Initiative object model — validation and factory helpers.
 */

import type {
  AudienceScope,
  CreativeInitiative,
  CreativeInitiativeStatus,
  ExpressionFamily,
  TouchpointPlan,
  VersionPin,
} from './types';

const EXPRESSION_FAMILIES: ExpressionFamily[] = [
  'product-commerce',
  'campaign-launch',
  'screen-interactive',
  'moving-image',
  'executive-institutional',
  'physical-environmental',
];

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createVersionPin(
  system: VersionPin['system'],
  id: string,
  version: string
): VersionPin {
  return { system, id, version };
}

export function createCreativeInitiative(input: {
  tenantId: string;
  companyId: string;
  title: string;
  expressionFamily: ExpressionFamily;
  businessObjective: string;
  audienceScope: AudienceScope;
  touchpointPlan: TouchpointPlan[];
  companyGenomeVersion: VersionPin;
  brandDnaVersion: VersionPin;
  designCanonVersion: VersionPin;
  successMetric?: string;
  narrativeBlueprintId?: string;
  productionGenomeId?: string;
  status?: CreativeInitiativeStatus;
}): CreativeInitiative {
  const now = new Date().toISOString();
  return {
    id: uid('initiative'),
    tenantId: input.tenantId,
    companyId: input.companyId,
    title: input.title.trim(),
    expressionFamily: input.expressionFamily,
    businessObjective: input.businessObjective.trim(),
    successMetric: input.successMetric?.trim(),
    audienceScope: input.audienceScope,
    touchpointPlan: input.touchpointPlan,
    companyGenomeVersion: input.companyGenomeVersion,
    brandDnaVersion: input.brandDnaVersion,
    designCanonVersion: input.designCanonVersion,
    narrativeBlueprintId: input.narrativeBlueprintId,
    productionGenomeId: input.productionGenomeId,
    status: input.status ?? 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

export type InitiativeValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateCreativeInitiative(initiative: CreativeInitiative): InitiativeValidationResult {
  const errors: string[] = [];
  if (!initiative.title.trim()) errors.push('title is required');
  if (!initiative.businessObjective.trim()) errors.push('businessObjective is required');
  if (!EXPRESSION_FAMILIES.includes(initiative.expressionFamily)) {
    errors.push(`invalid expressionFamily: ${initiative.expressionFamily}`);
  }
  if (!initiative.touchpointPlan.length) errors.push('touchpointPlan must include at least one touchpoint');
  for (const pin of [
    initiative.companyGenomeVersion,
    initiative.brandDnaVersion,
    initiative.designCanonVersion,
  ]) {
    if (!pin.id || !pin.version) errors.push(`version pin ${pin.system} requires id and version`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

/** Material production requires version pins before authorization issuance. */
export function assertMaterialInitiativeReady(initiative: CreativeInitiative): InitiativeValidationResult {
  const base = validateCreativeInitiative(initiative);
  if (!base.ok) return base;
  const errors: string[] = [];
  if (!initiative.narrativeBlueprintId) errors.push('narrativeBlueprintId required for material production');
  if (!initiative.productionGenomeId) errors.push('productionGenomeId required for material production');
  return errors.length ? { ok: false, errors } : { ok: true };
}
