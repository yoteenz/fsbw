import type { CareProductType, CareTextureFamily } from './productCatalog';
import type { OwnedUnitCustomerConfiguration, OwnedUnitTransformationState } from './ownedUnitModel';

/** Rule-based metadata — evaluated at runtime so future Care content can inherit to past purchases. */
export type CareApplicability = {
  universal?: boolean;
  productTypes?: CareProductType[];
  textureFamilies?: CareTextureFamily[];
  baseUnitIds?: string[];
  /** e.g. blonde, color-treated, platinum */
  colorStates?: string[];
  processingStates?: string[];
  /** e.g. layers, curls, wand-curls */
  stylingStates?: string[];
  configurationTraits?: string[];
};

const BLONDE_COLOR_TOKENS = new Set([
  'BLONDE',
  'GOLDEN',
  'PLATINUM',
  'ASH',
  'PLATINUM BLONDE',
  'HONEY BLONDE',
]);

const CURL_STYLING_TOKENS = /\b(CURL|CURLS|WAND|DEFINE|CRIMP)\b/i;
const LAYER_STYLING_TOKENS = /\bLAYER/i;

/** Derive configuration traits from trusted order snapshot fields — no string parsing of product names. */
export function deriveConfigurationTraits(
  config: OwnedUnitCustomerConfiguration
): string[] {
  const traits = new Set<string>(config.configurationTraits ?? []);

  const color = String(config.color ?? '').trim().toUpperCase();
  if (color) {
    traits.add(`color:${color}`);
    if (BLONDE_COLOR_TOKENS.has(color) || color.includes('BLONDE') || color.includes('PLATINUM') || color.includes('GOLDEN') || color.includes('ASH')) {
      traits.add('blonde');
      traits.add('color-treated');
    } else if (color !== 'OFF BLACK' && color !== 'JET BLACK') {
      traits.add('color-treated');
    }
  }

  const styling = String(config.styling ?? '').trim().toUpperCase();
  if (styling && styling !== 'NONE') {
    traits.add(`styling:${styling}`);
    if (LAYER_STYLING_TOKENS.test(styling)) traits.add('layers');
    if (CURL_STYLING_TOKENS.test(styling)) traits.add('curls');
  }

  const addOns = config.addOns ?? [];
  for (const addon of addOns) {
    const a = addon.trim().toUpperCase();
    if (a) traits.add(`addon:${a}`);
  }

  if (config.texture) traits.add(`texture:${config.texture.trim().toUpperCase()}`);
  if (config.length) traits.add(`length:${config.length.trim()}`);
  if (config.density) traits.add(`density:${config.density.trim()}`);

  return [...traits];
}

export function deriveTransformationStateFromConfiguration(
  config: OwnedUnitCustomerConfiguration
): OwnedUnitTransformationState {
  const traits = deriveConfigurationTraits(config);
  const stateTags = [...traits];

  const color = String(config.color ?? '').trim().toUpperCase();
  const blondeProcessed =
    traits.includes('blonde') ||
    traits.includes('color-treated') ||
    BLONDE_COLOR_TOKENS.has(color);
  const layered = traits.includes('layers');
  const curled = traits.includes('curls');

  const styling = String(config.styling ?? '').trim().toUpperCase();
  const straightened = styling.includes('FLAT IRON');

  return {
    stage: 'order-delivered',
    colorProcessed: blondeProcessed,
    blondeProcessed: traits.includes('blonde') || BLONDE_COLOR_TOKENS.has(color),
    layered,
    curled,
    straightened,
    installed: false,
    stateTags,
  };
}

export function traitSetFromUnit(
  config: OwnedUnitCustomerConfiguration,
  transformation: OwnedUnitTransformationState
): Set<string> {
  const traits = new Set(deriveConfigurationTraits(config));
  for (const tag of transformation.stateTags ?? []) traits.add(tag);
  if (transformation.blondeProcessed) traits.add('blonde');
  if (transformation.colorProcessed) traits.add('color-treated');
  if (transformation.layered) traits.add('layers');
  if (transformation.curled) traits.add('curls');
  return traits;
}

export function matchesCareApplicability(
  applicability: CareApplicability | undefined,
  ctx: {
    productType?: CareProductType;
    textureFamily?: CareTextureFamily;
    baseUnitId?: string;
    traits: Set<string>;
    transformation: OwnedUnitTransformationState;
  }
): boolean {
  if (!applicability) return false;
  if (applicability.universal) return true;

  if (applicability.productTypes?.length) {
    if (!ctx.productType || !applicability.productTypes.includes(ctx.productType)) return false;
  }
  if (applicability.textureFamilies?.length) {
    if (!ctx.textureFamily || !applicability.textureFamilies.includes(ctx.textureFamily)) {
      return false;
    }
  }
  if (applicability.baseUnitIds?.length) {
    if (!ctx.baseUnitId || !applicability.baseUnitIds.includes(ctx.baseUnitId)) return false;
  }

  if (applicability.colorStates?.length) {
    const ok = applicability.colorStates.some((s) => ctx.traits.has(s) || ctx.traits.has(s.toLowerCase()));
    if (!ok) return false;
  }
  if (applicability.processingStates?.length) {
    const ok = applicability.processingStates.some((s) => {
      const key = s.toLowerCase();
      if (key === 'blonde' && ctx.transformation.blondeProcessed) return true;
      if (key === 'color-treated' && ctx.transformation.colorProcessed) return true;
      return ctx.traits.has(key) || ctx.traits.has(s);
    });
    if (!ok) return false;
  }
  if (applicability.stylingStates?.length) {
    const ok = applicability.stylingStates.some((s) => {
      const key = s.toLowerCase();
      if (key === 'layers' && ctx.transformation.layered) return true;
      if (key === 'curls' && ctx.transformation.curled) return true;
      return ctx.traits.has(key) || ctx.traits.has(s);
    });
    if (!ok) return false;
  }
  if (applicability.configurationTraits?.length) {
    const ok = applicability.configurationTraits.every(
      (t) => ctx.traits.has(t) || ctx.traits.has(t.toLowerCase())
    );
    if (!ok) return false;
  }

  return true;
}
