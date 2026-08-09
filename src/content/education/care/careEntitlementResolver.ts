import type { CarePurchaseProfile } from '../types';
import type {
  YourOwnedUnit,
  ResolvedCareContentEntitlement,
  CareContentEntitlementSource,
} from './ownedUnitModel';
import {
  deriveConfigurationTraits,
  deriveTransformationStateFromConfiguration,
  matchesCareApplicability,
  traitSetFromUnit,
  type CareApplicability,
} from './careApplicability';
import { getCareGuideRegistry, type CareGuideRegistryEntry } from './careContentRegistry';
import type { CareProductType, CareTextureFamily, WigUnitSlug } from './productCatalog';
import type { CareOrderLineLike } from './careOrderParsing';

/** Build YOUR UNIT from a purchase profile + optional order line snapshot. */
export function buildYourOwnedUnitFromProfile(
  profile: CarePurchaseProfile,
  line?: CareOrderLineLike
): YourOwnedUnit {
  const config = profile.configurationSnapshot ?? configurationFromLine(line);
  const traits = deriveConfigurationTraits(config);
  const customerConfiguration = { ...config, configurationTraits: traits };
  const transformationState =
    profile.transformationState ?? deriveTransformationStateFromConfiguration(customerConfiguration);

  return {
    id: profile.id,
    userId: profile.userId,
    orderId: profile.orderId,
    orderLineKey: profile.orderLineKey,
    displayName: profile.displayLabel ?? formatOwnedUnitDisplayName(profile, customerConfiguration),
    productName: profile.productName,
    status: profile.status,
    grantedAt: profile.grantedAt,
    constructionDna: profile.constructionDna ?? {
      baseUnitId: profile.baseUnitId as WigUnitSlug | undefined,
      productType: profile.productType as CareProductType,
      textureFamily: profile.textureFamily as CareTextureFamily | undefined,
      hairOrigin: config.hairOrigin,
      laceType: config.lace,
    },
    customerConfiguration,
    transformationState,
  };
}

function configurationFromLine(line?: CareOrderLineLike): YourOwnedUnit['customerConfiguration'] {
  if (!line) return {};
  const opts = line.options ?? {};
  const addOnsRaw = opts.addOns ?? (line as { addOns?: string[] }).addOns;
  const addOns = Array.isArray(addOnsRaw)
    ? addOnsRaw
    : typeof addOnsRaw === 'string'
      ? addOnsRaw.split('·').map((s) => s.trim()).filter(Boolean)
      : undefined;

  return {
    length: opts.length ?? (line as { length?: string }).length,
    density: opts.density ?? (line as { density?: string }).density,
    color: opts.color ?? (line as { color?: string }).color,
    texture: opts.texture ?? (line as { texture?: string }).texture,
    lace: opts.lace ?? (line as { lace?: string }).lace,
    capSize: opts.capSize ?? (line as { capSize?: string }).capSize,
    hairline: opts.hairline ?? (line as { hairline?: string }).hairline,
    styling: opts.styling ?? (line as { styling?: string }).styling,
    partSelection: opts.partSelection ?? (line as { partSelection?: string }).partSelection,
    addOns,
    hairOrigin: opts.hairOrigin ?? (line as { hairOrigin?: string }).hairOrigin,
  };
}

function formatOwnedUnitDisplayName(
  profile: CarePurchaseProfile,
  config: YourOwnedUnit['customerConfiguration']
): string {
  const base = profile.baseUnitId
    ? profile.baseUnitId.replace(/-/g, ' ').toUpperCase()
    : profile.productName;
  const color = config.color?.trim();
  if (color && color !== 'OFF BLACK' && color !== 'JET BLACK') {
    return `${base} · ${color}`;
  }
  return base;
}

export function ownedUnitMatchesCareGuide(
  unit: YourOwnedUnit,
  entry: CareGuideRegistryEntry
): boolean {
  if (unit.status !== 'active') return false;
  const traits = traitSetFromUnit(unit.customerConfiguration, unit.transformationState);
  return matchesCareApplicability(entry.careApplicability, {
    productType: unit.constructionDna.productType,
    textureFamily: unit.constructionDna.textureFamily,
    baseUnitId: unit.constructionDna.baseUnitId,
    traits,
    transformation: unit.transformationState,
  });
}

