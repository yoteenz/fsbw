import { Link } from 'react-router-dom';
import { AIOButton } from '../../AIOButton';
import type { MobileServiceCta } from '../../../hooks/useMobileServicePage';

type Props = {
  ctas: MobileServiceCta;
};

export function MobileServiceActionPanel({ ctas }: Props) {
  const statusTone = ctas.statusState.toLowerCase().includes('go') || ctas.statusState.toLowerCase().includes('pilot')
    ? 'go'
    : 'hold';

  return (
    <section className="aio-msvc-actions" aria-label="Service actions">
      <div className="aio-msvc-actions__meta">
        <div>
          <p className="aio-msvc-actions__label">Service Status</p>
          <p className={`aio-msvc-actions__status aio-msvc-actions__status--${statusTone}`}>{ctas.statusState}</p>
        </div>
        <p className="aio-msvc-actions__pricing">{ctas.pricingLabel}</p>
      </div>

      <div className="aio-msvc-actions__buttons">
        {ctas.primaryHref ? (
          <AIOButton to={ctas.primaryHref} variant="gold" showArrow className="aio-msvc-actions__btn">
            {ctas.primaryLabel}
          </AIOButton>
        ) : (
          <AIOButton variant="gold" showArrow className="aio-msvc-actions__btn" onClick={ctas.primaryOnClick}>
            {ctas.primaryLabel}
          </AIOButton>
        )}
        <Link to={ctas.secondaryHref} className="aio-btn aio-btn--outline-gold aio-msvc-actions__btn">
          {ctas.secondaryLabel} →
        </Link>
        <Link to={ctas.tertiaryHref} className="aio-btn aio-btn--outline-gold aio-msvc-actions__btn aio-msvc-actions__btn--tertiary">
          {ctas.tertiaryLabel} →
        </Link>
      </div>
    </section>
  );
}
