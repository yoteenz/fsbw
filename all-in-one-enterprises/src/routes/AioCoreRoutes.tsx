import { lazy, Suspense } from 'react';
import { Navigate, Route, useParams } from 'react-router-dom';
import { CustomerRouteGuard, OfficeRouteGuard } from '../auth/guards/RouteGuards';
import { AIOPublicLayout } from '../layouts/AIOPublicLayout';
import { SmartIntakeLayout } from '../layouts/SmartIntakeLayout';
import { AIOPortalLayout } from '../layouts/AIOPortalLayout';
import { AIOAuthLayout } from '../layouts/AIOAuthLayout';
import { HomePage } from '../pages/HomePage';
import { PortalPage } from '../pages/PortalPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ServiceFindPage } from '../pages/ServiceFindPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { RequestCallbackPage } from '../pages/RequestCallbackPage';
import { PublicQuotePage } from '../pages/PublicQuotePage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { StartYourBusinessPage } from '../pages/StartYourBusinessPage';
import { StartBusinessBuildPage } from '../pages/start-business/StartBusinessBuildPage';
import { StartBusinessRegisterPage } from '../pages/start-business/StartBusinessRegisterPage';
import { StartBusinessActivatePage } from '../pages/start-business/StartBusinessActivatePage';
import { StartBusinessRollPage } from '../pages/start-business/StartBusinessRollPage';
import { ClientPortalInfoPage } from '../pages/ClientPortalInfoPage';
import { RoadReadyPublicPage } from '../pages/RoadReadyPublicPage';
import { FactoringPage } from '../pages/FactoringPage';
import { BookkeepingPage } from '../pages/BookkeepingPage';
import { BookkeepingAssessmentPage } from '../pages/bookkeeping/BookkeepingAssessmentPage';
import { BookkeepingRecommendationPage } from '../pages/bookkeeping/BookkeepingRecommendationPage';
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
import { PortalConnectionsPage } from '../pages/portal/PortalConnectionsPage';
import { PortalSecuritySettingsPage, PortalPrivacySettingsPage } from '../pages/portal/PortalSecurityPages';
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
import { BookkeepingHomePage } from '../pages/portal/bookkeeping/BookkeepingPortalPages';
import { PortalServiceTrackerPage, PortalJourneyRoadmapPage } from '../pages/portal/WorkflowPortalPages';
import { PortalMessagesListPage, PortalConversationDetailPage } from '../pages/portal/PortalMessagesPages';
import { PortalAppointmentsListPage, PortalAppointmentDetailPage } from '../pages/portal/PortalAppointmentsPages';
import { SchedulePage } from '../pages/SchedulePage';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';
import {
  FleetCarePublicPage,
  FleetCarePlansPage,
  FleetCareProviderJoinPage,
  FleetCareProviderApplyPage,
} from '../pages/fleetcare/FleetCarePublicPages';
import {
  FleetCareHomePage,
  FleetCareRequestPage,
  FleetCareTicketDetailPage,
  FleetCareVehicleHistoryPage,
} from '../pages/portal/fleetcare/FleetCarePortalPages';
import {
  FleetCareProviderLayout,
  FleetCareProviderDashboardPage,
  FleetCareProviderLeadsPage,
  FleetCareProviderLeadDetailPage,
  FleetCareProviderJobsPage,
  FleetCareProviderJobDetailPage,
  FleetCareProviderEarningsPage,
  FleetCareProviderCompliancePage,
  FleetCareProviderProfilePage,
} from '../pages/provider/FleetCareProviderPages';
import {
  DriverLinkPublicPage,
  DriverLinkDriverSignupPage,
} from '../pages/driverlink/DriverLinkPublicPages';
import {
  DriverLinkCompanyHomePage,
  DriverLinkCompanyOpportunitiesPage,
  DriverLinkCompanyOpportunityDetailPage,
  DriverLinkCompanyCandidatesPage,
  DriverLinkCompanyCreateJobPage,
} from '../pages/portal/driverlink/DriverLinkPortalPages';
import {
  DriverLinkDriverLayout,
  DriverLinkDriverDashboardPage,
  DriverLinkDriverProfilePage,
  DriverLinkDriverCredentialsPage,
  DriverLinkDriverFindWorkPage,
  DriverLinkDriverMatchesPage,
  DriverLinkDriverApplicationsPage,
  DriverLinkDriverOpportunityPage,
} from '../pages/driver/DriverLinkDriverPages';
import { IconLibraryDebugPage } from '../pages/debug/IconLibraryDebugPage';
import {
  LoadBoardLayout,
  LoadBoardSearchPage,
  LoadBoardResultsPage,
  LoadBoardDetailPage,
  LoadBoardMyLoadsPage,
  LoadBoardFleetPage,
  LoadBoardMapPage,
  LoadBoardSavedPage,
} from '../pages/portal/loadboard/LoadBoardPages';
function AioRouteLoading() {
  return <div className="aio-loading">Loading All In One…</div>;
}

