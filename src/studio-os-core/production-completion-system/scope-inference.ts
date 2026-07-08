import type { ProductionFeatureScope } from './types';

const DB_PATTERN = /\b(database|supabase|migration|postgres|rls|table)\b/i;
const API_PATTERN = /\b(api|endpoint|serverless|vercel api|webhook)\b/i;
const CONSTITUTIONAL_PATTERN = /\b(constitution|constitutional|adr|canon|world bible)\b/i;
const ROUTING_PATTERN = /\b(route|routing|path|navigation architecture|multi-company)\b/i;
const VISUAL_ONLY_PATTERN = /\b(visual only|ui polish|styling only|cosmetic)\b/i;
const ROUTING_ONLY_PATTERN = /\b(routing only|route architecture only|redirect only)\b/i;
const DEPARTMENT_PATTERN = /\b(department|headquarters|company-scoped)\b/i;

export function inferProductionFeatureScope(input: {
  founderIntent: string;
  architectureOutput?: string;
  requiresAssets?: boolean;
  requiresMotion?: boolean;
  scopeOverrides?: Partial<ProductionFeatureScope>;
}): ProductionFeatureScope {
  const text = `${input.founderIntent}\n${input.architectureOutput ?? ''}`;
  const routingOnly = ROUTING_ONLY_PATTERN.test(text) || input.scopeOverrides?.routingOnly === true;
  const visualOnly = VISUAL_ONLY_PATTERN.test(text) || input.scopeOverrides?.visualOnly === true;

  const base: ProductionFeatureScope = {
    requiresRoutes: ROUTING_PATTERN.test(text) || !visualOnly,
    requiresDatabase: DB_PATTERN.test(text),
    requiresApi: API_PATTERN.test(text),
    requiresAssets: input.requiresAssets ?? /asset|visual|icon|3d|openart|fal/i.test(text),
    requiresMotion: input.requiresMotion ?? /motion|kling|animation|transition/i.test(text),
    requiresConstitutional: CONSTITUTIONAL_PATTERN.test(text),
    requiresWorldGraph: !visualOnly,
    requiresAtlas: !routingOnly,
    requiresOrb: !routingOnly,
    visualOnly,
    routingOnly,
  };

  return { ...base, ...input.scopeOverrides };
}

export function scopeMentionsDepartment(_scope: ProductionFeatureScope, text: string): boolean {
  return DEPARTMENT_PATTERN.test(text);
}
