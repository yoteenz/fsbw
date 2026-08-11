import type { CSSProperties, ReactNode } from 'react';
import type {
  SlayTip,
  SlayTipArticleModule,
  SlayTipEditorialImage,
  SlayTipLookCloserItem,
} from '../../../content/education/types';
import type { PSATodayEpisode } from '../psa-today/types';
import { getSlayTipById } from '../../../content/education/catalog';
import { getEducationMasteryById, getEducationSeasonById } from '../../../content/education';
import { getPsaTodayEpisodeById } from '../psa-today/psaTodayCatalog';
import { LOUNGE_TV_DETAIL_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import {
  resolveSlayTipImage,
  slayTipAccessMetaLabel,
  slayTipReadTimeLabel,
} from './slayTipEditorialResolve';
import { slayTipDetailCategoryLabel, slayTipRelatedClassMetaLine, slayTipRelatedClassThumbnail } from './slayTipDetailMeta';
import { slayTipPreviewCopy, slayTipPublicTitle } from './slayTipContent';

const SLAYER_NOTE_FONT =
  "'Covered By Your Grace', 'Covered By Your Grace Preload', 'Futura PT Book', cursive";

type SlayTipMastheadProps = {
  tip: SlayTip;
  accessGranted: boolean;
  showTeaser?: boolean;
};

export function SlayTipMasthead({ tip, accessGranted, showTeaser = true }: SlayTipMastheadProps) {
  const category = slayTipDetailCategoryLabel(tip);
  const publicTitle = slayTipPublicTitle(tip);
  const teaser = showTeaser ? slayTipPreviewCopy(tip) : null;
  const readTime = slayTipReadTimeLabel(tip);
  const access = slayTipAccessMetaLabel(tip, accessGranted);

  return (
    <header className="lounge-tv-slay-tip-editorial__masthead">
      <p className="lounge-tv-slay-tip-editorial__eyebrow">SLAY TIP · {category}</p>
      <h1 className="lounge-tv-slay-tip-editorial__title">{publicTitle}</h1>
      {teaser ? <p className="lounge-tv-slay-tip-editorial__teaser">{teaser}</p> : null}
      <p className="lounge-tv-slay-tip-editorial__meta">
        {readTime} · {access}
      </p>
    </header>
  );
};

type SlayTipHeroCollageProps = {
  images: SlayTipEditorialImage[];
  locked?: boolean;
};

export function SlayTipHeroCollage({ images, locked = false }: SlayTipHeroCollageProps) {
  if (!images.length) return null;

  const hero = images.find((img) => img.role === 'hero') ?? images[0];
  const supporting = images.filter((img) => img.id !== hero.id).slice(0, locked ? 0 : 3);

  return (
    <figure
      className={`lounge-tv-slay-tip-editorial__hero${locked ? ' lounge-tv-slay-tip-editorial__hero--locked' : ''}`}
      aria-label="Editorial image composition"
    >
      <div className="lounge-tv-slay-tip-editorial__hero-main">
        <EditorialImage image={hero} priority />
      </div>
      {supporting.length ? (
        <div className="lounge-tv-slay-tip-editorial__hero-support">
          {supporting.map((img) => (
            <div key={img.id} className="lounge-tv-slay-tip-editorial__hero-support-cell">
              <EditorialImage image={img} />
            </div>
          ))}
        </div>
      ) : null}
    </figure>
  );
};

type EditorialImageProps = {
  image: SlayTipEditorialImage;
  priority?: boolean;
  className?: string;
};

function EditorialImage({ image, priority, className }: EditorialImageProps) {
  return (
    <div className={`lounge-tv-slay-tip-editorial__figure${className ? ` ${className}` : ''}`}>
      <img
        src={image.src}
        alt={image.alt ?? ''}
        draggable={false}
        loading={priority ? 'eager' : 'lazy'}
        style={{ objectPosition: image.objectPosition ?? 'center center' }}
        className="lounge-tv-slay-tip-editorial__img"
      />
      {image.annotations?.length ? (
        <div className="lounge-tv-slay-tip-editorial__annotations" aria-hidden>
          {image.annotations.map((ann) => (
            <span
              key={ann.id}
              className="lounge-tv-slay-tip-editorial__annotation"
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            >
              {ann.marker ?? ann.label}
            </span>
          ))}
        </div>
      ) : null}
      {image.caption ? (
        <figcaption className="lounge-tv-slay-tip-editorial__caption">{image.caption}</figcaption>
      ) : null}
    </div>
  );
};

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="lounge-tv-slay-tip-editorial__section-heading">
      <span className="lounge-tv-slay-tip-editorial__section-rule" aria-hidden />
      {children}
    </h2>
  );
}

