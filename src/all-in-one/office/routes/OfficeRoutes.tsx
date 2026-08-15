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
  DispatchCenterPage,
  LoadDetailPage,
  FactoringOpsPage,
  BrokerageOpsPage,
  ShipmentDetailPage,
  InvoicesPage,
  PaymentsPage,
  TeamPage,
  ReportsPage,
} from '../pages/DivisionOpsPages';
import { OfficeRoadReadyQueuePage } from '../pages/OfficeRoadReadyQueuePage';
import { ClientRoadReadyReviewPage } from '../pages/ClientRoadReadyReviewPage';
import { OfficeRenewalsPage } from '../pages/OfficeRenewalsPage';

export default function OfficeRoutes() {
  return (
    <Routes>
      <Route element={<AIOOfficeLayout />}>
        <Route index element={<OfficeDashboardPage />} />
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
        <Route path="insurance" element={<DivisionQueuePage division="insurance" title="Insurance Operations" />} />
        <Route path="dispatch" element={<DispatchCenterPage />} />
        <Route path="dispatch/loads/:loadId" element={<LoadDetailPage />} />
        <Route path="factoring" element={<FactoringOpsPage />} />
        <Route path="brokerage" element={<BrokerageOpsPage />} />
        <Route path="brokerage/shipments/:shipmentId" element={<ShipmentDetailPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
