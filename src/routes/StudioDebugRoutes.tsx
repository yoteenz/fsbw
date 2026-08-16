/**
 * TEMPORARY public debug routes — remove when Experience Lab is stable.
 * Registered in main.tsx BEFORE App (no AdminGuard, workspace bootstrap, or admin layout).
 */
import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import StudioHealthDebugPage from '../pages/debug/studio-health/page';
import ChunkDebugPage from '../pages/debug/chunk-debug/page';
import BootDebugPage from '../pages/debug/boot-debug/page';
import ThreadHeartbeatDebugPage from '../pages/debug/thread-heartbeat/page';
import ExperienceLabSafeDebugPage from '../pages/debug/experience-lab-safe/page';
import ExperienceEngineBisectPage from '../pages/debug/experience-engine-bisect/page';
import ExperienceEngineFreezeReportPage from '../pages/debug/experience-engine-freeze-report/page';
import StudioOsFlightRecorderPage from '../pages/debug/studio-os-flight-recorder/page';
import StudioOsSessionReportPage from '../pages/debug/studio-os-session-report/page';
import StudioOsLiveRuntimePage from '../pages/debug/studio-os-live-runtime/page';
import WorldCompilerInvestigationPage from '../pages/debug/world-compiler-investigation/page';
import ExpertCapturePage from '../pages/expert-capture/page';
import AllInOnePermittingCapturePage from '../pages/expert-capture/all-in-one-permitting/page';
import TaxPreparationCapturePage from '../pages/expert-capture/tax-preparation/page';
import ExpertCaptureResumePage from '../pages/expert-capture/resume/page';
import ExpertCaptureKnowledgeStreamPage from '../pages/expert-capture/knowledge-stream/page';
import ExpertCaptureConfessionalPage from '../pages/expert-capture/confessional/page';
import ExpertCaptureOwnerMirrorPage from '../pages/expert-capture/owner-mirror/page';
import TaxKnowledgeStreamPage from '../pages/expert-capture/tax-preparation/knowledge-stream/page';
import TaxConfessionalPage from '../pages/expert-capture/tax-preparation/confessional/page';
import TaxOwnerMirrorPage from '../pages/expert-capture/tax-preparation/owner-mirror/page';
import PermittingKnowledgeStreamPage from '../pages/expert-capture/all-in-one-permitting/knowledge-stream/page';
import PermittingConfessionalPage from '../pages/expert-capture/all-in-one-permitting/confessional/page';
import PermittingOwnerMirrorPage from '../pages/expert-capture/all-in-one-permitting/owner-mirror/page';
import ExpertCaptureKnowledgeVaultRoute from '../pages/expert-capture/knowledge-vault/page';
import ExpertCaptureTrustDashboardRoute from '../pages/expert-capture/trust-dashboard/page';
import ExpertCaptureLivingWorkerRoute from '../pages/expert-capture/living-worker/page';
import TaxKnowledgeVaultPage from '../pages/expert-capture/tax-preparation/knowledge-vault/page';
import TaxTrustDashboardPage from '../pages/expert-capture/tax-preparation/trust-dashboard/page';
import TaxLivingWorkerPage from '../pages/expert-capture/tax-preparation/living-worker/page';
import PermittingKnowledgeVaultPage from '../pages/expert-capture/all-in-one-permitting/knowledge-vault/page';
import PermittingTrustDashboardPage from '../pages/expert-capture/all-in-one-permitting/trust-dashboard/page';
import PermittingLivingWorkerPage from '../pages/expert-capture/all-in-one-permitting/living-worker/page';
import StudioInstituteHomePage from '../pages/studio-institute/page';
import StudioInstituteInviteManagerPage from '../pages/studio-institute/invites/page';
import StudioInstituteInviteLegacyRedirect from '../pages/studio-institute/invite/page';
import StudioInstituteInviteLandingPage from '../pages/studio-institute/invite/landing/page';
import StudioInstituteInterviewPage from '../pages/studio-institute/interview/page';
import StudioInstituteVaultPage from '../pages/studio-institute/knowledge-vault/page';
import ContextCapsuleDownloadPage from '../pages/context/page';
import FounderIntelligenceDownloadPage from '../pages/founder-intelligence/page';
import CollaborationIntelligenceDownloadPage from '../pages/collaboration-intelligence/page';
import OnboardingPackPage from '../pages/onboarding/page';
import ContextUpdatesPage from '../pages/context-updates/page';
import { isStudioInstitutePath } from '../studio-os-core/expert-capture/invite-system/config';
import { DebugRouteErrorBoundary } from '../pages/debug/DebugRouteErrorBoundary';
import { RootAppErrorBoundary } from './RootAppErrorBoundary';
import { lazyWithRetry } from '../utils/lazyWithRetry';

