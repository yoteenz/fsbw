export const BAW_SLAY_CARD_TEMPLATE_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/00C5D5BE-1F40-4974-A2DF-F02616BD231B.png';

export const BAW_SLAY_CARD_SLAYER_LOGO_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content/IMG_4820.png';

export const BAW_SLAY_CARD_LAYOUT_DEBUG_KEY = 'baw_slay_card_layout_debug_v2';

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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  return mergeDeep(DEFAULT_BAW_SLAY_CARD_LAYOUT, patch ?? undefined);
}

export function loadBawSlayCardLayoutDebug(): BawSlayCardLayout {
  if (typeof window === 'undefined') return DEFAULT_BAW_SLAY_CARD_LAYOUT;
  try {
    const raw = localStorage.getItem(BAW_SLAY_CARD_LAYOUT_DEBUG_KEY);
    if (!raw) return DEFAULT_BAW_SLAY_CARD_LAYOUT;
    const parsed = JSON.parse(raw) as Partial<BawSlayCardLayout>;
    return mergeBawSlayCardLayout(parsed);
  } catch {
    return DEFAULT_BAW_SLAY_CARD_LAYOUT;
  }
}

export function saveBawSlayCardLayoutDebug(layout: BawSlayCardLayout): void {
  localStorage.setItem(BAW_SLAY_CARD_LAYOUT_DEBUG_KEY, JSON.stringify(layout, null, 2));
}

export function clearBawSlayCardLayoutDebug(): void {
  localStorage.removeItem(BAW_SLAY_CARD_LAYOUT_DEBUG_KEY);
}

export function formatBawSlayCardLayoutForCopy(layout: BawSlayCardLayout): string {
  return JSON.stringify(layout, null, 2);
}
