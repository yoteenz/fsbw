import type { MobileServiceBenefit } from '../../../services/mobileServicePageConfig';

type Props = {
  benefits: MobileServiceBenefit[];
};

export function MobileServiceBenefits({ benefits }: Props) {
  return (
    <section className="aio-msvc-benefits" aria-labelledby="aio-msvc-benefits-heading">
      <h2 id="aio-msvc-benefits-heading" className="aio-msvc-section-label">
        What We Do For You
      </h2>
      <ul className="aio-msvc-benefits__grid">
        {benefits.map((benefit) => (
          <li key={benefit.label} className="aio-msvc-benefits__item">
            {benefit.iconSrc ? (
              <img src={benefit.iconSrc} alt="" className="aio-msvc-benefits__icon" width={28} height={28} />
            ) : (
              <span className="aio-msvc-benefits__dot" aria-hidden="true" />
            )}
            <span>{benefit.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
