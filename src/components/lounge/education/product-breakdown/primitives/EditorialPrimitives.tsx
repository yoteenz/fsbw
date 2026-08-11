import type { ReactNode } from 'react';
import type { ProductBreakdownImage } from '../../../../../content/education/product-breakdown/types';
import { useState } from 'react';

export function EditorialSectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="lounge-tv-pbd-editorial__section-heading">
      <span className="lounge-tv-pbd-editorial__section-rule" aria-hidden />
      {children}
    </h2>
  );
}

type EditorialImageProps = {
  image: ProductBreakdownImage;
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
};

export function EditorialImage({ image, priority, className, aspectRatio }: EditorialImageProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = failed || !image.src?.trim();

  return (
    <figure
      className={`lounge-tv-pbd-editorial__figure${className ? ` ${className}` : ''}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {showPlaceholder ? (
        <div className="lounge-tv-pbd-editorial__media-placeholder" role="img" aria-label={image.alt ?? 'Product image placeholder'}>
          <span className="lounge-tv-pbd-editorial__media-placeholder-label">IMAGE PLACEHOLDER</span>
          <span className="lounge-tv-pbd-editorial__media-placeholder-unit">{image.alt ?? 'PRODUCT ASSET'}</span>
        </div>
      ) : (
        <img
          src={image.src}
          alt={image.alt ?? ''}
          draggable={false}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          style={{ objectPosition: image.objectPosition ?? 'center center' }}
          className="lounge-tv-pbd-editorial__img"
        />
      )}
      {image.annotations?.length ? (
        <div className="lounge-tv-pbd-editorial__annotations" aria-hidden>
          {image.annotations.map((ann) => (
            <span
              key={ann.id}
              className="lounge-tv-pbd-editorial__annotation"
              style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            >
              {ann.marker ?? ann.label}
            </span>
          ))}
        </div>
      ) : null}
    </figure>
  );
}

export function ProductStat({
  label,
  spec,
  detail,
  tier = 'primary',
}: {
  label: string;
  spec: string;
  detail: string;
  tier?: 'primary' | 'secondary';
}) {
  return (
    <article className={`lounge-tv-pbd-editorial__stat lounge-tv-pbd-editorial__stat--${tier}`}>
      <p className="lounge-tv-pbd-editorial__stat-label">{label}</p>
      <p className="lounge-tv-pbd-editorial__stat-value">{spec}</p>
      <p className="lounge-tv-pbd-editorial__stat-detail">{detail}</p>
    </article>
  );
}

export function FeatureBenefitArrow({ feature, benefit }: { feature: string; benefit: string }) {
  return (
    <article className="lounge-tv-pbd-editorial__feature-benefit">
      <p className="lounge-tv-pbd-editorial__feature-benefit-feature">{feature}</p>
      <span className="lounge-tv-pbd-editorial__feature-benefit-arrow" aria-hidden>
        →
      </span>
      <p className="lounge-tv-pbd-editorial__feature-benefit-outcome">{benefit}</p>
    </article>
  );
}

export function EditorialImageCaption({ label, caption }: { label: string; caption: string }) {
  return (
    <figcaption className="lounge-tv-pbd-editorial__caption">
      <p className="lounge-tv-pbd-editorial__caption-label">{label}</p>
      <p className="lounge-tv-pbd-editorial__caption-body">{caption}</p>
    </figcaption>
  );
}
