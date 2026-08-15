import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { createLoadOpportunity } from '../../demo/dispatchActions';
import { computeAllMilesRpm, computeGrossMinor, computeLoadedRpm, computeTotalMiles } from '../../dispatch/dispatchCalculations';
import { dollarsToMinor, formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function DispatchLoadNewPage() {
  const store = useDemoStore();
  const navigate = useNavigate();
  const activeClients = store.dispatchEnrollments.filter((e) => e.status === 'active');

  const [orgId, setOrgId] = useState(activeClients[0]?.organizationId ?? 'client-a');
  const [brokerName, setBrokerName] = useState('Demo Logistics LLC');
  const [originCity, setOriginCity] = useState('');
  const [originState, setOriginState] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loadedMiles, setLoadedMiles] = useState(0);
  const [deadheadMiles, setDeadheadMiles] = useState(0);
  const [linehaul, setLinehaul] = useState('');
  const [fuel, setFuel] = useState('');
  const [equipment, setEquipment] = useState('Dry Van');
  const [powerUnitId, setPowerUnitId] = useState('');
  const [notes, setNotes] = useState('');

  const trucks = store.truckProfiles.filter((t) => t.organizationId === orgId);
  const linehaulMinor = linehaul ? dollarsToMinor(parseFloat(linehaul)) : 0;
  const fuelMinor = fuel ? dollarsToMinor(parseFloat(fuel)) : 0;
  const grossMinor = computeGrossMinor(linehaulMinor, fuelMinor, 0);
  const loadedRpm = computeLoadedRpm(grossMinor, loadedMiles);
  const allRpm = computeAllMilesRpm(grossMinor, loadedMiles, deadheadMiles);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const load = createLoadOpportunity(
      {
        organizationId: orgId,
        powerUnitId: powerUnitId || undefined,
        brokerName,
        originCity,
        originState,
        destinationCity: destCity,
        destinationState: destState,
        pickupDate,
        deliveryDate,
        loadedMiles,
        deadheadMiles,
        linehaulMinor,
        fuelSurchargeMinor: fuelMinor,
        equipmentType: equipment,
        customerNotes: notes || undefined,
      },
      'staff-4',
    );
    navigate(aioPaths.officeDispatchLoad(load.id));
  };

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeDispatch} className="aio-office-link">← Command Center</Link>
      <header className="aio-office-page__header"><h1>New Load Opportunity</h1></header>
      <form onSubmit={onSubmit} className="aio-dispatch-form aio-dispatch-form--office">
        <label>
          Carrier
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)}>
            {activeClients.map((e) => {
              const c = store.clients.find((x) => x.id === e.organizationId);
              return <option key={e.id} value={e.organizationId}>{c?.companyName}</option>;
            })}
          </select>
        </label>
        <label>
          Truck
          <select value={powerUnitId} onChange={(e) => setPowerUnitId(e.target.value)}>
            <option value="">—</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.powerUnitId}>{t.nickname}</option>
            ))}
          </select>
        </label>
        <label>Broker<input value={brokerName} onChange={(e) => setBrokerName(e.target.value)} required /></label>
        <div className="aio-dispatch-form__row">
          <label>Origin City<input value={originCity} onChange={(e) => setOriginCity(e.target.value)} required /></label>
          <label>State<input value={originState} onChange={(e) => setOriginState(e.target.value)} maxLength={2} required /></label>
        </div>
        <div className="aio-dispatch-form__row">
          <label>Destination City<input value={destCity} onChange={(e) => setDestCity(e.target.value)} required /></label>
          <label>State<input value={destState} onChange={(e) => setDestState(e.target.value)} maxLength={2} required /></label>
        </div>
        <div className="aio-dispatch-form__row">
          <label>Pickup Date<input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required /></label>
          <label>Delivery Date<input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required /></label>
        </div>
        <div className="aio-dispatch-form__row">
          <label>Loaded Miles<input type="number" value={loadedMiles || ''} onChange={(e) => setLoadedMiles(Number(e.target.value))} required /></label>
          <label>Deadhead Miles<input type="number" value={deadheadMiles || ''} onChange={(e) => setDeadheadMiles(Number(e.target.value))} /></label>
        </div>
        <div className="aio-dispatch-form__row">
          <label>Linehaul ($)<input value={linehaul} onChange={(e) => setLinehaul(e.target.value)} required /></label>
          <label>Fuel Surcharge ($)<input value={fuel} onChange={(e) => setFuel(e.target.value)} /></label>
        </div>
        <label>Equipment<input value={equipment} onChange={(e) => setEquipment(e.target.value)} /></label>
        <label>Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></label>
        {grossMinor > 0 && loadedMiles > 0 && (
          <section className="aio-office-panel">
            <h3>Rate Preview</h3>
            <p>Gross: {formatMoney(grossMinor)} · Loaded RPM: ${(loadedRpm / 100).toFixed(2)} · All-Miles RPM: ${(allRpm / 100).toFixed(2)} · Total: {computeTotalMiles(loadedMiles, deadheadMiles)} mi</p>
          </section>
        )}
        <button type="submit" className="aio-btn aio-btn--gold">Create Opportunity</button>
      </form>
    </div>
  );
}
