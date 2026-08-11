import type { ProductBreakdownEditorialContent } from '../../../../../content/education/product-breakdown/types';
import { getProductBreakdownArchetype } from '../../../../../content/education/product-breakdown/productBreakdownArchetypes';
import { resolveProductBreakdownHeroMedia } from '../../productBreakdownEditorialResolve';
import { EditorialImage, EditorialSectionHeading, ProductStat } from '../primitives/EditorialPrimitives';

type ScaffoldBreakdownLayoutProps = {
  content: ProductBreakdownEditorialContent;
};

/**
 * Minimal editorial scaffold for Signature Units without a dedicated layout yet.
 * Intentionally different rhythm from NOIR — not a cloned anatomy dossier.
 */
export function ScaffoldBreakdownLayout({ content }: ScaffoldBreakdownLayoutProps) {
  const archetype = getProductBreakdownArchetype(content.unitId);
  const media = resolveProductBreakdownHeroMedia(content);
  const hero = media.find((m) => m.role === 'hero') ?? media[0];
  const primaryGlance = (content.atAGlance ?? []).slice(0, 4);

  return (
    <article
      className="lounge-tv-pbd-scaffold"
      aria-label={`${content.unitId} product breakdown scaffold`}
    >
      {archetype ? (
        <p className="lounge-tv-pbd-scaffold__archetype" aria-label="Editorial identity">
          {archetype.editorialIdentity}
        </p>
      ) : null}

      {hero ? (
        <section className="lounge-tv-pbd-scaffold__hero" aria-label="Product hero">
          <EditorialImage image={hero} priority className="lounge-tv-pbd-scaffold__hero-figure" />
        </section>
      ) : null}

      {content.thesis ? (
        <p className="lounge-tv-pbd-scaffold__intro">{content.thesis}</p>
      ) : null}

      {primaryGlance.length ? (
        <section className="lounge-tv-pbd-editorial__module">
          <EditorialSectionHeading>KEY SPECS</EditorialSectionHeading>
          <div className="lounge-tv-pbd-scaffold__specs">
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
        </section>
      ) : null}
    </article>
  );
}
