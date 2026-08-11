import type { LoungeContentPack } from './loungeTvContentPack';
import { episodeRefForPack } from './loungeTvStreamSeries';

/** Replace title/subtitle em/en dashes with colon for TV card display. */
export function loungeTvDisplayTitle(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ': ')
    .replace(/\s+-\s+(?=[A-Z&])/g, ': ');
}

function episodeNumberLabel(pack: LoungeContentPack): string | null {
  const ref = episodeRefForPack(pack);
  const num = pack.episode ?? ref?.episodeNumber;
  if (num == null) return null;
  return `EP ${String(num).padStart(2, '0')}`;
}

function episodeNameFromPack(pack: LoungeContentPack): string | null {
  const ref = episodeRefForPack(pack);
  if (ref?.episodeTitle) return ref.episodeTitle;
  const dashMatch = pack.title.match(/\s*[—–]\s*(.+)$/);
  if (dashMatch) return dashMatch[1].trim();
  const colonMatch = pack.title.match(/:\s*(.+)$/);
  if (colonMatch) return colonMatch[1].trim();
  return null;
}

/** Detail body copy — em/en dashes become commas for TV readability. */
export function loungeTvDisplayBodyText(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ', ');
}

/** Split certification reward title into primary + secondary lines for nested card layout. */
export function loungeTvCertificationTitleLines(title: string): string[] {
  const dashMatch = title.match(/^(.+?)\s*[—–]\s*(.+)$/);
  if (dashMatch) {
    return [dashMatch[1].trim().toUpperCase(), dashMatch[2].trim().toUpperCase()];
  }
  return [title.toUpperCase()];
}

/** Detail page heading — EP + episode name instead of repeating series title. */
export function loungeTvContentDetailHeading(pack: LoungeContentPack): string {
  const ep = episodeNumberLabel(pack);
  const name = episodeNameFromPack(pack);
  if (ep && name) return `${ep} ${name}`;
  if (name) return name;
  return loungeTvDisplayTitle(pack.title);
}

/** ISO or display date → M/D/YY for root card metadata. */
export function loungeTvFormatCardDate(releaseDate: string): string {
  const iso = releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const year = iso[1].slice(-2);
    return `${month}/${day}/${year}`;
  }
  return releaseDate;
}
