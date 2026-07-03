export const BAW_SLAY_CARD_TEMPLATE_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/00C5D5BE-1F40-4974-A2DF-F02616BD231B.png';

export const BAW_SLAY_CARD_SLAYER_LOGO_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/IMG_4820.png';

export const BAW_SLAY_CARD_LAYOUT_DEBUG_KEY = 'baw_slay_card_layout_debug_v3';

export const BAW_SLAY_CARD_SUBTITLE_LABEL = 'personal build-a-wig slay card';

export const BAW_SLAY_CARD_DEFAULT_FOOTER_COPY =
  'PURCHASE THIS CUSTOM DESIGNED UNIT WITH YOUR PREMIUM MEMBERSHIP.';

/** Editable static copy on the slay card (saved with layout debug). */
export type BawSlayCardLayoutCopy = {
  frontal: string;
  subtitle: string;
  footer: string;
  /** When non-empty, replaces spec lines built from wig selections. */
  specLines: string[];
};

export const DEFAULT_BAW_SLAY_CARD_COPY: BawSlayCardLayoutCopy = {
  frontal: 'FRONTAL',
  subtitle: BAW_SLAY_CARD_SUBTITLE_LABEL,
  footer: BAW_SLAY_CARD_DEFAULT_FOOTER_COPY,
  specLines: [],
};

export type BawSlayCardTextStyle = {
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
};

export type BawSlayCardMannequinLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BawSlayCardImageLayout = BawSlayCardMannequinLayout;

export type BawSlayCardLayout = {
  canvasWidth: number;
  canvasHeight: number;
  mannequin: BawSlayCardMannequinLayout;
  copy: BawSlayCardLayoutCopy;
  header: {
    frontal: BawSlayCardTextStyle;
    /** Red SLAYER wordmark image — below FRONTAL. */
    slayerLogo: BawSlayCardImageLayout;
    subtitle: BawSlayCardTextStyle;
  };
  textPanel: {
    unit: BawSlayCardTextStyle;
    specsStartY: number;
    lineHeight: number;
    specsColor: string;
    specsFontSize: number;
    specsFontFamily: string;
    specsFontWeight: string | number;
    footer: BawSlayCardTextStyle;
  };
};

export const DEFAULT_BAW_SLAY_CARD_LAYOUT: BawSlayCardLayout = {
  canvasWidth: 1122,
  canvasHeight: 1402,
  mannequin: { x: 252, y: 292, width: 618, height: 748 },
  copy: DEFAULT_BAW_SLAY_CARD_COPY,
  header: {
    frontal: {
      x: 561,
      y: 118,
      color: '#1A1A1A',
      fontSize: 46,
      fontFamily: '"Futura PT Book", Futura, sans-serif',
      fontWeight: 500,
    },
    slayerLogo: {
      x: 411,
      y: 128,
      width: 300,
      height: 200,
    },
    subtitle: {
      x: 561,
      y: 340,
      color: '#1A1A1A',
      fontSize: 28,
      fontFamily: '"Bohemy", cursive',
      fontWeight: 400,
    },
  },
  textPanel: {
    unit: {
      x: 561,
      y: 1146,
      color: '#EB1C24',
      fontSize: 40,
      fontFamily: '"Covered By Your Grace", cursive',
      fontWeight: 600,
    },
    specsStartY: 1194,
    lineHeight: 34,
    specsColor: '#1A1A1A',
    specsFontSize: 27,
    specsFontFamily: '"Futura PT Medium", Futura, sans-serif',
    specsFontWeight: 500,
    footer: {
      x: 561,
      y: 1334,
      color: '#808080',
      fontSize: 22,
      fontFamily: '"Futura PT Book", Futura, sans-serif',
      fontWeight: 400,
    },
  },
};

const LEGACY_BAW_SLAY_CARD_LAYOUT_DEBUG_KEYS = [
  'baw_slay_card_layout_debug_v2',
  'baw_slay_card_layout_debug_v1',
] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidImageLayout(value: unknown): value is BawSlayCardImageLayout {
  if (!isObject(value)) return false;
  return (
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    value.width >= 40 &&
    value.height >= 24
  );
}

function coerceNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function coerceTextStyle(value: unknown, fallback: BawSlayCardTextStyle): BawSlayCardTextStyle {
  if (!isObject(value)) return fallback;
  const fontWeight =
    typeof value.fontWeight === 'string' || typeof value.fontWeight === 'number'
      ? value.fontWeight
      : fallback.fontWeight;
  return {
    x: coerceNumber(value.x, fallback.x),
    y: coerceNumber(value.y, fallback.y),
    color: typeof value.color === 'string' ? value.color : fallback.color,
    fontSize: coerceNumber(value.fontSize, fallback.fontSize),
    fontFamily: typeof value.fontFamily === 'string' ? value.fontFamily : fallback.fontFamily,
    fontWeight,
  };
}

function coerceImageLayout(value: unknown, fallback: BawSlayCardImageLayout): BawSlayCardImageLayout {
  if (!isObject(value)) return fallback;
  return {
    x: coerceNumber(value.x, fallback.x),
    y: coerceNumber(value.y, fallback.y),
    width: coerceNumber(value.width, fallback.width),
    height: coerceNumber(value.height, fallback.height),
  };
}

function coerceCopy(value: unknown, fallback: BawSlayCardLayoutCopy): BawSlayCardLayoutCopy {
  if (!isObject(value)) return fallback;
  const specLines = Array.isArray(value.specLines)
    ? value.specLines.filter((line): line is string => typeof line === 'string' && line.trim() !== '')
    : fallback.specLines;
  return {
    frontal: typeof value.frontal === 'string' && value.frontal.trim() ? value.frontal : fallback.frontal,
    subtitle:
      typeof value.subtitle === 'string' && value.subtitle.trim() ? value.subtitle : fallback.subtitle,
    footer: typeof value.footer === 'string' && value.footer.trim() ? value.footer : fallback.footer,
    specLines,
  };
}

/** Coerce saved debug JSON (string numbers, partial objects) before merging with defaults. */
export function coerceBawSlayCardLayoutPatch(patch: Partial<BawSlayCardLayout>): Partial<BawSlayCardLayout> {
  const defaults = DEFAULT_BAW_SLAY_CARD_LAYOUT;
  const header: Record<string, unknown> = isObject(patch.header) ? patch.header : {};
  const textPanel: Record<string, unknown> = isObject(patch.textPanel) ? patch.textPanel : {};
  const specsFontWeight =
    typeof textPanel.specsFontWeight === 'string' || typeof textPanel.specsFontWeight === 'number'
      ? textPanel.specsFontWeight
      : defaults.textPanel.specsFontWeight;

  return {
    canvasWidth: coerceNumber(patch.canvasWidth, defaults.canvasWidth),
    canvasHeight: coerceNumber(patch.canvasHeight, defaults.canvasHeight),
    mannequin: coerceImageLayout(patch.mannequin, defaults.mannequin),
    copy: coerceCopy(patch.copy, defaults.copy),
    header: {
      frontal: coerceTextStyle(header.frontal, defaults.header.frontal),
      slayerLogo: coerceImageLayout(header.slayerLogo, defaults.header.slayerLogo),
      subtitle: coerceTextStyle(header.subtitle, defaults.header.subtitle),
    },
    textPanel: {
      unit: coerceTextStyle(textPanel.unit, defaults.textPanel.unit),
      specsStartY: coerceNumber(textPanel.specsStartY, defaults.textPanel.specsStartY),
      lineHeight: coerceNumber(textPanel.lineHeight, defaults.textPanel.lineHeight),
      specsColor: typeof textPanel.specsColor === 'string' ? textPanel.specsColor : defaults.textPanel.specsColor,
      specsFontSize: coerceNumber(textPanel.specsFontSize, defaults.textPanel.specsFontSize),
      specsFontFamily:
        typeof textPanel.specsFontFamily === 'string'
          ? textPanel.specsFontFamily
          : defaults.textPanel.specsFontFamily,
      specsFontWeight,
      footer: coerceTextStyle(textPanel.footer, defaults.textPanel.footer),
    },
  };
}