const AllInOneRouteHost = lazyWithRetry(
  () => import('../all-in-one/routes/AllInOneRouteHost'),
  'AllInOneRouteHost',
);

const App = lazyWithRetry(() => import('../App'), 'App');

function AllInOneRouteLoading() {
  return (
    <div
      data-route-loading="all-in-one"
      className="aio-loading"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#d4af37',
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontSize: '0.875rem',
      }}
    >
      Loading All In One…
    </div>
  );
}

const allInOneRouteElement = (
  <DebugRouteErrorBoundary route="/all-in-one">
    <Suspense fallback={<AllInOneRouteLoading />}>
      <AllInOneRouteHost />
    </Suspense>
  </DebugRouteErrorBoundary>
);

function DebugAllInOneLegacyRedirect() {
  const location = useLocation();
  const tail = location.pathname.replace(/^\/debug\/all-in-one\/?/, '');
  const target = tail ? `/all-in-one/${tail}` : '/all-in-one';
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}

export const STUDIO_DEBUG_PATHS = [
  '/__studio-health',
  '/__chunk-debug',
  '/__boot-debug',
  '/__thread-heartbeat',
  '/__experience-lab-safe',
  '/__experience-engine-bisect',
  '/__experience-engine-freeze-report',
  '/__studio-os-flight-recorder',
  '/__studio-os-session-report',
  '/__studio-os-live-runtime',
  '/__world-compiler-investigation',
  '/expert-capture',
  '/expert-capture/all-in-one-permitting',
  '/expert-capture/tax-preparation',
  '/expert-capture/resume',
  '/expert-capture/knowledge-stream',
  '/expert-capture/confessional',
  '/expert-capture/owner-mirror',
  '/expert-capture/tax-preparation/knowledge-stream',
  '/expert-capture/tax-preparation/confessional',
  '/expert-capture/tax-preparation/owner-mirror',
  '/expert-capture/all-in-one-permitting/knowledge-stream',
  '/expert-capture/all-in-one-permitting/confessional',
  '/expert-capture/all-in-one-permitting/owner-mirror',
  '/expert-capture/knowledge-vault',
  '/expert-capture/trust-dashboard',
  '/expert-capture/living-worker',
  '/expert-capture/tax-preparation/knowledge-vault',
  '/expert-capture/tax-preparation/trust-dashboard',
  '/expert-capture/tax-preparation/living-worker',
  '/expert-capture/all-in-one-permitting/knowledge-vault',
  '/expert-capture/all-in-one-permitting/trust-dashboard',
  '/expert-capture/all-in-one-permitting/living-worker',
] as const;

export function isStudioDebugPath(pathname: string): boolean {
  if (isStudioInstitutePath(pathname)) return true;
  if (pathname === '/context') return true;
  if (pathname === '/founder-intelligence') return true;
  if (pathname === '/collaboration-intelligence') return true;
  if (pathname === '/onboarding') return true;
  if (pathname === '/context-updates') return true;
  return (STUDIO_DEBUG_PATHS as readonly string[]).includes(pathname);
}

