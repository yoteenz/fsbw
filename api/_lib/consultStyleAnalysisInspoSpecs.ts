import {
  allowedColorsForCatalogUnit,
  normalizeCatalogUnit,
  type CatalogUnitName,
} from './hairstyleAnalysisUnitCatalog.js';
import { normalizeAnalysisStylingId } from './hairstyleAnalysisDisplay.js';
import {
  CONSULT_DEFAULT_COLORS,
  normalizeConsultHairColor,
  type ConsultHairColorName,
} from './consultStyleAnalysisCatalog.js';
import { detectInspoHairColor } from './consultStyleAnalysisInspoColor.js';

const DEFAULT_MODEL = (process.env.PSA_OPENAI_MODEL || 'gpt-5.4-mini').trim();

const UNIT_LIST = 'NOIR, BLANCO, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL';
const STRAIGHT_STYLING_IDS = [
  'NONE',
  'BANGS',
  'LAYERS',
  'FLAT IRON',
  'CRIMPS',
  'BANGS, LAYERS',
  'BANGS, FLAT IRON',
  'BANGS, CRIMPS',
] as const;
const CURLY_STYLING_IDS = [
  'NONE',
  'BANGS',
  'DEFINE',
  'WAND CURLS',
  'FLAT IRON',
  'BANGS, DEFINE',
  'BANGS, WAND CURLS',
  'BANGS, FLAT IRON',
] as const;
const STRAIGHT_STYLING = STRAIGHT_STYLING_IDS.join(', ');
const CURLY_STYLING = CURLY_STYLING_IDS.join(', ');
const CONSULT_LENGTH_OPTIONS = [16, 18, 20, 22, 24, 26, 28, 30] as const;
const MANUAL_LENGTH_OPTIONS = [16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40] as const;

export type ConsultInspoSpecs = {
  unit: CatalogUnitName;
  color: ConsultHairColorName;
  styling: string;
  length: string;
  part: 'MIDDLE' | 'LEFT' | 'RIGHT';
  lace: string;
  density: string;
  hairline: string;
};

type RawInspoSpecs = {
  unit?: string;
  color?: string;
  styling?: string;
  lengthInches?: number;
  part?: string;
};

export type ManualConsultInspoSpecs = {
  unit?: string;
  color?: string;
  styling?: string;
  length?: string;
  lengthInches?: number;
  part?: string;
  lace?: string;
  density?: string;
  hairline?: string;
};

function parseSpecsJson(raw: string | null): RawInspoSpecs | null {
  if (!raw) return null;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as RawInspoSpecs;
  } catch {
    return null;
  }
}

function normalizePart(part: string | undefined): 'MIDDLE' | 'LEFT' | 'RIGHT' {
  const p = String(part || 'MIDDLE')
    .replace(/\s*PART\s*$/i, '')
    .trim()
    .toUpperCase();
  if (p === 'LEFT' || p === 'RIGHT') return p;
  return 'MIDDLE';
}

function normalizeDetectedLength(inches: number | undefined): string {
  const n = typeof inches === 'number' && Number.isFinite(inches) ? Math.round(inches) : 24;
  const clamped = Math.min(30, Math.max(16, n));
  const roundedDown =
    [...CONSULT_LENGTH_OPTIONS].reverse().find((option) => option <= clamped) ?? 24;
  return `${roundedDown} INCHES`;
}

function parseManualLengthInches(length: string | undefined, lengthInches: number | undefined): number {
  if (typeof lengthInches === 'number' && Number.isFinite(lengthInches)) return Math.round(lengthInches);
  const match = String(length || '').match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 24;
}

