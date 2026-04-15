type BuildWigGeneratedUnitSelections = {
  unitKey: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
  partSelection?: string;
  referenceMatchesHairline?: boolean;
};

type ColorSwatch = {
  label: string;
  hex: string;
};

const WIG_CONSULT_STEP1_PROMPT = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like your standard white/rose studio consult backdrop.',
  'On the center of the mannequin’s chest, the Frontal Slayer brand mark should be clear and fully legible - red F/S monogram with FRONTAL SLAYER in small red caps, proportional to the chest, stitched-on look, matching brand red.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

const COLOR_SWATCHES: Record<string, ColorSwatch> = {
  GOLDEN: { label: 'golden blonde', hex: 'FBF08B' },
  PLATINUM: { label: 'platinum blonde', hex: 'F6F3D2' },
  ASH: { label: 'ash blonde', hex: 'E5E3CB' },
  ESPRESSO: { label: 'espresso', hex: '361504' },
  CHESTNUT: { label: 'chestnut', hex: '643118' },
  HONEY: { label: 'honey', hex: 'BB883C' },
  AUBURN: { label: 'auburn', hex: '925927' },
  COPPER: { label: 'copper', hex: '763412' },
  GINGER: { label: 'ginger', hex: 'E35B2A' },
  SANGRIA: { label: 'sangria', hex: '731921' },
  CHERRY: { label: 'cherry', hex: 'C52C1F' },
  RASPBERRY: { label: 'raspberry', hex: 'DA3063' },
  PLUM: { label: 'plum', hex: '5B177C' },
  COBALT: { label: 'cobalt', hex: '25067B' },
  TEAL: { label: 'teal', hex: '7BE7CA' },
  SLIME: { label: 'slime', hex: '63D54B' },
  CITRINE: { label: 'citrine', hex: 'E3E851' },
  JET_BLACK: { label: 'jet black/off black', hex: '000000' },
  OFF_BLACK: { label: 'jet black/off black', hex: '000000' },
  'JET BLACK': { label: 'jet black/off black', hex: '000000' },
  'OFF BLACK': { label: 'jet black/off black', hex: '000000' },
};

function normalizeToken(value: string): string {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w%"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLookupKey(value: string): string {
  return normalizeToken(value).replace(/\s+/g, '_');
}

function formatUnitLabel(unitKey: string): string {
  return normalizeToken(unitKey)
    .replace(/_/g, ' ')
    .trim() || 'NOIR';
}

function defaultColorForUnit(unitKey: string): string {
  return normalizeLookupKey(unitKey) === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
}

function defaultTextureForUnit(unitKey: string): string {
  const unit = normalizeLookupKey(unitKey);
  if (unit === 'SOFT_WAVE' || unit === 'BEACH_WAVE') return 'WAVY';
  if (unit === 'SOFT_CURL' || unit === 'OCEAN_CURL') return 'CURLY';
  return 'SILKY';
}

function defaultDensityForUnit(unitKey: string): string {
  return normalizeLookupKey(unitKey) === 'BLANCO' ? '250%' : '200%';
}

function lookupColorSwatch(color: string): ColorSwatch | null {
  const raw = String(color || '').trim().toUpperCase();
  if (!raw) return null;
  if (raw === 'PINK') return COLOR_SWATCHES.RASPBERRY;
  return COLOR_SWATCHES[raw] ?? COLOR_SWATCHES[normalizeLookupKey(raw)] ?? null;
}

function formatHairline(hairline: string): string {
  const raw = normalizeToken(hairline);
  if (!raw) return '';
  if (raw === 'NATURAL') return 'a natural hairline';
  if (raw === 'PEAK') return 'a peak hairline';
  if (raw === 'LAGOS') return 'a Lagos hairline';
  return `${raw.toLowerCase()} hairline`;
}

function formatLength(length: string): string {
  const cleaned = String(length || '').trim();
  if (!cleaned) return '';
  return `${cleaned.replace(/"/g, '-inch')} length`;
}

function formatTexture(texture: string): string {
  const raw = normalizeToken(texture);
  if (!raw) return '';
  return `${raw.toLowerCase()} texture`;
}

function formatLace(lace: string): string {
  const raw = normalizeToken(lace);
  if (!raw) return '';
  return `${raw.toLowerCase()} lace`;
}

function formatDensity(density: string): string {
  const raw = normalizeToken(density);
  if (!raw) return '';
  return `${raw.toLowerCase()} density`;
}

function parseStylingIds(styling: string): string[] {
  return String(styling || '')
    .split(',')
    .map((part) => normalizeToken(part))
    .filter((part) => Boolean(part) && part !== 'NONE' && part !== 'MIDDLE' && part !== 'LEFT' && part !== 'RIGHT');
}