/** @deprecated Use ownedUnitMatchesCareGuide */
export const ownedUnitMatchesCareContent = ownedUnitMatchesCareGuide;

export function resolveCareGuideEntitlementsForPurchasedUnit(
  unit: YourOwnedUnit,
  registry: CareGuideRegistryEntry[] = getCareGuideRegistry()
): ResolvedCareContentEntitlement[] {
  return registry
    .filter((entry) => ownedUnitMatchesCareGuide(unit, entry))
    .map((entry) => ({
      contentId: entry.contentId,
      contentKind: 'care-guide' as const,
      sources: [
        {
          sourceType: 'qualifying_product' as const,
          orderId: unit.orderId,
          orderLineKey: unit.orderLineKey,
          ownedUnitId: unit.id,
          careRuleId: applicabilityRuleId(entry.careApplicability),
        },
      ],
      appliesToOwnedUnitIds: [unit.id],
    }));
}

/** Merge entitlements across multiple YOUR UNITS — one canonical guide per contentId. */
export function resolveCareGuideEntitlementsForOwnedUnits(
  units: YourOwnedUnit[],
  registry: CareGuideRegistryEntry[] = getCareGuideRegistry()
): ResolvedCareContentEntitlement[] {
  const byContent = new Map<string, ResolvedCareContentEntitlement>();

  for (const unit of units) {
    if (unit.status !== 'active') continue;
    for (const ent of resolveCareGuideEntitlementsForPurchasedUnit(unit, registry)) {
      const existing = byContent.get(ent.contentId);
      if (!existing) {
        byContent.set(ent.contentId, {
          ...ent,
          sources: [...ent.sources],
          appliesToOwnedUnitIds: [...ent.appliesToOwnedUnitIds],
        });
        continue;
      }
      existing.appliesToOwnedUnitIds = [
        ...new Set([...existing.appliesToOwnedUnitIds, ...ent.appliesToOwnedUnitIds]),
      ];
      existing.sources = mergeSources(existing.sources, ent.sources);
    }
  }

  return [...byContent.values()];
}

export function resolveCareGuideEntitlementsFromProfiles(
  profiles: CarePurchaseProfile[],
  linesByKey?: Map<string, CareOrderLineLike>
): ResolvedCareContentEntitlement[] {
  const active = profiles.filter((p) => p.status === 'active');
  const units = active.map((p) =>
    buildYourOwnedUnitFromProfile(p, linesByKey?.get(p.orderLineKey))
  );
  return resolveCareGuideEntitlementsForOwnedUnits(units);
}

/** @deprecated Use resolveCareGuideEntitlementsFromProfiles */
export const resolveCareEntitlementsFromProfiles = resolveCareGuideEntitlementsFromProfiles;
export const resolveCareEntitlementsForOwnedUnits = resolveCareGuideEntitlementsForOwnedUnits;
export const resolveCareEntitlementsForPurchasedUnit = resolveCareGuideEntitlementsForPurchasedUnit;

function mergeSources(
  a: CareContentEntitlementSource[],
  b: CareContentEntitlementSource[]
): CareContentEntitlementSource[] {
  const key = (s: CareContentEntitlementSource) =>
    `${s.sourceType}|${s.orderId}|${s.orderLineKey}|${s.ownedUnitId}`;
  const map = new Map<string, CareContentEntitlementSource>();
  for (const s of [...a, ...b]) map.set(key(s), s);
  return [...map.values()];
}

function applicabilityRuleId(applicability: CareApplicability): string {
  return JSON.stringify(applicability);
}

export function isCareGuideProductEntitled(
  contentId: string,
  entitlements: ResolvedCareContentEntitlement[]
): boolean {
  return entitlements.some((e) => e.contentId === contentId && e.contentKind === 'care-guide');
}

/** @deprecated Use isCareGuideProductEntitled */
export const isCareContentProductEntitled = isCareGuideProductEntitled;

/** Future-published guides automatically inherit when rules match owned units. */
export function describeFutureContentInheritance(): string {
  return (
    'Care Guide entitlements are resolved at access time from applicability rules on the canonical ' +
    'Care Guide registry — not from frozen content ID lists stored at checkout.'
  );
}
