import { Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { getFinancialSummary, getReceivablesAging } from '../../management/managementFinancial';
import {
  getExecutiveSnapshot,
  getSalesFunnel,
  getBrokerageEconomics,
  getDispatchSummary,
  getFactoringSummary,
  getInsuranceSummary,
  getCommunicationHealth,
  getServiceVolume,
  getWorkflowPerformance,
  getTeamWorkload,
  getDeadlineWindows,
  getCustomerSummary,
  getBusinessHealthAreas,
  getEstimatedPipelineValue,
  getReceivableDetail,
  conversionRate,
  compareFinancialMetric,
  getCrmMetricsForManagement,
  getBrokerageMetricsForManagement,
} from '../../management/managementQueryLayer';
import { getManagementAttentionItems } from '../../management/managementAttentionEngine';
import { detectDataQualityIssues } from '../../management/managementDataQuality';
import { acknowledgeManagementAttention, getManagementPreferences, saveReportConfig } from '../../management/managementActions';
import { reportsByCategory } from '../../management/managementReports';
import { exportToCsv } from '../../management/managementExport';
import {
  ManagementGate,
  ManagementHero,
  ManagementPeriodFilter,
  MetricCard,
  AttentionCard,
  SectionNav,
  WaterfallChart,
  HealthGrid,
  useManagementPeriod,
  FunnelBar,
} from '../../management/ManagementComponents';
import { hasManagementPermission } from '../../management/managementPermissions';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import type { ReceivablesBucket } from '../../management/managementTypes';

const SECTION_LINKS = [
  { label: 'Overview', to: aioPaths.officeManagement },
  { label: 'Financial', to: aioPaths.officeManagementFinancial },
  { label: 'Sales', to: aioPaths.officeManagementSales },
  { label: 'Services', to: aioPaths.officeManagementServices },
  { label: 'Customers', to: aioPaths.officeManagementCustomers },
  { label: 'Dispatch', to: aioPaths.officeManagementDispatch },
  { label: 'Brokerage', to: aioPaths.officeManagementBrokerage },
  { label: 'Factoring', to: aioPaths.officeManagementFactoring },
  { label: 'Insurance', to: aioPaths.officeManagementInsurance },
  { label: 'Communications', to: aioPaths.officeManagementCommunications },
  { label: 'Team', to: aioPaths.officeManagementTeam },
  { label: 'Deadlines', to: aioPaths.officeManagementDeadlines },
  { label: 'Data Quality', to: aioPaths.officeManagementDataQuality },
  { label: 'Launch Control', to: aioPaths.officeManagementLaunch },
  { label: 'Service Activation', to: aioPaths.officeManagementLaunchServices },
  { label: 'Reports', to: aioPaths.officeReports },
];

export function ManagementCommandCenterPage() {
  const store = useDemoStore();
  const { periodId, setPeriodId, comparePrevious, setComparePrevious, range } = useManagementPeriod();
  const snapshot = useMemo(() => getExecutiveSnapshot(store, range), [store, range]);
  const financial = useMemo(() => getFinancialSummary(store, range), [store, range]);
  const attention = useMemo(() => getManagementAttentionItems(store), [store]);
  const health = useMemo(() => getBusinessHealthAreas(store, range), [store, range]);
  const crm = useMemo(() => getCrmMetricsForManagement(store), [store]);
  const comm = useMemo(() => getCommunicationHealth(store), [store]);
  const deadlines = useMemo(() => getDeadlineWindows(store), [store]);
  const serviceRevCompare = useMemo(
    () => compareFinancialMetric(store, range, 'serviceFeesCollectedMinor'),
    [store, range],
  );

  return (
    <ManagementGate permission="management.dashboard.read">
      <div className="aio-office-page aio-mgmt-page">
        <ManagementHero />
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter
          periodId={periodId}
          onChange={setPeriodId}
          comparePrevious={comparePrevious}
          onCompareChange={setComparePrevious}
        />

        <section className="aio-mgmt-block">
          <h2 className="aio-office-subheading">Executive Snapshot</h2>
          <div className="aio-metrics-grid aio-metrics-grid--compact">
            <ManagementGate permission="management.financial.read">
              <MetricCard
                metricKey="collected_service_revenue"
                label="Collected Service Revenue"
                value={formatMoney(snapshot.collectedServiceRevenueMinor)}
                href={aioPaths.officeManagementFinancial}
                comparison={serviceRevCompare.label}
                incomplete={snapshot.hasIncompleteFinancialData}
              />
              <MetricCard
                metricKey="outstanding_receivables"
                label="Outstanding Receivables"
                value={formatMoney(snapshot.outstandingReceivablesMinor)}
                href={`${aioPaths.officeManagementFinancial}?section=receivables`}
              />
            </ManagementGate>
            <MetricCard metricKey="active_customers" label="Active Customers" value={String(snapshot.activeCustomers)} href={aioPaths.officeManagementCustomers} />
            <MetricCard metricKey="active_service_requests" label="Active Service Requests" value={String(snapshot.activeServiceRequests)} href={aioPaths.officeManagementServices} />
            <MetricCard metricKey="open_sales_opportunities" label="Open Sales Opportunities" value={String(snapshot.openSalesOpportunities)} href={aioPaths.officeManagementSales} />
            <MetricCard metricKey="active_loads" label="Active Loads" value={String(snapshot.activeLoads)} href={aioPaths.officeManagementDispatch} />
            <MetricCard metricKey="management_attention" label="Management Attention" value={String(snapshot.managementAttentionCount)} href={`${aioPaths.officeManagement}#attention`} />
          </div>
        </section>

        <section className="aio-mgmt-block aio-mgmt-grid-2">
          <div>
            <h2 className="aio-office-subheading">Today at All In One</h2>
            <ul className="aio-mgmt-today-list">
              <li><Link to={aioPaths.officeAppointments}>Appointments today: {comm.appointmentsToday}</Link></li>
              <li><Link to={aioPaths.officeManagementDeadlines}>Deadlines overdue: {deadlines.overdue}</Link></li>
              <li><Link to={aioPaths.officeManagementFinancial}>Service fees collected ({range.label}): {formatMoney(financial.serviceFeesCollectedMinor)}</Link></li>
              <li><Link to={aioPaths.officeCrmLeads}>New leads ({range.label}): {crm.newLeads}</Link></li>
              <li><Link to={aioPaths.officeManagementServices}>Active services: {snapshot.activeServiceRequests}</Link></li>
              <li><Link to={aioPaths.officeManagementDispatch}>Loads in transit: {getDispatchSummary(store, range).inTransit}</Link></li>
              <li><Link to={aioPaths.officeManagementCommunications}>Customers waiting on staff: {comm.needsReply}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="aio-office-subheading">Business Health</h2>
            <HealthGrid areas={health} />
          </div>
        </section>

        <section id="attention" className="aio-mgmt-block">
          <h2 className="aio-office-subheading">Management Attention</h2>
          {attention.length === 0 ? (
            <p className="aio-empty-state__text">No items need management attention right now.</p>
          ) : (
            attention.slice(0, 8).map((item) => (
              <AttentionCard
                key={item.id}
                {...item}
                onAcknowledge={() => acknowledgeManagementAttention(item.dedupeKey)}
              />
            ))
          )}
        </section>

        <section className="aio-mgmt-block">
          <h2 className="aio-office-subheading">Money · {range.label}</h2>
          <ManagementGate permission="management.financial.read">
            <div className="aio-metrics-grid aio-metrics-grid--compact">
              <MetricCard label="Collected Cash" value={formatMoney(financial.collectedCashMinor)} metricKey="collected_cash" />
              <MetricCard label="Pass-Through Collected" value={formatMoney(financial.passThroughCollectedMinor)} metricKey="pass_through_collected" />
            </div>
            <p className="aio-prototype-note">Service revenue is separated from pass-through. Not GAAP accounting.</p>
          </ManagementGate>
        </section>
      </div>
    </ManagementGate>
  );
}

export function ManagementFinancialPage() {
  const store = useDemoStore();
  const [params] = useSearchParams();
  const bucket = params.get('bucket') as ReceivablesBucket | null;
  const { periodId, setPeriodId, range } = useManagementPeriod();
  const financial = useMemo(() => getFinancialSummary(store, range), [store, range]);
  const aging = useMemo(() => getReceivablesAging(store), [store]);
  const receivables = useMemo(() => getReceivableDetail(store, bucket ?? undefined), [store, bucket]);

  const exportAging = () => {
    const rows = getReceivableDetail(store);
    exportToCsv(
      'receivables-aging.csv',
      ['Invoice', 'Customer', 'Outstanding', 'Service', 'Pass-Through', 'Due', 'Days', 'Status'],
      rows.map((r) => [
        r.invoiceNumber,
        r.customer,
        (r.outstandingMinor / 100).toFixed(2),
        (r.serviceMinor / 100).toFixed(2),
        (r.passThroughMinor / 100).toFixed(2),
        r.dueAt ?? '',
        r.daysOutstanding,
        r.status,
      ]),
    );
  };

  return (
    <ManagementGate permission="management.financial.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Financial Command Center</h1>
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter periodId={periodId} onChange={setPeriodId} dateBasisLabel="Payment date (collections) · Invoice date (invoiced)" />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard metricKey="collected_service_revenue" label="Service Fees Collected" value={formatMoney(financial.serviceFeesCollectedMinor)} incomplete={financial.hasIncompleteAllocation} />
          <MetricCard label="Service Fees Invoiced" value={formatMoney(financial.serviceFeesInvoicedMinor)} />
          <MetricCard metricKey="pass_through_collected" label="Pass-Through Collected" value={formatMoney(financial.passThroughCollectedMinor)} />
          <MetricCard label="Collected Cash" value={formatMoney(financial.collectedCashMinor)} metricKey="collected_cash" />
          <MetricCard label="Outstanding Service Receivables" value={formatMoney(financial.outstandingServiceReceivablesMinor)} />
          <MetricCard label="Total Outstanding" value={formatMoney(financial.totalOutstandingMinor)} />
          <MetricCard label="Refunds" value={formatMoney(financial.refundsMinor)} />
          <MetricCard label="Discounts" value={formatMoney(financial.discountsMinor)} />
        </div>

        <section className="aio-mgmt-block">
          <h2>Financial Waterfall</h2>
          <WaterfallChart
            grossMinor={financial.waterfall.grossCustomerPaymentsMinor}
            passThroughMinor={financial.waterfall.passThroughMinor}
            refundsMinor={financial.waterfall.refundsMinor}
            serviceMinor={financial.waterfall.serviceFeesCollectedMinor}
          />
        </section>

        <section className="aio-mgmt-block">
          <div className="aio-inline-actions">
            <h2>Receivables Aging</h2>
            <button type="button" className="aio-btn aio-btn--sm aio-btn--outline" onClick={exportAging}>Export CSV</button>
          </div>
          <div className="aio-metrics-grid aio-metrics-grid--compact">
            {aging.map((row) => (
              <Link
                key={row.bucket}
                to={`${aioPaths.officeManagementFinancial}?section=receivables&bucket=${row.bucket}`}
                className={`aio-metric-card aio-metric-card--link ${bucket === row.bucket ? 'aio-metric-card--active' : ''}`}
              >
                <span className="aio-metric-card__value">{formatMoney(row.balanceMinor)}</span>
                <span className="aio-metric-card__label">{row.label} ({row.count})</span>
              </Link>
            ))}
          </div>
          {receivables.length > 0 && (
            <div className="aio-office-table-wrap">
              <table className="aio-office-table">
                <thead>
                  <tr><th>Invoice</th><th>Customer</th><th>Outstanding</th><th>Service</th><th>Pass-Through</th><th>Due</th><th>Days</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {receivables.map((r) => (
                    <tr key={r.id}>
                      <td><Link to={r.href}>{r.invoiceNumber}</Link></td>
                      <td>{r.customer}</td>
                      <td>{formatMoney(r.outstandingMinor)}</td>
                      <td>{formatMoney(r.serviceMinor)}</td>
                      <td>{formatMoney(r.passThroughMinor)}</td>
                      <td>{r.dueAt ?? '—'}</td>
                      <td>{r.daysOutstanding}</td>
                      <td>{r.status.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="aio-prototype-note">No net profit, EBITDA, or GAAP recognition. Expense categories prepared for future accounting integration.</p>
      </div>
    </ManagementGate>
  );
}

export function ManagementSalesPage() {
  const store = useDemoStore();
  const { periodId, setPeriodId, range } = useManagementPeriod();
  const funnel = useMemo(() => getSalesFunnel(store, range), [store, range]);
  const pipeline = useMemo(() => getEstimatedPipelineValue(store), [store]);
  const crm = useMemo(() => getCrmMetricsForManagement(store), [store]);

  const leadConversion = conversionRate(funnel.converted, funnel.leads);
  const quoteAccept = conversionRate(funnel.accepted, funnel.quotesSent);

  return (
    <ManagementGate permission="management.sales.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Sales Command Center</h1>
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter periodId={periodId} onChange={setPeriodId} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Estimated Pipeline Value" value={formatMoney(pipeline)} metricKey="estimated_pipeline_value" />
          <MetricCard label="Quotes Out" value={String(crm.quotesOut)} href={aioPaths.officeCrmPipeline} />
          <MetricCard label="Decision Pending" value={String(crm.decisionPending)} href={aioPaths.officeCrmPipeline} />
          <MetricCard label="Overdue Follow-Ups" value={String(crm.overdueFollowUp)} href={aioPaths.officeCrmCalendar} />
        </div>

        <section className="aio-mgmt-block">
          <h2>Sales Funnel · {range.label}</h2>
          <FunnelBar
            stages={[
              { label: 'Leads', count: funnel.leads },
              { label: 'Contacted', count: funnel.contacted },
              { label: 'Qualified', count: funnel.qualified },
              { label: 'Opportunities', count: funnel.opportunities },
              { label: 'Quotes Sent', count: funnel.quotesSent },
              { label: 'Accepted', count: funnel.accepted },
              { label: 'Converted', count: funnel.converted },
            ]}
          />
          <p className="aio-muted">
            Lead → Customer: {leadConversion !== null ? `${leadConversion.toFixed(1)}%` : 'No prior data'} ·
            Quote acceptance: {quoteAccept !== null ? `${quoteAccept.toFixed(1)}%` : '—'} (quotes sent denominator)
          </p>
        </section>

        <section className="aio-mgmt-block">
          <h2>CRM Follow-Up Health</h2>
          <ul className="aio-mgmt-today-list">
            <li>Due today: {crm.followUpToday}</li>
            <li>Overdue: {crm.overdueFollowUp}</li>
            <li>Lost ({range.label}): {funnel.lost}</li>
          </ul>
        </section>
      </div>
    </ManagementGate>
  );
}

export function ManagementServicesPage() {
  const store = useDemoStore();
  const { periodId, setPeriodId, range } = useManagementPeriod();
  const volume = useMemo(() => getServiceVolume(store, range), [store, range]);
  const wf = useMemo(() => getWorkflowPerformance(store), [store]);

  const byDivision = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of store.requests) {
      if (['completed', 'cancelled'].includes(r.status)) continue;
      map.set(r.division, (map.get(r.division) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [store.requests]);

  return (
    <ManagementGate permission="management.services.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Services Command Center</h1>
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter periodId={periodId} onChange={setPeriodId} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="New Requests" value={String(volume.newRequests)} />
          <MetricCard label="Active" value={String(volume.active)} href={aioPaths.officeServices} />
          <MetricCard label="Waiting Customer" value={String(volume.waitingCustomer)} />
          <MetricCard label="Waiting External" value={String(volume.waitingExternal)} />
          <MetricCard label="Completed" value={String(volume.completed)} />
        </div>

        <section className="aio-mgmt-block">
          <h2>By Service Category</h2>
          <ul className="aio-mgmt-today-list">
            {byDivision.map(([div, count]) => (
              <li key={div}>{div.replace(/-/g, ' ')}: {count}</li>
            ))}
          </ul>
        </section>

        <section className="aio-mgmt-block">
          <h2>Workflow Performance</h2>
          <div className="aio-metrics-grid aio-metrics-grid--compact">
            <MetricCard label="Active Workflows" value={String(wf.active)} href={aioPaths.officeWorkflows} />
            <MetricCard label="Waiting Customer" value={String(wf.waitingCustomer)} />
            <MetricCard label="Waiting Staff" value={String(wf.waitingStaff)} />
            <MetricCard label="Stalled / Blocked" value={String(wf.stalled)} href={aioPaths.officeWorkflowHealth} />
            <MetricCard label="Failed Automation" value={String(wf.failedAutomation)} href={aioPaths.officeAutomationExceptions} />
          </div>
        </section>

        <section className="aio-mgmt-block">
          <h2>Road Ready</h2>
          <Link to={aioPaths.officeRoadReady} className="aio-btn aio-btn--outline aio-btn--sm">Open Road Ready Queue →</Link>
        </section>
      </div>
    </ManagementGate>
  );
}

export function ManagementCustomersPage() {
  const store = useDemoStore();
  const { periodId, setPeriodId, range } = useManagementPeriod();
  const summary = useMemo(() => getCustomerSummary(store, range), [store, range]);

  return (
    <ManagementGate permission="management.customers.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Customer Command Center</h1>
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter periodId={periodId} onChange={setPeriodId} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Total Customers" value={String(summary.total)} href={aioPaths.officeClients} />
          <MetricCard label="New Customers" value={String(summary.newCustomers)} />
          <MetricCard label="Waiting on All In One" value={String(summary.waitingOnUs)} />
          <MetricCard label="Waiting on Customer" value={String(summary.waitingOnCustomer)} />
          <MetricCard label="Overdue Balances" value={String(summary.withOverdueBalances)} href={aioPaths.officeManagementFinancial} />
          <MetricCard label="Upcoming Renewals" value={String(summary.renewalsUpcoming)} href={aioPaths.officeRenewals} />
        </div>
        <p className="aio-prototype-note">Customer value uses collected service fees only — pass-through excluded. Not LTV forecast.</p>
      </div>
    </ManagementGate>
  );
}

export function ManagementDispatchPage() {
  const store = useDemoStore();
  const { periodId, setPeriodId, range } = useManagementPeriod();
  const dispatch = useMemo(() => getDispatchSummary(store, range), [store, range]);

  return (
    <ManagementGate permission="management.dispatch.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Dispatch Command Center</h1>
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter periodId={periodId} onChange={setPeriodId} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Active Loads" value={String(dispatch.activeLoads)} href={aioPaths.officeDispatchLoads} />
          <MetricCard label="Available Trucks" value={String(dispatch.availableTrucks)} />
          <MetricCard label="In Transit" value={String(dispatch.inTransit)} />
          <MetricCard label="Missing PODs" value={String(dispatch.missingPods)} />
          <MetricCard label="Carrier Gross Revenue" value={formatMoney(dispatch.carrierGrossRevenueMinor)} />
          <MetricCard label="All In One Dispatch Fees" value={formatMoney(dispatch.dispatchServiceFeesMinor)} />
        </div>
        <p className="aio-prototype-note">Carrier gross load revenue is not company service revenue.</p>
      </div>
    </ManagementGate>
  );
}

export function ManagementBrokeragePage() {
  const store = useDemoStore();
  const { periodId, setPeriodId, range } = useManagementPeriod();
  const econ = useMemo(() => getBrokerageEconomics(store, range), [store, range]);
  const ops = useMemo(() => getBrokerageMetricsForManagement(store), [store]);

  return (
    <ManagementGate permission="management.brokerage.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Brokerage Command Center</h1>
        <SectionNav items={SECTION_LINKS} />
        <ManagementPeriodFilter periodId={periodId} onChange={setPeriodId} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Shipper Revenue" value={formatMoney(econ.shipperRevenueMinor)} />
          <MetricCard label="Carrier Pay" value={formatMoney(econ.carrierPayMinor)} />
          <MetricCard label="Gross Margin" value={formatMoney(econ.grossMarginMinor)} metricKey="brokerage_gross_margin" />
          <MetricCard label="Gross Margin %" value={econ.grossMarginPercent !== null ? `${econ.grossMarginPercent.toFixed(2)}%` : '—'} />
          <MetricCard label="Needs Coverage" value={String(ops.needsCoverage)} href={aioPaths.officeBrokerageCoverage} />
          <MetricCard label="Open Issues" value={String(ops.issues)} />
        </div>
        <p className="aio-prototype-note">Gross margin is not net profit. Shipper revenue is not All In One service revenue.</p>
      </div>
    </ManagementGate>
  );
}

export function ManagementFactoringPage() {
  const store = useDemoStore();
  const factoring = useMemo(() => getFactoringSummary(store), [store]);

  return (
    <ManagementGate permission="management.factoring.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Factoring Command Center</h1>
        <SectionNav items={SECTION_LINKS} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Invoice Face Value Assisted" value={formatMoney(factoring.faceValueMinor)} />
          <MetricCard label="Provider Funded" value={formatMoney(factoring.fundedMinor)} />
          <MetricCard label="Pending" value={formatMoney(factoring.pendingMinor)} />
          <MetricCard label="All In One Service Fees" value={formatMoney(factoring.aioFeesMinor)} />
          <MetricCard label="Submitted" value={String(factoring.submitted)} href={aioPaths.officeFactoringSubmissions} />
          <MetricCard label="Provider Review" value={String(factoring.providerReview)} />
        </div>
        <p className="aio-prototype-note">Invoice face value is not All In One revenue. All In One is not automatically the factor.</p>
      </div>
    </ManagementGate>
  );
}

export function ManagementInsurancePage() {
  const store = useDemoStore();
  const ins = useMemo(() => getInsuranceSummary(store), [store]);

  return (
    <ManagementGate permission="management.insurance.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Insurance Command Center</h1>
        <SectionNav items={SECTION_LINKS} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Open Requests" value={String(ins.openRequests)} href={aioPaths.officeInsuranceRequests} />
          <MetricCard label="Information Gathering" value={String(ins.incompleteRequests)} />
          <MetricCard label="Partner Review" value={String(ins.partnerReview)} />
          <MetricCard label="Quotes Received" value={String(ins.quotesReported)} />
          <MetricCard label="Policies Expiring" value={String(ins.policiesExpiring)} href={aioPaths.officeInsuranceRenewals} />
        </div>
        <p className="aio-prototype-note">Insurance premium is not All In One service revenue. All In One is not the insurer.</p>
      </div>
    </ManagementGate>
  );
}

export function ManagementCommunicationsPage() {
  const store = useDemoStore();
  const comm = useMemo(() => getCommunicationHealth(store), [store]);

  return (
    <ManagementGate permission="management.communications.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Communications Command Center</h1>
        <SectionNav items={SECTION_LINKS} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Needs Reply" value={String(comm.needsReply)} href={aioPaths.officeCommunications} />
          <MetricCard label="Waiting on Customer" value={String(comm.waitingOnCustomer)} />
          <MetricCard label="Unassigned" value={String(comm.unassigned)} />
          <MetricCard label="High Priority" value={String(comm.highPriority)} />
          <MetricCard label="Appointments Today" value={String(comm.appointmentsToday)} href={aioPaths.officeAppointments} />
          <MetricCard label="Failed Deliveries" value={String(comm.failedDeliveries)} href={aioPaths.officeCommunicationsOutbox} />
        </div>
      </div>
    </ManagementGate>
  );
}

export function ManagementTeamPage() {
  const store = useDemoStore();
  const team = useMemo(() => getTeamWorkload(store), [store]);

  return (
    <ManagementGate permission="management.team.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Team / Workload Command Center</h1>
        <SectionNav items={SECTION_LINKS} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Open Work Items" value={String(team.openWorkItems)} href={aioPaths.officeWork} />
          <MetricCard label="Due Today" value={String(team.dueToday)} />
          <MetricCard label="Overdue" value={String(team.overdue)} />
          <MetricCard label="Unassigned" value={String(team.unassigned)} href={aioPaths.officeQueues} />
          <MetricCard label="Approvals Waiting" value={String(team.approvalsWaiting)} href={aioPaths.officeApprovals} />
          <MetricCard label="Handoffs Waiting" value={String(team.handoffsWaiting)} />
        </div>

        <section className="aio-mgmt-block">
          <h2>Workload by Team</h2>
          <ul className="aio-mgmt-today-list">
            {team.byTeam.map((t) => (
              <li key={t.teamId}>{t.teamName}: {t.count} open items</li>
            ))}
          </ul>
          <p className="aio-prototype-note">Workload visibility only — no employee performance scores or rankings.</p>
        </section>
      </div>
    </ManagementGate>
  );
}

export function ManagementDeadlinesPage() {
  const store = useDemoStore();
  const windows = useMemo(() => getDeadlineWindows(store), [store]);

  return (
    <ManagementGate permission="management.deadlines.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Deadlines Command Center</h1>
        <SectionNav items={SECTION_LINKS} />

        <div className="aio-metrics-grid aio-metrics-grid--compact">
          <MetricCard label="Overdue" value={String(windows.overdue)} href={aioPaths.officeDeadlines} />
          <MetricCard label="Next 7 Days" value={String(windows.next7)} />
          <MetricCard label="Next 30 Days" value={String(windows.next30)} />
          <MetricCard label="Next 60 Days" value={String(windows.next60)} />
          <MetricCard label="Next 90 Days" value={String(windows.next90)} />
          <MetricCard label="Later" value={String(windows.later)} />
        </div>
        <Link to={aioPaths.officeDeadlines} className="aio-btn aio-btn--outline aio-btn--sm">Open Compliance Calendar →</Link>
      </div>
    </ManagementGate>
  );
}

export function ManagementDataQualityPage() {
  const store = useDemoStore();
  const issues = useMemo(() => detectDataQualityIssues(store), [store]);

  return (
    <ManagementGate permission="management.data_quality.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Data Quality Command Center</h1>
        <SectionNav items={SECTION_LINKS} />

        {issues.length === 0 ? (
          <p className="aio-empty-state__text">No data quality exceptions detected.</p>
        ) : (
          issues.map((issue) => (
            <article key={`${issue.ruleId}-${issue.entityId}`} className={`aio-mgmt-attention aio-mgmt-attention--${issue.severity}`}>
              <strong>{issue.name}</strong>
              <p>{issue.description}</p>
              <p className="aio-muted">{issue.resolutionGuidance}</p>
              {issue.ctaHref && <Link to={issue.ctaHref} className="aio-btn aio-btn--sm aio-btn--gold">Open record</Link>}
            </article>
          ))
        )}
      </div>
    </ManagementGate>
  );
}

export function ManagementReportsCenterPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const grouped = reportsByCategory();
  const prefs = getManagementPreferences(store);
  const [saveName, setSaveName] = useState('');

  return (
    <ManagementGate permission="reports.read">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Reporting Center</h1>
        <p className="aio-muted">Standard reports consume canonical operational data. Scheduled delivery foundation only.</p>

        {Object.entries(grouped).map(([category, reports]) => (
          <section key={category} className="aio-mgmt-block">
            <h2>{category}</h2>
            <div className="aio-mgmt-report-list">
              {reports.map((r) => {
                if (!hasManagementPermission(ctx, r.permission as Parameters<typeof hasManagementPermission>[1])) return null;
                return (
                  <Link key={r.id} to={r.href} className="aio-office-list-row">
                    <span><strong>{r.name}</strong><br /><small className="aio-muted">{r.description}</small></span>
                    {prefs.pinnedReportIds.includes(r.id) && <span className="aio-badge">Pinned</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section className="aio-mgmt-block">
          <h2>Save Report Configuration</h2>
          <p className="aio-muted">Saves filter preset — does not duplicate underlying data.</p>
          <div className="aio-inline-actions">
            <input className="aio-input" placeholder="Report name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
            <button
              type="button"
              className="aio-btn aio-btn--sm aio-btn--gold"
              disabled={!saveName.trim() || !hasManagementPermission(ctx, 'reports.save')}
              onClick={() => {
                saveReportConfig(saveName.trim(), 'executive_summary', 'month');
                setSaveName('');
              }}
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </ManagementGate>
  );
}

export function ManagementSettingsPage() {
  const store = useDemoStore();
  const prefs = getManagementPreferences(store);

  return (
    <ManagementGate permission="management.settings">
      <div className="aio-office-page aio-mgmt-page">
        <Link to={aioPaths.officeManagement} className="aio-office-link">← Management</Link>
        <h1>Management Settings</h1>
        <dl className="aio-office-dl">
          <dt>Default period</dt><dd>{prefs.defaultPeriodId}</dd>
          <dt>Financial date basis</dt><dd>{prefs.financialDateBasis.replace(/_/g, ' ')}</dd>
          <dt>Pinned reports</dt><dd>{prefs.pinnedReportIds.join(', ') || 'None'}</dd>
        </dl>
        <p className="aio-prototype-note">Canonical financial formulas cannot be changed here. Targets and scheduled reports are future foundations.</p>
      </div>
    </ManagementGate>
  );
}
