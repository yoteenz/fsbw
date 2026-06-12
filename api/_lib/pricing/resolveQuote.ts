import { hairstyleAnalysisComparisonUsd } from '../hairstyleAnalysisPricing.js';

/**
 * Server-side USD pricing for checkout quotes (do not trust client `price` fields).
 * Keep in sync with booking appointment page + unit PDP base prices where possible.
 */

export type QuoteLineInput = {
  id?: string;
  name: string;
  quantity: number;
  type?: string;
  bookingInstallKind?: string;
  /** Matches booking appointment page `bookingStyle` (e.g. LAYERED CURLS → +$40). */
  bookingStyle?: string;
  bookingAddonIds?: string[];
  /** Wig consult — optional style analysis add-on comparison count (1 / 3 / 6). */
  consultStyleAnalysisComparisonCount?: 1 | 3 | 6;
  /** Standalone hairstyle analysis purchase (1 / 3 / 6 comparisons — same USD as consult add-on). */
  hairstyleAnalysisComparisonCount?: 1 | 3 | 6;
  bcfBundleDeal?: boolean;
  bcfBundleDealListSubtotal?: number;
  capSize?: string;
};

export type ResolvedQuoteLine = {
  key: string;
  description: string;
  quantity: number;
  amountCents: number;
  resolved: boolean;
  note?: string;
};

export type QuoteResult = {
  currency: 'usd';
  totalCents: number;
  lines: ResolvedQuoteLine[];
  /** True if every line was resolved with server rules (safe for PaymentIntent). */
  fullyResolved: boolean;
  /** Human-readable reasons for partial quotes. */
  warnings: string[];
};

/** Mirror `src/pages/booking/appointment/page.tsx` (USD, before currency display). */
const INSTALL_USD: Record<string, number> = {
  NEW_INSTALL: 275,
  RE_INSTALL: 225
};

const ADDON_USD: Record<string, number> = {
  braids: 60,
  'brow-clean': 40,
  'brow-tint': 60,
  'mink-lashes': 20,
  makeup: 250,
  'clean-lace': 40,
  travel: 1200
};

const CONSULT_DEPOSIT_USD = 40;

const CONSULT_STYLE_ANALYSIS_USD: Record<1 | 3 | 6, number> = {
  1: 20,
  3: 40,
  6: 60,
};

function consultStyleAnalysisAddonUsd(count: unknown): number {
  if (count === 1 || count === 3 || count === 6) return CONSULT_STYLE_ANALYSIS_USD[count];
  return 0;
}

/** Matches `src/pages/booking/appointment/page.tsx` — LAYERED CURLS style upcharge. */
const LAYERED_CURLS_STYLE_UPCHARGE_USD = 40;

/** Known unit / wig list prices (USD) — extend as catalog grows. */
const UNIT_BASE_USD_BY_NAME: Record<string, number> = {
  NOIR: 740,
  BLANCO: 820,
  'SOFT CURL': 780,
  'OCEAN CURL': 780,
  'SOFT WAVE': 760,
  'BEACH WAVE': 760,
  WIG: 740
};

function normalizeName(name: string): string {
  return (name || '').trim().toUpperCase();
}

function capSizeSurchargeUsd(cap?: string): number {
  if (!cap) return 0;
  const c = cap.trim().toUpperCase();
  if (c === 'XXS/XS/S' || c === 'S/M/L') return 40;
  return 0;
}

function appointmentAddonIdsForInstall(kind: string): Set<string> {
  const allowed = new Set<string>(Object.keys(ADDON_USD));
  if (kind === 'RE_INSTALL') return allowed;
  allowed.delete('clean-lace');
  return allowed;
}

function resolveBookingAppointment(line: QuoteLineInput, idx: number): ResolvedQuoteLine {
  const q = Math.max(1, Math.floor(line.quantity || 1));
  const kind = (line.bookingInstallKind || 'NEW_INSTALL').trim();
  const base = INSTALL_USD[kind];
  if (base == null) {
    return {
      key: `line-${idx}`,
      description: line.name || 'BOOKING',
      quantity: q,
      amountCents: 0,
      resolved: false,
      note: `Unknown bookingInstallKind: ${kind}`
    };
  }
  let usd = base;
  const allowedAddons = appointmentAddonIdsForInstall(kind);
  const ids = Array.isArray(line.bookingAddonIds) ? line.bookingAddonIds : [];
  for (const id of ids) {
    if (!allowedAddons.has(id)) continue;
    const add = ADDON_USD[id];
    if (add != null) usd += add;
  }
  const style = String(line.bookingStyle || '').trim().toUpperCase();
  if (style === 'LAYERED CURLS') {
    usd += LAYERED_CURLS_STYLE_UPCHARGE_USD;
  }
  const totalUsd = usd * q;
  return {
    key: `line-${idx}`,
    description: line.name || 'WIG INSTALLATION',
    quantity: q,
    amountCents: Math.round(totalUsd * 100),
    resolved: true
  };
}

