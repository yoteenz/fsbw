/**
 * Server-side PSA context prefetch — inject founder pick, DNA score, lounge lessons
 * before the model runs so recommendations do not depend on tool discipline alone.
 */
import type { PsaMemberContextSnapshot } from './psaMemberContext.js';
import { founderTasteForUnitId } from './psaFounderTaste.js';
import { matchPsaLoungeLessons } from './psaLoungeLessons.js';
import { buildPsaSlayDna, scoreUnitAgainstSlayDna } from './psaSlayDna.js';

const UNIT_CATALOG: { id: string; names: string[] }[] = [
  { id: 'noir', names: ['NOIR', 'noir'] },
  { id: 'blanco', names: ['BLANCO', 'blanco'] },
  { id: 'soft-wave', names: ['SOFT WAVE', 'soft wave', 'soft-wave'] },
  { id: 'beach-wave', names: ['BEACH WAVE', 'beach wave', 'beach-wave'] },
  { id: 'soft-curl', names: ['SOFT CURL', 'soft curl', 'soft-curl'] },
  { id: 'ocean-curl', names: ['OCEAN CURL', 'ocean curl', 'ocean-curl'] },
];

function unitIdFromPathname(pathname: string): string | null {
  const m = pathname.match(/\/(?:build-a-wig|shop\/units)\/([a-z-]+)/i);
  if (!m?.[1]) return null;
  const id = m[1].toLowerCase();
  return UNIT_CATALOG.some((u) => u.id === id) ? id : null;
}

function detectUnitIds(message: string, clientContext?: Record<string, unknown>): string[] {
  const found = new Set<string>();
  const blob = `${message} ${String(clientContext?.pathname ?? '')}`.toLowerCase();

  const baw = clientContext?.bawDraft as { buildPath?: string; unitLabel?: string } | undefined;
  if (baw?.buildPath) {
    const fromBaw = unitIdFromPathname(baw.buildPath);
    if (fromBaw) found.add(fromBaw);
  }
  const pathUnit = unitIdFromPathname(String(clientContext?.pathname ?? ''));
  if (pathUnit) found.add(pathUnit);

  for (const unit of UNIT_CATALOG) {
    for (const name of unit.names) {
      if (blob.includes(name.toLowerCase())) {
        found.add(unit.id);
        break;
      }
    }
  }

  return [...found].slice(0, 3);
}

function isShoppingContext(clientContext?: Record<string, unknown>): boolean {
  const path = String(clientContext?.pathname ?? '');
  if (/^\/build-a-wig(\/|$)/i.test(path)) return true;
  if (/^\/shop\/units\//i.test(path)) return true;
  const cart = clientContext?.cart as { itemCount?: number } | undefined;
  return (cart?.itemCount ?? 0) > 0;
}

export function buildPsaContextPrefetchBlock(input: {
  message: string;
  clientContext?: Record<string, unknown>;
  memberCtx: PsaMemberContextSnapshot | null;
}): string {
  const unitIds = detectUnitIds(input.message, input.clientContext);
  const onShopSurface = isShoppingContext(input.clientContext) || unitIds.length > 0;
  if (!onShopSurface && unitIds.length === 0) return '';

  const lines: string[] = [
    '## Prefetched context (authoritative for this turn — use in your reply; do not re-call these tools unless the member changes units)',
  ];

  const dna = input.memberCtx ? buildPsaSlayDna(input.memberCtx) : null;

  if (unitIds.length) {
    for (const unitId of unitIds) {
      const taste = founderTasteForUnitId(unitId);
      if (taste) {
        lines.push(
          `- **Founder pick (${taste.unitName}):** ${taste.personalPick}`,
          `  - Steer away when: ${taste.whenToSteerAway ?? 'n/a'}`
        );
      }
      if (dna) {
        const score = scoreUnitAgainstSlayDna(dna, unitId);
        lines.push(`- **Slay DNA vs ${unitId}:** ${score.level} — ${score.reason}`);
      }
      const lessons = matchPsaLoungeLessons(`${unitId} maintenance styling`, 1);
      if (lessons[0]) {
        lines.push(`- **Lounge lesson:** ${lessons[0].title} — ${lessons[0].note}`);
      }
    }
  } else if (onShopSurface && dna?.primaryUnits?.length) {
    const primary = dna.primaryUnits[0];
    const unitRow = UNIT_CATALOG.find((u) => u.names.includes(primary));
    if (unitRow) {
      const taste = founderTasteForUnitId(unitRow.id);
      if (taste) {
        lines.push(`- **Founder pick (rotation signal ${primary}):** ${taste.personalPick}`);
      }
    }
  }

  if (lines.length <= 1) return '';
  lines.push('- Lead with taste and DNA fit when recommending. Still verify cart/orders with action tools if acting.');
  return `\n${lines.join('\n')}\n`;
}