const OfficeRoutesLazy = lazy(() => import('../office/routes/OfficeRoutes'));

function DriverLinkPortalOpportunityRoute() {
  const { opportunityId = '' } = useParams();
  return <DriverLinkCompanyOpportunityDetailPage opportunityId={opportunityId} />;
}

function RequestConfirmationRoute() {
  const { requestId } = useParams<{ requestId: string }>();
  if (!requestId) return <Navigate to={aioAppConfig.routes.portal} replace />;
  return <RequestConfirmationPage requestId={requestId} />;
}

/** Shared AIO route tree — mounted at root and under /desktop/* + /mobile/* mirrors. */
export const aioCoreRoutes = (
  <>
      <Route element={<AIOAuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="sign-up" element={<Navigate to={aioPaths.signUp} replace />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>

      <Route element={<AIOPublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/find" element={<ServiceFindPage />} />
        <Route path="services/factoring" element={<FactoringPage />} />
        <Route path="services/bookkeeping" element={<BookkeepingPage />} />
        <Route path="services/fleetcare" element={<FleetCarePublicPage />} />
        <Route path="services/fleetcare/plans" element={<FleetCarePlansPage />} />
        <Route path="services/driverlink" element={<DriverLinkPublicPage />} />
        <Route path="driverlink/signup" element={<DriverLinkDriverSignupPage />} />
        <Route path="fleetcare/providers/join" element={<FleetCareProviderJoinPage />} />
        <Route path="fleetcare/providers/apply" element={<FleetCareProviderApplyPage />} />
        <Route path="services/bookkeeping/assessment" element={<BookkeepingAssessmentPage />} />
        <Route path="services/bookkeeping/recommendation" element={<BookkeepingRecommendationPage />} />
        <Route path="services/permitting" element={<ServiceCatalogDetailPage slug="permitting" />} />
        <Route path="services/business-formation" element={<ServiceCatalogDetailPage slug="business-formation" />} />
        <Route path="services/insurance" element={<ServiceCatalogDetailPage slug="insurance" />} />
        <Route path="services/dispatching" element={<ServiceCatalogDetailPage slug="dispatching" />} />
        <Route path="services/brokerage" element={<ServiceCatalogDetailPage slug="brokerage" />} />
        <Route path="services/:serviceSlug" element={<ServiceCatalogDetailPage />} />
        <Route path="roadmap/results" element={<RoadmapResultsPage />} />
        <Route path="service-plan" element={<ServicePlanPage />} />
        <Route path="request/submit" element={<RequestSubmitPage />} />
        <Route path="request/confirmation/:requestId" element={<RequestConfirmationRoute />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="request-callback" element={<RequestCallbackPage />} />
        <Route path="quote/:secureToken" element={<PublicQuotePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="road-ready" element={<RoadReadyPublicPage />} />
        <Route path="start-your-business" element={<StartYourBusinessPage />} />
        <Route path="start-your-business/build" element={<StartBusinessBuildPage />} />
        <Route path="start-your-business/register" element={<StartBusinessRegisterPage />} />
        <Route path="start-your-business/activate" element={<StartBusinessActivatePage />} />
        <Route path="start-your-business/roll" element={<StartBusinessRollPage />} />
        <Route path="client-portal" element={<ClientPortalInfoPage />} />
        <Route path="debug/icon-library" element={<IconLibraryDebugPage />} />
      </Route>

      <Route element={<SmartIntakeLayout />}>
        <Route path="get-started" element={<GetStartedPage />} />
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
          <Route path="messages" element={<PortalMessagesListPage />} />
          <Route path="messages/:conversationId" element={<PortalConversationDetailPage />} />
          <Route path="appointments" element={<PortalAppointmentsListPage />} />
          <Route path="appointments/:appointmentId" element={<PortalAppointmentDetailPage />} />
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
          <Route path="load-board" element={<LoadBoardLayout />}>
            <Route index element={<LoadBoardSearchPage />} />
            <Route path="results" element={<LoadBoardResultsPage />} />
            <Route path="loads/:loadId" element={<LoadBoardDetailPage />} />
            <Route path="my-loads" element={<LoadBoardMyLoadsPage />} />
            <Route path="fleet" element={<LoadBoardFleetPage />} />
            <Route path="map" element={<LoadBoardMapPage />} />
            <Route path="saved" element={<LoadBoardSavedPage />} />
          </Route>
          <Route path="factoring" element={<FactoringHomePage />} />
          <Route path="factoring/application" element={<FactoringApplicationPage />} />
          <Route path="factoring/ready" element={<FactoringReadyPage />} />
          <Route path="factoring/submissions/:submissionId" element={<FactoringSubmissionDetailPage />} />
          <Route path="factoring/history" element={<FactoringHistoryPage />} />
          <Route path="factoring/invoices/:invoiceId" element={<FreightInvoicePrintPage />} />
          <Route path="bookkeeping" element={<BookkeepingHomePage />} />
          <Route path="fleetcare" element={<FleetCareHomePage />} />
          <Route path="fleetcare/request" element={<FleetCareRequestPage />} />
          <Route path="fleetcare/tickets/:ticketId" element={<FleetCareTicketDetailPage />} />
          <Route path="fleetcare/vehicles/:vehicleId/history" element={<FleetCareVehicleHistoryPage />} />
          <Route path="driverlink" element={<DriverLinkCompanyHomePage />} />
          <Route path="driverlink/opportunities" element={<DriverLinkCompanyOpportunitiesPage />} />
          <Route path="driverlink/opportunities/new" element={<DriverLinkCompanyCreateJobPage />} />
          <Route path="driverlink/opportunities/:opportunityId" element={<DriverLinkPortalOpportunityRoute />} />
          <Route path="driverlink/candidates" element={<DriverLinkCompanyCandidatesPage />} />
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
          <Route path="services/:serviceRequestId" element={<PortalServiceTrackerPage />} />
          <Route path="roadmap" element={<PortalJourneyRoadmapPage />} />
          <Route path="settings" element={<PortalSettingsPage />} />
          <Route path="settings/connections" element={<PortalConnectionsPage />} />
          <Route path="settings/security" element={<PortalSecuritySettingsPage />} />
          <Route path="settings/privacy" element={<PortalPrivacySettingsPage />} />
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

      <Route path="provider/fleetcare" element={<FleetCareProviderLayout />}>
        <Route index element={<FleetCareProviderDashboardPage />} />
        <Route path="leads" element={<FleetCareProviderLeadsPage />} />
        <Route path="leads/:ticketId" element={<FleetCareProviderLeadDetailPage />} />
        <Route path="jobs" element={<FleetCareProviderJobsPage />} />
        <Route path="jobs/:ticketId" element={<FleetCareProviderJobDetailPage />} />
        <Route path="earnings" element={<FleetCareProviderEarningsPage />} />
        <Route path="compliance" element={<FleetCareProviderCompliancePage />} />
        <Route path="profile" element={<FleetCareProviderProfilePage />} />
      </Route>

      <Route path="driver/driverlink" element={<DriverLinkDriverLayout />}>
        <Route index element={<DriverLinkDriverDashboardPage />} />
        <Route path="profile" element={<DriverLinkDriverProfilePage />} />
        <Route path="credentials" element={<DriverLinkDriverCredentialsPage />} />
        <Route path="find-work" element={<DriverLinkDriverFindWorkPage />} />
        <Route path="matches" element={<DriverLinkDriverMatchesPage />} />
        <Route path="applications" element={<DriverLinkDriverApplicationsPage />} />
        <Route path="opportunities/:opportunityId" element={<DriverLinkDriverOpportunityPage />} />
      </Route>

      <Route element={<OfficeRouteGuard />}>
        <Route
          path="office/*"
          element={
            <Suspense fallback={<AioRouteLoading />}>
              <OfficeRoutesLazy />
            </Suspense>
          }
        />
      </Route>
  </>
);