function normalizeManualLength(length: string | undefined, lengthInches: number | undefined): string {
  const n = parseManualLengthInches(length, lengthInches);
  const clamped = Math.min(40, Math.max(16, n));
  const exact = MANUAL_LENGTH_OPTIONS.find((option) => option === clamped);
  if (exact) return `${exact} INCHES`;
  const closest =
    MANUAL_LENGTH_OPTIONS.reduce((best, option) =>
      Math.abs(option - clamped) < Math.abs(best - clamped) ? option : best
    ) ?? 24;
  return `${closest} INCHES`;
}

function resolveColorForUnit(
  unit: CatalogUnitName,
  colorRaw: string,
  fallbackColor?: ConsultHairColorName
): ConsultHairColorName {
  const normalized = normalizeConsultHairColor(colorRaw);
  const fallback = fallbackColor ? normalizeConsultHairColor(fallbackColor) : null;
  const allowed = allowedColorsForCatalogUnit(unit);
  if (normalized && (allowed as readonly string[]).includes(normalized)) {
    return normalized;
  }
  if (fallback && (allowed as readonly string[]).includes(fallback)) {
    return fallback;
  }
  if (unit === 'BLANCO') return 'PLATINUM';
  return 'JET BLACK';
}

function stylingTokens(stylingRaw: string): Set<string> {
  const raw = String(stylingRaw || '')
    .replace(/^STYLING:\s*/i, '')
    .trim()
    .toUpperCase();
  const normalized = raw
    .replace(/\b(CURTAIN\s+BANGS|FRINGE|BANG)\b/g, 'BANGS')
    .replace(/\b(BONE\s+STRAIGHT|SILK\s+PRESS|SLEEK\s+STRAIGHT|PIN\s+STRAIGHT)\b/g, 'FLAT IRON')
    .replace(/\b(ZIG\s*ZAG|ZIGZAG)\b/g, 'CRIMPS')
    .replace(/[+&/]+/g, ',');
  const tokens = new Set(
    normalized
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );
  if (/\bBANGS\b/.test(normalized)) tokens.add('BANGS');
  if (/\bFLAT\s+IRON\b/.test(normalized)) tokens.add('FLAT IRON');
  if (/\bCRIMPS?\b/.test(normalized)) tokens.add('CRIMPS');
  if (/\bLAYERS?\b|FACE\s+FRAMING|BUTTERFLY\s+CUT/.test(normalized)) tokens.add('LAYERS');
  if (/\bDEFINE|DEFINED\s+CURLS?\b/.test(normalized)) tokens.add('DEFINE');
  if (/\bWAND\s+CURLS?|RINGLETS?|SPIRALS?|BARREL\s+CURLS?\b/.test(normalized)) tokens.add('WAND CURLS');
  return tokens;
}

function defaultStylingForUnit(unit: CatalogUnitName, stylingRaw: string): string {
  const normalized = normalizeAnalysisStylingId(unit, stylingRaw || 'NONE');
  const tokens = stylingTokens(normalized);
  const hasBangs = tokens.has('BANGS');
  const straightUnits: CatalogUnitName[] = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE'];
  if (straightUnits.includes(unit)) {
    let salon: (typeof STRAIGHT_STYLING_IDS)[number] | null = null;
    if (tokens.has('FLAT IRON')) salon = 'FLAT IRON';
    else if (tokens.has('CRIMPS')) salon = 'CRIMPS';
    else if (tokens.has('LAYERS')) salon = 'LAYERS';
    if (hasBangs && salon === 'FLAT IRON') return 'BANGS, FLAT IRON';
    if (hasBangs && salon === 'CRIMPS') return 'BANGS, CRIMPS';
    if (hasBangs && salon === 'LAYERS') return 'BANGS, LAYERS';
    if (hasBangs) return 'BANGS';
    if (salon) return salon;
    if ((STRAIGHT_STYLING_IDS as readonly string[]).includes(normalized)) return normalized;
    return 'NONE';
  }
  let curlySalon: (typeof CURLY_STYLING_IDS)[number] | null = null;
  if (tokens.has('FLAT IRON')) curlySalon = 'FLAT IRON';
  else if (tokens.has('CRIMPS') || tokens.has('WAND CURLS')) curlySalon = 'WAND CURLS';
  else if (tokens.has('LAYERS') || tokens.has('DEFINE')) curlySalon = 'DEFINE';
  if (hasBangs && curlySalon === 'FLAT IRON') return 'BANGS, FLAT IRON';
  if (hasBangs && curlySalon === 'WAND CURLS') return 'BANGS, WAND CURLS';
  if (hasBangs && curlySalon === 'DEFINE') return 'BANGS, DEFINE';
  if (hasBangs) return 'BANGS';
  if (curlySalon) return curlySalon;
  if ((CURLY_STYLING_IDS as readonly string[]).includes(normalized)) return normalized;
  return 'NONE';
}

