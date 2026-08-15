import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AIOAuthProvider } from '../auth/AIOAuthProvider';
import { CustomerRouteGuard, OfficeRouteGuard } from '../auth/guards/RouteGuards';
import { AIOPublicLayout } from '../layouts/AIOPublicLayout';
import { AIOPortalLayout } from '../layouts/AIOPortalLayout';
import { AIOAuthLayout } from '../layouts/AIOAuthLayout';
import { HomePage } from '../pages/HomePage';
import { PortalPage } from '../pages/PortalPage';
import { ServicesPage } from '../pages/ServicesPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { FactoringPage } from '../pages/FactoringPage';
import {
  FactoringHomePage,
  FactoringApplicationPage,
  FactoringReadyPage,
  FactoringSubmissionDetailPage,
  FactoringHistoryPage,
} from '../pages/portal/factoring/FactoringPortalPages';
import { GetStartedPage } from '../pages/GetStartedPage';
import { RoadmapResultsPage } from '../pages/RoadmapResultsPage';
import { ServicePlanPage } from '../pages/ServicePlanPage';
import { RequestSubmitPage, RequestConfirmationPage } from '../pages/RequestSubmitPage';
import { RequestDetailPage } from '../pages/RequestDetailPage';
import { ServiceCatalogDetailPage } from '../pages/ServiceCatalogDetailPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import {
  BusinessProfilePage,
  BusinessSummaryPage,
  OperationsCenterPage,
  MoneyCenterPage,
  DocumentCenterPage,
  CommunicationHubPage,
  ServiceRequestsCenterPage,
  ServicesCenterPage,
  ActivityTimelinePage,
  TeamPage,
  PortalSearchPage,
} from '../pages/portal/ClientPortalPages';
import { PortalSettingsPage } from '../pages/portal/PortalSettingsPage';
import { RoadReadyOnboardingPage } from '../pages/portal/RoadReadyOnboardingPage';
import { RoadReadyPage } from '../pages/portal/RoadReadyPage';
import { FleetPage } from '../pages/portal/FleetPage';
import { VehicleDetailPage } from '../pages/portal/VehicleDetailPage';
import { VaultPage } from '../pages/portal/VaultPage';
import { VaultDocumentPage } from '../pages/portal/VaultDocumentPage';
import { CalendarPage } from '../pages/portal/CalendarPage';
import { RenewalsPage } from '../pages/portal/RenewalsPage';
import { NotificationsPage } from '../pages/portal/NotificationsPage';
import { NotificationSettingsPage } from '../pages/portal/NotificationSettingsPage';
import { QuotesPage } from '../pages/portal/QuotesPage';
import { QuoteDetailPage } from '../pages/portal/QuoteDetailPage';
import { BillingPage } from '../pages/portal/BillingPage';
import { InvoiceDetailPage } from '../pages/portal/InvoiceDetailPage';
import { PayInvoicePage } from '../pages/portal/PayInvoicePage';
import { ReceiptPage } from '../pages/portal/ReceiptPage';
import { DispatchHomePage } from '../pages/portal/dispatch/DispatchHomePage';
import { DispatchOnboardingPage } from '../pages/portal/dispatch/DispatchOnboardingPage';
import { DispatchLoadsPage } from '../pages/portal/dispatch/DispatchLoadsPage';
import { DispatchLoadDetailPage } from '../pages/portal/dispatch/DispatchLoadDetailPage';
import { DispatchHistoryPage } from '../pages/portal/dispatch/DispatchHistoryPage';
import { FreightInvoicePrintPage } from '../pages/portal/factoring/FreightInvoicePrintPage';
import {
  CarrierBrokerageHomePage,
  CarrierBrokerageOffersPage,
  CarrierBrokerageLoadPage,
  CarrierBrokeragePaymentsPage,
} from '../pages/portal/brokerage/BrokeragePortalPages';
import {
  InsuranceHomePage,
  InsuranceRequestPage,
  InsuranceRequestDetailPage,
  InsurancePolicyDetailPage,
  InsuranceCertificatesPage,
  InsuranceCertificateNewPage,
  InsuranceRenewalsPage,
} from '../pages/portal/insurance/InsurancePortalPages';
import {
  ShipperHomePage,
  ShipperOnboardingPage,
  ShipperNewShipmentPage,
  ShipperShipmentsPage,
  ShipperShipmentDetailPage,
  ShipperQuotesPage,
  ShipperQuoteDetailPage,
  ShipperBillingPage,
  ShipperInvoiceDetailPage,
} from '../pages/shipper/ShipperPortalPages';
import { aioAppConfig } from '../config/appConfig';

const OfficeRoutesLazy = lazy(() => import('../office/routes/OfficeRoutes'));

export function AllInOneLoading() {
  return <div className="aio-loading">Loading All In One…</div>;
}

function RequestConfirmationRoute() {
  const { requestId } = useParams<{ requestId: string }>();
  if (!requestId) return <Navigate to={aioAppConfig.routes.portal} replace />;
  return <RequestConfirmationPage requestId={requestId} />;
}

