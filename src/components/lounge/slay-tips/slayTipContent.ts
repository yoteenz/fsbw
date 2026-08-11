import type { SlayTip } from '../../../content/education/types';

const warnedMissingPublicTitle = new Set<string>();

/** Locked/public headline — curiosity hook, never the actionable solution. */
export function slayTipPublicTitle(tip: SlayTip): string {
  const authored = tip.publicTitle?.trim() || tip.cardTitle?.trim();
  if (authored) return authored.toUpperCase();

  if (import.meta.env.DEV && !warnedMissingPublicTitle.has(tip.id)) {
    warnedMissingPublicTitle.add(tip.id);
    console.warn(
      `[SlayTip] "${tip.id}" is missing publicTitle — using title fallback. Assign publicTitle for editorial migration.`,
    );
  }
  return tip.title.trim();
}

/** Unlocked reveal — concise actionable tip after Slay Ticket spend. */
export function slayTipRevealTitle(tip: SlayTip): string | null {
  const reveal = tip.revealTitle?.trim();
  return reveal ? reveal : null;
}

/** Locked-state preview — relevance without spoiling the answer. */
export function slayTipPreviewCopy(tip: SlayTip): string | null {
  const preview = tip.previewCopy?.trim();
  if (preview) return preview;
  const legacy = tip.shortDescription?.trim();
  return legacy || null;
}

/** True when a published tip still needs an authored publicTitle. */
export function slayTipNeedsEditorialMigration(tip: SlayTip): boolean {
  return tip.published !== false && !tip.publicTitle?.trim();
}

/** Search/catalog haystack — public fields only; excludes reveal and scrapbook bodies. */
export function slayTipPublicHaystack(tip: SlayTip): string {
  return [
    slayTipPublicTitle(tip),
    tip.subtitle,
    slayTipPreviewCopy(tip),
    tip.pillar,
    tip.tags?.join(' '),
    tip.readTime,
  ]
    .filter(Boolean)
    .join(' ');
}
