import type {
  SlayTip,
  SlayTipArticleModule,
  SlayTipEditorialImage,
} from '../../../content/education/types';
import { slayTipPreviewImageUrl } from './slayTipDetailMeta';
import { slayTipRevealTitle } from './slayTipContent';

function sortImages(images: SlayTipEditorialImage[]): SlayTipEditorialImage[] {
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function imagesFromLegacyPages(tip: SlayTip): SlayTipEditorialImage[] {
  const pages = [...(tip.pages ?? [])].sort((a, b) => a.order - b.order);
  return pages
    .filter((p) => p.imageUrl)
    .map((p, index) => ({
      id: p.id,
      src: p.imageUrl!,
      alt: p.altText,
      caption: p.heading,
      role: index === 0 ? ('hero' as const) : ('supporting' as const),
      order: index,
    }));
}

/** Resolved hero collage for detail — authored heroMedia or legacy page/cover fallbacks. */
export function resolveSlayTipHeroMedia(tip: SlayTip): SlayTipEditorialImage[] {
  if (tip.heroMedia?.length) return sortImages(tip.heroMedia);

  const fromPages = imagesFromLegacyPages(tip);
  if (fromPages.length) return fromPages;

  const cover = tip.coverImageUrl ?? tip.thumbnailUrl ?? slayTipPreviewImageUrl(tip);
  if (cover) {
    return [{ id: `${tip.id}-cover`, src: cover, alt: tip.title, role: 'hero', order: 0 }];
  }
  return [];
}

/** Limited hero for locked preview — first dominant image only. */
export function resolveSlayTipLockedHeroMedia(tip: SlayTip): SlayTipEditorialImage[] {
  const all = resolveSlayTipHeroMedia(tip);
  const hero = all.find((img) => img.role === 'hero') ?? all[0];
  return hero ? [hero] : [];
}

function buildImageLookup(tip: SlayTip): Map<string, SlayTipEditorialImage> {
  const map = new Map<string, SlayTipEditorialImage>();
  for (const img of resolveSlayTipHeroMedia(tip)) {
    map.set(img.id, img);
  }
  for (const mod of tip.modules ?? []) {
    if (mod.type === 'lookCloser') {
      for (const item of mod.items) {
        if (item.image) map.set(item.image.id, item.image);
      }
    }
    if (mod.type === 'comparison') {
      if (mod.leftImage) map.set(mod.leftImage.id, mod.leftImage);
      if (mod.rightImage) map.set(mod.rightImage.id, mod.rightImage);
    }
    if (mod.type === 'image') {
      map.set(mod.image.id, mod.image);
    }
  }
  return map;
}

export function resolveSlayTipImage(
  tip: SlayTip,
  imageId: string | undefined,
  inline?: SlayTipEditorialImage
): SlayTipEditorialImage | undefined {
  if (inline) return inline;
  if (!imageId) return undefined;
  return buildImageLookup(tip).get(imageId);
}

function modulesFromLegacyPages(tip: SlayTip): SlayTipArticleModule[] {
  const modules: SlayTipArticleModule[] = [];
  const reveal = slayTipRevealTitle(tip);
  if (reveal) modules.push({ type: 'quickRead', body: reveal });

  const pages = [...(tip.pages ?? [])].sort((a, b) => a.order - b.order);
  for (const page of pages) {
    if (page.imageUrl && page.layout !== 'text-focus') {
      modules.push({
        type: 'image',
        layout: page.layout === 'split' ? 'wide' : 'standard',
        image: {
          id: page.id,
          src: page.imageUrl,
          alt: page.altText,
          caption: page.heading,
        },
      });
    }
    if (page.heading || page.body) {
      modules.push({
        type: 'text',
        heading: page.heading,
        body: page.body ?? '',
      });
    }
    if (page.callout) {
      modules.push({ type: 'callout', body: page.callout });
    }
  }
  return modules;
}

/** Editorial article modules — authored modules or legacy page conversion. */
export function resolveSlayTipModules(tip: SlayTip): SlayTipArticleModule[] {
  if (tip.modules?.length) return tip.modules;
  return modulesFromLegacyPages(tip);
}

/** Access label for masthead metadata line. */
export function slayTipAccessMetaLabel(tip: SlayTip, accessGranted: boolean): string {
  if (tip.slayTicketCost <= 0) return 'FREE';
  if (accessGranted) return 'UNLOCKED';
  return tip.slayTicketCost === 1 ? '1 SLAY TICKET' : `${tip.slayTicketCost} SLAY TICKETS`;
}

/** Read time label — authored or estimated from modules/pages. */
export function slayTipReadTimeLabel(tip: SlayTip): string {
  if (tip.readTime?.trim()) {
    const normalized = tip.readTime.trim().toUpperCase();
    return normalized.includes('READ') ? normalized : `${normalized} READ`;
  }
  const modules = resolveSlayTipModules(tip);
  const wordCount = modules
    .flatMap((m) => {
      if (m.type === 'quickRead' || m.type === 'takeaway' || m.type === 'callout') return [m.body];
      if (m.type === 'text') return [m.heading, m.body];
      if (m.type === 'slayerNote') return [m.body];
      if (m.type === 'lookCloser') return m.items.flatMap((i) => [i.label, i.caption]);
      if (m.type === 'diagnosticRow') return [m.seeing, m.notToDo, m.move];
      return [];
    })
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} MIN READ`;
}
