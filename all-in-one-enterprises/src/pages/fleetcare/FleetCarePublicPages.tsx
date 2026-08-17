import { Link } from 'react-router-dom';
import { AIOButton } from '../../components/AIOButton';
import { IndependentProviderDisclosure, ReferralEconomicDisclosure } from '../../components/fleetcare/FleetCareDisclosures';
import { FLEETCARE_PRICING_CONFIG } from '../../fleetcare/fleetcareConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { usePageMeta } from '../../hooks/usePageMeta';

export function FleetCarePublicPage() {
  usePageMeta({
    title: 'AIO FleetCare Network — Truck Maintenance & Repair',
    description:
      'Request maintenance and repair service, get matched with independent FleetCare providers, and keep records with your fleet.',
  });

  return (
    <div className="aio-fc-public aio-ps-page">
      <section className="aio-ps-hero aio-fc-public__hero">
        <p className="aio-ps-eyebrow">AIO FleetCare Network</p>
        <h1 className="aio-ps-hero__title">
          KEEP YOUR TRUCKS
          <br />
          MOVING.
        </h1>
        <p className="aio-ps-hero__lead">
          Request service, get matched with an independent FleetCare provider, track your repair, and keep the record
          with your truck — all inside All In One.
        </p>
        <div className="aio-ps-hero__actions">
          <AIOButton to={aioPaths.portalFleetCareRequest} variant="gold" showArrow>
            Request Service
          </AIOButton>
          <AIOButton to={aioPaths.fleetCarePlans} variant="outline-gold" showArrow>
            Explore FleetCare+
          </AIOButton>
        </div>
        <IndependentProviderDisclosure className="aio-fc-public__disclosure" />
      </section>

      <section className="aio-ps-section">
        <h2 className="aio-ps-section__title">How FleetCare works</h2>
        <ol className="aio-fc-steps">
          <li>Select your vehicle and describe the issue</li>
          <li>AIO matches eligible independent providers in your area</li>
          <li>Review estimate and authorize work</li>
          <li>Track service and store records in your vehicle history</li>
        </ol>
        <ReferralEconomicDisclosure />
      </section>

      <section className="aio-ps-section aio-fc-plans-preview">
        <h2 className="aio-ps-section__title">Client plans</h2>
        <div className="aio-fc-plan-grid">
          {(Object.values(FLEETCARE_PRICING_CONFIG.clientPlans) as Array<(typeof FLEETCARE_PRICING_CONFIG.clientPlans)[keyof typeof FLEETCARE_PRICING_CONFIG.clientPlans]>).map((plan) => (
            <article key={plan.code} className="aio-fc-plan-card">
              <h3>{plan.name}</h3>
              <p className="aio-fc-plan-card__price">
                {plan.monthlyMinor === 0 ? '$0' : formatMoney(plan.monthlyMinor)}
                {plan.monthlyMinor > 0 ? '/mo' : ''}
              </p>
              <ul>
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="aio-fc-note">Repair service is billed separately by your independent provider.</p>
      </section>

      <section className="aio-ps-section">
        <h2 className="aio-ps-section__title">Independent repair businesses</h2>
        <p>Join the FleetCare Network to access eligible AIO service opportunities.</p>
        <Link to={aioPaths.fleetCareProviderJoin} className="aio-btn aio-btn--outline-gold">
          Join the FleetCare Network →
        </Link>
      </section>
    </div>
  );
}

export function FleetCarePlansPage() {
  usePageMeta({ title: 'FleetCare Plans' });
  return (
    <div className="aio-fc-public aio-ps-page">
      <h1>FleetCare plans</h1>
      <p>Maintenance-management technology — separate from repair service charges.</p>
      <div className="aio-fc-plan-grid">
        {Object.values(FLEETCARE_PRICING_CONFIG.clientPlans).map((plan) => (
          <article key={plan.code} className="aio-fc-plan-card">
            <h2>{plan.name}</h2>
            <p>{formatMoney(plan.monthlyMinor)}/month</p>
            {'perVehicleMinor' in plan && plan.perVehicleMinor ? (
              <p>+ {formatMoney(plan.perVehicleMinor)} per managed vehicle (Pro)</p>
            ) : null}
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <AIOButton to={aioPaths.portalFleetCare} variant="gold">
        Open FleetCare in Portal
      </AIOButton>
    </div>
  );
}

export function FleetCareProviderJoinPage() {
  usePageMeta({ title: 'Join the FleetCare Network' });
  return (
    <div className="aio-fc-public aio-ps-page">
      <h1>Join the FleetCare Network</h1>
      <p>For independent repair businesses — mobile diesel, shop, and fleet maintenance providers.</p>
      <ul className="aio-fc-bullet-list">
        <li>Access eligible AIO-originated service opportunities</li>
        <li>Manage jobs, estimates, and schedules in the provider portal</li>
        <li>Maintain credentials, insurance, and service territory</li>
        <li>Track referral fee records for completed AIO-originated work</li>
      </ul>
      <p className="aio-fc-note">Subscription does not guarantee lead volume or income.</p>
      <IndependentProviderDisclosure />
      <div className="aio-ps-hero__actions">
        <AIOButton to={aioPaths.fleetCareProviderApply} variant="gold" showArrow>
          Apply to Join
        </AIOButton>
        <AIOButton to={aioPaths.fleetCareProviderPortal} variant="outline-gold">
          Provider Portal
        </AIOButton>
      </div>
    </div>
  );
}

export function FleetCareProviderApplyPage() {
  usePageMeta({ title: 'FleetCare Provider Application' });
  return (
    <div className="aio-fc-public aio-ps-page">
      <h1>Provider application</h1>
      <p>Progressive onboarding — submit basics now; credentials and billing details can follow review.</p>
      <form className="aio-fc-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Business name
          <input name="businessName" required placeholder="Smith Mobile Diesel LLC" />
        </label>
        <label>
          Contact email
          <input name="email" type="email" required />
        </label>
        <label>
          Primary service city / state
          <input name="location" placeholder="Columbus, OH" />
        </label>
        <label>
          <input type="checkbox" required /> I accept the FleetCare Provider Agreement (draft v0.1 — legal review pending)
        </label>
        <button type="submit" className="aio-btn aio-btn--gold">
          Submit application
        </button>
      </form>
      <p className="aio-fc-note">Applications are reviewed by AIO — not auto-approved.</p>
    </div>
  );
}