export default function StudioDebugRoutes() {
  return (
    <Routes>
      <Route path="/__studio-health" element={<StudioHealthDebugPage />} />
      <Route path="/__chunk-debug" element={<ChunkDebugPage />} />
      <Route
        path="/__boot-debug"
        element={
          <DebugRouteErrorBoundary route="/__boot-debug">
            <BootDebugPage />
          </DebugRouteErrorBoundary>
        }
      />
      <Route path="/__thread-heartbeat" element={<ThreadHeartbeatDebugPage />} />
      <Route path="/__experience-lab-safe" element={<ExperienceLabSafeDebugPage />} />
      <Route path="/__experience-engine-bisect" element={<ExperienceEngineBisectPage />} />
      <Route path="/__experience-engine-freeze-report" element={<ExperienceEngineFreezeReportPage />} />
      <Route path="/__studio-os-flight-recorder" element={<StudioOsFlightRecorderPage />} />
      <Route path="/__studio-os-session-report" element={<StudioOsSessionReportPage />} />
      <Route path="/__studio-os-live-runtime" element={<StudioOsLiveRuntimePage />} />
      <Route path="/__world-compiler-investigation" element={<WorldCompilerInvestigationPage />} />
      <Route path="/expert-capture" element={<ExpertCapturePage />} />
      <Route path="/expert-capture/all-in-one-permitting" element={<AllInOnePermittingCapturePage />} />
      <Route path="/expert-capture/tax-preparation" element={<TaxPreparationCapturePage />} />
      <Route path="/expert-capture/resume" element={<ExpertCaptureResumePage />} />
      <Route path="/expert-capture/knowledge-stream" element={<ExpertCaptureKnowledgeStreamPage />} />
      <Route path="/expert-capture/confessional" element={<ExpertCaptureConfessionalPage />} />
      <Route path="/expert-capture/owner-mirror" element={<ExpertCaptureOwnerMirrorPage />} />
      <Route path="/expert-capture/tax-preparation/knowledge-stream" element={<TaxKnowledgeStreamPage />} />
      <Route path="/expert-capture/tax-preparation/confessional" element={<TaxConfessionalPage />} />
      <Route path="/expert-capture/tax-preparation/owner-mirror" element={<TaxOwnerMirrorPage />} />
      <Route path="/expert-capture/all-in-one-permitting/knowledge-stream" element={<PermittingKnowledgeStreamPage />} />
      <Route path="/expert-capture/all-in-one-permitting/confessional" element={<PermittingConfessionalPage />} />
      <Route path="/expert-capture/all-in-one-permitting/owner-mirror" element={<PermittingOwnerMirrorPage />} />
      <Route path="/expert-capture/knowledge-vault" element={<ExpertCaptureKnowledgeVaultRoute />} />
      <Route path="/expert-capture/trust-dashboard" element={<ExpertCaptureTrustDashboardRoute />} />
      <Route path="/expert-capture/living-worker" element={<ExpertCaptureLivingWorkerRoute />} />
      <Route path="/expert-capture/tax-preparation/knowledge-vault" element={<TaxKnowledgeVaultPage />} />
      <Route path="/expert-capture/tax-preparation/trust-dashboard" element={<TaxTrustDashboardPage />} />
      <Route path="/expert-capture/tax-preparation/living-worker" element={<TaxLivingWorkerPage />} />
      <Route path="/expert-capture/all-in-one-permitting/knowledge-vault" element={<PermittingKnowledgeVaultPage />} />
      <Route path="/expert-capture/all-in-one-permitting/trust-dashboard" element={<PermittingTrustDashboardPage />} />
      <Route path="/expert-capture/all-in-one-permitting/living-worker" element={<PermittingLivingWorkerPage />} />
      <Route path="/studio-institute" element={<StudioInstituteHomePage />} />
      <Route path="/studio-institute/invites" element={<StudioInstituteInviteManagerPage />} />
      <Route path="/studio-institute/invite" element={<StudioInstituteInviteLegacyRedirect />} />
      <Route path="/studio-institute/invite/:token" element={<StudioInstituteInviteLandingPage />} />
      <Route path="/studio-institute/interview" element={<StudioInstituteInterviewPage />} />
      <Route path="/studio-institute/knowledge-vault" element={<StudioInstituteVaultPage />} />
      <Route path="/context" element={<ContextCapsuleDownloadPage />} />
      <Route path="/founder-intelligence" element={<FounderIntelligenceDownloadPage />} />
      <Route path="/collaboration-intelligence" element={<CollaborationIntelligenceDownloadPage />} />
      <Route path="/onboarding" element={<OnboardingPackPage />} />
      <Route path="/context-updates" element={<ContextUpdatesPage />} />
      <Route path="/all-in-one/*" element={allInOneRouteElement} />
      <Route path="/debug/all-in-one/*" element={<DebugAllInOneLegacyRedirect />} />
      <Route path="/debug/all-in-one" element={<DebugAllInOneLegacyRedirect />} />
      <Route
        path="*"
        element={
          <RootAppErrorBoundary>
            <Suspense
              fallback={
                <div
                  data-route-loading="app-shell"
                  style={{
                    minHeight: '100dvh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    color: '#444',
                  }}
                >
                  Loading…
                </div>
              }
            >
              <App />
            </Suspense>
          </RootAppErrorBoundary>
        }
      />
    </Routes>
  );
}
