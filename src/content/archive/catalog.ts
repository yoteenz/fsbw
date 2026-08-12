import {
  contentPacksForExploreSection,
  type LoungeContentPack,
} from '../../components/lounge/loungeTvContentPack';
import { resolvePackArtwork } from '../../components/lounge/loungeTvArtwork';
import type { ArchiveCampaign, ArchiveRestorationSummary } from './types';

const ARCHIVE_TIMELINE_DEPTH = 8;

function packArchiveYear(pack: LoungeContentPack): number | undefined {
  const meta = pack as LoungeContentPack & { archiveYear?: number };
  if (typeof meta.archiveYear === 'number') return meta.archiveYear;
  const match = pack.releaseDate?.match(/^(\d{4})/);
  return match ? Number(match[1]) : undefined;
}

function campaignFromPack(pack: LoungeContentPack, year: number): ArchiveCampaign {
  return {
    id: `archive-${year}-${pack.id}`,
    year,
    title: pack.title,
    thumbnail: resolvePackArtwork(pack, 'card'),
    status: 'restored',
    campaignType: pack.category,
    contentPackId: pack.id,
    restoredAt: pack.releaseDate,
    description: pack.subtitle,
  };
}

function placeholderCampaign(year: number, currentYear: number): ArchiveCampaign {
  if (year === currentYear) {
    return {
      id: `archive-${year}`,
      year,
      status: 'restoring',
    };
  }

  return {
    id: `archive-${year}`,
    year,
    status: 'sealed',
  };
}

/** Archive timeline — newest first; grows with future years without layout changes. */
export function getArchiveCampaigns(): ArchiveCampaign[] {
  const currentYear = new Date().getFullYear();
  const packs = contentPacksForExploreSection('the-archive');
  const restoredByYear = new Map<number, LoungeContentPack>();

  for (const pack of packs) {
    const year = packArchiveYear(pack) ?? currentYear;
    if (!restoredByYear.has(year)) restoredByYear.set(year, pack);
  }

  const campaigns: ArchiveCampaign[] = [];

  for (let offset = 0; offset < ARCHIVE_TIMELINE_DEPTH; offset += 1) {
    const year = currentYear - offset;
    const pack = restoredByYear.get(year);
    campaigns.push(pack ? campaignFromPack(pack, year) : placeholderCampaign(year, currentYear));
  }

  return campaigns;
}

export function getArchiveRestorationSummary(
  campaigns: ArchiveCampaign[] = getArchiveCampaigns(),
): ArchiveRestorationSummary {
  const restoredCount = campaigns.filter((c) => c.status === 'restored').length;
  const totalCount = campaigns.length;
  return {
    restoredCount,
    totalCount,
    inProgress: restoredCount < totalCount,
  };
}

export function getArchiveCampaignById(id: string): ArchiveCampaign | undefined {
  return getArchiveCampaigns().find((c) => c.id === id);
}
