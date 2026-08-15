import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AIOPublicLayout } from '../layouts/AIOPublicLayout';
import { AIOPortalLayout } from '../layouts/AIOPortalLayout';
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
import { aioAppConfig } from '../config/appConfig';

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
    <Routes>
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

      <Route path="portal" element={<AIOPortalLayout />}>
        <Route index element={<PortalPage />} />
        <Route path="factoring" element={<FactoringPortalPage />} />
        <Route path="requests/:requestId" element={<RequestDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to={base} replace />} />
    </Routes>
  );
}
