import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { intakeRepository } from '../intake/intakeState';
import { useAioRepositories } from '../data/repositories/registry';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';
import { isBackendMode } from '../config/dataMode';
import { useAIOAuth } from '../auth/AIOAuthProvider';
import { requestBusinessNameCheck } from '../business-formation/businessNameRegistry/nameCheckClient';
import { shouldRecheckBeforeSubmit, effectiveDisplayStatus } from '../business-formation/businessNameRegistry/staleLogic';
import { getStateRegistryCapability } from '../business-formation/businessNameRegistry/stateCapabilities';
import { createBusinessNameReviewTask } from '../demo/businessNameCheckActions';
import { formatAppDate } from '../i18n/format';
import type { IntakeAnswers } from '../intake/intakeTypes';

function NameAvailabilityReview({
  intake,
  onIntakeUpdate,
}: {
  intake: IntakeAnswers;
  onIntakeUpdate: (next: IntakeAnswers) => void;
}) {
  const { t, i18n } = useTranslation('intake');
  const [rechecking, setRechecking] = useState(false);

  const businessName = intake.business?.name;
  const formationState = intake.business?.formationState;
  const nameCheck = intake.business?.nameCheck;

  if (!businessName?.trim() || !formationState) return null;

  const stateLabel = getStateRegistryCapability(formationState).stateName;
  const displayStatus = effectiveDisplayStatus(nameCheck, {
    businessNameRaw: businessName,
    formationState,
    entityStructure: intake.business?.structure,
  });

  const runRecheck = useCallback(async () => {
    setRechecking(true);
    try {
      const result = await requestBusinessNameCheck({
        state: formationState,
        businessName,
        entityType: intake.business?.structure,
      });
      const next = {
        ...intake,
        business: { ...intake.business, nameCheck: result },
      };
      onIntakeUpdate(next);
      intakeRepository.save(next);
      if (result.manualReviewRequired) {
        createBusinessNameReviewTask({
          businessName: result.businessNameRaw,
          formationState: result.formationState,
          entityStructure: result.entityStructure,
          status: result.status,
        });
      }
    } finally {
      setRechecking(false);
    }
  }, [businessName, formationState, intake, onIntakeUpdate]);

  const statusLabel = (() => {
    switch (displayStatus) {
      case 'likely_available':
        return t('nameCheck.likelyAvailable');
      case 'possible_conflict':
        return t('nameCheck.possibleConflict');
      case 'unavailable':
        return t('nameCheck.unavailable');
      case 'manual_review_required':
      case 'lookup_unavailable':
        return t('nameCheck.manualRequired');
      case 'stale_result':
        return t('nameCheck.stale');
      case 'error':
        return t('nameCheck.errorTitle');
      default:
        return t('nameCheck.manualRequired');
    }
  })();

  return (
    <section className="aio-portal-panel aio-name-check-review">
      <h2>{t('nameCheck.reviewSection')}</h2>
      <dl className="aio-name-check-review__grid">
        <div>
          <dt>Business Name</dt>
          <dd>{businessName}</dd>
        </div>
        <div>
          <dt>Formation State</dt>
          <dd>{stateLabel}</dd>
        </div>
        {intake.business?.structure && (
          <div>
            <dt>Business Structure</dt>
            <dd>{intake.business.structure.replace(/_/g, ' ')}</dd>
          </div>
        )}
        <div>
          <dt>{t('nameCheck.reviewSection')}</dt>
          <dd className={`aio-name-check-review__status aio-name-check-review__status--${displayStatus}`}>{statusLabel}</dd>
        </div>
        {nameCheck?.checkedAt && displayStatus !== 'stale_result' && (
          <div>
            <dt>Last Checked</dt>
            <dd>{formatAppDate(nameCheck.checkedAt, i18n.language)}</dd>
          </div>
        )}
      </dl>
      <p className="aio-name-check__disclaimer">{t('nameCheck.finalDisclaimer', { state: stateLabel })}</p>
      <AIOButton type="button" variant="outline-dark" onClick={() => void runRecheck()} disabled={rechecking}>
        {rechecking ? t('nameCheck.rechecking') : t('nameCheck.recheck')}
      </AIOButton>
    </section>
  );
}

