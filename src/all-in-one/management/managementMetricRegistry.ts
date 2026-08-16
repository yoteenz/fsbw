import { aioPaths } from '../utils/paths';
import type { ManagementDateBasis } from './managementTypes';

export interface ManagementMetricDefinition {
  key: string;
  label: string;
  description: string;
  source: string;
  dateBasis: ManagementDateBasis;
  inclusions: string;
  exclusions: string;
  permission: string;
  drillDownHref?: string;
  format: 'money' | 'count' | 'percent';
}

export const MANAGEMENT_METRICS: Record<string, ManagementMetricDefinition> = {
  collected_service_revenue: {
    key: 'collected_service_revenue',
    label: 'Collected Service Revenue',
    description:
      'All In One service revenue associated with payments recorded as collected during the selected period. Government and third-party pass-through fees are excluded.',
    source: 'billing.payments + billing.invoices (allocation)',
    dateBasis: 'payment_date',
    inclusions: 'Succeeded payments allocated to service fee line items',
    exclusions: 'Pass-through fees, tax, refunds, pending payments',
    permission: 'management.financial.read',
    drillDownHref: aioPaths.officeManagementFinancial,
    format: 'money',
  },
  collected_cash: {
    key: 'collected_cash',
    label: 'Collected Cash',
    description: 'Total customer payments recorded as received during the selected period, including pass-through portions.',
    source: 'billing.payments',
    dateBasis: 'payment_date',
    inclusions: 'Succeeded payments',
    exclusions: 'Pending, failed, void payments',
    permission: 'management.financial.read',
    drillDownHref: aioPaths.officeManagementFinancial,
    format: 'money',
  },
  pass_through_collected: {
    key: 'pass_through_collected',
    label: 'Pass-Through Collected',
    description: 'Government and third-party fee portions collected with customer payments — not All In One service revenue.',
    source: 'billing.payments + billing.invoices (allocation)',
    dateBasis: 'payment_date',
    inclusions: 'External fee + tax portions of allocated payments',
    exclusions: 'Service fees',
    permission: 'management.financial.read',
    drillDownHref: aioPaths.officeManagementFinancial,
    format: 'money',
  },
  outstanding_receivables: {
    key: 'outstanding_receivables',
    label: 'Outstanding Receivables',
    description: 'Invoice balances still owed according to canonical invoice/payment state.',
    source: 'billing.invoices',
    dateBasis: 'invoice_date',
    inclusions: 'Issued, partially paid, past due invoices with balance due',
    exclusions: 'Paid, void, draft invoices',
    permission: 'management.financial.read',
    drillDownHref: `${aioPaths.officeManagementFinancial}?section=receivables`,
    format: 'money',
  },
  active_customers: {
    key: 'active_customers',
    label: 'Active Customers',
    description: 'Organizations with at least one non-cancelled service relationship or open canonical record.',
    source: 'clients + service requests',
    dateBasis: 'created_at',
    inclusions: 'Clients with active requests, enrollments, or open billing',
    exclusions: 'Prospects not yet converted',
    permission: 'management.customers.read',
    drillDownHref: aioPaths.officeManagementCustomers,
    format: 'count',
  },
  active_service_requests: {
    key: 'active_service_requests',
    label: 'Active Service Requests',
    description: 'Service requests currently in progress or awaiting action.',
    source: 'service_requests',
    dateBasis: 'created_at',
    inclusions: 'Non-completed, non-cancelled requests',
    exclusions: 'Completed, cancelled',
    permission: 'management.services.read',
    drillDownHref: aioPaths.officeManagementServices,
    format: 'count',
  },
  open_sales_opportunities: {
    key: 'open_sales_opportunities',
    label: 'Open Sales Opportunities',
    description: 'CRM opportunities in open pipeline stages.',
    source: 'crm.opportunities',
    dateBasis: 'created_at',
    inclusions: 'Status open',
    exclusions: 'Won, lost, archived',
    permission: 'management.sales.read',
    drillDownHref: aioPaths.officeManagementSales,
    format: 'count',
  },
  active_loads: {
    key: 'active_loads',
    label: 'Active Loads',
    description: 'Dispatch loads not completed or cancelled.',
    source: 'dispatch.loads',
    dateBasis: 'created_at',
    inclusions: 'Operational statuses except complete, cancelled',
    exclusions: 'Brokerage-only unless on dispatch load list',
    permission: 'management.dispatch.read',
    drillDownHref: aioPaths.officeManagementDispatch,
    format: 'count',
  },
  management_attention: {
    key: 'management_attention',
    label: 'Management Attention',
    description: 'Deterministic items requiring management review derived from canonical conditions.',
    source: 'management.attention_engine',
    dateBasis: 'created_at',
    inclusions: 'ACTION and URGENT severity items',
    exclusions: 'Acknowledged items, INFO-only routine tasks',
    permission: 'management.dashboard.read',
    drillDownHref: `${aioPaths.officeManagement}?section=attention`,
    format: 'count',
  },
  brokerage_gross_margin: {
    key: 'brokerage_gross_margin',
    label: 'Brokerage Gross Margin',
    description: 'Shipper charge minus carrier pay for completed brokerage loads. Not net profit — excludes operating expenses.',
    source: 'brokerage.load_financials',
    dateBasis: 'service_completion',
    inclusions: 'Confirmed shipper charge and carrier pay on completed loads',
    exclusions: 'Pending coverage, unconfirmed rates',
    permission: 'management.brokerage.read',
    drillDownHref: aioPaths.officeManagementBrokerage,
    format: 'money',
  },
  estimated_pipeline_value: {
    key: 'estimated_pipeline_value',
    label: 'Estimated Pipeline Value',
    description: 'Sum of estimated values on open CRM opportunities. Estimate only — not future revenue.',
    source: 'crm.opportunities',
    dateBasis: 'created_at',
    inclusions: 'Open opportunities with estimatedValueMinor',
    exclusions: 'Won/lost, quotes not yet linked',
    permission: 'management.sales.read',
    drillDownHref: aioPaths.officeManagementSales,
    format: 'money',
  },
};

export function getMetricDefinition(key: string): ManagementMetricDefinition | undefined {
  return MANAGEMENT_METRICS[key];
}
