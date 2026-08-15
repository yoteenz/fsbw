import { Navigate, Route, Routes } from 'react-router-dom';
import { AIOPublicLayout } from '../layouts/AIOPublicLayout';
import { AIOPortalLayout } from '../layouts/AIOPortalLayout';
import { HomePage } from '../pages/HomePage';
import { PortalPage } from '../pages/PortalPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ServiceDetailPage } from '../pages/ServiceDetailPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { FactoringPage } from '../pages/FactoringPage';
import { FactoringPortalPage } from '../pages/FactoringPortalPage';
import { aioAppConfig } from '../config/appConfig';

export function AllInOneLoading() {
  return <div className="aio-loading">Loading All In One…</div>;
}

export default function AllInOneRoutes() {
  const base = aioAppConfig.routes.base;

  return (
    <Routes>
      <Route element={<AIOPublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/permitting" element={<ServiceDetailPage slug="permitting" />} />
        <Route path="services/business-formation" element={<ServiceDetailPage slug="business-formation" />} />
        <Route path="services/insurance" element={<ServiceDetailPage slug="insurance" />} />
        <Route path="services/dispatching" element={<ServiceDetailPage slug="dispatching" />} />
        <Route path="services/factoring" element={<FactoringPage />} />
        <Route path="services/brokerage" element={<ServiceDetailPage slug="brokerage" />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
      </Route>

      <Route path="portal" element={<AIOPortalLayout />}>
        <Route index element={<PortalPage />} />
        <Route path="factoring" element={<FactoringPortalPage />} />
      </Route>

      <Route path="*" element={<Navigate to={base} replace />} />
    </Routes>
  );
}