export function RequestSubmitPage() {
  const navigate = useNavigate();
  const repos = useAioRepositories();
  const { isAuthenticated } = useAIOAuth();
  const [intake, setIntake] = useState(() => intakeRepository.load());
  const roadmap = repos.roadmap.load();
  const plan = repos.servicePlan.load();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recheckBlocking, setRecheckBlocking] = useState(false);

  const handleSubmit = async () => {
    if (plan.length === 0) return;
    if (isBackendMode() && !isAuthenticated) {
      navigate(aioPaths.signUp);
      return;
    }

    let intakeToSubmit = intake;

    const needsRecheck = shouldRecheckBeforeSubmit(intake.business?.nameCheck, {
      businessNameRaw: intake.business?.name,
      formationState: intake.business?.formationState,
      entityStructure: intake.business?.structure,
    });

    if (needsRecheck && intake.business?.name?.trim() && intake.business?.formationState) {
      setRecheckBlocking(true);
      try {
        const result = await requestBusinessNameCheck({
          state: intake.business.formationState,
          businessName: intake.business.name,
          entityType: intake.business.structure,
        });
        intakeToSubmit = { ...intake, business: { ...intake.business, nameCheck: result } };
        setIntake(intakeToSubmit);
        intakeRepository.save(intakeToSubmit);
        if (result.manualReviewRequired) {
          createBusinessNameReviewTask({
            businessName: result.businessNameRaw,
            formationState: result.formationState,
            entityStructure: result.entityStructure,
            status: result.status,
          });
        }
      } finally {
        setRecheckBlocking(false);
      }
    }

    setSubmitting(true);
    try {
      const request = await repos.serviceRequests.create({
        services: plan.map((p: { slug: string; title: string; division: string }) => ({ slug: p.slug, title: p.title, division: p.division })),
        intake: intakeToSubmit,
        roadmap,
        notes,
      });
      navigate(aioPaths.requestConfirmation(request.id));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="aio-page-hero aio-page-hero--dark">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Service Request</p>
          <h1 className="aio-page-hero__title">Request Help From All In One</h1>
          <p className="aio-page-hero__desc">Review your information before submitting this demo request.</p>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container aio-request-review">
          <section className="aio-portal-panel">
            <h2>Business</h2>
            <p>{intake.business?.name || intake.shipper?.companyName || '—'}</p>
            <p>{intake.business?.formationState ? `Formation: ${intake.business.formationState}` : ''}</p>
            <p>{intake.business?.operatingState ? `Operating: ${intake.business.operatingState}` : ''}</p>
          </section>

          <NameAvailabilityReview intake={intake} onIntakeUpdate={setIntake} />

          <section className="aio-portal-panel">
            <h2>Contact</h2>
            <p>{intake.contact?.name || intake.shipper?.contactName || '—'}</p>
            <p>{intake.contact?.email || '—'}</p>
            {intake.contact?.phone && <p>{intake.contact.phone}</p>}
          </section>

          <section className="aio-portal-panel">
            <h2>Selected Services ({plan.length})</h2>
            {plan.length === 0 ? (
              <p>
                No services in your plan.{' '}
                <Link to={aioPaths.servicePlan}>Add services</Link>
              </p>
            ) : (
              <ul>
                {plan.map((s: ServicePlanItem) => (
                  <li key={s.slug}>{s.title}</li>
                ))}
              </ul>
            )}
          </section>

          {roadmap && (
            <section className="aio-portal-panel">
              <h2>Roadmap Summary</h2>
              <p>{roadmap.complianceProgress}% setup progress</p>
              <p>{roadmap.items.filter((i) => i.status === 'recommended').length} recommended next steps</p>
            </section>
          )}

          <section className="aio-portal-panel">
            <label htmlFor="request-notes" className="aio-intake-label">
              Notes (optional)
            </label>
            <textarea
              id="request-notes"
              className="aio-intake-input aio-intake-textarea"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else we should know?"
            />
          </section>

          <p className="aio-prototype-note">DEMO REQUEST — No email sent, no charges, no production records created.</p>

          <div className="aio-intake__actions">
            <Link to={aioPaths.servicePlan}>
              <AIOButton variant="outline-dark">Back to Plan</AIOButton>
            </Link>
            <AIOButton variant="gold" onClick={handleSubmit} disabled={plan.length === 0 || submitting || recheckBlocking}>
              {recheckBlocking ? 'Rechecking name…' : submitting ? 'Submitting…' : 'Submit Service Request'}
            </AIOButton>
          </div>
        </div>
      </div>
    </>
  );
}

export function RequestConfirmationPage({ requestId }: { requestId: string }) {
  const repos = useAioRepositories();
  const [request, setRequest] = useState<Awaited<ReturnType<typeof repos.serviceRequests.getById>>>(undefined);

  useEffect(() => {
    void Promise.resolve(repos.serviceRequests.getById(requestId)).then(setRequest);
  }, [repos.serviceRequests, requestId]);

  if (!request) {
    return (
      <div className="aio-page-content">
        <div className="aio-container">
          <h1>Request Not Found</h1>
          <Link to={aioPaths.portal}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="aio-page-content">
      <div className="aio-container aio-confirmation">
        <span className="aio-badge aio-badge--progress">DEMO REQUEST</span>
        <h1 className="aio-display-md">Request Received</h1>
        <p className="aio-confirmation__number">{request.requestNumber}</p>
        <p>Your service request has been added to the prototype client portal.</p>
        <p>Next step: {request.nextStep}</p>
        <div className="aio-intake__actions" style={{ marginTop: '2rem' }}>
          <Link to={aioPaths.portal}>
            <AIOButton variant="gold">View My Dashboard</AIOButton>
          </Link>
          <Link to={aioPaths.portalRequest(request.id)}>
            <AIOButton variant="outline-dark">View Request Details</AIOButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
