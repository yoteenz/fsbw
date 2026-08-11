import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductBreakdownEditorialContent, ProductBreakdownImage } from '../../../content/education/product-breakdown/types';
import type { ProductBreakdownPresentationEntry } from './productBreakdownPresentation';
import {
  productBreakdownAccessMetaLabel,
  productBreakdownCoreSpecs,
  productBreakdownReadTimeLabel,
  resolveProductBreakdownHeroMedia,
} from './productBreakdownEditorialResolve';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import type { PSATodayEpisode } from '../psa-today/types';
import type { PsaAnswerPresentationEntry } from './psaAnswersPresentation';
import type { SlayTip } from '../../../content/education/types';
import { getEducationMasteryById, getEducationSeasonById } from '../../../content/education';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';

type ProductBreakdownMastheadProps = {
  entry: ProductBreakdownPresentationEntry;
  content: ProductBreakdownEditorialContent;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
};

export function ProductBreakdownMasthead({
  entry,
  content,
  unlocks,
  isUnlocked,
}: ProductBreakdownMastheadProps) {
  const thesis = content.thesis;
  const readTime = productBreakdownReadTimeLabel(entry, content);
  const access = productBreakdownAccessMetaLabel(entry, unlocks, isUnlocked);
  const specs = productBreakdownCoreSpecs(entry);

  return (
    <header className="lounge-tv-product-breakdown-editorial__masthead">
      <p className="lounge-tv-product-breakdown-editorial__eyebrow">
        PRODUCT BREAKDOWN · {content.productType}
      </p>
      <h1 className="lounge-tv-product-breakdown-editorial__product-name">{entry.displayName}</h1>
      {specs ? <p className="lounge-tv-product-breakdown-editorial__specs">{specs}</p> : null}
      {thesis ? <p className="lounge-tv-product-breakdown-editorial__thesis">{thesis}</p> : null}
      <p className="lounge-tv-product-breakdown-editorial__meta">
        {readTime} · {access}
      </p>
    </header>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="lounge-tv-product-breakdown-editorial__section-heading">
      <span className="lounge-tv-product-breakdown-editorial__section-rule" aria-hidden />
      {children}
    </h2>
  );
}

