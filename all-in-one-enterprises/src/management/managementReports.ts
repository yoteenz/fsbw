import { aioPaths } from '../utils/paths';
import type { ReportDefinition } from './managementTypes';

export const STANDARD_REPORTS: ReportDefinition[] = [
  { id: 'executive_summary', name: 'Executive Summary', category: 'Executive', description: 'Business snapshot across money, sales, operations, and risk.', href: aioPaths.officeReports, permission: 'reports.read' },
  { id: 'service_revenue', name: 'Service Revenue', category: 'Financial', description: 'Service fees invoiced and collected with pass-through separation.', href: `${aioPaths.officeManagementFinancial}?report=service_revenue`, permission: 'management.financial.read' },
  { id: 'collections', name: 'Collections', category: 'Financial', description: 'Collection trends by period with allocation breakdown.', href: `${aioPaths.officeManagementFinancial}?report=collections`, permission: 'management.financial.read' },
  { id: 'receivables_aging', name: 'Receivables Aging', category: 'Financial', description: 'Outstanding balances by aging bucket.', href: `${aioPaths.officeManagementFinancial}?section=receivables`, permission: 'management.financial.read' },
  { id: 'pass_through_fees', name: 'Pass-Through Fees', category: 'Financial', description: 'Government and third-party fees collected.', href: `${aioPaths.officeManagementFinancial}?report=pass_through`, permission: 'management.financial.read' },
  { id: 'service_performance', name: 'Service Performance', category: 'Services', description: 'Volume and cycle metrics by service category.', href: aioPaths.officeManagementServices, permission: 'management.services.read' },
  { id: 'sales_funnel', name: 'Sales Funnel', category: 'Sales', description: 'Lead-to-customer funnel counts.', href: `${aioPaths.officeManagementSales}?report=funnel`, permission: 'management.sales.read' },
  { id: 'lead_source', name: 'Lead Source Performance', category: 'Sales', description: 'Leads and conversions by source.', href: `${aioPaths.officeManagementSales}?report=sources`, permission: 'management.sales.read' },
  { id: 'quote_conversion', name: 'Quote Conversion', category: 'Sales', description: 'Quote sent vs accepted metrics.', href: `${aioPaths.officeManagementSales}?report=quotes`, permission: 'management.sales.read' },
  { id: 'customer_growth', name: 'Customer Growth', category: 'Customers', description: 'New and active customer counts.', href: aioPaths.officeManagementCustomers, permission: 'management.customers.read' },
  { id: 'workflow_backlog', name: 'Workflow Backlog', category: 'Services', description: 'Active workflows by waiting state.', href: `${aioPaths.officeManagementServices}?section=workflows`, permission: 'management.services.read' },
  { id: 'upcoming_deadlines', name: 'Upcoming Deadlines', category: 'Compliance', description: 'Deadlines by time window.', href: aioPaths.officeManagementDeadlines, permission: 'management.deadlines.read' },
  { id: 'dispatch_activity', name: 'Dispatch Activity', category: 'Dispatch', description: 'Loads, carrier revenue, and dispatch fees.', href: aioPaths.officeManagementDispatch, permission: 'management.dispatch.read' },
  { id: 'brokerage_margin', name: 'Brokerage Margin', category: 'Brokerage', description: 'Shipper revenue, carrier pay, gross margin.', href: aioPaths.officeManagementBrokerage, permission: 'management.brokerage.read' },
  { id: 'factoring_activity', name: 'Factoring Assistance Activity', category: 'Factoring', description: 'Submissions and invoice face value assisted.', href: aioPaths.officeManagementFactoring, permission: 'management.factoring.read' },
  { id: 'insurance_activity', name: 'Insurance Assistance Activity', category: 'Insurance', description: 'Assistance request pipeline.', href: aioPaths.officeManagementInsurance, permission: 'management.insurance.read' },
  { id: 'communication_response', name: 'Communication Response', category: 'Communications', description: 'Inbox metrics and response backlog.', href: aioPaths.officeManagementCommunications, permission: 'management.communications.read' },
  { id: 'appointments', name: 'Appointments', category: 'Communications', description: 'Appointment status breakdown.', href: `${aioPaths.officeManagementCommunications}?section=appointments`, permission: 'management.communications.read' },
  { id: 'team_workload', name: 'Team Workload', category: 'Team', description: 'Open work by team and queue.', href: aioPaths.officeManagementTeam, permission: 'management.team.read' },
  { id: 'data_quality_exceptions', name: 'Data Quality Exceptions', category: 'Data Quality', description: 'Deterministic data integrity issues.', href: aioPaths.officeManagementDataQuality, permission: 'management.data_quality.read' },
];

export function reportsByCategory(): Record<string, ReportDefinition[]> {
  const map: Record<string, ReportDefinition[]> = {};
  for (const r of STANDARD_REPORTS) {
    (map[r.category] ??= []).push(r);
  }
  return map;
}
