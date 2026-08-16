import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../billing/money';
import type { BookkeepingBillingInterval, BookkeepingPlanId } from '../../bookkeeping/bookkeepingTypes';
import {
  annualSavingsLabel,
  BOOKKEEPING_FEATURE_MATRIX,
  BOOKKEEPING_PLAN_ORDER,
  BOOKKEEPING_PLANS,
  planStartingPriceMinor,
} from '../../bookkeeping/bookkeepingPlans';
import { AIOButton } from '../AIOButton';
import { aioPaths } from '../../utils/paths';
import { getPublicServiceCta } from '../../launch/serviceActivationLaunch';
import { BOOKKEEPING_SERVICE_SLUG } from '../../bookkeeping/bookkeepingConfig';

function cellMark(val: boolean | 'partial'): string {
  if (val === true) return '✓';
  if (val === 'partial') return 'Basic';
  return '—';
}

export function BookkeepingBillingToggle({
  interval,
  onChange,
}: {
  interval: BookkeepingBillingInterval;
  onChange: (i: BookkeepingBillingInterval) => void;
}) {
  return (
    <div className="aio-bk-billing-toggle" role="group" aria-label="Billing period">
      <button
        type="button"
        className={`aio-bk-billing-toggle__btn${interval === 'MONTHLY' ? ' is-active' : ''}`}
        onClick={() => onChange('MONTHLY')}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`aio-bk-billing-toggle__btn${interval === 'ANNUAL' ? ' is-active' : ''}`}
        onClick={() => onChange('ANNUAL')}
      >
        Annual
      </button>
    </div>
  );
}

export function BookkeepingPlanCards({
  interval,
  highlightPlan,
  ctaMode = 'public',
}: {
  interval: BookkeepingBillingInterval;
  highlightPlan?: BookkeepingPlanId;
  ctaMode?: 'public' | 'recommendation';
}) {
  const activation = getPublicServiceCta(BOOKKEEPING_SERVICE_SLUG);

  return (
    <div className="aio-bk-plans">
      {BOOKKEEPING_PLAN_ORDER.map((planId) => {
        const plan = BOOKKEEPING_PLANS[planId];
        const price = planStartingPriceMinor(planId, interval);
        const isTop = plan.highlight === 'most_complete';
        const emphasized = highlightPlan === planId || isTop;
        return (
          <article
            key={planId}
            className={`aio-bk-plan-card${emphasized ? ' aio-bk-plan-card--featured' : ''}${isTop ? ' aio-bk-plan-card--premium' : ''}`}
          >
            {isTop && <span className="aio-bk-plan-card__badge">Most Complete</span>}
            <h3 className="aio-bk-plan-card__name">{plan.name}</h3>
            <p className="aio-bk-plan-card__best">{plan.bestFor}</p>
            <div className="aio-bk-plan-card__price">
              <span className="aio-bk-plan-card__starting">Starting at</span>
              <span className="aio-bk-plan-card__amount">{formatMoney(price)}</span>
              <span className="aio-bk-plan-card__period">
                {interval === 'ANNUAL' ? '/ year · billed annually' : '/ month'}
              </span>
              {interval === 'ANNUAL' && (
                <span className="aio-bk-plan-card__savings">{annualSavingsLabel(planId)}</span>
              )}
            </div>
            <ul className="aio-bk-plan-card__features">
              {plan.features.slice(0, 8).map((f) => (
                <li key={f}>{f}</li>
              ))}
              {plan.features.length > 8 && <li>+ {plan.features.length - 8} more included</li>}
            </ul>
            {ctaMode === 'recommendation' ? (
              <AIOButton variant={emphasized ? 'gold' : 'outline'} to={aioPaths.getStartedForService(plan.slug)}>
                Select This Plan
              </AIOButton>
            ) : (
              <AIOButton
                variant={emphasized ? 'gold' : 'outline'}
                to={activation.allowed ? aioPaths.getStartedForService(plan.slug) : aioPaths.contact}
              >
                {activation.allowed ? activation.label || 'Request Bookkeeping' : activation.label}
              </AIOButton>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function BookkeepingFeatureMatrix({ comparePlan }: { comparePlan?: BookkeepingPlanId }) {
  const [mobilePlan, setMobilePlan] = useState<BookkeepingPlanId>(comparePlan ?? 'PLUS');

  return (
    <div className="aio-bk-matrix">
      <div className="aio-bk-matrix__desktop">
        <table className="aio-bk-matrix__table">
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">Essentials</th>
              <th scope="col">Plus</th>
              <th scope="col">All In One</th>
            </tr>
          </thead>
          <tbody>
            {BOOKKEEPING_FEATURE_MATRIX.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                <td>{cellMark(row.essentials)}</td>
                <td>{cellMark(row.plus)}</td>
                <td>{cellMark(row.allInOne)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="aio-bk-matrix__mobile">
        <div className="aio-bk-matrix__mobile-tabs" role="tablist" aria-label="Compare plan">
          {BOOKKEEPING_PLAN_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mobilePlan === id}
              className={`aio-bk-matrix__mobile-tab${mobilePlan === id ? ' is-active' : ''}`}
              onClick={() => setMobilePlan(id)}
            >
              {BOOKKEEPING_PLANS[id].name.replace('Bookkeeping ', '').replace('All In One ', 'AIO ')}
            </button>
          ))}
        </div>
        <ul className="aio-bk-matrix__mobile-list">
          {BOOKKEEPING_FEATURE_MATRIX.map((row) => {
            const val = mobilePlan === 'ESSENTIALS' ? row.essentials : mobilePlan === 'PLUS' ? row.plus : row.allInOne;
            if (!val) return null;
            return (
              <li key={row.id}>
                <span>{row.label}</span>
                <span>{cellMark(val)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function BookkeepingCategoryChips() {
  const categories = ['Fuel', 'Repairs & Maintenance', 'Insurance', 'Permits & Registration', 'Factoring Fees', 'Dispatch Fees', 'Truck Payments', 'Driver Expenses', 'Tolls & Parking', 'Load Revenue'];
  return (
    <div className="aio-bk-chips">
      {categories.map((c) => (
        <span key={c} className="aio-bk-chip">{c}</span>
      ))}
    </div>
  );
}

export function BookkeepingDisclosuresBlock() {
  return (
    <section className="aio-bk-disclosures">
      <h2>Service Boundaries</h2>
      <ul>
        <li>Bookkeeping services do not constitute legal advice.</li>
        <li>Bookkeeping does not automatically include income-tax return preparation.</li>
        <li>IFTA bookkeeping support does not automatically include filing unless separately selected.</li>
        <li>Payroll bookkeeping/reconciliation does not make All In One the payroll processor.</li>
        <li>Factoring reconciliation does not make All In One the factor.</li>
      </ul>
      <Link to={aioPaths.contact} className="aio-link">Questions? Talk to our team</Link>
    </section>
  );
}
