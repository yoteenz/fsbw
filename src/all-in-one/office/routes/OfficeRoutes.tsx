import { Route, Routes } from 'react-router-dom';
import { AIOOfficeLayout } from '../layouts/AIOOfficeLayout';
import { OfficeDashboardPage } from '../pages/OfficeDashboardPage';
import { ClientsListPage } from '../pages/ClientsListPage';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { RequestsListPage } from '../pages/RequestsListPage';
import { OfficeRequestDetailPage } from '../pages/OfficeRequestDetailPage';
import { TasksPage, DeadlinesPage, DocumentsPage, MessagesPage } from '../pages/OperationsPages';
import {
  DivisionQueuePage,
  InvoicesPage,
  PaymentsPage,
  TeamPage,
  ReportsPage,
} from '../pages/DivisionOpsPages';
import {
  BrokerageCommandCenterPage,
  BrokerageReadinessPage,
  BrokerageShippersPage,
  BrokerageShipperDetailPage,
  BrokerageCoveragePage,
  BrokerageCarriersPage,
  BrokerageCarrierDetailPage,
  BrokerageLoadDetailPage,
  BrokerageFinancePage,
  BrokerageLoadsListPage,
} from '../pages/BrokeragePages';
import {
  FactoringCommandCenterPage,
  FactoringSubmissionsListPage,
  OfficeFactoringSubmissionDetailPage,
  FactoringClientsListPage,
  FactoringClientDetailPage,
  FactoringProvidersPage,
} from '../pages/FactoringPages';
import {
  DispatchCommandCenterPage,
  DispatchLoadsListPage,
  DispatchClientsListPage,
  DispatchBrokersPage,
} from '../pages/DispatchPages';
import { DispatchLoadNewPage } from '../pages/DispatchLoadNewPage';
import { OfficeDispatchLoadDetailPage, DispatchClientDetailPage } from '../pages/DispatchLoadDetailPage';
import {
  OfficeBillingDashboardPage,
  OfficeQuotesPage,
  OfficeQuoteDetailPage,
  OfficeInvoiceDetailPage,
  OfficePricingSettingsPage,
} from '../pages/BillingPages';
import { OfficeRoadReadyQueuePage } from '../pages/OfficeRoadReadyQueuePage';
import { ClientRoadReadyReviewPage } from '../pages/ClientRoadReadyReviewPage';
import { OfficeRenewalsPage } from '../pages/OfficeRenewalsPage';
import {
  OfficeMyWorkPage,
  OfficeQueuesPage,
  OfficeApprovalsPage,
  OfficeEscalationsPage,
  OfficeServicesPage,
  OfficeDocumentReviewPage,
  OfficeInboxPage,
  OfficeWorkloadPage,
  OfficeActivityPage,
  OfficeAuditPage,
} from '../pages/OfficeWorkPages';
import {
  InsuranceCommandCenterPage,
  InsuranceRequestsListPage,
  InsuranceRequestDetailOfficePage,
  InsurancePoliciesListPage,
  InsurancePartnersPage,
  InsuranceCertificatesOfficePage,
  InsuranceRenewalsOfficePage,
  InsuranceReadinessPage,
} from '../pages/InsurancePages';
import {
  OfficeWorkflowsListPage,
  OfficeWorkflowDetailPage,
  OfficeWorkflowSettingsPage,
  OfficeWorkflowTemplateDetailPage,
  OfficeAutomationSettingsPage,
  OfficeAutomationExceptionsPage,
  OfficeWorkflowHealthPage,
} from '../pages/WorkflowPages';
import {
  CrmHomePage,
  CrmLeadsListPage,
  CrmLeadDetailPage,
  CrmPipelinePage,
  CrmOpportunityDetailPage,
  CrmCalendarPage,
  CrmReportsPage,
  CrmSettingsPage,
} from '../pages/CrmPages';

