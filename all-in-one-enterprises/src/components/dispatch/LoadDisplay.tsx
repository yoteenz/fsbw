import {
  computeAllMilesRpm,
  computeDeadheadPercent,
  computeDispatchFeeMinor,
  computeLoadedRpm,
  computeTotalMiles,
} from '../../dispatch/dispatchCalculations';
import { LOAD_STATUS_LABELS, TRUCK_AVAILABILITY_LABELS } from '../../dispatch/dispatchConfig';
import type { Load, TruckDispatchProfile } from '../../dispatch/dispatchTypes';
import { formatMoney } from '../../billing/money';

function formatRpm(minorPerMile: number): string {
  return `$${(minorPerMile / 100).toFixed(2)}`;
}

type Props = {
  load: Load;
  dispatchFeeBasisPoints?: number;
  dispatchFeeFlatMinor?: number;
  billingMode?: 'percentage' | 'flat_per_load';
  compact?: boolean;
};

export function LoadLane({ load }: { load: Load }) {
  return (
    <p className="aio-dispatch-lane" aria-label={`Lane ${load.originCity} to ${load.destinationCity}`}>
      <span>{load.originCity}, {load.originState}</span>
      <span className="aio-dispatch-lane__arrow" aria-hidden>→</span>
      <span>{load.destinationCity}, {load.destinationState}</span>
    </p>
  );
}

export function LoadMetrics({ load, compact }: Pick<Props, 'load' | 'compact'>) {
  const totalMiles = computeTotalMiles(load.loadedMiles, load.deadheadMiles);
  const loadedRpm = computeLoadedRpm(load.grossMinor, load.loadedMiles);
  const allMilesRpm = computeAllMilesRpm(load.grossMinor, load.loadedMiles, load.deadheadMiles);
  const deadheadPct = computeDeadheadPercent(load.deadheadMiles, load.loadedMiles);

  if (compact) {
    return (
      <dl className="aio-dispatch-metrics aio-dispatch-metrics--compact">
        <div><dt>Loaded</dt><dd>{load.loadedMiles} mi</dd></div>
        <div><dt>Deadhead</dt><dd>{load.deadheadMiles} mi</dd></div>
        <div><dt>Gross</dt><dd>{formatMoney(load.grossMinor)}</dd></div>
        <div><dt>Loaded RPM</dt><dd>{formatRpm(loadedRpm)}/mi</dd></div>
      </dl>
    );
  }

  return (
    <dl className="aio-dispatch-metrics">
      <div><dt>Loaded Miles</dt><dd>{load.loadedMiles.toLocaleString()} mi</dd></div>
      <div><dt>Deadhead Miles</dt><dd>{load.deadheadMiles.toLocaleString()} mi</dd></div>
      <div><dt>Total Miles</dt><dd>{totalMiles.toLocaleString()} mi</dd></div>
      <div><dt>Gross Rate</dt><dd>{formatMoney(load.grossMinor)}</dd></div>
      <div><dt>Loaded RPM</dt><dd><span className="aio-dispatch-target">{formatRpm(loadedRpm)}/mi</span></dd></div>
      <div><dt>All-Miles RPM</dt><dd><span className="aio-dispatch-target">{formatRpm(allMilesRpm)}/mi</span></dd></div>
      <div><dt>Deadhead %</dt><dd>{deadheadPct}%</dd></div>
    </dl>
  );
}

export function LoadStatusBadge({ load }: { load: Load }) {
  const label =
    load.offerStatus === 'awaiting_carrier'
      ? 'Awaiting Carrier Review'
      : LOAD_STATUS_LABELS[load.operationalStatus] ?? load.operationalStatus;
  return <span className="aio-dispatch-status">{label}</span>;
}

export function TruckAvailabilityBadge({ truck }: { truck: TruckDispatchProfile }) {
  return (
    <span className={`aio-dispatch-truck-avail aio-dispatch-truck-avail--${truck.availability}`}>
      {TRUCK_AVAILABILITY_LABELS[truck.availability]}
    </span>
  );
}

export function LoadFeePreview({ load, dispatchFeeBasisPoints, dispatchFeeFlatMinor, billingMode }: Props) {
  if (!billingMode) return null;
  const fee = computeDispatchFeeMinor(
    load.confirmedGrossMinor,
    billingMode,
    dispatchFeeBasisPoints,
    dispatchFeeFlatMinor,
  );
  const afterFee = load.confirmedGrossMinor - fee;
  return (
    <section className="aio-dispatch-fee-preview" aria-label="Dispatch fee preview">
      <h3>Dispatch Summary</h3>
      <p className="aio-prototype-note">Operational summary — not profit &amp; loss.</p>
      <dl className="aio-dispatch-metrics">
        <div><dt>Gross Load Pay</dt><dd>{formatMoney(load.confirmedGrossMinor)}</dd></div>
        <div><dt>Dispatch Service Fee</dt><dd>{formatMoney(fee)}</dd></div>
        <div><dt>Est. Carrier Gross After Dispatch Fee</dt><dd>{formatMoney(afterFee)}</dd></div>
      </dl>
    </section>
  );
}

export function LoadAppointment({ load, kind }: { load: Load; kind: 'pickup' | 'delivery' }) {
  const date = kind === 'pickup' ? load.pickupDate : load.deliveryDate;
  const start = kind === 'pickup' ? load.pickupTimeStart : load.deliveryTimeStart;
  const end = kind === 'pickup' ? load.pickupTimeEnd : load.deliveryTimeEnd;
  const label = kind === 'pickup' ? 'Pickup' : 'Delivery';
  const time =
    start && end ? `${start}–${end}` : start ?? end ?? '';
  return (
    <div className="aio-dispatch-appt">
      <span className="aio-dispatch-appt__label">{label}</span>
      <span>{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      {time && <span className="aio-dispatch-appt__time">{time}</span>}
    </div>
  );
}
