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
import { FactoringPortalPage } from '../pages/FactoringPortalPage';
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
import { PortalSettingsPage } from '../pages/portal/PortalSettingsPage';
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
            <Route path="factoring" element={<FactoringPortalPage />} />
            <Route path="requests/:requestId" element={<RequestDetailPage />} />
            <Route path="settings" element={<PortalSettingsPage />} />
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