function EditorialImage({
  image,
  priority,
  className,
}: {
  image: ProductBreakdownImage;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`lounge-tv-product-breakdown-editorial__figure${className ? ` ${className}` : ''}`}>
      <img
        src={image.src}
        alt={image.alt ?? ''}
        draggable={false}
        loading={priority ? 'eager' : 'lazy'}
        style={{ objectPosition: image.objectPosition ?? 'center center' }}
        className="lounge-tv-product-breakdown-editorial__img"
      />
      {image.annotations?.length ? (
        <div className="lounge-tv-product-breakdown-editorial__annotations" aria-hidden>
          {image.annotations.map((ann) => (
            <span
              key={ann.id}
              className="lounge-tv-product-breakdown-editorial__annotation"
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            >
              {ann.marker ?? ann.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductBreakdownHeroComposition({ content }: { content: ProductBreakdownEditorialContent }) {
  const media = resolveProductBreakdownHeroMedia(content);
  if (!media.length) return null;

  const hero = media.find((m) => m.role === 'hero') ?? media[0];
  const supports = media.filter((m) => m.id !== hero.id).slice(0, 2);

  return (
    <section className="lounge-tv-product-breakdown-editorial__hero" aria-label="Product inspection hero">
      <div className="lounge-tv-product-breakdown-editorial__hero-main">
        <EditorialImage image={hero} priority className="lounge-tv-product-breakdown-editorial__hero-main-figure" />
      </div>
      {supports.length ? (
        <div className="lounge-tv-product-breakdown-editorial__hero-support">
          {supports.map((img) => (
            <EditorialImage key={img.id} image={img} className="lounge-tv-product-breakdown-editorial__hero-support-figure" />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ProductBreakdownAtAGlanceSection({ content }: { content: ProductBreakdownEditorialContent }) {
  const items = content.atAGlance;
  if (!items?.length) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__module">
      <SectionHeading>AT A GLANCE</SectionHeading>
      <div className="lounge-tv-product-breakdown-editorial__at-a-glance">
        {items.map((item) => (
          <article key={item.id} className="lounge-tv-product-breakdown-editorial__glance-item">
            <p className="lounge-tv-product-breakdown-editorial__glance-label">{item.label}</p>
            <p className="lounge-tv-product-breakdown-editorial__glance-spec">{item.spec}</p>
            <p className="lounge-tv-product-breakdown-editorial__glance-detail">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductBreakdownLookCloserSection({ content }: { content: ProductBreakdownEditorialContent }) {
  const points = content.inspectionPoints;
  if (!points?.length) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__module">
      <SectionHeading>LOOK CLOSER</SectionHeading>
      <div className="lounge-tv-product-breakdown-editorial__look-closer">
        {points.map((point) => (
          <article key={point.id} className="lounge-tv-product-breakdown-editorial__look-item">
            {point.image ? (
              <EditorialImage image={point.image} className="lounge-tv-product-breakdown-editorial__look-figure" />
            ) : null}
            <p className="lounge-tv-product-breakdown-editorial__look-label">{point.label}</p>
            <p className="lounge-tv-product-breakdown-editorial__look-caption">{point.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductBreakdownInsideUnitSection({ content }: { content: ProductBreakdownEditorialContent }) {
  const callouts = content.interiorCallouts;
  const interior = content.interiorImage;
  if (!callouts?.length && !interior) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__module">
      <SectionHeading>INSIDE THE UNIT</SectionHeading>
      <div className="lounge-tv-product-breakdown-editorial__inside-unit">
        {interior ? (
          <div className="lounge-tv-product-breakdown-editorial__inside-visual">
            <EditorialImage image={interior} className="lounge-tv-product-breakdown-editorial__inside-figure" />
          </div>
        ) : null}
        {callouts?.length ? (
          <ol className="lounge-tv-product-breakdown-editorial__callouts">
            {callouts.map((callout) => (
              <li key={callout.number} className="lounge-tv-product-breakdown-editorial__callout">
                <span className="lounge-tv-product-breakdown-editorial__callout-number">{callout.number}</span>
                <div>
                  <p className="lounge-tv-product-breakdown-editorial__callout-label">{callout.label}</p>
                  <p className="lounge-tv-product-breakdown-editorial__callout-body">{callout.body}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

export function ProductBreakdownProductNoteSection({ content }: { content: ProductBreakdownEditorialContent }) {
  const note = content.productNote;
  if (!note?.body) return null;

  return (
    <aside className="lounge-tv-product-breakdown-editorial__product-note" aria-label="Product Note">
      <p className="lounge-tv-product-breakdown-editorial__product-note-kicker">
        <span className="lounge-tv-product-breakdown-editorial__product-note-script">Product Note</span>
        {note.number ? ` ${note.number}` : null}
      </p>
      <p className="lounge-tv-product-breakdown-editorial__product-note-body">{note.body}</p>
    </aside>
  );
}

export function ProductBreakdownWhyItMattersSection({ content }: { content: ProductBreakdownEditorialContent }) {
  const points = content.benefitPoints;
  if (!points?.length) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__module">
      <SectionHeading>WHY IT MATTERS</SectionHeading>
      <div className="lounge-tv-product-breakdown-editorial__benefits">
        {points.map((point) => (
          <article key={point.feature} className="lounge-tv-product-breakdown-editorial__benefit">
            <p className="lounge-tv-product-breakdown-editorial__benefit-feature">{point.feature}</p>
            <p className="lounge-tv-product-breakdown-editorial__benefit-meaning">{point.meaning}</p>
            <p className="lounge-tv-product-breakdown-editorial__benefit-why">{point.whyItMatters}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductBreakdownWhatYouReceiveSection({ content }: { content: ProductBreakdownEditorialContent }) {
  const items = content.includedItems;
  if (!items?.length) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__module">
      <SectionHeading>WHAT YOU RECEIVE</SectionHeading>
      <div className="lounge-tv-product-breakdown-editorial__receive">
        {content.includedImage ? (
          <EditorialImage
            image={content.includedImage}
            className="lounge-tv-product-breakdown-editorial__receive-figure"
          />
        ) : null}
        <ul className="lounge-tv-product-breakdown-editorial__receive-list">
          {items.map((item) => (
            <li key={item.label} className="lounge-tv-product-breakdown-editorial__receive-item">
              <span className="lounge-tv-product-breakdown-editorial__receive-check" aria-hidden>
                ✓
              </span>
              <span>
                <span className="lounge-tv-product-breakdown-editorial__receive-label">{item.label}</span>
                {item.detail ? (
                  <span className="lounge-tv-product-breakdown-editorial__receive-detail"> — {item.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProductBreakdownFooterModules({ content }: { content: ProductBreakdownEditorialContent }) {
  const hasBestFor = Boolean(content.bestFor?.trim());
  const hasCare = Boolean(content.careNotes?.length);
  if (!hasBestFor && !hasCare) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__footer-modules">
      {hasBestFor ? (
        <article className="lounge-tv-product-breakdown-editorial__footer-block">
          <h3 className="lounge-tv-product-breakdown-editorial__footer-heading">BEST FOR</h3>
          <p className="lounge-tv-product-breakdown-editorial__footer-body">{content.bestFor}</p>
        </article>
      ) : null}
      {hasCare ? (
        <article className="lounge-tv-product-breakdown-editorial__footer-block">
          <h3 className="lounge-tv-product-breakdown-editorial__footer-heading">CARE NOTES</h3>
          <ul className="lounge-tv-product-breakdown-editorial__care-list">
            {content.careNotes!.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}

type ProductBreakdownRelatedFooterProps = {
  content: ProductBreakdownEditorialContent;
  onViewRelatedPsa?: (episode: PSATodayEpisode) => void;
  onViewRelatedAnswer?: (entry: PsaAnswerPresentationEntry) => void;
  onViewRelatedSlayTip?: (tip: SlayTip) => void;
  onViewDeeperSeason?: (seasonId: string) => void;
  onViewDeeperMastery?: (masteryId: string) => void;
};

export function ProductBreakdownRelatedFooter({
  content,
  onViewDeeperSeason,
  onViewDeeperMastery,
}: ProductBreakdownRelatedFooterProps) {
  const related = content.relatedEducation;
  if (!related?.length) return null;

  return (
    <section className="lounge-tv-product-breakdown-editorial__related">
      <SectionHeading>RELATED EDUCATION</SectionHeading>
      <div className="lounge-tv-product-breakdown-editorial__related-list">
        {related.map((item) => {
          const mastery = item.targetType === 'mastery' ? getEducationMasteryById(item.targetId) : undefined;
          const season = item.targetType === 'season' ? getEducationSeasonById(item.targetId) : undefined;
          const subtitle = item.description ?? mastery?.title ?? season?.title ?? '';
          const handler = () => {
            if (item.targetType === 'mastery' && onViewDeeperMastery) onViewDeeperMastery(item.targetId);
            if (item.targetType === 'season' && onViewDeeperSeason) onViewDeeperSeason(item.targetId);
          };

          return (
            <button
              key={item.id}
              type="button"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`product-breakdown-related-${item.id}`}
              className="lounge-tv-product-breakdown-editorial__related-link"
              onClick={handler}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-product-breakdown-editorial__related-label">{item.label}</span>
              {subtitle ? (
                <span className="lounge-tv-product-breakdown-editorial__related-target">{subtitle} →</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

type ProductBreakdownCtaRowProps = {
  content: ProductBreakdownEditorialContent;
  onBuildYours?: () => void;
  onShopUnit?: () => void;
};

export function ProductBreakdownCtaRow({ content, onBuildYours, onShopUnit }: ProductBreakdownCtaRowProps) {
  const showBuild = Boolean(content.buildYoursPath);
  const showShop = Boolean(content.shopPath);
  if (!showBuild && !showShop) return null;

  return (
    <div className="lounge-tv-product-breakdown-editorial__cta-row">
      {showBuild ? (
        <button
          type="button"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id="product-breakdown-build-yours"
          className="lounge-tv-product-breakdown-editorial__cta lounge-tv-product-breakdown-editorial__cta--primary"
          onClick={onBuildYours}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          BUILD YOURS →
        </button>
      ) : null}
      {showShop ? (
        <button
          type="button"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id="product-breakdown-shop-unit"
          className="lounge-tv-product-breakdown-editorial__cta lounge-tv-product-breakdown-editorial__cta--secondary"
          onClick={onShopUnit}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          SHOP THIS UNIT →
        </button>
      ) : null}
    </div>
  );
}

export function ProductBreakdownArticleRenderer({ content }: { content: ProductBreakdownEditorialContent }) {
  return (
    <div className="lounge-tv-product-breakdown-editorial__article">
      <ProductBreakdownHeroComposition content={content} />
      <ProductBreakdownAtAGlanceSection content={content} />
      <ProductBreakdownLookCloserSection content={content} />
      <ProductBreakdownInsideUnitSection content={content} />
      <ProductBreakdownProductNoteSection content={content} />
      <ProductBreakdownWhyItMattersSection content={content} />
      <ProductBreakdownWhatYouReceiveSection content={content} />
      <ProductBreakdownFooterModules content={content} />
    </div>
  );
}

export function useProductBreakdownExternalRoutes(content: ProductBreakdownEditorialContent) {
  const navigate = useNavigate();

  const onBuildYours = content.buildYoursPath
    ? () => navigate(content.buildYoursPath!)
    : undefined;

  const onShopUnit = content.shopPath ? () => navigate(content.shopPath!) : undefined;

  return { onBuildYours, onShopUnit };
}