function formatStyling(styling: string, partSelection?: string): string {
  const ids = parseStylingIds(styling);
  if (!ids.length) return '';
  const hasBangs = ids.includes('BANGS');
  const hasLayers = ids.includes('LAYERS');
  const phrases: string[] = [];
  if (hasBangs) phrases.push('lightly feathered curtain bangs');
  if (hasLayers) phrases.push('face-framing layers');
  if (ids.includes('CRIMPS')) phrases.push('crimped styling');
  if (ids.includes('FLAT IRON')) phrases.push('flat-ironed styling');
  const part = normalizeToken(partSelection || '');
  if (part === 'MIDDLE' || part === 'LEFT' || part === 'RIGHT') {
    phrases.push(`${part.toLowerCase()} part`);
  }
  if (!phrases.length) return '';
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} with ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(', ')}, and ${phrases[phrases.length - 1]}`;
}

function formatAddOns(addOns: string[]): string {
  const phrases = (Array.isArray(addOns) ? addOns : [])
    .map((item) => normalizeToken(item))
    .map((item) => {
      if (item === 'BLEACH') return 'bleached knots';
      if (item === 'PLUCK') return 'a plucked hairline';
      if (item === 'BLUNT CUT') return 'a blunt cut';
      return item ? item.toLowerCase() : '';
    })
    .filter(Boolean);
  if (!phrases.length) return '';
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(', ')}, and ${phrases[phrases.length - 1]}`;
}

function buildWigConsultChainEditPrompt(fromDescription: string, toDescription: string): string {
  const fromD = String(fromDescription || '').trim() || 'previous state';
  const toD = String(toDescription || '').trim() || 'target state';
  return [
    `Recreate this exact mannequin image, but change the ${fromD} to ${toD}.`,
    'The logo on the center of the mannequin’s chest should look exactly like reference image with FRONTAL SLAYER fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

function hasSelectionEditWork(selections: BuildWigGeneratedUnitSelections): boolean {
  const defaultTexture = defaultTextureForUnit(selections.unitKey);
  const defaultDensity = defaultDensityForUnit(selections.unitKey);
  const hasHairlineEdit =
    !selections.referenceMatchesHairline && normalizeToken(selections.hairline) && normalizeToken(selections.hairline) !== 'NATURAL';
  return (
    normalizeToken(selections.length) !== normalizeToken('24"') ||
    normalizeToken(selections.density) !== normalizeToken(defaultDensity) ||
    normalizeToken(selections.lace) !== normalizeToken('13X6') ||
    normalizeToken(selections.texture) !== normalizeToken(defaultTexture) ||
    hasHairlineEdit ||
    parseStylingIds(selections.styling).length > 0 ||
    (Array.isArray(selections.addOns) && selections.addOns.length > 0)
  );
}

export function buildRoseBackdropPrompt(): string {
  return WIG_CONSULT_STEP1_PROMPT;
}

export function buildGeneratedUnitColorPrompt(
  selections: Pick<BuildWigGeneratedUnitSelections, 'unitKey' | 'color'>
): string | null {
  const targetColor = String(selections.color || '').trim();
  if (!targetColor) return null;
  const defaultColor = defaultColorForUnit(selections.unitKey);
  if (normalizeToken(targetColor) === normalizeToken(defaultColor)) return null;
  const fromSwatch = lookupColorSwatch(defaultColor);
  const toSwatch = lookupColorSwatch(targetColor);
  const fromDescription = fromSwatch ? `${fromSwatch.label} hair color` : `${defaultColor.toLowerCase()} hair color`;
  const toDescription = toSwatch
    ? `${toSwatch.label} hair color (hex #${toSwatch.hex}) & ensure this color looks as closely to authentically colored/dyed hair & not a weird unrealistic shade`
    : `${targetColor.toLowerCase()} hair color`;
  return buildWigConsultChainEditPrompt(fromDescription, toDescription);
}

export function buildGeneratedUnitSelectionPrompt(
  selections: BuildWigGeneratedUnitSelections
): string | null {
  if (!hasSelectionEditWork(selections)) return null;
  const targetParts = [
    `a custom ${formatUnitLabel(selections.unitKey)} unit`,
    formatTexture(selections.texture),
    formatLength(selections.length),
    formatDensity(selections.density),
    formatLace(selections.lace),
    selections.referenceMatchesHairline ? '' : formatHairline(selections.hairline),
    formatStyling(selections.styling, selections.partSelection),
  ].filter(Boolean);

  const addOnsText = formatAddOns(selections.addOns);
  if (addOnsText) targetParts.push(`with ${addOnsText}`);
  targetParts.push('while keeping the same hair color as in the previous image');

  return buildWigConsultChainEditPrompt(
    'wig details in the previous image',
    targetParts.join(', ')
  );
}