export default function AllInOneRoutes() {
  const base = aioAppConfig.routes.base;

  return (
    <AIOAuthProvider>
      <Routes>
        <Route element={<AIOAuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="sign-up" element={<SignUpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
        </Route>

        <Route element={<AIOPublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/factoring" element={<FactoringPage />} />
          <Route path="services/permitting" element={<ServiceCatalogDetailPage slug="permitting" />} />
          <Route path="services/business-formation" element={<ServiceCatalogDetailPage slug="business-formation" />} />
          <Route path="services/insurance" element={<ServiceCatalogDetailPage slug="insurance" />} />
          <Route path="services/dispatching" element={<ServiceCatalogDetailPage slug="dispatching" />} />
          <Route path="services/brokerage" element={<ServiceCatalogDetailPage slug="brokerage" />} />
          <Route path="services/:serviceSlug" element={<ServiceCatalogDetailPage />} />
          <Route path="get-started" element={<GetStartedPage />} />
          <Route path="roadmap/results" element={<RoadmapResultsPage />} />
          <Route path="service-plan" element={<ServicePlanPage />} />
          <Route path="request/submit" element={<RequestSubmitPage />} />
          <Route path="request/confirmation/:requestId" element={<RequestConfirmationRoute />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
        </Route>

        <Route element={<CustomerRouteGuard />}>
          <Route path="portal" element={<AIOPortalLayout />}>
            <Route index element={<PortalPage />} />
            <Route path="business" element={<BusinessProfilePage />} />
            <Route path="business/summary" element={<BusinessSummaryPage />} />
            <Route path="operations" element={<OperationsCenterPage />} />
            <Route path="money" element={<MoneyCenterPage />} />
            <Route path="documents" element={<DocumentCenterPage />} />
            <Route path="communication" element={<CommunicationHubPage />} />
            <Route path="requests" element={<ServiceRequestsCenterPage />} />
            <Route path="services" element={<ServicesCenterPage />} />
            <Route path="activity" element={<ActivityTimelinePage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="search" element={<PortalSearchPage />} />
            <Route path="onboarding" element={<RoadReadyOnboardingPage />} />
            <Route path="road-ready" element={<RoadReadyPage />} />
            <Route path="fleet" element={<FleetPage />} />
            <Route path="fleet/vehicles/:vehicleId" element={<VehicleDetailPage />} />
            <Route path="vault" element={<VaultPage />} />
            <Route path="vault/:documentId" element={<VaultDocumentPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="renewals" element={<RenewalsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="quotes/:quoteId" element={<QuoteDetailPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="billing/invoices/:invoiceId" element={<InvoiceDetailPage />} />
            <Route path="billing/pay/:invoiceId" element={<PayInvoicePage />} />
            <Route path="billing/receipts/:receiptId" element={<ReceiptPage />} />
            <Route path="dispatch" element={<DispatchHomePage />} />
            <Route path="dispatch/onboarding" element={<DispatchOnboardingPage />} />
            <Route path="dispatch/loads" element={<DispatchLoadsPage />} />
            <Route path="dispatch/loads/:loadId" element={<DispatchLoadDetailPage />} />
            <Route path="dispatch/history" element={<DispatchHistoryPage />} />
            <Route path="factoring" element={<FactoringHomePage />} />
            <Route path="factoring/application" element={<FactoringApplicationPage />} />
            <Route path="factoring/ready" element={<FactoringReadyPage />} />
            <Route path="factoring/submissions/:submissionId" element={<FactoringSubmissionDetailPage />} />
            <Route path="factoring/history" element={<FactoringHistoryPage />} />
            <Route path="factoring/invoices/:invoiceId" element={<FreightInvoicePrintPage />} />
            <Route path="insurance" element={<InsuranceHomePage />} />
            <Route path="insurance/request" element={<InsuranceRequestPage />} />
            <Route path="insurance/requests/:requestId" element={<InsuranceRequestDetailPage />} />
            <Route path="insurance/policies/:policyId" element={<InsurancePolicyDetailPage />} />
            <Route path="insurance/certificates" element={<InsuranceCertificatesPage />} />
            <Route path="insurance/certificates/new" element={<InsuranceCertificateNewPage />} />
            <Route path="insurance/renewals" element={<InsuranceRenewalsPage />} />
            <Route path="brokerage" element={<CarrierBrokerageHomePage />} />
            <Route path="brokerage/offers" element={<CarrierBrokerageOffersPage />} />
            <Route path="brokerage/loads/:loadId" element={<CarrierBrokerageLoadPage />} />
            <Route path="brokerage/payments" element={<CarrierBrokeragePaymentsPage />} />
            <Route path="requests/:requestId" element={<RequestDetailPage />} />
            <Route path="settings" element={<PortalSettingsPage />} />
          </Route>
          <Route path="shipper" element={<AIOPortalLayout />}>
            <Route index element={<ShipperHomePage />} />
            <Route path="onboarding" element={<ShipperOnboardingPage />} />
            <Route path="shipments" element={<ShipperShipmentsPage />} />
            <Route path="shipments/new" element={<ShipperNewShipmentPage />} />
            <Route path="shipments/:loadId" element={<ShipperShipmentDetailPage />} />
            <Route path="quotes" element={<ShipperQuotesPage />} />
            <Route path="quotes/:quoteId" element={<ShipperQuoteDetailPage />} />
            <Route path="billing" element={<ShipperBillingPage />} />
            <Route path="billing/:invoiceId" element={<ShipperInvoiceDetailPage />} />
          </Route>
        </Route>

        <Route element={<OfficeRouteGuard />}>
          <Route
            path="office/*"
            element={
              <Suspense fallback={<AllInOneLoading />}>
                <OfficeRoutesLazy />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to={base} replace />} />
      </Routes>
    </AIOAuthProvider>
  );
}
