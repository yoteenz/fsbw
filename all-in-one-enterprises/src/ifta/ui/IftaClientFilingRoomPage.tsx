import { useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { resolvePortalContext } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';
import {
  MILEAGE_QUALITY_COPY,
  RECEIPT_CLASS_COPY,
  aioDoingLine,
  blockingItems,
  clientOpenItems,
  effectiveState,
  fleetReadiness,
  formatMoney,
  formatNumber,
  jurisdictionName,
  nextStepLine,
  receiptTotals,
  taxPositionLabel,
  templateVars,
  type IftaCompartment,
} from '../iftaDerive';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';
import { primaryCta, stateLabel, experienceState } from '../experience/iftaExperience';
import { defaultQuarterKeyForOrg, findOrgQuarter, orgHasIftaWorkspace } from '../iftaRouteHelpers';
import type { IftaQuarterCase, IftaReceiptClass } from '../iftaTypes';
import { IftaIcon } from './IftaIcon';
import { IFTA_MEDIA } from './iftaAssetManifest';
import { IftaFilingRoomHero } from './IftaHero';
import {
  IftaActivity,
  IftaChecklist,
  IftaChip,
  IftaCtaRail,
  IftaFuelDonut,
  IftaInsights,
  IftaMetricsRail,
  IftaMileageBars,
  IftaPanel,
  IftaPhaseStepper,
  IftaShareLegend,
  IftaStatusPill,
  IftaTaskList,
  IftaUploadRows,
  IftaUsMap,
  IftaViewAll,
} from './IftaModules';
import {
  checklistRows,
  clientTasks,
  filingPhases,
  fuelShares,
  mileageIntensity,
  mileageShares,
  quarterMetrics,
  recentActivity,
  recentUploads,
  type IftaClientTab,
} from './iftaViewModel';

const TABS: IftaClientTab[] = ['PROGRESS', 'FUEL PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS'];

const COMPARTMENT_TAB: Record<IftaCompartment, IftaClientTab> = {
  receipts: 'FUEL PURCHASES',
  mileage: 'MILEAGE',
  vehicles: 'VEHICLES',
  approval: 'JURISDICTIONS',
};

const RECEIPT_TONE: Record<IftaReceiptClass, 'success' | 'warn' | 'progress' | 'alert' | 'muted'> = {
  READY: 'success',
  UNDER_AIO_REVIEW: 'progress',
  NEEDS_YOU: 'warn',
  UNREADABLE: 'alert',
  POSSIBLE_MISSING: 'warn',
  DUPLICATE: 'muted',
};

const QUALITY_TONE = { VERIFIED: 'success', AIO_CHECKING: 'progress', AIO_BUILDING: 'progress', ESTIMATE: 'warn', MISSING: 'alert', NOT_OPERATED: 'muted' } as const;

/** CLIENT OFFICE · IFTA FILING ROOM — light premium Filing Room (approved client parent + tablet / desktop authority). */
export function IftaClientFilingRoomPage() {
  const { quarterKey: quarterParam } = useParams<{ quarterKey?: string }>();
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const [tab, setTab] = useState<IftaClientTab>('PROGRESS');
  const tabsRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  if (!orgHasIftaWorkspace(store, ctx.organizationId)) return null;
  const defaultKey = defaultQuarterKeyForOrg(store, ctx.organizationId, now);
  if (!quarterParam && defaultKey) return <Navigate to={aioPaths.portalWorkspaceIftaQuarter(defaultKey)} replace />;

  const quarter = quarterParam ? findOrgQuarter(store, ctx.organizationId, quarterParam) : undefined;
  if (!quarter) {
    return (
      <div className="ifta-frame">
        <div className="ifta-notice ifta-notice--block">
          <strong>Quarter not found</strong>
          <p>Select a valid quarter for {ctx.companyName}.</p>
        </div>
      </div>
    );
  }

  const go = (t: IftaClientTab) => {
    setTab(t);
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <FilingRoom quarter={quarter} now={now} tab={tab} go={go} setTab={setTab} tabsRef={tabsRef} />;
}

function FilingRoom({
  quarter,
  now,
  tab,
  go,
  setTab,
  tabsRef,
}: {
  quarter: IftaQuarterCase;
  now: Date;
  tab: IftaClientTab;
  go: (t: IftaClientTab) => void;
  setTab: (t: IftaClientTab) => void;
  tabsRef: React.RefObject<HTMLDivElement>;
}) {
  const state = effectiveState(quarter, now);
  const metrics = quarterMetrics(quarter);
  const vars = templateVars(quarter, now);
  const openItems = clientOpenItems(quarter, now);
  const blocking = blockingItems(quarter, now);
  const days = Math.max(0, daysUntil(quarter.dueDate, now));
  const stateClass = experienceState(state).state_class;
  const pillTone = stateClass === 'BLOCKED' ? 'warn' : stateClass === 'COMPLETE' || stateClass === 'ARCHIVED' ? 'success' : 'gold';

  // Bottom rail: the next thing that needs the client, else the contract's primary client action.
  const first = blocking[0] ?? openItems[0];
  const ctaTab: IftaClientTab = first ? COMPARTMENT_TAB[first.compartment] : quarter.vault ? 'DOCUMENTS' : 'PROGRESS';
  const ctaRaw = primaryCta(state, 'CLIENT', vars);
  const ctaLabel = blocking.length
    ? `Resolve ${blocking.length} item${blocking.length === 1 ? '' : 's'} · ${ctaTab}`
    : ctaRaw.replace(/\{[^}]+\}/g, '').trim() || `Open ${ctaTab}`;

  const shares = mileageShares(quarter);
  const fuel = fuelShares(quarter);
  const totals = receiptTotals(quarter);
  const fleet = fleetReadiness(quarter);

  const vehiclesPanel = (
    <IftaPanel title="Vehicle & trip data" className="ifta-area-vehicles" aside={tab === 'PROGRESS' ? <IftaViewAll onClick={() => go('VEHICLES')} /> : undefined}>
      <ul className="ifta-vehicles">
        {fleet.map((v) => (
          <li key={v.vehicle.id}>
            <span className="ifta-vehicles__icon" aria-hidden="true">
              <IftaIcon name="truck" size={20} />
            </span>
            <span className="ifta-vehicles__text">
              <span className="ifta-vehicles__unit">{v.vehicle.unit}</span>
              <span className="ifta-vehicles__meta">
                {formatNumber(v.miles)} miles · {formatNumber(v.gallons, 0)} gal
              </span>
            </span>
            <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
          </li>
        ))}
      </ul>
    </IftaPanel>
  );

  const mapPanel = (
    <IftaPanel title="Jurisdiction breakdown" className="ifta-area-map" aside={tab === 'PROGRESS' ? <IftaViewAll onClick={() => go('JURISDICTIONS')} /> : undefined}>
      {shares.length ? (
        <div className="ifta-mapwrap">
          <IftaUsMap intensity={mileageIntensity(quarter)} label={`Miles by state, ${quarterLabel(quarter)}`} />
          <IftaShareLegend shares={shares} />
        </div>
      ) : (
        <p className="ifta-empty-line">No miles recorded yet — the map fills as mileage arrives.</p>
      )}
    </IftaPanel>
  );

  const uploadsPanel = (
    <IftaPanel title="Recent uploads" className="ifta-area-uploads" aside={tab === 'PROGRESS' ? <IftaViewAll onClick={() => go('DOCUMENTS')} /> : undefined}>
      <IftaUploadRows rows={recentUploads(quarter, tab === 'DOCUMENTS' ? 12 : 3)} />
    </IftaPanel>
  );

  const progress = (
    <div className="ifta-grid ifta-grid--room">
      <IftaPanel title="Filing checklist" className="ifta-area-checklist ifta-panel--bare">
        <IftaChecklist rows={checklistRows(quarter, now)} onSelect={(r) => go(r.tab)} />
      </IftaPanel>
      <IftaPanel title="Filing progress" className="ifta-area-workflow">
        <IftaPhaseStepper phases={filingPhases(quarter, now, 'CLIENT')} showDetails />
      </IftaPanel>
      <IftaPanel title={`Quarter tasks${blocking.length ? ` · ${blocking.length} need you` : ''}`} className="ifta-area-tasks">
        <IftaTaskList tasks={clientTasks(quarter, now)} empty="Nothing needs you right now — keep capturing fuel and miles." />
      </IftaPanel>
      <IftaPanel title="Mileage by jurisdiction" className="ifta-area-bars" aside={<IftaViewAll onClick={() => go('MILEAGE')} />}>
        {shares.length ? <IftaMileageBars shares={shares} /> : <p className="ifta-empty-line">No miles recorded yet.</p>}
      </IftaPanel>
      {mapPanel}
      <IftaPanel title="Fuel purchases" className="ifta-area-donut" aside={<IftaViewAll onClick={() => go('FUEL PURCHASES')} />}>
        {fuel.length ? (
          <div className="ifta-donutwrap">
            <IftaFuelDonut shares={fuel} total={formatNumber(totals.gallons)} />
            <IftaShareLegend shares={fuel.map((s) => ({ ...s, name: s.code === 'OTHER' ? 'Other' : s.code }))} />
          </div>
        ) : (
          <p className="ifta-empty-line">No fuel receipts counted yet.</p>
        )}
      </IftaPanel>
      {vehiclesPanel}
      {uploadsPanel}
      <IftaPanel title="Recent activity" className="ifta-area-activity">
        <IftaActivity events={recentActivity(quarter, 4)} />
      </IftaPanel>
      <div className="ifta-area-insights">
        <IftaInsights lines={[aioDoingLine(quarter, now, 'Jordan Lee'), nextStepLine(quarter, now)]} media={IFTA_MEDIA.filingRoomHero} />
      </div>
    </div>
  );

  const fuelTab = (
    <div className="ifta-grid ifta-grid--split">
      <IftaPanel title="Fuel by state" className="ifta-area-side">
        {fuel.length ? (
          <div className="ifta-donutwrap ifta-donutwrap--stack">
            <IftaFuelDonut shares={fuel} total={formatNumber(totals.gallons)} />
            <IftaShareLegend shares={fuel} />
          </div>
        ) : (
          <p className="ifta-empty-line">No fuel receipts counted yet.</p>
        )}
        <p className="ifta-footnote">
          {totals.count} counted receipt{totals.count === 1 ? '' : 's'} · {formatMoney(totals.amount)}
        </p>
      </IftaPanel>
      <IftaPanel title={`Fuel purchases · ${quarter.receipts.length} records`} className="ifta-area-main">
        <ul className="ifta-rows">
          {quarter.receipts.map((r) => (
            <li key={r.id} className="ifta-row">
              <span className="ifta-row__main">
                <span className="ifta-row__title">{r.vendor ?? (r.receiptClass === 'POSSIBLE_MISSING' ? `No ${jurisdictionName(r.jurisdiction)} receipt` : 'Receipt photo')}</span>
                <span className="ifta-row__meta">
                  {[r.location, r.purchaseDate ? formatShortDate(r.purchaseDate) : null, quarter.vehicles.find((v) => v.id === r.vehicleId)?.unit].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className="ifta-row__state">{r.jurisdiction}</span>
              <span className="ifta-row__num">{r.gallons !== null ? `${formatNumber(r.gallons, 1)} gal` : '—'}</span>
              <IftaChip label={RECEIPT_CLASS_COPY[r.receiptClass].client} tone={RECEIPT_TONE[r.receiptClass]} />
            </li>
          ))}
        </ul>
      </IftaPanel>
    </div>
  );

  const mileageTab = (
    <div className="ifta-grid ifta-grid--split">
      <IftaPanel title="Mileage by jurisdiction" className="ifta-area-main">
        {shares.length ? <IftaMileageBars shares={mileageShares(quarter, 8)} /> : <p className="ifta-empty-line">No miles recorded yet.</p>}
      </IftaPanel>
      <IftaPanel title="Miles by truck" className="ifta-area-side">
        <ul className="ifta-rows">
          {fleet.map((v) => (
            <li key={v.vehicle.id} className="ifta-row">
              <span className="ifta-row__main">
                <span className="ifta-row__title">{v.vehicle.unit}</span>
                <span className="ifta-row__meta">{MILEAGE_QUALITY_COPY[v.quality].client}</span>
              </span>
              <span className="ifta-row__num">{formatNumber(v.miles)} mi</span>
              <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
            </li>
          ))}
        </ul>
      </IftaPanel>
    </div>
  );

  const vehiclesTab = (
    <div className="ifta-grid ifta-grid--single">
      <IftaPanel title={`Vehicles · ${quarter.vehicles.length}`}>
        <ul className="ifta-rows">
          {fleet.map((v) => (
            <li key={v.vehicle.id} className="ifta-row">
              <span className="ifta-vehicles__icon" aria-hidden="true">
                <IftaIcon name="truck" size={20} />
              </span>
              <span className="ifta-row__main">
                <span className="ifta-row__title">
                  {v.vehicle.unit} — {v.vehicle.description}
                </span>
                <span className="ifta-row__meta">
                  {v.vehicle.operated === false ? 'Not operated' : v.vehicle.operated ? 'Operated' : 'Not confirmed'} · {formatNumber(v.miles)} mi · {formatNumber(v.gallons, 0)} gal
                  {v.mpg !== null ? ` · ${v.mpg} mpg` : ''}
                </span>
              </span>
              <IftaChip label={MILEAGE_QUALITY_COPY[v.quality].badge} tone={QUALITY_TONE[v.quality]} />
            </li>
          ))}
        </ul>
      </IftaPanel>
    </div>
  );

  const jurisdictionsTab = (
    <div className="ifta-grid ifta-grid--split">
      <div className="ifta-area-main">{mapPanel}</div>
      <IftaPanel title="Return summary · read-only" className="ifta-area-side">
        {quarter.returnSummary ? (
          <ul className="ifta-rows">
            {quarter.returnSummary.lines.map((l) => {
              const pos = taxPositionLabel(l.netTax);
              return (
                <li key={l.jurisdiction} className="ifta-row">
                  <span className="ifta-row__main">
                    <span className="ifta-row__title">{jurisdictionName(l.jurisdiction)}</span>
                    <span className="ifta-row__meta">
                      {formatNumber(l.miles)} mi · {formatNumber(l.taxPaidGallons, 1)} gal tax-paid
                    </span>
                  </span>
                  <span className="ifta-row__num">
                    {pos.label} {pos.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="ifta-pending">Tax due / credit — pending AIO preparation</p>
        )}
      </IftaPanel>
    </div>
  );

  const documentsTab = (
    <div className="ifta-grid ifta-grid--split">
      <IftaPanel title="Filed packet" className="ifta-area-main">
        {quarter.vault ? (
          <div className="ifta-vault">
            <IftaIcon name="vault" size={28} />
            <div>
              <p className="ifta-vault__path">{quarter.vault.path.join(' / ')}</p>
              <ul className="ifta-vault__contents">
                {quarter.vault.contents.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="ifta-empty-line">No filed packet yet — upload receipts and send the quarter to AIO when ready.</p>
        )}
      </IftaPanel>
      <div className="ifta-area-side">{uploadsPanel}</div>
    </div>
  );

  const body: Record<IftaClientTab, JSX.Element> = {
    PROGRESS: progress,
    'FUEL PURCHASES': fuelTab,
    MILEAGE: mileageTab,
    VEHICLES: vehiclesTab,
    JURISDICTIONS: jurisdictionsTab,
    DOCUMENTS: documentsTab,
  };

  return (
    <>
      <IftaFilingRoomHero
        eyebrow="IFTA filing room"
        title={quarterLabel(quarter)}
        period={`${formatShortDate(quarter.periodStart)} – ${formatShortDate(quarter.periodEnd)}, ${quarter.year}`}
        lines={
          <p>
            Real data. Real progress.
            <br />
            Every mile accounted for.
          </p>
        }
        status={
          <>
            <IftaStatusPill label={stateLabel(state, vars)} tone={pillTone} />
            <span className="ifta-hero__due">
              Due {formatShortDate(quarter.dueDate)} · {days} day{days === 1 ? '' : 's'}
            </span>
          </>
        }
      />
      <div className="ifta-frame ifta-frame--lift">
        <IftaMetricsRail
          cells={[
            { icon: 'miles', value: formatNumber(metrics.miles), label: 'Total miles' },
            { icon: 'fuel', value: formatNumber(metrics.gallons), label: 'Total fuel (gal)' },
            { icon: 'pin', value: String(metrics.jurisdictions), label: 'Jurisdictions' },
            { icon: 'coins', value: metrics.tax.value, label: metrics.tax.label, note: metrics.tax.kind === 'PENDING' ? metrics.tax.note : undefined, pending: metrics.tax.kind === 'PENDING' },
          ]}
        />
      </div>

      <div className="ifta-frame">
        <div className="ifta-tabbar" role="tablist" aria-label="Filing room sections" ref={tabsRef}>
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`ifta-tab${tab === t ? ' ifta-tab--active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div role="tabpanel" aria-label={tab}>
          {body[tab]}
        </div>

        <IftaCtaRail eyebrow="Go to" label={ctaLabel} icon={first ? 'clipboard' : 'doc'} actionLabel={ctaLabel} onClick={() => go(ctaTab)} />
      </div>
    </>
  );
}
