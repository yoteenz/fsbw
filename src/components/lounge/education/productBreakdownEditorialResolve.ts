import type { ProductBreakdownPresentationEntry } from './productBreakdownPresentation';
import type { ProductBreakdownEditorialContent } from '../../../content/education/product-breakdown/types';
import { productBreakdownCoreSpecLine } from '../../../content/education/product-breakdown';
import { contentPackToTile } from '../loungeTvContent';
import { loungeTvContentIsAccessible } from '../loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { getContentPackById } from '../loungeTvContentPack';

export function productBreakdownReadTimeLabel(
  entry: ProductBreakdownPresentationEntry,
  content: ProductBreakdownEditorialContent,
): string {
  const raw = content.readTime ?? getContentPackById(entry.packId)?.readTime;
  if (!raw) return '4 MIN READ';
  const trimmed = raw.replace(/\s*read/i, '').trim();
  return trimmed.includes('MIN') ? `${trimmed} READ` : `${trimmed} MIN READ`;
}

export function productBreakdownAccessMetaLabel(
  entry: ProductBreakdownPresentationEntry,
  unlocks?: LoungeContentUnlock[],
  isUnlocked?: (contentId: string) => boolean,
): string {
  const pack = getContentPackById(entry.packId);
  if (!pack) return 'FREE';
  const tile = contentPackToTile(pack);
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  if (accessible && (pack.ticketCost ?? 0) === 0) return 'FREE';
  if (accessible) return 'UNLOCKED';
  if ((pack.ticketCost ?? 0) > 0) return `${pack.ticketCost} SLAY TICKET${pack.ticketCost === 1 ? '' : 'S'}`;
  return 'PREMIUM';
}

export function resolveProductBreakdownHeroMedia(content: ProductBreakdownEditorialContent) {
  return [...(content.heroMedia ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function productBreakdownCoreSpecs(
  entry: ProductBreakdownPresentationEntry,
): string {
  return productBreakdownCoreSpecLine(entry);
}

export function resolveProductBreakdownImage(
  content: ProductBreakdownEditorialContent,
  imageId: string | undefined,
) {
  if (!imageId) return undefined;
  const pool = [
    ...(content.heroMedia ?? []),
    ...(content.interiorImage ? [content.interiorImage] : []),
    ...(content.includedImage ? [content.includedImage] : []),
    ...(content.inspectionPoints?.map((p) => p.image).filter(Boolean) ?? []),
  ];
  return pool.find((img) => img?.id === imageId);
}
