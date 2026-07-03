export const BAW_SLAY_CARD_TEMPLATE_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/00C5D5BE-1F40-4974-A2DF-F02616BD231B.png';

export const BAW_SLAY_CARD_SLAYER_LOGO_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/IMG_4820.png';

export const BAW_SLAY_CARD_LAYOUT_DEBUG_KEY = 'baw_slay_card_layout_debug_v3';

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
      fontFamily: '"Futura PT Book", Futura, sans-serif',
      fontWeight: 500,
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

/** Saved debug layout cannot override FRONTAL font or drop the slayer logo. */
export function normalizeBawSlayCardLayout(layout: BawSlayCardLayout): BawSlayCardLayout {
  const defaults = DEFAULT_BAW_SLAY_CARD_LAYOUT;
  return {
    ...layout,
    header: {
      ...layout.header,
      frontal: {
        ...layout.header.frontal,
        fontFamily: defaults.header.frontal.fontFamily,
        fontWeight: defaults.header.frontal.fontWeight,
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
  return mergeBawSlayCardLayout(patch);
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
