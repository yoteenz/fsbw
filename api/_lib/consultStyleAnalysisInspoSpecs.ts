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
const STRAIGHT_STYLING = 'NONE, LAYERS, FLAT IRON, CRIMPS';
const CURLY_STYLING = 'NONE, DEFINE, WAND CURLS';

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

function normalizeLength(inches: number | undefined): string {
  const n = typeof inches === 'number' && Number.isFinite(inches) ? Math.round(inches) : 24;
  const clamped = Math.min(34, Math.max(12, n));
  return `${clamped} INCHES`;
}

function resolveColorForUnit(unit: CatalogUnitName, colorRaw: string): ConsultHairColorName {
  const normalized = normalizeConsultHairColor(colorRaw);
  const allowed = allowedColorsForCatalogUnit(unit);
  if (normalized && (allowed as readonly string[]).includes(normalized)) {
    return normalized;
  }
  if (unit === 'BLANCO') return 'PLATINUM';
  return 'JET BLACK';
}

function defaultStylingForUnit(unit: CatalogUnitName, stylingRaw: string): string {
  const normalized = normalizeAnalysisStylingId(unit, stylingRaw || 'NONE');
  const straightUnits: CatalogUnitName[] = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE'];
  if (straightUnits.includes(unit)) {
    if (['LAYERS', 'FLAT IRON', 'CRIMPS', 'NONE'].includes(normalized)) return normalized;
    return 'NONE';
  }
  if (['DEFINE', 'WAND CURLS', 'NONE'].includes(normalized)) return normalized;
  if (normalized === 'CRIMPS') return 'WAND CURLS';
  if (normalized === 'LAYERS') return 'DEFINE';
  return 'NONE';
}

function defaultDensityForUnit(unit: CatalogUnitName): string {
  if (unit === 'SOFT WAVE' || unit === 'BEACH WAVE') return '200%';
  if (unit === 'SOFT CURL' || unit === 'OCEAN CURL') return '250%';
  return '250%';
}

/** Map silver/platinum/blonde inspo → BLANCO + PLATINUM when vision picks a vivid color on straight blonde hair. */
function inferUnitFromColorHint(unit: CatalogUnitName, color: ConsultHairColorName): CatalogUnitName {
  if (unit === 'BLANCO') return 'BLANCO';
  if (['PLATINUM', 'GOLDEN', 'ASH'].includes(color)) return 'BLANCO';
  return unit;
}

export function normalizeConsultInspoSpecs(raw: RawInspoSpecs, fallbackColor: ConsultHairColorName): ConsultInspoSpecs {
  const unitRaw = normalizeCatalogUnit(raw.unit || 'NOIR') ?? 'NOIR';
  let color = resolveColorForUnit(unitRaw, raw.color || fallbackColor);
  let unit = inferUnitFromColorHint(unitRaw, color);
  if (unit === 'BLANCO') {
    color = resolveColorForUnit('BLANCO', raw.color || color);
  } else {
    color = resolveColorForUnit(unit, raw.color || fallbackColor);
  }

  const styling = defaultStylingForUnit(unit, raw.styling || 'NONE');
  return {
    unit,
    color,
    styling,
    length: normalizeLength(raw.lengthInches),
    part: normalizePart(raw.part),
    lace: '13X6 HD',
    density: defaultDensityForUnit(unit),
    hairline: 'NATURAL HAIRLINE',
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
          `Return JSON only: {"unit":"<${UNIT_LIST}>","color":"<catalog color>","styling":"<salon id>","lengthInches":<12-34>,"part":"MIDDLE|LEFT|RIGHT"}`,
          `Straight/wavy units (${UNIT_LIST.split(', ').slice(0, 4).join(', ')}): styling one of ${STRAIGHT_STYLING}.`,
          `Curly units (SOFT CURL, OCEAN CURL): styling one of ${CURLY_STYLING}.`,
          `Color must be one of: ${CONSULT_DEFAULT_COLORS.join(', ')}, PLATINUM, GOLDEN, ASH.`,
          'Silver blonde / icy blonde → unit BLANCO, color PLATINUM. Warm blonde → BLANCO GOLDEN. Ash blonde → BLANCO ASH.',
          'Straight sleek black → NOIR JET BLACK. Loose S-waves → SOFT WAVE. Beach waves → BEACH WAVE. Tight curls → pick SOFT CURL vs OCEAN CURL.',
          'Visible layering → LAYERS (or DEFINE on curls). Bone-straight polished → FLAT IRON. Crimped → CRIMPS (or WAND CURLS on curls).',
          'Estimate visible hair length in inches from crown to ends on the body.',
        ].join(' '),
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: 'Map this inspo to BAW catalog specs. JSON only.' },
              { type: 'input_image', image_url: inspoDataUrl, detail: 'low' },
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