function defaultDensityForUnit(unit: CatalogUnitName): string {
  if (unit === 'SOFT WAVE' || unit === 'BEACH WAVE') return '200%';
  if (unit === 'SOFT CURL' || unit === 'OCEAN CURL') return '250%';
  return '250%';
}

function normalizeManualLace(lace: string | undefined, fallback: string): string {
  const cleaned = String(lace || '').trim().toUpperCase();
  if (!cleaned) return fallback;
  return cleaned.includes('HD') ? cleaned : `${cleaned} HD`;
}

function normalizeManualDensity(density: string | undefined, fallback: string): string {
  const cleaned = String(density || '').trim().toUpperCase().replace(/\s*DENSITY\s*$/i, '');
  if (!cleaned) return fallback;
  return cleaned.includes('%') ? cleaned : `${cleaned}%`;
}

function normalizeManualHairline(hairline: string | undefined, fallback: string): string {
  const cleaned = String(hairline || '').trim().toUpperCase();
  if (!cleaned) return fallback;
  return cleaned.includes('HAIRLINE') ? cleaned : `${cleaned} HAIRLINE`;
}

/** Map silver/platinum/blonde inspo → BLANCO + PLATINUM when vision picks a vivid color on straight blonde hair. */
function inferUnitFromColorHint(unit: CatalogUnitName, color: ConsultHairColorName): CatalogUnitName {
  if (unit === 'BLANCO') return 'BLANCO';
  if (['PLATINUM', 'GOLDEN', 'ASH'].includes(color)) return 'BLANCO';
  return unit;
}

export function normalizeConsultInspoSpecs(raw: RawInspoSpecs, fallbackColor: ConsultHairColorName): ConsultInspoSpecs {
  const unitRaw = normalizeCatalogUnit(raw.unit || 'NOIR') ?? 'NOIR';
  let color = resolveColorForUnit(unitRaw, raw.color || fallbackColor, fallbackColor);
  let unit = inferUnitFromColorHint(unitRaw, color);
  if (unit === 'BLANCO') {
    color = resolveColorForUnit('BLANCO', raw.color || color, color);
  } else {
    color = resolveColorForUnit(unit, raw.color || fallbackColor, fallbackColor);
  }

  const styling = defaultStylingForUnit(unit, raw.styling || 'NONE');
  return {
    unit,
    color,
    styling,
    length: normalizeDetectedLength(raw.lengthInches),
    part: normalizePart(raw.part),
    lace: '13X6 HD',
    density: defaultDensityForUnit(unit),
    hairline: 'NATURAL HAIRLINE',
  };
}

