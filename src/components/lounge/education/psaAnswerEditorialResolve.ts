import type {
  PsaAnswerArticleModule,
  PsaAnswerEditorialContent,
} from '../../../content/education/psa-answers/types';
import type { PsaAnswerPresentationEntry } from './psaAnswersPresentation';
import { getContentPackById } from '../loungeTvContentPack';
import { contentPackToTile } from '../loungeTvContent';
import { loungeTvContentIsAccessible } from '../loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import type { SlayTipEditorialImage } from '../../../content/education/types';

export function resolvePsaAnswerHeroMedia(content: PsaAnswerEditorialContent): SlayTipEditorialImage[] {
  return [...(content.heroMedia ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function resolvePsaAnswerImage(
  content: PsaAnswerEditorialContent,
  imageId?: string,
  inline?: SlayTipEditorialImage,
): SlayTipEditorialImage | undefined {
  if (inline) return inline;
  if (!imageId) return undefined;
  return resolvePsaAnswerHeroMedia(content).find((img) => img.id === imageId);
}

export function resolvePsaAnswerModules(content: PsaAnswerEditorialContent): PsaAnswerArticleModule[] {
  if (content.modules?.length) return content.modules;
  if (content.directAnswer) return [{ type: 'psaSays', body: content.directAnswer }];
  return [];
}

export function psaAnswerReadTimeLabel(
  entry: PsaAnswerPresentationEntry,
  content: PsaAnswerEditorialContent,
): string {
  const raw = content.readTime ?? getContentPackById(entry.packId)?.readTime;
  if (raw?.trim()) {
    const normalized = raw.trim().toUpperCase();
    return normalized.includes('READ') ? normalized : `${normalized} READ`;
  }
  return '3 MIN READ';
}

export function psaAnswerAccessMetaLabel(
  entry: PsaAnswerPresentationEntry,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean,
): string {
  const pack = getContentPackById(entry.packId);
  if (!pack) return 'FREE';
  const tile = contentPackToTile(pack);
  if ((tile.ticketCost ?? 0) <= 0 || pack.isFreePreview) return 'FREE';
  if (loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked)) return 'UNLOCKED';
  return tile.ticketCost === 1 ? '1 SLAY TICKET' : `${tile.ticketCost} SLAY TICKETS`;
}
