import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeTvContentArtwork } from './loungeTvStreamingTypes';

export type LoungeTvArtworkRole =
  | 'landscape'
  | 'portrait'
  | 'hero'
  | 'episode'
  | 'preview'
  | 'hover'
  | 'card';

const FALLBACK_POSTERS = [
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
] as const;

function hashPick(id: string, pool: readonly string[]): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) % pool.length;
  return pool[h] ?? pool[0];
}

export function defaultArtworkForPack(pack: LoungeContentPack): LoungeTvContentArtwork {
  const base = pack.thumbnail ?? pack.heroImage ?? hashPick(pack.id, FALLBACK_POSTERS);
  const alt = hashPick(`${pack.id}-alt`, FALLBACK_POSTERS);
  return {
    landscapeCover: base,
    portraitCover: alt,
    heroBanner: pack.heroImage ?? base,
    episodeThumbnail: pack.streaming?.artwork?.episodeThumbnail ?? base,
    previewImage: pack.streaming?.artwork?.previewImage ?? alt,
    hoverImage: pack.streaming?.artwork?.hoverImage ?? alt,
  };
}

export function resolvePackArtwork(pack: LoungeContentPack, role: LoungeTvArtworkRole = 'card'): string {
  const merged = { ...defaultArtworkForPack(pack), ...pack.streaming?.artwork };
  switch (role) {
    case 'landscape':
      return merged.landscapeCover ?? merged.episodeThumbnail ?? pack.thumbnail ?? FALLBACK_POSTERS[0];
    case 'portrait':
      return merged.portraitCover ?? merged.landscapeCover ?? pack.thumbnail ?? FALLBACK_POSTERS[0];
    case 'hero':
      return merged.heroBanner ?? pack.heroImage ?? merged.landscapeCover ?? FALLBACK_POSTERS[0];
    case 'episode':
      return merged.episodeThumbnail ?? merged.landscapeCover ?? pack.thumbnail ?? FALLBACK_POSTERS[0];
    case 'preview':
      return merged.previewImage ?? merged.landscapeCover ?? pack.thumbnail ?? FALLBACK_POSTERS[0];
    case 'hover':
      return merged.hoverImage ?? merged.previewImage ?? merged.landscapeCover ?? pack.thumbnail ?? FALLBACK_POSTERS[0];
    case 'card':
    default:
      return merged.episodeThumbnail ?? merged.landscapeCover ?? pack.thumbnail ?? FALLBACK_POSTERS[0];
  }
}