/** Manual/admin specs for a submitted hair inspo image. Skips vision spec detection. */
export function normalizeManualConsultInspoSpecs(
  manual: ManualConsultInspoSpecs,
  fallbackColor: ConsultHairColorName
): ConsultInspoSpecs {
  const unitRaw = normalizeCatalogUnit(manual.unit || 'NOIR') ?? 'NOIR';
  let color = resolveColorForUnit(unitRaw, manual.color || fallbackColor, fallbackColor);
  let unit = inferUnitFromColorHint(unitRaw, color);
  if (unit === 'BLANCO') {
    color = resolveColorForUnit('BLANCO', manual.color || color, color);
  } else {
    color = resolveColorForUnit(unit, manual.color || fallbackColor, fallbackColor);
  }
  const base: ConsultInspoSpecs = {
    unit,
    color,
    styling: defaultStylingForUnit(unit, manual.styling || 'NONE'),
    length: normalizeManualLength(manual.length, manual.lengthInches),
    part: normalizePart(manual.part),
    lace: '13X6 HD',
    density: defaultDensityForUnit(unit),
    hairline: 'NATURAL HAIRLINE',
  };
  return {
    ...base,
    lace: normalizeManualLace(manual.lace, base.lace),
    density: normalizeManualDensity(manual.density, base.density),
    hairline: normalizeManualHairline(manual.hairline, base.hairline),
  };
}

/** Vision: map inspo photo → closest BAW catalog build specs (unit, color, styling, length, part). */
export async function detectInspoHairSpecs(inspoDataUrl: string): Promise<ConsultInspoSpecs> {
  const fallbackColor = await detectInspoHairColor(inspoDataUrl);
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    return normalizeConsultInspoSpecs({ color: fallbackColor }, fallbackColor);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: [
          'You map a hair inspiration photo to Build-a-Wig catalog specs.',
          `Return JSON only: {"unit":"<${UNIT_LIST}>","color":"<catalog color>","styling":"<salon id>","lengthInches":<16-30>,"part":"MIDDLE|LEFT|RIGHT"}`,
          `Straight/wavy units (${UNIT_LIST.split(', ').slice(0, 4).join(', ')}): styling one of ${STRAIGHT_STYLING}.`,
          `Curly units (SOFT CURL, OCEAN CURL): styling one of ${CURLY_STYLING}.`,
          `Color must be one of: ${CONSULT_DEFAULT_COLORS.join(', ')}, PLATINUM, GOLDEN, ASH.`,
          'Use BANGS or BANGS combinations when the inspo has fringe/curtain bangs. Use FLAT IRON for sleek bone-straight styling, CRIMPS for zig-zag/ripple texture, WAND CURLS for ringlets/barrel curls, DEFINE for shaped curly definition.',
          'Silver blonde / icy blonde → unit BLANCO, color PLATINUM. Warm blonde → BLANCO GOLDEN. Ash blonde → BLANCO ASH.',
          'Straight sleek black → NOIR JET BLACK. Loose S-waves → SOFT WAVE. Beach waves → BEACH WAVE. Tight waves → SOFT CURL. Tight spiral curls/ringlets → OCEAN CURL.',
          'Estimate visible hair length from the hairline/crown to the visible ends on the body, then choose the nearest BAW even length. If between two sizes, choose the lower length so the generated template does not become too long.',
          'Do not infer extra inches from cropped/off-frame hair; if ends are cropped or uncertain, choose the shortest plausible length, usually 22 or 24.',
        ].join(' '),
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: 'Map this inspo to BAW catalog specs. JSON only.' },
              { type: 'input_image', image_url: inspoDataUrl, detail: 'high' },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return normalizeConsultInspoSpecs({ color: fallbackColor }, fallbackColor);
    }

    const data = (await res.json()) as {
      output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
    };
    const texts: string[] = [];
    for (const block of data.output ?? []) {
      if (block.type !== 'message') continue;
      for (const part of block.content ?? []) {
        if (part.type === 'output_text' && part.text) texts.push(part.text);
      }
    }
    const parsed = parseSpecsJson(texts.join('\n').trim());
    return normalizeConsultInspoSpecs(parsed ?? { color: fallbackColor }, fallbackColor);
  } catch {
    return normalizeConsultInspoSpecs({ color: fallbackColor }, fallbackColor);
  }
}

export async function inspoDataUrlFromFetch(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch inspo image (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}