export default function OfficeRoutes() {
  return (
    <Routes>
      <Route element={<AIOOfficeLayout />}>
        <Route index element={<OfficeDashboardPage />} />
        <Route path="work" element={<OfficeMyWorkPage />} />
        <Route path="queues" element={<OfficeQueuesPage />} />
        <Route path="approvals" element={<OfficeApprovalsPage />} />
        <Route path="escalations" element={<OfficeEscalationsPage />} />
        <Route path="services" element={<OfficeServicesPage />} />
        <Route path="documents/review" element={<OfficeDocumentReviewPage />} />
        <Route path="inbox" element={<OfficeInboxPage />} />
        <Route path="workload" element={<OfficeWorkloadPage />} />
        <Route path="activity" element={<OfficeActivityPage />} />
        <Route path="audit" element={<OfficeAuditPage />} />
        <Route path="workflows" element={<OfficeWorkflowsListPage />} />
        <Route path="workflows/:workflowId" element={<OfficeWorkflowDetailPage />} />
        <Route path="settings/workflows" element={<OfficeWorkflowSettingsPage />} />
        <Route path="settings/workflows/:templateId" element={<OfficeWorkflowTemplateDetailPage />} />
        <Route path="settings/automations" element={<OfficeAutomationSettingsPage />} />
        <Route path="automation-exceptions" element={<OfficeAutomationExceptionsPage />} />
        <Route path="workflow-health" element={<OfficeWorkflowHealthPage />} />
        <Route path="crm" element={<CrmHomePage />} />
        <Route path="crm/leads" element={<CrmLeadsListPage />} />
        <Route path="crm/leads/:leadId" element={<CrmLeadDetailPage />} />
        <Route path="crm/pipeline" element={<CrmPipelinePage />} />
        <Route path="crm/opportunities/:opportunityId" element={<CrmOpportunityDetailPage />} />
        <Route path="crm/calendar" element={<CrmCalendarPage />} />
        <Route path="crm/reports" element={<CrmReportsPage />} />
        <Route path="settings/crm" element={<CrmSettingsPage />} />
        <Route path="clients" element={<ClientsListPage />} />
        <Route path="clients/:clientId/road-ready" element={<ClientRoadReadyReviewPage />} />
        <Route path="clients/:clientId" element={<ClientDetailPage />} />
        <Route path="road-ready" element={<OfficeRoadReadyQueuePage />} />
        <Route path="requests" element={<RequestsListPage />} />
        <Route path="requests/:requestId" element={<OfficeRequestDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="deadlines" element={<DeadlinesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="renewals" element={<OfficeRenewalsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="permitting" element={<DivisionQueuePage division="permitting" title="Permitting & Compliance" />} />
        <Route path="business-formation" element={<DivisionQueuePage division="business-formation" title="Business Formation" />} />
        <Route path="insurance" element={<InsuranceCommandCenterPage />} />
        <Route path="insurance/requests" element={<InsuranceRequestsListPage />} />
        <Route path="insurance/requests/:requestId" element={<InsuranceRequestDetailOfficePage />} />
        <Route path="insurance/policies" element={<InsurancePoliciesListPage />} />
        <Route path="insurance/partners" element={<InsurancePartnersPage />} />
        <Route path="insurance/certificates" element={<InsuranceCertificatesOfficePage />} />
        <Route path="insurance/renewals" element={<InsuranceRenewalsOfficePage />} />
        <Route path="insurance/readiness" element={<InsuranceReadinessPage />} />
        <Route path="dispatch" element={<DispatchCommandCenterPage />} />
        <Route path="dispatch/loads" element={<DispatchLoadsListPage />} />
        <Route path="dispatch/loads/new" element={<DispatchLoadNewPage />} />
        <Route path="dispatch/loads/:loadId" element={<OfficeDispatchLoadDetailPage />} />
        <Route path="dispatch/clients" element={<DispatchClientsListPage />} />
        <Route path="dispatch/clients/:clientId" element={<DispatchClientDetailPage />} />
        <Route path="dispatch/brokers" element={<DispatchBrokersPage />} />
        <Route path="factoring" element={<FactoringCommandCenterPage />} />
        <Route path="factoring/submissions" element={<FactoringSubmissionsListPage />} />
        <Route path="factoring/submissions/:submissionId" element={<OfficeFactoringSubmissionDetailPage />} />
        <Route path="factoring/clients" element={<FactoringClientsListPage />} />
        <Route path="factoring/clients/:clientId" element={<FactoringClientDetailPage />} />
        <Route path="factoring/providers" element={<FactoringProvidersPage />} />
        <Route path="brokerage" element={<BrokerageCommandCenterPage />} />
        <Route path="brokerage/readiness" element={<BrokerageReadinessPage />} />
        <Route path="brokerage/shippers" element={<BrokerageShippersPage />} />
        <Route path="brokerage/shippers/:shipperId" element={<BrokerageShipperDetailPage />} />
        <Route path="brokerage/loads" element={<BrokerageLoadsListPage />} />
        <Route path="brokerage/loads/:loadId" element={<BrokerageLoadDetailPage />} />
        <Route path="brokerage/coverage" element={<BrokerageCoveragePage />} />
        <Route path="brokerage/carriers" element={<BrokerageCarriersPage />} />
        <Route path="brokerage/carriers/:carrierId" element={<BrokerageCarrierDetailPage />} />
        <Route path="brokerage/finance" element={<BrokerageFinancePage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:invoiceId" element={<OfficeInvoiceDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="billing" element={<OfficeBillingDashboardPage />} />
        <Route path="quotes" element={<OfficeQuotesPage />} />
        <Route path="quotes/:quoteId" element={<OfficeQuoteDetailPage />} />
        <Route path="settings/pricing" element={<OfficePricingSettingsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
