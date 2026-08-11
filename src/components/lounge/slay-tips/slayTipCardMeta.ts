import type { SlayTip } from '../../../content/education/types';
import { slayTipPublicTitle } from './slayTipContent';

const PILLAR_TRICK_LABEL: Record<string, string> = {
  lace: 'LACE TRICK',
  color: 'COLOR TRICK',
  style: 'STYLING TRICK',
  styling: 'STYLING TRICK',
  care: 'CARE TRICK',
  installation: 'INSTALLATION TRICK',
  install: 'INSTALLATION TRICK',
  'after-care': 'UPKEEP TRICK',
};

/** Classifies the tip category for card metadata (Learn tab). */
export function slayTipTypeLabel(tip: SlayTip): string {
  const key = String(tip.pillar).toLowerCase();
  if (PILLAR_TRICK_LABEL[key]) return PILLAR_TRICK_LABEL[key];
  const pillar = String(tip.pillar).trim().toUpperCase();
  return pillar ? `${pillar} TRICK` : 'SLAY TRICK';
}

export function slayTipTicketCostLabel(tip: SlayTip): string | null {
  if (tip.comingSoon) return 'COMING SOON';
  if (tip.slayTicketCost > 0) {
    return `${tip.slayTicketCost} SLAY TICKET${tip.slayTicketCost === 1 ? '' : 'S'}`;
  }
  return 'FREE';
}

/** Estimated or authored read duration for scrapbook tips. */
export function slayTipReadDurationLabel(tip: SlayTip): string {
  if (tip.readTime?.trim()) {
    const normalized = tip.readTime.trim().toUpperCase();
    return normalized.includes('READ') ? normalized : `${normalized} READ`;
  }

  const pages = tip.pages ?? [];
  if (!pages.length) return '1 MIN READ';

  const wordCount = pages
    .flatMap((page) => [page.heading, page.body, page.callout])
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} MIN READ`;
}

/** Locked/public card headline — authored curiosity hook ({@link slayTipPublicTitle}). */
export function slayTipLearnCardTitle(tip: SlayTip): string {
  return slayTipPublicTitle(tip);
}
