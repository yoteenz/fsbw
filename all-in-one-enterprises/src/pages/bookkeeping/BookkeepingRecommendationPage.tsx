import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AIOButton } from '../../components/AIOButton';
import { BookkeepingPlanCards } from '../../components/bookkeeping/BookkeepingPlanSection';
import { BOOKKEEPING_PLANS, BOOKS_RESCUE_STARTING_PRICE_MINOR, planStartingPriceMinor } from '../../bookkeeping/bookkeepingPlans';
import { planDisplayName } from '../../bookkeeping/bookkeepingRecommendation';
import { formatMoney } from '../../billing/money';
import { loadAssessmentFromSession, loadRecommendationFromSession } from '../../demo/bookkeepingActions';
import { getPublicServiceCta } from '../../launch/serviceActivationLaunch';
import { BOOKKEEPING_SERVICE_SLUG, BOOKS_RESCUE_SERVICE_SLUG } from '../../bookkeeping/bookkeepingConfig';
import { aioPaths } from '../../utils/paths';

export function BookkeepingRecommendationPage() {
  const answers = loadAssessmentFromSession();
  const result = loadRecommendationFromSession();

  useEffect(() => {
    document.title = 'Your Bookkeeping Recommendation | All In One Enterprises Inc.';
  }, []);

  if (!answers || !result) {
    return <Navigate to={aioPaths.bookkeepingAssessment} replace />;
  }

  const plan = BOOKKEEPING_PLANS[result.recommendedPlan];
  const price = planStartingPriceMinor(result.recommendedPlan, result.billingInterval);
  const activation = getPublicServiceCta(BOOKKEEPING_SERVICE_SLUG);
  const rescueActivation = getPublicServiceCta(BOOKS_RESCUE_SERVICE_SLUG);

  return (
    <div className="aio-page aio-bk-recommendation">
      <div className="aio-container">
        <Link to={aioPaths.bookkeepingAssessment} className="aio-office-link">← Edit answers</Link>

        {result.booksRescueRequired && (
          <section className="aio-bk-rescue-callout">
            <p className="aio-label">First step</p>
            <h1>Books Rescue</h1>
            <p>Your books need cleanup before recurring bookkeeping can begin.</p>
            <p className="aio-bk-rescue-callout__price">
              Starting at {formatMoney(BOOKS_RESCUE_STARTING_PRICE_MINOR)}
            </p>
            {result.rescueReasons?.map((r) => (
              <p key={r} className="aio-bk-rescue-callout__reason">{r}</p>
            ))}
            <AIOButton
              variant="gold"
              to={rescueActivation.allowed ? aioPaths.getStartedForService('books-rescue') : aioPaths.contact}
            >
              {rescueActivation.allowed ? 'Start Books Rescue' : rescueActivation.label}
            </AIOButton>
            <p className="aio-bk-rescue-callout__then">
              Then: {planDisplayName(result.afterRescuePlan ?? result.recommendedPlan)}
            </p>
          </section>
        )}

        <section className="aio-bk-rec-card">
          <p className="aio-label">Recommended for you</p>
          <h1>{planDisplayName(result.recommendedPlan)}</h1>
          <p className="aio-bk-rec-card__price">
            Starting at {formatMoney(price)}
            {result.billingInterval === 'ANNUAL' ? ' / year · billed annually' : ' / month'}
          </p>

          {result.customReviewRequired && (
            <p className="aio-bk-rec-card__review">
              Your bookkeeping needs are more complex than our standard starting package. We&apos;ll review your setup
              and confirm pricing before service begins.
            </p>
          )}

          <div className="aio-bk-rec-card__why">
            <h2>Why we recommend it</h2>
            <ul>
              {result.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="aio-bk-rec-card__included">
            <h2>What&apos;s included</h2>
            <ul>
              {plan.features.slice(0, 10).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="aio-hero__actions">
            <AIOButton
              variant="gold"
              to={activation.allowed ? aioPaths.getStartedForService(plan.slug) : aioPaths.contact}
            >
              Select This Plan
            </AIOButton>
            <Link to={`${aioPaths.bookkeeping}#plans`}>
              <AIOButton variant="outline">Compare All Plans</AIOButton>
            </Link>
            <Link to={aioPaths.contact}>
              <AIOButton variant="outline-dark">Talk to an Expert</AIOButton>
            </Link>
          </div>
        </section>

        <section style={{ marginTop: '3rem' }}>
          <h2 className="aio-display-sm">All plans</h2>
          <BookkeepingPlanCards interval={result.billingInterval} highlightPlan={result.recommendedPlan} ctaMode="recommendation" />
        </section>
      </div>
    </div>
  );
}