/** Saved debug layout cannot override FRONTAL/subtitle fonts or drop the slayer logo. */
export function normalizeBawSlayCardLayout(layout: BawSlayCardLayout): BawSlayCardLayout {
  const defaults = DEFAULT_BAW_SLAY_CARD_LAYOUT;
  return {
    ...layout,
    copy: coerceCopy(layout.copy, defaults.copy),
    header: {
      ...layout.header,
      frontal: {
        ...layout.header.frontal,
        fontFamily: defaults.header.frontal.fontFamily,
        fontWeight: defaults.header.frontal.fontWeight,
      },
      subtitle: {
        ...layout.header.subtitle,
        fontFamily: defaults.header.subtitle.fontFamily,
        fontWeight: defaults.header.subtitle.fontWeight,
      },
      slayerLogo: isValidImageLayout(layout.header?.slayerLogo)
        ? layout.header.slayerLogo
        : defaults.header.slayerLogo,
    },
  };
}

function readRawBawSlayCardLayoutPatch(): Partial<BawSlayCardLayout> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BAW_SLAY_CARD_LAYOUT_DEBUG_KEY);
    if (raw) return JSON.parse(raw) as Partial<BawSlayCardLayout>;

    for (const legacyKey of LEGACY_BAW_SLAY_CARD_LAYOUT_DEBUG_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (!legacyRaw) continue;
      const parsed = JSON.parse(legacyRaw) as Record<string, unknown>;
      if (isObject(parsed.header)) {
        delete parsed.header.slayer;
      }
      return parsed as Partial<BawSlayCardLayout>;
    }
    return null;
  } catch {
    return null;
  }
}

function mergeDeep<T>(base: T, patch: Partial<T> | undefined): T {
  if (!patch) return base;
  const out = { ...base } as T;
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const patchVal = patch[key];
    const baseVal = base[key];
    if (patchVal === undefined) continue;
    if (isObject(baseVal) && isObject(patchVal)) {
      (out as Record<string, unknown>)[key as string] = mergeDeep(baseVal, patchVal as Partial<typeof baseVal>);
    } else {
      (out as Record<string, unknown>)[key as string] = patchVal;
    }
  }
  return out;
}

export function mergeBawSlayCardLayout(patch?: Partial<BawSlayCardLayout> | null): BawSlayCardLayout {
  return normalizeBawSlayCardLayout(mergeDeep(DEFAULT_BAW_SLAY_CARD_LAYOUT, patch ?? undefined));
}

export function loadBawSlayCardLayoutDebug(): BawSlayCardLayout {
  const patch = readRawBawSlayCardLayoutPatch();
  if (!patch) return DEFAULT_BAW_SLAY_CARD_LAYOUT;
  return mergeBawSlayCardLayout(coerceBawSlayCardLayoutPatch(patch));
}

/** Layout used by try-hub SAVE SLAY CARD — saved debug layout or defaults. */
export function getActiveBawSlayCardLayout(): BawSlayCardLayout {
  return loadBawSlayCardLayoutDebug();
}

export function saveBawSlayCardLayoutDebug(layout: BawSlayCardLayout): void {
  localStorage.setItem(
    BAW_SLAY_CARD_LAYOUT_DEBUG_KEY,
    JSON.stringify(normalizeBawSlayCardLayout(layout), null, 2)
  );
}

export function clearBawSlayCardLayoutDebug(): void {
  localStorage.removeItem(BAW_SLAY_CARD_LAYOUT_DEBUG_KEY);
  for (const legacyKey of LEGACY_BAW_SLAY_CARD_LAYOUT_DEBUG_KEYS) {
    localStorage.removeItem(legacyKey);
  }
}

export function formatBawSlayCardLayoutForCopy(layout: BawSlayCardLayout): string {
  return JSON.stringify(layout, null, 2);
}
