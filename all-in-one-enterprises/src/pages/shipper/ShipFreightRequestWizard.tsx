import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ShipmentRequestInput } from '../../brokerage/brokerageWorkflow';
import {
  duplicateRequestFromTemplate,
  saveShipmentRequestDraft,
  saveShipmentTemplate,
  submitShipmentRequest,
} from '../../brokerage/brokerageWorkflow';
import { getShipperOrganizationId } from '../../demo/brokerageActions';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';

const STEPS = ['Route', 'Freight', 'Schedule', 'Requirements', 'Review'] as const;
const EQUIPMENT = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only'];

const emptyForm = (): Partial<ShipmentRequestInput> => ({
  equipmentType: 'Dry Van',
  fullPartial: 'full',
  trailerLengthFt: 53,
  hazmatSelfReported: false,
});

export function ShipFreightRequestWizard() {
  const { requestId: editId } = useParams();
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const navigate = useNavigate();
  const existing = editId ? store.shipmentRequests.find((r) => r.id === editId && r.shipperOrganizationId === orgId) : undefined;

  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState(existing?.id ?? '');
  const [form, setForm] = useState<Partial<ShipmentRequestInput>>(() =>
    existing ? { ...existing } : emptyForm(),
  );
  const [templateLabel, setTemplateLabel] = useState('');

  const templates = useMemo(
    () => (store.shipmentRequestTemplates ?? []).filter((t) => t.shipperOrganizationId === orgId),
    [store.shipmentRequestTemplates, orgId],
  );

  const patch = (partial: Partial<ShipmentRequestInput>) => setForm((f) => ({ ...f, ...partial }));

  const persistDraft = () => {
    const id = saveShipmentRequestDraft(orgId, form, draftId || undefined);
    setDraftId(id);
    return id;
  };

  const onSaveDraft = () => {
    persistDraft();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = persistDraft();
    if (submitShipmentRequest(orgId, id)) {
      navigate(aioPaths.shipperRequest(id));
    }
  };

  const onSaveTemplate = () => {
    if (!templateLabel.trim()) return;
    saveShipmentTemplate(orgId, templateLabel.trim(), form);
    setTemplateLabel('');
  };

  return (
    <div className="aio-shipper-request">
      <header className="aio-shipper-request__header">
        <Link to={aioPaths.shipper} className="aio-rr-link">← Shipper</Link>
        <h1>Ship with AIO</h1>
        <p>Request a freight quote — AIO is your broker. One submission flows to office pricing and load board distribution.</p>
      </header>

      <div className="aio-shipper-request__shell">
        <nav className="aio-shipper-request__steps aio-desktop-only" aria-label="Wizard steps">
          {STEPS.map((label, i) => (
            <button key={label} type="button" className={step === i ? 'is-active' : ''} onClick={() => setStep(i)}>
              {String(i + 1).padStart(2, '0')} {label}
            </button>
          ))}
        </nav>

        <div className="aio-shipper-request__workspace">
          <div className="aio-shipper-request__mobile-step aio-mobile-only">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </div>

          {templates.length > 0 && step === 0 && (
            <div className="aio-shipper-request__templates">
              <label>Start from template
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const newId = duplicateRequestFromTemplate(orgId, id);
                    if (newId) navigate(aioPaths.shipperRequest(newId));
                  }}
                >
                  <option value="">Select…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <form className="aio-shipper-request__form" onSubmit={onSubmit}>
            {step === 0 && (
              <>
                <h2>Route</h2>
                <fieldset>
                  <legend>Pickup</legend>
                  <label>Company<input value={form.pickupCompany ?? ''} onChange={(e) => patch({ pickupCompany: e.target.value })} /></label>
                  <label>City<input required value={form.pickupCity ?? ''} onChange={(e) => patch({ pickupCity: e.target.value })} /></label>
                  <label>State<input required maxLength={2} value={form.pickupState ?? ''} onChange={(e) => patch({ pickupState: e.target.value.toUpperCase() })} /></label>
                  <label>ZIP<input value={form.pickupZip ?? ''} onChange={(e) => patch({ pickupZip: e.target.value })} /></label>
                </fieldset>
                <fieldset>
                  <legend>Delivery</legend>
                  <label>Company<input value={form.deliveryCompany ?? ''} onChange={(e) => patch({ deliveryCompany: e.target.value })} /></label>
                  <label>City<input required value={form.deliveryCity ?? ''} onChange={(e) => patch({ deliveryCity: e.target.value })} /></label>
                  <label>State<input required maxLength={2} value={form.deliveryState ?? ''} onChange={(e) => patch({ deliveryState: e.target.value.toUpperCase() })} /></label>
                  <label>ZIP<input value={form.deliveryZip ?? ''} onChange={(e) => patch({ deliveryZip: e.target.value })} /></label>
                </fieldset>
              </>
            )}

            {step === 1 && (
              <>
                <h2>Freight</h2>
                <label>Equipment
                  <select value={form.equipmentType ?? 'Dry Van'} onChange={(e) => patch({ equipmentType: e.target.value })}>
                    {EQUIPMENT.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </label>
                <label>Trailer length (ft)<input type="number" value={form.trailerLengthFt ?? 53} onChange={(e) => patch({ trailerLengthFt: Number(e.target.value) })} /></label>
                <label>Full / partial
                  <select value={form.fullPartial ?? 'full'} onChange={(e) => patch({ fullPartial: e.target.value as 'full' | 'partial' })}>
                    <option value="full">Full</option>
                    <option value="partial">Partial</option>
                  </select>
                </label>
                <label>Commodity<input value={form.commodity ?? ''} onChange={(e) => patch({ commodity: e.target.value })} /></label>
                <label>Weight<input value={form.weight ?? ''} onChange={(e) => patch({ weight: e.target.value })} placeholder="e.g. 42000 lbs" /></label>
                <label>Pallets<input type="number" value={form.palletCount ?? ''} onChange={(e) => patch({ palletCount: e.target.value ? Number(e.target.value) : undefined })} /></label>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Schedule</h2>
                <label>Pickup date<input required type="date" value={form.pickupDate ?? ''} onChange={(e) => patch({ pickupDate: e.target.value })} /></label>
                <label>Pickup window start<input type="time" value={form.pickupTimeStart ?? ''} onChange={(e) => patch({ pickupTimeStart: e.target.value })} /></label>
                <label>Pickup window end<input type="time" value={form.pickupTimeEnd ?? ''} onChange={(e) => patch({ pickupTimeEnd: e.target.value })} /></label>
                <label>Delivery date<input required type="date" value={form.deliveryDate ?? ''} onChange={(e) => patch({ deliveryDate: e.target.value })} /></label>
                <label>Delivery window start<input type="time" value={form.deliveryTimeStart ?? ''} onChange={(e) => patch({ deliveryTimeStart: e.target.value })} /></label>
                <label>Delivery window end<input type="time" value={form.deliveryTimeEnd ?? ''} onChange={(e) => patch({ deliveryTimeEnd: e.target.value })} /></label>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Requirements</h2>
                <label>Temperature<input value={form.temperatureRequirements ?? ''} onChange={(e) => patch({ temperatureRequirements: e.target.value })} /></label>
                <label className="aio-check"><input type="checkbox" checked={form.hazmatSelfReported ?? false} onChange={(e) => patch({ hazmatSelfReported: e.target.checked })} /> Hazmat (self-reported)</label>
                <label>Special handling<textarea value={form.specialHandling ?? ''} onChange={(e) => patch({ specialHandling: e.target.value })} rows={2} /></label>
                <label>Reference / PO<input value={form.poNumber ?? form.referenceNumbers ?? ''} onChange={(e) => patch({ poNumber: e.target.value, referenceNumbers: e.target.value })} /></label>
                <label>Contact name<input value={form.contactName ?? ''} onChange={(e) => patch({ contactName: e.target.value })} /></label>
                <label>Contact phone<input value={form.contactPhone ?? ''} onChange={(e) => patch({ contactPhone: e.target.value })} /></label>
                <label>Contact email<input type="email" value={form.contactEmail ?? ''} onChange={(e) => patch({ contactEmail: e.target.value })} /></label>
                <label>Instructions<textarea value={form.specialInstructions ?? ''} onChange={(e) => patch({ specialInstructions: e.target.value })} rows={3} /></label>
              </>
            )}

            {step === 4 && (
              <>
                <h2>Review</h2>
                <dl className="aio-shipper-request__review">
                  <dt>Lane</dt><dd>{form.pickupCity}, {form.pickupState} → {form.deliveryCity}, {form.deliveryState}</dd>
                  <dt>Pickup</dt><dd>{form.pickupDate} {form.pickupTimeStart && `· ${form.pickupTimeStart}–${form.pickupTimeEnd ?? ''}`}</dd>
                  <dt>Delivery</dt><dd>{form.deliveryDate}</dd>
                  <dt>Equipment</dt><dd>{form.equipmentType} · {form.trailerLengthFt}' · {form.fullPartial}</dd>
                  <dt>Freight</dt><dd>{form.commodity ?? '—'} · {form.weight ?? '—'}</dd>
                </dl>
                <p className="aio-prototype-note">Carrier rates and AIO margin are never shown to shippers.</p>
              </>
            )}

            <div className="aio-shipper-request__actions">
              {step > 0 && (
                <button type="button" className="aio-btn aio-btn--outline" onClick={() => setStep((s) => s - 1)}>Back</button>
              )}
              {step < STEPS.length - 1 && (
                <button type="button" className="aio-btn aio-btn--gold" onClick={() => { persistDraft(); setStep((s) => s + 1); }}>Continue</button>
              )}
              <button type="button" className="aio-btn aio-btn--outline" onClick={onSaveDraft}>Save draft</button>
              {step === STEPS.length - 1 && (
                <button type="submit" className="aio-btn aio-btn--gold">Submit to AIO Brokerage</button>
              )}
            </div>
          </form>
        </div>

        <aside className="aio-shipper-request__rail aio-desktop-only">
          <h3>Templates</h3>
          <label>Save as template<input value={templateLabel} onChange={(e) => setTemplateLabel(e.target.value)} placeholder="Lane nickname" /></label>
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={onSaveTemplate}>Save template</button>
          {draftId && <p className="aio-prototype-note">Draft {draftId.slice(0, 8)}… saved locally.</p>}
        </aside>
      </div>
    </div>
  );
}

export function ShipperRequestDetailPage() {
  const { requestId = '' } = useParams();
  const store = useDemoStore();
  const orgId = getShipperOrganizationId(store);
  const req = store.shipmentRequests.find((r) => r.id === requestId && r.shipperOrganizationId === orgId);
  const info = req?.openInfoRequestId
    ? store.brokerageInfoRequests?.find((i) => i.id === req.openInfoRequestId)
    : undefined;

  if (!req) return <p>Request not found.</p>;

  return (
    <div className="aio-brokerage">
      <Link to={aioPaths.shipperRequests} className="aio-rr-link">← Requests</Link>
      <h1>{req.requestNumber}</h1>
      <p>{req.pickupCity}, {req.pickupState} → {req.deliveryCity}, {req.deliveryState}</p>
      <p>Status: <strong>{req.status.replace(/_/g, ' ')}</strong></p>

      {info && (
        <section className="aio-shipper-request__alert">
          <h2>Action required</h2>
          <p>{info.message}</p>
          <p>Missing: {info.missingFields.join(', ')}</p>
          <Link to={aioPaths.shipperShipWithAioEdit(req.id)} className="aio-btn aio-btn--gold aio-btn--sm">Complete information</Link>
        </section>
      )}

      {req.convertedLoadId && (
        <Link to={aioPaths.shipperShipment(req.convertedLoadId)} className="aio-btn aio-btn--gold">View shipment</Link>
      )}
    </div>
  );
}