function resolveHairstyleAnalysis(line: QuoteLineInput, idx: number): ResolvedQuoteLine {
  const q = Math.max(1, Math.floor(line.quantity || 1));
  const perUnitUsd = hairstyleAnalysisComparisonUsd(line.hairstyleAnalysisComparisonCount);
  if (perUnitUsd <= 0) {
    return {
      key: `line-${idx}`,
      description: line.name || 'HAIRSTYLE ANALYSIS',
      quantity: q,
      amountCents: 0,
      resolved: false,
      note: 'hairstyleAnalysisComparisonCount must be 1, 3, or 6',
    };
  }
  const totalUsd = perUnitUsd * q;
  return {
    key: `line-${idx}`,
    description: `${line.name || 'HAIRSTYLE ANALYSIS'} (${line.hairstyleAnalysisComparisonCount} comparisons, non-refundable)`,
    quantity: q,
    amountCents: Math.round(totalUsd * 100),
    resolved: true,
  };
}

function resolveBookingConsult(line: QuoteLineInput, idx: number): ResolvedQuoteLine {
  const q = Math.max(1, Math.floor(line.quantity || 1));
  const addonUsd = consultStyleAnalysisAddonUsd(line.consultStyleAnalysisComparisonCount);
  const totalUsd = (CONSULT_DEPOSIT_USD + addonUsd) * q;
  const addonNote =
    addonUsd > 0
      ? ` incl. $${addonUsd} style analysis add-on (${line.consultStyleAnalysisComparisonCount} comparisons, non-refundable)`
      : '';
  return {
    key: `line-${idx}`,
    description: `${line.name || 'WIG CONSULT'}${addonNote}`,
    quantity: q,
    amountCents: Math.round(totalUsd * 100),
    resolved: true
  };
}

function resolveUnitLike(line: QuoteLineInput, idx: number): ResolvedQuoteLine {
  const q = Math.max(1, Math.floor(line.quantity || 1));
  const n = normalizeName(line.name);
  const base = UNIT_BASE_USD_BY_NAME[n];
  if (base == null) {
    return {
      key: `line-${idx}`,
      description: line.name || 'ITEM',
      quantity: q,
      amountCents: 0,
      resolved: false,
      note: `Unknown product name for server catalog: ${line.name}`
    };
  }
  const cap = capSizeSurchargeUsd(line.capSize);
  const perUnitUsd = base + cap;
  return {
    key: `line-${idx}`,
    description: line.name,
    quantity: q,
    amountCents: Math.round(perUnitUsd * q * 100),
    resolved: true
  };
}

/**
 * Resolves cart lines to USD cents. Booking + consult + simple unit wigs are fully modeled.
 * BCF bundle-deal and build-a-wig custom lines are **not** fully resolved server-side yet (returns unresolved line).
 */
export function resolveCheckoutQuoteLines(lines: QuoteLineInput[]): QuoteResult {
  const warnings: string[] = [];
  const resolvedLines: ResolvedQuoteLine[] = [];

  if (!Array.isArray(lines) || lines.length === 0) {
    return {
      currency: 'usd',
      totalCents: 0,
      lines: [],
      fullyResolved: true,
      warnings: []
    };
  }

  lines.forEach((line, idx) => {
    const t = (line.type || '').trim();

    if (line.bcfBundleDeal) {
      resolvedLines.push({
        key: `line-${idx}`,
        description: line.name || 'BCF BUNDLE',
        quantity: Math.max(1, Math.floor(line.quantity || 1)),
        amountCents: 0,
        resolved: false,
        note: 'BCF bundle-deal pricing requires full server catalog (phase 2)'
      });
      warnings.push('BCF bundle-deal lines are not server-priced yet; use client checkout or expand API.');
      return;
    }

    if (t === 'booking-appointment') {
      resolvedLines.push(resolveBookingAppointment(line, idx));
      return;
    }

    if (t === 'booking-consult') {
      resolvedLines.push(resolveBookingConsult(line, idx));
      return;
    }

    if (t === 'hairstyle-analysis') {
      resolvedLines.push(resolveHairstyleAnalysis(line, idx));
      return;
    }

    if (t === 'gift-card' || t === 'membership' || t === 'subscription') {
      resolvedLines.push({
        key: `line-${idx}`,
        description: line.name,
        quantity: Math.max(1, Math.floor(line.quantity || 1)),
        amountCents: 0,
        resolved: false,
        note: `Line type "${t}" not handled by product PaymentIntent`
      });
      warnings.push(`Skipped type "${t}" in server quote.`);
      return;
    }

    const unit = resolveUnitLike(line, idx);
    resolvedLines.push(unit);
    if (!unit.resolved) warnings.push(unit.note || 'Unresolved unit line');
  });

  const totalCents = resolvedLines.filter((l) => l.resolved).reduce((s, l) => s + l.amountCents, 0);
  const fullyResolved = resolvedLines.length > 0 && resolvedLines.every((l) => l.resolved);

  return {
    currency: 'usd',
    totalCents,
    lines: resolvedLines,
    fullyResolved,
    warnings
  };
}
