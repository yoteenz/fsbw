import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { intakeRepository } from '../intake/intakeState';
import { roadmapRepository } from '../repositories/roadmapRepository';
import { servicePlanRepository } from '../repositories/servicePlanRepository';
import { serviceRequestRepository } from '../repositories/serviceRequestRepository';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';

export function RequestSubmitPage() {
  const navigate = useNavigate();
  const intake = intakeRepository.load();
  const roadmap = roadmapRepository.load();
  const plan = servicePlanRepository.load();
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (plan.length === 0) return;
    const request = serviceRequestRepository.create({
      services: plan.map((p) => ({ slug: p.slug, title: p.title, division: p.division })),
      intake,
      roadmap,
      notes,
    });
    navigate(aioPaths.requestConfirmation(request.id));
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
            <p>{intake.business?.operatingState ? `Operating: ${intake.business.operatingState}` : ''}</p>
          </section>

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
                {plan.map((s) => (
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
            <AIOButton variant="gold" onClick={handleSubmit} disabled={plan.length === 0}>
              Submit Service Request
            </AIOButton>
          </div>
        </div>
      </div>
    </>
  );
}

export function RequestConfirmationPage({ requestId }: { requestId: string }) {
  const request = serviceRequestRepository.getById(requestId);

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