type SlayTipArticleRendererProps = {
  tip: SlayTip;
  modules: SlayTipArticleModule[];
};

export function SlayTipArticleRenderer({ tip, modules }: SlayTipArticleRendererProps) {
  if (!modules.length) return null;

  return (
    <div className="lounge-tv-slay-tip-editorial__article">
      {modules.map((mod, index) => (
        <ArticleModule key={`${mod.type}-${index}`} tip={tip} module={mod} />
      ))}
    </div>
  );
};

function ArticleModule({ tip, module: mod }: { tip: SlayTip; module: SlayTipArticleModule }) {
  switch (mod.type) {
    case 'quickRead':
      return (
        <section className="lounge-tv-slay-tip-editorial__module">
          <SectionHeading>THE QUICK READ</SectionHeading>
          <p className="lounge-tv-slay-tip-editorial__body">{mod.body}</p>
        </section>
      );

    case 'diagnosticRow':
      return (
        <section className="lounge-tv-slay-tip-editorial__module lounge-tv-slay-tip-editorial__diagnostic">
          <div className="lounge-tv-slay-tip-editorial__diagnostic-item">
            <p className="lounge-tv-slay-tip-editorial__diagnostic-label">WHAT YOU&apos;RE SEEING</p>
            <p className="lounge-tv-slay-tip-editorial__diagnostic-copy">{mod.seeing}</p>
          </div>
          <div className="lounge-tv-slay-tip-editorial__diagnostic-item">
            <p className="lounge-tv-slay-tip-editorial__diagnostic-label">WHAT NOT TO DO</p>
            <p className="lounge-tv-slay-tip-editorial__diagnostic-copy">{mod.notToDo}</p>
          </div>
          <div className="lounge-tv-slay-tip-editorial__diagnostic-item">
            <p className="lounge-tv-slay-tip-editorial__diagnostic-label">THE MOVE</p>
            <p className="lounge-tv-slay-tip-editorial__diagnostic-copy">{mod.move}</p>
          </div>
        </section>
      );

    case 'lookCloser':
      return (
        <section className="lounge-tv-slay-tip-editorial__module">
          <SectionHeading>LOOK CLOSER</SectionHeading>
          <div className="lounge-tv-slay-tip-editorial__look-closer">
            {mod.items.map((item) => (
              <LookCloserItem key={item.number} tip={tip} item={item} />
            ))}
          </div>
        </section>
      );

    case 'slayerNote':
      return (
        <aside className="lounge-tv-slay-tip-editorial__slayer-note">
          <p className="lounge-tv-slay-tip-editorial__slayer-note-label">
            SLAYER NOTE {mod.number ?? '01'}
          </p>
          <p className="lounge-tv-slay-tip-editorial__slayer-note-body">{mod.body}</p>
        </aside>
      );

    case 'comparison': {
      const left = resolveSlayTipImage(tip, mod.leftImageId, mod.leftImage);
      const right = resolveSlayTipImage(tip, mod.rightImageId, mod.rightImage);
      if (!left && !right) return null;
      return (
        <section className="lounge-tv-slay-tip-editorial__module lounge-tv-slay-tip-editorial__comparison">
          <p className="lounge-tv-slay-tip-editorial__comparison-heading">THIS ≠ THIS</p>
          <div className="lounge-tv-slay-tip-editorial__comparison-row">
            {left ? (
              <div className="lounge-tv-slay-tip-editorial__comparison-cell">
                <EditorialImage image={left} className="lounge-tv-slay-tip-editorial__comparison-img" />
                <p className="lounge-tv-slay-tip-editorial__comparison-label">{mod.leftLabel}</p>
              </div>
            ) : null}
            {right ? (
              <div className="lounge-tv-slay-tip-editorial__comparison-cell">
                <EditorialImage image={right} className="lounge-tv-slay-tip-editorial__comparison-img" />
                <p className="lounge-tv-slay-tip-editorial__comparison-label">{mod.rightLabel}</p>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    case 'takeaway':
      return (
        <section className="lounge-tv-slay-tip-editorial__module">
          <SectionHeading>THE TAKEAWAY</SectionHeading>
          <p className="lounge-tv-slay-tip-editorial__body lounge-tv-slay-tip-editorial__takeaway">
            {mod.body}
          </p>
        </section>
      );

    case 'text':
      return (
        <section className="lounge-tv-slay-tip-editorial__module">
          {mod.heading ? (
            <h3 className="lounge-tv-slay-tip-editorial__text-heading">{mod.heading}</h3>
          ) : null}
          {mod.body ? <p className="lounge-tv-slay-tip-editorial__body">{mod.body}</p> : null}
        </section>
      );

    case 'image':
      return (
        <section
          className={`lounge-tv-slay-tip-editorial__module lounge-tv-slay-tip-editorial__image-block lounge-tv-slay-tip-editorial__image-block--${mod.layout ?? 'standard'}`}
        >
          <EditorialImage image={mod.image} />
        </section>
      );

    case 'callout':
      return (
        <aside className="lounge-tv-slay-tip-editorial__callout">
          <p>{mod.body}</p>
        </aside>
      );

    default:
      return null;
  }
}

function LookCloserItem({ tip, item }: { tip: SlayTip; item: SlayTipLookCloserItem }) {
  const image = resolveSlayTipImage(tip, item.imageId, item.image);
  return (
    <article className="lounge-tv-slay-tip-editorial__look-item">
      <p className="lounge-tv-slay-tip-editorial__look-number">{item.number}</p>
      <p className="lounge-tv-slay-tip-editorial__look-label">{item.label}</p>
      {image ? (
        <EditorialImage image={image} className="lounge-tv-slay-tip-editorial__look-img" />
      ) : null}
      <p className="lounge-tv-slay-tip-editorial__look-caption">{item.caption}</p>
    </article>
  );
}

type SlayTipRelatedFooterProps = {
  tip: SlayTip;
  onViewRelatedSlayTip: (tip: SlayTip) => void;
  onViewRelatedPsa: (episode: PSATodayEpisode) => void;
  onViewDeeperSeason?: (seasonId: string) => void;
  onViewDeeperMastery?: (masteryId: string) => void;
};

export function SlayTipRelatedFooter({
  tip,
  onViewRelatedSlayTip,
  onViewRelatedPsa,
  onViewDeeperSeason,
  onViewDeeperMastery,
}: SlayTipRelatedFooterProps) {
  const relatedTip = tip.relatedSlayTipId ? getSlayTipById(tip.relatedSlayTipId) : undefined;
  const deeper = resolveDeeperLink(tip, {
    onViewRelatedPsa,
    onViewDeeperSeason,
    onViewDeeperMastery,
  });

  if (!relatedTip && !deeper) return null;

  return (
    <footer className="lounge-tv-slay-tip-editorial__related">
      {relatedTip ? (
        <RelatedLink
          eyebrow="TRY THIS NEXT"
          title={slayTipPublicTitle(relatedTip)}
          description={slayTipPreviewCopy(relatedTip) ?? relatedTip.shortDescription}
          thumbnail={relatedTip.thumbnailUrl ?? relatedTip.coverImageUrl}
          onClick={() => onViewRelatedSlayTip(relatedTip)}
        />
      ) : null}
      {deeper ? (
        <RelatedLink
          eyebrow="GO DEEPER"
          title={deeper.title}
          description={deeper.description}
          thumbnail={deeper.thumbnail}
          onClick={deeper.onClick}
        />
      ) : null}
    </footer>
  );
}

type DeeperLink = {
  title: string;
  description?: string;
  thumbnail?: string;
  onClick: () => void;
};

function resolveDeeperLink(
  tip: SlayTip,
  handlers: {
    onViewRelatedPsa: (episode: PSATodayEpisode) => void;
    onViewDeeperSeason?: (seasonId: string) => void;
    onViewDeeperMastery?: (masteryId: string) => void;
  } = { onViewRelatedPsa: () => {} }
): DeeperLink | undefined {
  const deeper = tip.deeperContent;
  const episode = resolveDeeperEpisode(tip);
  if (episode) {
    return {
      title: deeper?.title ?? episode.title,
      description:
        deeper?.description ??
        episode.shortDescription ??
        slayTipRelatedClassMetaLine(episode) ??
        undefined,
      thumbnail: slayTipRelatedClassThumbnail(episode),
      onClick: () => handlers.onViewRelatedPsa(episode),
    };
  }
  if (deeper?.contentType === 'season' && deeper.seasonId && handlers.onViewDeeperSeason) {
    const season = getEducationSeasonById(deeper.seasonId);
    return {
      title: deeper.title ?? season?.title ?? 'GO DEEPER',
      description: deeper.description ?? season?.shortPremise ?? season?.description,
      thumbnail: tip.thumbnailUrl ?? tip.coverImageUrl,
      onClick: () => handlers.onViewDeeperSeason!(deeper.seasonId!),
    };
  }
  if (deeper?.contentType === 'mastery' && deeper.masteryId && handlers.onViewDeeperMastery) {
    const mastery = getEducationMasteryById(deeper.masteryId);
    return {
      title: deeper.title ?? mastery?.title ?? 'GO DEEPER',
      description: deeper.description ?? mastery?.description,
      thumbnail: tip.thumbnailUrl ?? tip.coverImageUrl,
      onClick: () => handlers.onViewDeeperMastery!(deeper.masteryId!),
    };
  }
  return undefined;
}

function resolveDeeperEpisode(tip: SlayTip): PSATodayEpisode | undefined {
  const deeper = tip.deeperContent;
  if (deeper?.episodeId) return getPsaTodayEpisodeById(deeper.episodeId);
  if (tip.relatedPSAEpisodeId) return getPsaTodayEpisodeById(tip.relatedPSAEpisodeId);
  if (deeper?.seasonId) {
    const season = getEducationSeasonById(deeper.seasonId);
    const slot = season?.episodeSlots?.[0];
    if (slot?.psaEpisodeId) return getPsaTodayEpisodeById(slot.psaEpisodeId);
  }
  if (deeper?.masteryId) {
    const mastery = getEducationMasteryById(deeper.masteryId);
    const seasonId = mastery?.seasonIds?.[0];
    if (seasonId) {
      const season = getEducationSeasonById(seasonId);
      const slot = season?.episodeSlots?.[0];
      if (slot?.psaEpisodeId) return getPsaTodayEpisodeById(slot.psaEpisodeId);
    }
  }
  return undefined;
}

function RelatedLink({
  eyebrow,
  title,
  description,
  thumbnail,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  thumbnail?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-lounge-tv-focusable
      className="lounge-tv-slay-tip-editorial__related-link"
      onClick={onClick}
    >
      {thumbnail ? (
        <span className="lounge-tv-slay-tip-editorial__related-thumb">
          <img src={thumbnail} alt="" draggable={false} />
        </span>
      ) : null}
      <span className="lounge-tv-slay-tip-editorial__related-copy">
        <span className="lounge-tv-slay-tip-editorial__related-eyebrow">{eyebrow}</span>
        <span className="lounge-tv-slay-tip-editorial__related-title">{title}</span>
        {description ? (
          <span className="lounge-tv-slay-tip-editorial__related-desc">{description}</span>
        ) : null}
        <span className="lounge-tv-slay-tip-editorial__related-arrow">→</span>
      </span>
    </button>
  );
}

/** Inline styles export for legacy detail sections that still use style props. */
export const slayTipEditorialInline = {
  sectionTitle: {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
    color: LOUNGE_TV_TEXT_WHITE,
  } satisfies CSSProperties,
  body: {
    fontFamily: LOUNGE_TV_FONT_BOOK,
    fontSize: LOUNGE_TV_DETAIL_TYPE.body,
    color: LOUNGE_TV_TEXT_GRAY,
  } satisfies CSSProperties,
  slayerNoteFont: SLAYER_NOTE_FONT,
  brandRed: LOUNGE_TV_BRAND_RED,
  textWhite: LOUNGE_TV_TEXT_WHITE,
};
