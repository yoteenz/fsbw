import type { ProductBreakdownEditorialContent } from '../../../../../content/education/product-breakdown/types';
import { resolveProductBreakdownHeroMedia } from '../../productBreakdownEditorialResolve';
import {
  EditorialImage,
  EditorialImageCaption,
  EditorialSectionHeading,
  FeatureBenefitArrow,
  ProductStat,
} from '../primitives/EditorialPrimitives';

type NoirBreakdownLayoutProps = {
  content: ProductBreakdownEditorialContent;
};

/** NOIR editorial composition — anatomy / precision archetype. Independent from other Signature Units. */
export function NoirBreakdownLayout({ content }: NoirBreakdownLayoutProps) {
  const media = resolveProductBreakdownHeroMedia(content);
  const hero = media.find((m) => m.role === 'hero') ?? media[0];
  const hairline = media.find((m) => m.role === 'hairline');
  const side = media.find((m) => m.role === 'sideProfile');

  const primaryGlance = content.atAGlance?.filter((item) => item.tier !== 'secondary') ?? [];
  const secondaryGlance = content.atAGlance?.filter((item) => item.tier === 'secondary') ?? [];

  const inspectionPoints = content.inspectionPoints ?? [];
  const dominantInspection = inspectionPoints[0];
  const supportInspection = inspectionPoints.slice(1);

  return (
    <article className="lounge-tv-pbd-noir" aria-label="NOIR product breakdown">
      {hero ? (
        <section className="lounge-tv-pbd-noir__hero" aria-label="Product inspection hero">
          <div className="lounge-tv-pbd-noir__hero-dominant">
            <EditorialImage
              image={hero}
              priority
              className="lounge-tv-pbd-noir__hero-dominant-figure"
            />
          </div>
          {(hairline || side) && (
            <div className="lounge-tv-pbd-noir__hero-support">
              {hairline ? (
                <EditorialImage
                  image={hairline}
                  className="lounge-tv-pbd-noir__hero-support-figure lounge-tv-pbd-noir__hero-support-figure--macro"
                />
              ) : null}
              {side ? (
                <EditorialImage
                  image={side}
                  className="lounge-tv-pbd-noir__hero-support-figure"
                />
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      {primaryGlance.length ? (
        <section className="lounge-tv-pbd-editorial__module">
          <EditorialSectionHeading>AT A GLANCE</EditorialSectionHeading>
          <div className="lounge-tv-pbd-noir__glance-primary">
            {primaryGlance.map((item) => (
              <ProductStat
                key={item.id}
                label={item.label}
                spec={item.spec}
                detail={item.detail}
                tier="primary"
              />
            ))}
          </div>
          {secondaryGlance.length ? (
            <div className="lounge-tv-pbd-noir__glance-secondary">
              {secondaryGlance.map((item) => (
                <ProductStat
                  key={item.id}
                  label={item.label}
                  spec={item.spec}
                  detail={item.detail}
                  tier="secondary"
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {dominantInspection ? (
        <section className="lounge-tv-pbd-editorial__module">
          <EditorialSectionHeading>LOOK CLOSER</EditorialSectionHeading>
          <div className="lounge-tv-pbd-noir__inspection">
            <div className="lounge-tv-pbd-noir__inspection-dominant">
              {dominantInspection.image ? (
                <EditorialImage
                  image={dominantInspection.image}
                  className="lounge-tv-pbd-noir__inspection-dominant-figure"
                />
              ) : null}
              <EditorialImageCaption
                label={dominantInspection.label}
                caption={dominantInspection.caption}
              />
            </div>
            {supportInspection.length ? (
              <div className="lounge-tv-pbd-noir__inspection-support">
                {supportInspection.map((point) => (
                  <div key={point.id} className="lounge-tv-pbd-noir__inspection-support-item">
                    {point.image ? (
                      <EditorialImage
                        image={point.image}
                        className="lounge-tv-pbd-noir__inspection-support-figure"
                      />
                    ) : null}
                    <EditorialImageCaption label={point.label} caption={point.caption} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {content.interiorImage || content.interiorCallouts?.length ? (
        <section className="lounge-tv-pbd-editorial__module">
          <EditorialSectionHeading>INSIDE THE UNIT</EditorialSectionHeading>
          <div className="lounge-tv-pbd-noir__anatomy">
            {content.interiorImage ? (
              <div className="lounge-tv-pbd-noir__anatomy-visual">
                <EditorialImage
                  image={content.interiorImage}
                  className="lounge-tv-pbd-noir__anatomy-figure"
                />
              </div>
            ) : null}
            <div className="lounge-tv-pbd-noir__anatomy-detail">
              {content.interiorCallouts?.length ? (
                <ol className="lounge-tv-pbd-noir__anatomy-callouts">
                  {content.interiorCallouts.map((callout) => (
                    <li key={callout.number} className="lounge-tv-pbd-noir__anatomy-callout">
                      <span className="lounge-tv-pbd-noir__anatomy-marker">{callout.number}</span>
                      <div>
                        <p className="lounge-tv-pbd-noir__anatomy-label">{callout.label}</p>
                        <p className="lounge-tv-pbd-noir__anatomy-body">{callout.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              {content.productNote?.body ? (
                <aside className="lounge-tv-pbd-noir__product-note" aria-label="Product Note">
                  <p className="lounge-tv-pbd-noir__product-note-kicker">
                    <span className="lounge-tv-pbd-noir__product-note-script">Product Note</span>
                    {content.productNote.number ? ` ${content.productNote.number}` : null}
                  </p>
                  <p className="lounge-tv-pbd-noir__product-note-body">{content.productNote.body}</p>
                </aside>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {content.benefitPoints?.length ? (
        <section className="lounge-tv-pbd-editorial__module">
          <EditorialSectionHeading>WHY IT MATTERS</EditorialSectionHeading>
          <div className="lounge-tv-pbd-noir__benefits">
            {content.benefitPoints.map((point) => (
              <FeatureBenefitArrow
                key={point.feature}
                feature={point.feature}
                benefit={point.whyItMatters}
              />
            ))}
          </div>
        </section>
      ) : null}

      {content.includedItems?.length ? (
        <section className="lounge-tv-pbd-editorial__module">
          <EditorialSectionHeading>WHAT YOU RECEIVE</EditorialSectionHeading>
          <div className="lounge-tv-pbd-noir__receive">
            {content.includedImage ? (
              <EditorialImage
                image={content.includedImage}
                className="lounge-tv-pbd-noir__receive-figure"
              />
            ) : null}
            <ul className="lounge-tv-pbd-noir__receive-list">
              {content.includedItems.map((item) => (
                <li key={item.label} className="lounge-tv-pbd-noir__receive-item">
                  <span className="lounge-tv-pbd-noir__receive-check" aria-hidden>
                    ✓
                  </span>
                  <span>
                    <span className="lounge-tv-pbd-noir__receive-label">{item.label}</span>
                    {item.detail ? (
                      <span className="lounge-tv-pbd-noir__receive-detail"> — {item.detail}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {content.bestFor || content.careNotes?.length ? (
        <section className="lounge-tv-pbd-noir__footer-modules">
          {content.bestFor ? (
            <article className="lounge-tv-pbd-noir__footer-block lounge-tv-pbd-noir__footer-block--best-for">
              <h3 className="lounge-tv-pbd-noir__footer-heading">BEST FOR</h3>
              <p className="lounge-tv-pbd-noir__footer-body">{content.bestFor}</p>
            </article>
          ) : null}
          {content.careNotes?.length ? (
            <article className="lounge-tv-pbd-noir__footer-block lounge-tv-pbd-noir__footer-block--care">
              <h3 className="lounge-tv-pbd-noir__footer-heading">CARE NOTES</h3>
              <ul className="lounge-tv-pbd-noir__care-list">
                {content.careNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
