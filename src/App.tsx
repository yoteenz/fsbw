import { Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import LobbyPage from './pages/lobby/page';
import BuildAWigPage from './pages/build-a-wig/page';
import LengthPage from './pages/build-a-wig/length/page';
import ColorPage from './pages/build-a-wig/color/page';
import DensityPage from './pages/build-a-wig/density/page';
import LacePage from './pages/build-a-wig/lace/page';
import TexturePage from './pages/build-a-wig/texture/page';
import HairlinePage from './pages/build-a-wig/hairline/page';
import CapSizePage from './pages/build-a-wig/cap-size/page';
import StylingPage from './pages/build-a-wig/styling/page';
import AddOnsPage from './pages/build-a-wig/addons/page';
import { BuildWigCustomizeEditAccessGate } from './components/buildWig/BuildWigCustomizeEditAccessGate';
import { lazy, Suspense } from 'react';
import LoadingScreen from './components/base/LoadingScreen';
import AdminGuard from './components/AdminGuard';
import AdminStudioWorkspaceGuard from './components/AdminStudioWorkspaceGuard';
import StudioAdministrationGuard from './components/admin/studio-os/StudioAdministrationGuard';
import StudioWorkspaceGuard from './components/admin/studio-os/StudioWorkspaceGuard';
import AccountRouteGuard from './components/AccountRouteGuard';
import { AccountHubRedirect } from './components/AccountHubRedirect';
import CommerceRouteGuard from './components/CommerceRouteGuard';
import MembershipRouteSync from './components/MembershipRouteSync';
import AccountCommerceSync from './components/AccountCommerceSync';
import HomeLandingRedirect from './components/HomeLandingRedirect';
import ProductInventorySync from './components/ProductInventorySync';
import { PsaChatCopyBootstrap } from './components/psa/PsaChatCopyBootstrap';
import { DebugModeShell } from './components/debug-mode/DebugModeShell';
import CreativePreviewBanner from './components/CreativePreviewBanner';
import { DesktopRouteShell } from './components/desktop-preview/DesktopRouteShell';
import { DesktopRoomTitlePlacementEditorProvider } from './components/desktop-lobby/DesktopRoomTitlePlacementEditorContext';
import { DesktopRoomTitlePlacementEditorPanel } from './components/desktop-lobby/DesktopRoomTitlePlacementEditorPanel';
import { DesktopLoungeTvFrameEditorProvider } from './components/desktop-lobby/DesktopLoungeTvFrameEditorContext';
import { DesktopLoungeTvFrameEditorPanel } from './components/desktop-lobby/DesktopLoungeTvFrameEditorPanel';
import { DesktopPsaSuiteFrameEditorProvider } from './components/desktop-lobby/DesktopPsaSuiteFrameEditorContext';
import { DesktopPsaSuiteFrameEditorPanel } from './components/desktop-lobby/DesktopPsaSuiteFrameEditorPanel';
import { PerspectivePanelDebugProvider } from './components/perspective-panel/PerspectivePanelDebugProvider';
import { MansionDebugControlPanel, MansionDebugProvider } from './components/desktop-mansion-debug';
import './components/desktop-mansion-debug/MansionDebug.css';
import { PerspectivePanelDebugToolbar } from './components/perspective-panel/PerspectivePanelDebugToolbar';
import { PerspectivePanelFounderBootstrap } from './components/perspective-panel/PerspectivePanelFounderBootstrap';
import { clearTestDataForNonAdminUserIfNeeded } from './utils/clearTestDataForNonAdmin';
import { ensureAuthRestoredFromBackup, persistAuthBackup, isSignedIn } from './utils/adminAuth';
import { seedShoppingBagMockCartIfEmpty } from './utils/shoppingBagMockCart';
import { schedulePushCartWishlistToCloud } from './utils/pushCartWishlistToCloud';
import { flushQueuedProfilePatch } from './utils/profileSyncQueue';
import { registerGlobalClientActivityListeners } from './utils/clientActivityBootstrap';
import { startLivePresenceHeartbeat } from './utils/livePresenceHeartbeat';
import {
  forceReloadForStaleChunks,
  isDynamicImportChunkFailure,
  reloadForStaleChunks,
} from './utils/chunkLoadRecovery';
import { isQuotaExceededError } from './utils/safeLocalStorage';
import { resetLocalStudioCache } from './utils/studioOsBrowserStorage';
import { isCreativePreviewMode, seedCreativePreviewDemoSession } from './utils/creativePreviewMode';
import { isDesktopPreviewWrapperPath } from './utils/desktopPreview';
import { DesktopTowerNavProvider } from './components/desktop-tower/DesktopTowerNavProvider';
import { MobileMansionRoutes } from './routes/MobileMansionRoutes';
import { BAW_TUTORIAL_ROUTE, normalizeBawViewPathname } from './constants/bawTutorialConfig';
import { TutorialOsProvider, TutorialOsPsaGate } from './tutorial-os';
import { VisionEngineProvider } from './components/vision-engine/runtime';
import { VisionEngineDebugGate } from './components/vision-engine/runtime/VisionEngineDebugGate';
import './components/vision-engine/runtime/vision-engine.css';

/** Lazy route imports with retries for chunk/network failures (common after deploys). */
const lazyWithRetry = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => {
    const retryImport = async (retries = 4, delay = 1000): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          return await importFn();
        } catch (error: unknown) {
          const chunkFail = isDynamicImportChunkFailure(error);

          if (chunkFail && i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            if (typeof window !== 'undefined' && 'caches' in window) {
              try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((name) => caches.delete(name)));
              } catch {
                // ignore
              }
            }
            continue;
          }
          if (chunkFail) {
            if (reloadForStaleChunks()) {
              return new Promise(() => {
                /* page reload in progress */
              });
            }
            throw error instanceof Error ? error : new Error(`Failed to load ${componentName}`);
          }
          throw error instanceof Error ? error : new Error(`Failed to load ${componentName}`);
        }
      }
      throw new Error(`Failed to load ${componentName} after ${retries} attempts`);
    };
    return retryImport();
  });
};

// Use lazy loading for admin pages and noir page (like canonical backup)
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/dashboard/page'), 'AdminDashboard');
const AdminBrand = lazyWithRetry(() => import('./pages/admin/brand/page'), 'AdminBrand');
const AdminClients = lazyWithRetry(() => import('./pages/admin/clients/page'), 'AdminClients');
const AdminDeletedAccounts = lazyWithRetry(() => import('./pages/admin/clients/deleted/page'), 'AdminDeletedAccounts');
const AdminMeetings = lazyWithRetry(() => import('./pages/admin/meetings/page'), 'AdminMeetings');
const AdminMeetingsSchedule = lazyWithRetry(() => import('./pages/admin/meetings/schedule/page'), 'AdminMeetingsSchedule');
const AdminPending = lazyWithRetry(() => import('./pages/admin/pending/page'), 'AdminPending');
const AdminRevenue = lazyWithRetry(() => import('./pages/admin/revenue/page'), 'AdminRevenue');
const AdminAccountingReport = lazyWithRetry(() => import('./pages/admin/revenue/accounting-report/page'), 'AdminAccountingReport');
const AdminFulfilledOrders = lazyWithRetry(() => import('./pages/admin/revenue/fulfilled-orders/page'), 'AdminFulfilledOrders');
const AdminFraudAnalysis = lazyWithRetry(() => import('./pages/admin/revenue/fraud-analysis/page'), 'AdminFraudAnalysis');
const AdminEditInventory = lazyWithRetry(() => import('./pages/admin/revenue/edit-inventory/page'), 'AdminEditInventory');
const AdminViewWaitlist = lazyWithRetry(() => import('./pages/admin/revenue/view-waitlist/page'), 'AdminViewWaitlist');
const AdminReviews = lazyWithRetry(() => import('./pages/admin/reviews/page'), 'AdminReviews');
const AdminReferrals = lazyWithRetry(() => import('./pages/admin/referrals/page'), 'AdminReferrals');
const AdminAnalytics = lazyWithRetry(() => import('./pages/admin/analytics/page'), 'AdminAnalytics');
const AdminUsers = lazyWithRetry(() => import('./pages/admin/users/page'), 'AdminUsers');
const AdminNotifications = lazyWithRetry(() => import('./pages/admin/notifications/page'), 'AdminNotifications');
const AdminMessages = lazyWithRetry(() => import('./pages/admin/messages/page'), 'AdminMessages');
const AdminAlerts = lazyWithRetry(() => import('./pages/admin/alerts/page'), 'AdminAlerts');
const AdminAudit = lazyWithRetry(() => import('./pages/admin/audit/page'), 'AdminAudit');
const AdminSpecialOffer = lazyWithRetry(() => import('./pages/admin/special-offer/page'), 'AdminSpecialOffer');
const AdminWorkers = lazyWithRetry(() => import('./pages/admin/workers/page'), 'AdminWorkers');
const AdminBackend = lazyWithRetry(() => import('./pages/admin/backend/page'), 'AdminBackend');
const AdminStudio = lazyWithRetry(() => import('./pages/admin/studio/page'), 'AdminStudio');
const AdminStudioSection = lazyWithRetry(() => import('./pages/admin/studio/section/page'), 'AdminStudioSection');
const AdminStudioShows = lazyWithRetry(() => import('./pages/admin/studio/shows/page'), 'AdminStudioShows');
const AdminStudioShowDetail = lazyWithRetry(() => import('./pages/admin/studio/shows/detail/page'), 'AdminStudioShowDetail');
const AdminStudioContentPacks = lazyWithRetry(() => import('./pages/admin/studio/content-packs/page'), 'AdminStudioContentPacks');
const AdminStudioContentPackDetail = lazyWithRetry(() => import('./pages/admin/studio/content-packs/detail/page'), 'AdminStudioContentPackDetail');
const AdminStudioAiStudio = lazyWithRetry(() => import('./pages/admin/studio/ai-studio/page'), 'AdminStudioAiStudio');
const AdminStudioPromptLibrary = lazyWithRetry(() => import('./pages/admin/studio/prompt-library/page'), 'AdminStudioPromptLibrary');
const AdminStudioAssetLibrary = lazyWithRetry(() => import('./pages/admin/studio/asset-library/page'), 'AdminStudioAssetLibrary');
const AdminStudioPublishingQueue = lazyWithRetry(() => import('./pages/admin/studio/publishing-queue/page'), 'AdminStudioPublishingQueue');
const AdminStudioAnalytics = lazyWithRetry(() => import('./pages/admin/studio/analytics/page'), 'AdminStudioAnalytics');
const AdminStudioContentBrain = lazyWithRetry(() => import('./pages/admin/studio/content-brain/page'), 'AdminStudioContentBrain');
const AdminStudioContentBrainSection = lazyWithRetry(() => import('./pages/admin/studio/content-brain/section/page'), 'AdminStudioContentBrainSection');
const AdminStudioCreativeDirector = lazyWithRetry(() => import('./pages/admin/studio/creative-director/page'), 'AdminStudioCreativeDirector');
const AdminStudioIntelligenceEngine = lazyWithRetry(() => import('./pages/admin/studio/intelligence-engine/page'), 'AdminStudioIntelligenceEngine');
const AdminStudioAiOrchestrator = lazyWithRetry(() => import('./pages/admin/studio/ai-orchestrator/page'), 'AdminStudioAiOrchestrator');
const AdminStudioShowBible = lazyWithRetry(() => import('./pages/admin/studio/show-bible/page'), 'AdminStudioShowBible');
const AdminStudioShowBibleDetail = lazyWithRetry(() => import('./pages/admin/studio/show-bible/detail/page'), 'AdminStudioShowBibleDetail');
const AdminStudioLot = lazyWithRetry(() => import('./pages/admin/studio/studio-lot/page'), 'AdminStudioLot');
const AdminStudioLotDetail = lazyWithRetry(() => import('./pages/admin/studio/studio-lot/detail/page'), 'AdminStudioLotDetail');
const AdminStudioTalentAgency = lazyWithRetry(() => import('./pages/admin/studio/talent-agency/page'), 'AdminStudioTalentAgency');
const AdminStudioTalentAgencyDetail = lazyWithRetry(() => import('./pages/admin/studio/talent-agency/detail/page'), 'AdminStudioTalentAgencyDetail');
const AdminStudioCasting = lazyWithRetry(() => import('./pages/admin/studio/casting/page'), 'AdminStudioCasting');
const AdminStudioCastingProduction = lazyWithRetry(() => import('./pages/admin/studio/casting/detail/page'), 'AdminStudioCastingProduction');
const AdminStudioCastingTalent = lazyWithRetry(() => import('./pages/admin/studio/casting/talent/page'), 'AdminStudioCastingTalent');
const AdminStudioProduction = lazyWithRetry(() => import('./pages/admin/studio/production/page'), 'AdminStudioProduction');
const AdminStudioProductionDetail = lazyWithRetry(() => import('./pages/admin/studio/production/detail/page'), 'AdminStudioProductionDetail');
const AdminStudioAiProductionEngine = lazyWithRetry(() => import('./pages/admin/studio/ai-production-engine/page'), 'AdminStudioAiProductionEngine');
const AdminStudioAiProductionEngineDetail = lazyWithRetry(() => import('./pages/admin/studio/ai-production-engine/detail/page'), 'AdminStudioAiProductionEngineDetail');
const AdminStudioDistributionNetwork = lazyWithRetry(() => import('./pages/admin/studio/distribution-network/page'), 'AdminStudioDistributionNetwork');
const AdminStudioDistributionNetworkDetail = lazyWithRetry(() => import('./pages/admin/studio/distribution-network/detail/page'), 'AdminStudioDistributionNetworkDetail');
const AdminStudioDistributionNetworkChannel = lazyWithRetry(() => import('./pages/admin/studio/distribution-network/channel/page'), 'AdminStudioDistributionNetworkChannel');
const AdminStudioAudienceBrain = lazyWithRetry(() => import('./pages/admin/studio/audience-brain/page'), 'AdminStudioAudienceBrain');
const AdminStudioAudienceBrainIntelligence = lazyWithRetry(() => import('./pages/admin/studio/audience-brain/intelligence/page'), 'AdminStudioAudienceBrainIntelligence');
const AdminStudioGrowthNetwork = lazyWithRetry(() => import('./pages/admin/studio/growth-network/page'), 'AdminStudioGrowthNetwork');
const AdminStudioLabs = lazyWithRetry(() => import('./pages/admin/studio/labs/page'), 'AdminStudioLabs');
const AdminStudioAiMediaNetwork = lazyWithRetry(() => import('./pages/admin/studio/ai-media-network/page'), 'AdminStudioAiMediaNetwork');
const AdminStudioNdxbook = lazyWithRetry(() => import('./pages/admin/studio/ndxbook/page'), 'AdminStudioNdxbook');
const AdminStudioNdxbookMissionControl = lazyWithRetry(() => import('./pages/admin/studio/ndxbook/mission-control/page'), 'AdminStudioNdxbookMissionControl');
const AdminStudioTalentNetwork = lazyWithRetry(() => import('./pages/admin/studio/talent-network/page'), 'AdminStudioTalentNetwork');
const AdminStudioMarketplace = lazyWithRetry(() => import('./pages/admin/studio/marketplace/page'), 'AdminStudioMarketplace');
const AdminStudioBusinessModelEngine = lazyWithRetry(() => import('./pages/admin/studio/business-model-engine/page'), 'AdminStudioBusinessModelEngine');
const AdminStudioEcosystem = lazyWithRetry(() => import('./pages/admin/studio/ecosystem/page'), 'AdminStudioEcosystem');
const AdminStudioExpansionCenter = lazyWithRetry(() => import('./pages/admin/studio/expansion-center/page'), 'AdminStudioExpansionCenter');
const AdminStudioBusinessDiscoveryBlueprint = lazyWithRetry(() => import('./pages/admin/studio/business-discovery-blueprint/page'), 'AdminStudioBusinessDiscoveryBlueprint');
const AdminStudioOrganizationInauguration = lazyWithRetry(() => import('./pages/admin/studio/organization-inauguration/page'), 'AdminStudioOrganizationInauguration');
const AdminStudioProfessionBrain = lazyWithRetry(() => import('./pages/admin/studio/profession-brain/page'), 'AdminStudioProfessionBrain');
const AdminStudioExpertMarketplace = lazyWithRetry(() => import('./pages/admin/studio/expert-marketplace/page'), 'AdminStudioExpertMarketplace');
const AdminStudioKnowledgeCommerce = lazyWithRetry(() => import('./pages/admin/studio/knowledge-commerce/page'), 'AdminStudioKnowledgeCommerce');
const AdminStudioProfessionalTrustFramework = lazyWithRetry(() => import('./pages/admin/studio/professional-trust-framework/page'), 'AdminStudioProfessionalTrustFramework');
const AdminStudioOrganizationGenome = lazyWithRetry(() => import('./pages/admin/studio/organization-genome/page'), 'AdminStudioOrganizationGenome');
const AdminStudioMemoryEngine = lazyWithRetry(() => import('./pages/admin/studio/memory-engine/page'), 'AdminStudioMemoryEngine');
const AdminStudioCompanyHealthIndex = lazyWithRetry(() => import('./pages/admin/studio/company-health-index/page'), 'AdminStudioCompanyHealthIndex');
const AdminStudioOrganizationPulse = lazyWithRetry(() => import('./pages/admin/studio/organization-pulse/page'), 'AdminStudioOrganizationPulse');
const AdminStudioWisdomCapture = lazyWithRetry(() => import('./pages/admin/studio/wisdom-capture/page'), 'AdminStudioWisdomCapture');
const AdminStudioShadowMode = lazyWithRetry(() => import('./pages/admin/studio/shadow-mode/page'), 'AdminStudioShadowMode');
const AdminStudioOrganizationDigitalTwin = lazyWithRetry(() => import('./pages/admin/studio/organization-digital-twin/page'), 'AdminStudioOrganizationDigitalTwin');
const AdminStudioBusinessSimulationLab = lazyWithRetry(() => import('./pages/admin/studio/business-simulation-lab/page'), 'AdminStudioBusinessSimulationLab');
const AdminStudioKnowledgeConfidence = lazyWithRetry(() => import('./pages/admin/studio/knowledge-confidence/page'), 'AdminStudioKnowledgeConfidence');
const AdminStudioLegacyVault = lazyWithRetry(() => import('./pages/admin/studio/legacy-vault/page'), 'AdminStudioLegacyVault');
const AdminStudioAmbientAwareness = lazyWithRetry(() => import('./pages/admin/studio/ambient-awareness/page'), 'AdminStudioAmbientAwareness');
const AdminStudioAnticipationEngine = lazyWithRetry(() => import('./pages/admin/studio/anticipation-engine/page'), 'AdminStudioAnticipationEngine');
const AdminStudioFounderCognitiveLoad = lazyWithRetry(() => import('./pages/admin/studio/founder-cognitive-load/page'), 'AdminStudioFounderCognitiveLoad');
const AdminStudioPresenceEngine = lazyWithRetry(() => import('./pages/admin/studio/presence-engine/page'), 'AdminStudioPresenceEngine');
const AdminStudioCrossOrgIntelligence = lazyWithRetry(() => import('./pages/admin/studio/cross-organization-intelligence/page'), 'AdminStudioCrossOrgIntelligence');
const AdminStudioRelationshipMemory = lazyWithRetry(() => import('./pages/admin/studio/relationship-memory/page'), 'AdminStudioRelationshipMemory');
const AdminStudioPredictiveOrganization = lazyWithRetry(() => import('./pages/admin/studio/predictive-organization/page'), 'AdminStudioPredictiveOrganization');
const AdminStudioAutonomousPreparation = lazyWithRetry(() => import('./pages/admin/studio/autonomous-preparation/page'), 'AdminStudioAutonomousPreparation');
const AdminStudioOrganizationalConsciousness = lazyWithRetry(() => import('./pages/admin/studio/organizational-consciousness/page'), 'AdminStudioOrganizationalConsciousness');
const AdminStudioWorldKnowledgeEngine = lazyWithRetry(() => import('./pages/admin/studio/world-knowledge-engine/page'), 'AdminStudioWorldKnowledgeEngine');
const AdminStudioFounderOperatingSystem = lazyWithRetry(() => import('./pages/admin/studio/founder-operating-system/page'), 'AdminStudioFounderOperatingSystem');
const AdminStudioInnovationLab = lazyWithRetry(() => import('./pages/admin/studio/innovation-lab/page'), 'AdminStudioInnovationLab');
const AdminStudioOrganizationOperatingManual = lazyWithRetry(() => import('./pages/admin/studio/organization-operating-manual/page'), 'AdminStudioOrganizationOperatingManual');
const AdminStudioLegacyNetwork = lazyWithRetry(() => import('./pages/admin/studio/legacy-network/page'), 'AdminStudioLegacyNetwork');
const AdminStudioStudioIntelligenceArchitecture = lazyWithRetry(
  () => import('./pages/admin/studio/studio-intelligence-architecture/page'),
  'AdminStudioStudioIntelligenceArchitecture'
);
const AdminStudioModelOrchestrator = lazyWithRetry(
  () => import('./pages/admin/studio/model-orchestrator/page'),
  'AdminStudioModelOrchestrator'
);
const AdminStudioStudioFoundationModels = lazyWithRetry(
  () => import('./pages/admin/studio/studio-foundation-models/page'),
  'AdminStudioStudioFoundationModels'
);
const AdminStudioDocumentationRegistry = lazyWithRetry(
  () => import('./pages/admin/studio/documentation-registry/page'),
  'AdminStudioDocumentationRegistry'
);
const AdminStudioDocumentationGovernance = lazyWithRetry(
  () => import('./pages/admin/studio/documentation-governance/page'),
  'AdminStudioDocumentationGovernance'
);
const AdminStudioSystemRegistry = lazyWithRetry(
  () => import('./pages/admin/studio/system-registry/page'),
  'AdminStudioSystemRegistry'
);
const AdminStudioComponentRegistry = lazyWithRetry(
  () => import('./pages/admin/studio/component-registry/page'),
  'AdminStudioComponentRegistry'
);
const AdminStudioDesignTokenEngine = lazyWithRetry(
  () => import('./pages/admin/studio/design-token-engine/page'),
  'AdminStudioDesignTokenEngine'
);
const AdminStudioInteractionEngine = lazyWithRetry(
  () => import('./pages/admin/studio/interaction-engine/page'),
  'AdminStudioInteractionEngine'
);
const AdminStudioEventBus = lazyWithRetry(
  () => import('./pages/admin/studio/event-bus/page'),
  'AdminStudioEventBus'
);
const AdminStudioAutomationRegistry = lazyWithRetry(
  () => import('./pages/admin/studio/automation-registry/page'),
  'AdminStudioAutomationRegistry'
);
const AdminStudioPromptRegistry = lazyWithRetry(
  () => import('./pages/admin/studio/prompt-registry/page'),
  'AdminStudioPromptRegistry'
);
const AdminStudioPolicyEngine = lazyWithRetry(
  () => import('./pages/admin/studio/policy-engine/page'),
  'AdminStudioPolicyEngine'
);
const AdminStudioPermissionEngine = lazyWithRetry(
  () => import('./pages/admin/studio/permission-engine/page'),
  'AdminStudioPermissionEngine'
);
const AdminStudioWorkspaceRuntime = lazyWithRetry(
  () => import('./pages/admin/studio/workspace-runtime/page'),
  'AdminStudioWorkspaceRuntime'
);
const AdminStudioPluginSdk = lazyWithRetry(
  () => import('./pages/admin/studio/plugin-sdk/page'),
  'AdminStudioPluginSdk'
);
const AdminStudioWorkflowEngine = lazyWithRetry(
  () => import('./pages/admin/studio/workflow-engine/page'),
  'AdminStudioWorkflowEngine'
);
const AdminStudioStateEngine = lazyWithRetry(
  () => import('./pages/admin/studio/state-engine/page'),
  'AdminStudioStateEngine'
);
const AdminStudioAssetRegistry = lazyWithRetry(
  () => import('./pages/admin/studio/asset-registry/page'),
  'AdminStudioAssetRegistry'
);
const AdminStudioExperienceEngine = lazyWithRetry(
  () => import('./pages/admin/studio/experience-engine/page'),
  'AdminStudioExperienceEngine'
);
const AdminStudioQaHeadquarters = lazyWithRetry(
  () => import('./pages/admin/studio/qa-headquarters/page'),
  'AdminStudioQaHeadquarters'
);
const AdminStudioQaInspector = lazyWithRetry(
  () => import('./pages/admin/studio/qa-inspector/page'),
  'AdminStudioQaInspector'
);
const AdminStudioQaSimulationEngine = lazyWithRetry(
  () => import('./pages/admin/studio/qa-simulation-engine/page'),
  'AdminStudioQaSimulationEngine'
);
const AdminStudioAiRedTeam = lazyWithRetry(
  () => import('./pages/admin/studio/ai-red-team/page'),
  'AdminStudioAiRedTeam'
);
const AdminStudioExecutiveTrustDashboard = lazyWithRetry(
  () => import('./pages/admin/studio/executive-trust-dashboard/page'),
  'AdminStudioExecutiveTrustDashboard'
);
const AdminStudioTimeMachine = lazyWithRetry(
  () => import('./pages/admin/studio/time-machine/page'),
  'AdminStudioTimeMachine'
);
const AdminStudioPredictiveQa = lazyWithRetry(
  () => import('./pages/admin/studio/predictive-qa/page'),
  'AdminStudioPredictiveQa'
);
const AdminStudioSuccessionMode = lazyWithRetry(() => import('./pages/admin/studio/succession-mode/page'), 'AdminStudioSuccessionMode');
const AdminStudioGovernance = lazyWithRetry(() => import('./pages/admin/studio/governance/page'), 'AdminStudioGovernance');
const AdminStudioIntelligence = lazyWithRetry(() => import('./pages/admin/studio/studio-intelligence/page'), 'AdminStudioIntelligence');
const AdminStudioSimulationEngine = lazyWithRetry(() => import('./pages/admin/studio/simulation-engine/page'), 'AdminStudioSimulationEngine');
const AdminStudioVisionEngine = lazyWithRetry(() => import('./pages/admin/studio/vision-engine/page'), 'AdminStudioVisionEngine');
const VisionSharePage = lazyWithRetry(() => import('./pages/vision/page'), 'VisionSharePage');
const AdminStudioExecutiveCommandCenter = lazyWithRetry(() => import('./pages/admin/studio/executive-command-center/page'), 'AdminStudioExecutiveCommandCenter');
const AdminStudioOverview = lazyWithRetry(() => import('./pages/admin/studio/overview/page'), 'AdminStudioOverview');
const AdminStudioLegacySystem = lazyWithRetry(() => import('./pages/admin/studio/legacy-system/page'), 'AdminStudioLegacySystem');
const AdminStudioLegacySystemMuseum = lazyWithRetry(() => import('./pages/admin/studio/legacy-system/museum/page'), 'AdminStudioLegacySystemMuseum');
const AdminStudioSocialAccounts = lazyWithRetry(() => import('./pages/admin/studio/social-accounts/page'), 'AdminStudioSocialAccounts');
const AdminStudioAssetDirector = lazyWithRetry(() => import('./pages/admin/studio/asset-director/page'), 'AdminStudioAssetDirector');
const AdminStudioAssetDirectorStudios = lazyWithRetry(() => import('./pages/admin/studio/asset-director/studios/page'), 'AdminStudioAssetDirectorStudios');
const AdminStudioAssetDirectorStudioDetail = lazyWithRetry(() => import('./pages/admin/studio/asset-director/studios/detail/page'), 'AdminStudioAssetDirectorStudioDetail');
const AdminStudioAssetDirectorTalent = lazyWithRetry(() => import('./pages/admin/studio/asset-director/talent/page'), 'AdminStudioAssetDirectorTalent');
const AdminStudioAssetDirectorTalentDetail = lazyWithRetry(() => import('./pages/admin/studio/asset-director/talent/detail/page'), 'AdminStudioAssetDirectorTalentDetail');
const AdminStudioAssetDirectorSection = lazyWithRetry(() => import('./pages/admin/studio/asset-director/section/page'), 'AdminStudioAssetDirectorSection');
const AdminStudioProductionBuilder = lazyWithRetry(() => import('./pages/admin/studio/production-builder/page'), 'AdminStudioProductionBuilder');
const AdminStudioDirectorMode = lazyWithRetry(() => import('./pages/admin/studio/director-mode/page'), 'AdminStudioDirectorMode');
const AdminStudioExecutiveAiDirector = lazyWithRetry(() => import('./pages/admin/studio/executive-ai-director/page'), 'AdminStudioExecutiveAiDirector');
const AdminStudioCampaignOrchestrator = lazyWithRetry(() => import('./pages/admin/studio/campaign-orchestrator/page'), 'AdminStudioCampaignOrchestrator');
const AdminStudioAssetFactory = lazyWithRetry(() => import('./pages/admin/studio/asset-factory/page'), 'AdminStudioAssetFactory');
const AdminStudioBlueprintManager = lazyWithRetry(() => import('./pages/admin/studio/blueprint-manager/page'), 'AdminStudioBlueprintManager');
const AdminStudioBlueprintDetail = lazyWithRetry(() => import('./pages/admin/studio/blueprint-manager/detail/page'), 'AdminStudioBlueprintDetail');
const AdminStudioMissionControl = lazyWithRetry(() => import('./pages/admin/studio/mission-control/page'), 'AdminStudioMissionControl');
const AdminStudioChiefOfStaff = lazyWithRetry(() => import('./pages/admin/studio/chief-of-staff/page'), 'AdminStudioChiefOfStaff');
const AdminStudioExecutiveOrganization = lazyWithRetry(() => import('./pages/admin/studio/executive-organization/page'), 'AdminStudioExecutiveOrganization');
const AdminStudioOrganizationalInheritance = lazyWithRetry(() => import('./pages/admin/studio/organizational-inheritance/page'), 'AdminStudioOrganizationalInheritance');
const AdminStudioStrategyEngine = lazyWithRetry(() => import('./pages/admin/studio/strategy-engine/page'), 'AdminStudioStrategyEngine');
const AdminStudioCampaignEngine = lazyWithRetry(() => import('./pages/admin/studio/campaign-engine/page'), 'AdminStudioCampaignEngine');
const AdminStudioWorkOrchestration = lazyWithRetry(() => import('./pages/admin/studio/work-orchestration/page'), 'AdminStudioWorkOrchestration');
const AdminStudioDistributionEngine = lazyWithRetry(() => import('./pages/admin/studio/distribution-engine/page'), 'AdminStudioDistributionEngine');
const AdminStudioReaderGraph = lazyWithRetry(() => import('./pages/admin/studio/reader-graph/page'), 'AdminStudioReaderGraph');
const AdminStudioRelationshipEngine = lazyWithRetry(() => import('./pages/admin/studio/relationship-engine/page'), 'AdminStudioRelationshipEngine');
const AdminStudioCreatorMarketplace = lazyWithRetry(() => import('./pages/admin/studio/creator-marketplace/page'), 'AdminStudioCreatorMarketplace');
const AdminStudioEcosystemMarketplace = lazyWithRetry(() => import('./pages/admin/studio/ecosystem-marketplace/page'), 'AdminStudioEcosystemMarketplace');
const AdminStudioKnowledgeAssetEngine = lazyWithRetry(() => import('./pages/admin/studio/knowledge-asset-engine/page'), 'AdminStudioKnowledgeAssetEngine');
const AdminStudioCompanyMaturityEngine = lazyWithRetry(() => import('./pages/admin/studio/company-maturity-engine/page'), 'AdminStudioCompanyMaturityEngine');
const AdminStudioBrandArchitect = lazyWithRetry(() => import('./pages/admin/studio/brand-architect/page'), 'AdminStudioBrandArchitect');
const AdminStudioExperienceArchitect = lazyWithRetry(() => import('./pages/admin/studio/experience-architect/page'), 'AdminStudioExperienceArchitect');
const AdminStudioDigitalArchitect = lazyWithRetry(() => import('./pages/admin/studio/digital-architect/page'), 'AdminStudioDigitalArchitect');
const AdminStudioGrowthArchitect = lazyWithRetry(() => import('./pages/admin/studio/growth-architect/page'), 'AdminStudioGrowthArchitect');
const AdminStudioCompanyGenome = lazyWithRetry(() => import('./pages/admin/studio/company-genome/page'), 'AdminStudioCompanyGenome');
const AdminStudioArchitectStudio = lazyWithRetry(() => import('./pages/admin/studio/architect-studio/page'), 'AdminStudioArchitectStudio');
const AdminStudioCampusEvolutionEngine = lazyWithRetry(() => import('./pages/admin/studio/campus-evolution-engine/page'), 'AdminStudioCampusEvolutionEngine');
const AdminStudioFounderWalk = lazyWithRetry(() => import('./pages/admin/studio/founder-walk/page'), 'AdminStudioFounderWalk');
const AdminStudioRemembranceGarden = lazyWithRetry(() => import('./pages/admin/studio/remembrance-garden/page'), 'AdminStudioRemembranceGarden');
const AdminStudioFoundersPromise = lazyWithRetry(() => import('./pages/admin/studio/founders-promise/page'), 'AdminStudioFoundersPromise');
const AdminStudioExecutiveFramework = lazyWithRetry(() => import('./pages/admin/studio/executive-framework/page'), 'AdminStudioExecutiveFramework');
const AdminStudioLeadershipManifestoFramework = lazyWithRetry(() => import('./pages/admin/studio/leadership-manifesto-framework/page'), 'AdminStudioLeadershipManifestoFramework');
const AdminStudioChiefBrandOfficer = lazyWithRetry(() => import('./pages/admin/studio/chief-brand-officer/page'), 'AdminStudioChiefBrandOfficer');
const AdminStudioChiefExperienceOfficer = lazyWithRetry(() => import('./pages/admin/studio/chief-experience-officer/page'), 'AdminStudioChiefExperienceOfficer');
const AdminStudioChiefDigitalOfficer = lazyWithRetry(() => import('./pages/admin/studio/chief-digital-officer/page'), 'AdminStudioChiefDigitalOfficer');
const AdminStudioChiefTechnologyOfficer = lazyWithRetry(() => import('./pages/admin/studio/chief-technology-officer/page'), 'AdminStudioChiefTechnologyOfficer');
const AdminStudioChiefGrowthOfficer = lazyWithRetry(() => import('./pages/admin/studio/chief-growth-officer/page'), 'AdminStudioChiefGrowthOfficer');
const AdminStudioExecutiveCouncil = lazyWithRetry(() => import('./pages/admin/studio/executive-council/page'), 'AdminStudioExecutiveCouncil');
const AdminStudioOrganizationalIntelligence = lazyWithRetry(() => import('./pages/admin/studio/organizational-intelligence/page'), 'AdminStudioOrganizationalIntelligence');
const AdminStudioOrganizationalAutonomyFramework = lazyWithRetry(() => import('./pages/admin/studio/organizational-autonomy-framework/page'), 'AdminStudioOrganizationalAutonomyFramework');
const AdminStudioOrganizationalDelegationEngine = lazyWithRetry(() => import('./pages/admin/studio/organizational-delegation-engine/page'), 'AdminStudioOrganizationalDelegationEngine');
const AdminStudioOrganizationalWorkflowOrchestration = lazyWithRetry(() => import('./pages/admin/studio/organizational-workflow-orchestration/page'), 'AdminStudioOrganizationalWorkflowOrchestration');
const AdminStudioOrganizationalSelfImprovement = lazyWithRetry(() => import('./pages/admin/studio/organizational-self-improvement/page'), 'AdminStudioOrganizationalSelfImprovement');
const AdminStudioOrganizationalGovernanceSafeguards = lazyWithRetry(() => import('./pages/admin/studio/organizational-governance-safeguards/page'), 'AdminStudioOrganizationalGovernanceSafeguards');
const AdminStudioOrganizationalMaturityModel = lazyWithRetry(() => import('./pages/admin/studio/organizational-maturity-model/page'), 'AdminStudioOrganizationalMaturityModel');
const AdminStudioLeadershipModes = lazyWithRetry(() => import('./pages/admin/studio/leadership-modes/page'), 'AdminStudioLeadershipModes');
const AdminStudioCompanyOnboardingIntelligence = lazyWithRetry(() => import('./pages/admin/studio/company-onboarding-intelligence/page'), 'AdminStudioCompanyOnboardingIntelligence');
const AdminStudioArrivalExperience = lazyWithRetry(() => import('./pages/admin/studio/arrival-experience/page'), 'AdminStudioArrivalExperience');
const AdminStudioExecutiveApprenticeshipFounderCalibration = lazyWithRetry(() => import('./pages/admin/studio/executive-apprenticeship-founder-calibration/page'), 'AdminStudioExecutiveApprenticeshipFounderCalibration');
const AdminStudioStudioInstitute = lazyWithRetry(() => import('./pages/admin/studio/studio-institute/page'), 'AdminStudioStudioInstitute');
const AdminStudioOrganizationalApprenticeship = lazyWithRetry(() => import('./pages/admin/studio/organizational-apprenticeship/page'), 'AdminStudioOrganizationalApprenticeship');
const AdminStudioConciergeLayer = lazyWithRetry(() => import('./pages/admin/studio/concierge-layer/page'), 'AdminStudioConciergeLayer');
const AdminStudioProductionStudio = lazyWithRetry(() => import('./pages/admin/studio/production-studio/page'), 'AdminStudioProductionStudio');
const AdminStudioRenderQueue = lazyWithRetry(() => import('./pages/admin/studio/render-queue/page'), 'AdminStudioRenderQueue');
const AdminStudioScreeningRoom = lazyWithRetry(() => import('./pages/admin/studio/screening-room/page'), 'AdminStudioScreeningRoom');
const AdminStudioConciergeApprovalFlow = lazyWithRetry(() => import('./pages/admin/studio/concierge-approval-flow/page'), 'AdminStudioConciergeApprovalFlow');
const AdminStudioDesignDnaCanon = lazyWithRetry(() => import('./pages/admin/studio/design-dna-canon/page'), 'AdminStudioDesignDnaCanon');
const AdminStudioDesignGenome = lazyWithRetry(() => import('./pages/admin/studio/design-genome/page'), 'AdminStudioDesignGenome');
const AdminStudioExecutiveTimeline = lazyWithRetry(() => import('./pages/admin/studio/executive-timeline/page'), 'AdminStudioExecutiveTimeline');
const AdminStudioLeadershipDna = lazyWithRetry(() => import('./pages/admin/studio/leadership-dna/page'), 'AdminStudioLeadershipDna');
const AdminStudioKnowledgeHub = lazyWithRetry(() => import('./pages/admin/studio/knowledge-hub/page'), 'AdminStudioKnowledgeHub');
const AdminStudioKnowledgeHubProfile = lazyWithRetry(() => import('./pages/admin/studio/knowledge-hub/profile/page'), 'AdminStudioKnowledgeHubProfile');
const AdminStudioKnowledgeHubWorkflow = lazyWithRetry(() => import('./pages/admin/studio/knowledge-hub/workflow/page'), 'AdminStudioKnowledgeHubWorkflow');
const AdminStudioMemoryBible = lazyWithRetry(() => import('./pages/admin/studio/memory-bible/page'), 'AdminStudioMemoryBible');
const AdminStudioTutorialOs = lazyWithRetry(() => import('./pages/admin/studio/tutorial-os/page'), 'AdminStudioTutorialOs');
const AdminStudioBrandAssets = lazyWithRetry(() => import('./pages/admin/studio/brand-assets/page'), 'AdminStudioBrandAssets');
const AdminStudioPhotographyBible = lazyWithRetry(() => import('./pages/admin/studio/brand-assets/photography-bible/page'), 'AdminStudioPhotographyBible');
const AdminStudioBrandAssetsAssetFactory = lazyWithRetry(() => import('./pages/admin/studio/brand-assets/asset-factory/page'), 'AdminStudioBrandAssetsAssetFactory');
const AdminStudioOs = lazyWithRetry(() => import('./pages/admin/studio-os/page'), 'AdminStudioOs');
const AdminStudioCommandCenter = lazyWithRetry(() => import('./pages/admin/studio-os/command-center/page'), 'AdminStudioCommandCenter');
const AdminStudioPlatformModuleHost = lazyWithRetry(() => import('./pages/admin/studio-os/platform-module/host'), 'AdminStudioPlatformModuleHost');
const AdminStudioAdministration = lazyWithRetry(() => import('./pages/admin/studio-os/administration/page'), 'AdminStudioAdministration');
const AdminHeadquartersEntry = lazyWithRetry(() => import('./pages/admin/headquarters/page'), 'AdminHeadquartersEntry');
const AdminStudioOsCreate = lazyWithRetry(() => import('./pages/admin/studio-os/create/page'), 'AdminStudioOsCreate');
const AdminStudioOsBlueprints = lazyWithRetry(() => import('./pages/admin/studio-os/blueprints/page'), 'AdminStudioOsBlueprints');
const AdminStudioOsPromotionCenter = lazyWithRetry(() => import('./pages/admin/studio-os/promotion-center/page'), 'AdminStudioOsPromotionCenter');
const AdminStudioOsWorkspaceDashboard = lazyWithRetry(() => import('./pages/admin/studio-os/workspace/dashboard/page'), 'AdminStudioOsWorkspaceDashboard');
const AdminStudioOsWorkspaceNewsroom = lazyWithRetry(() => import('./pages/admin/studio-os/workspace/newsroom/page'), 'AdminStudioOsWorkspaceNewsroom');
const AdminStudioOsWorkspaceShell = lazyWithRetry(() => import('./pages/admin/studio-os/workspace/page'), 'AdminStudioOsWorkspaceShell');
const AdminStudioOsWorkspaceSettings = lazyWithRetry(() => import('./pages/admin/studio-os/workspace/settings/page'), 'AdminStudioOsWorkspaceSettings');
const AdminStudioOsWorkspaceStudioModule = lazyWithRetry(() => import('./pages/admin/studio-os/workspace/studio/WorkspaceStudioModuleHost'), 'AdminStudioOsWorkspaceStudioModule');
const AdminMarketing = lazyWithRetry(() => import('./pages/admin/marketing/page'), 'AdminMarketing');
const NoirUnitPage = lazyWithRetry(() => import('./pages/straight/noir/page'), 'NoirUnitPage');
const BlancoUnitPage = lazyWithRetry(() => import('./pages/straight/blanco/page'), 'BlancoUnitPage');
const SoftCurlUnitPage = lazyWithRetry(() => import('./pages/curly/soft-curl/page'), 'SoftCurlUnitPage');
const SoftWaveUnitPage = lazyWithRetry(() => import('./pages/wavy/soft-wave/page'), 'SoftWaveUnitPage');
const OceanCurlUnitPage = lazyWithRetry(() => import('./pages/curly/ocean-curl/page'), 'OceanCurlUnitPage');
const BeachWaveUnitPage = lazyWithRetry(() => import('./pages/wavy/beach-wave/page'), 'BeachWaveUnitPage');
const WishlistPage = lazyWithRetry(() => import('./pages/wishlist/page'), 'WishlistPage');
const ViewListsPage = lazyWithRetry(() => import('./pages/wishlist/lists/page'), 'ViewListsPage');
const SharedWishlistListPage = lazyWithRetry(
  () => import('./pages/wishlist/shared/page'),
  'SharedWishlistListPage'
);
const AccountPage = lazyWithRetry(() => import('./pages/account/page'), 'AccountPage');
const ConciergePage = lazyWithRetry(() => import('./pages/account/concierge/page'), 'ConciergePage');
const RewardsPage = lazyWithRetry(() => import('./pages/account/rewards/page'), 'RewardsPage');
const ReferralsPage = lazyWithRetry(() => import('./pages/account/referrals/page'), 'ReferralsPage');
const AffiliatePage = lazyWithRetry(() => import('./pages/account/affiliate/page'), 'AffiliatePage');
const NotificationsPage = lazyWithRetry(() => import('./pages/account/notifications/page'), 'NotificationsPage');
const ConsultOfferPage = lazyWithRetry(() => import('./pages/account/consult-offer/page'), 'ConsultOfferPage');
const LoadCardPage = lazyWithRetry(() => import('./pages/account/load-card/page'), 'LoadCardPage');
const ReviewsPage = lazyWithRetry(() => import('./pages/account/reviews/page'), 'ReviewsPage');
const LeaveReviewOrderPage = lazyWithRetry(() => import('./pages/account/reviews/leave-review-order/page'), 'LeaveReviewOrderPage');
import ShippingPage from './pages/account/shipping/page';
const PaymentPage = lazyWithRetry(() => import('./pages/account/payment/page'), 'PaymentPage');
const SettingsPage = lazyWithRetry(() => import('./pages/account/settings/page'), 'SettingsPage');
const OrdersPage = lazyWithRetry(() => import('./pages/orders/page'), 'OrdersPage');
const SignInPage = lazyWithRetry(() => import('./pages/sign-in/page'), 'SignInPage');
const ShoppingBagPage = lazyWithRetry(() => import('./pages/shopping-bag/page'), 'ShoppingBagPage');
const CheckoutPage = lazyWithRetry(() => import('./pages/checkout/page'), 'CheckoutPage');
const CheckoutConfirmPage = lazyWithRetry(() => import('./pages/checkout/confirm/page'), 'CheckoutConfirmPage');
const StraightUnitsPage = lazyWithRetry(() => import('./pages/units/straight/page'), 'StraightUnitsPage');
const WavyUnitsPage = lazyWithRetry(() => import('./pages/units/wavy/page'), 'WavyUnitsPage');
const CurlyUnitsPage = lazyWithRetry(() => import('./pages/units/curly/page'), 'CurlyUnitsPage');
const ProductsPage = lazyWithRetry(() => import('./pages/products/page'), 'ProductsPage');
const ProductsUnitsPage = lazyWithRetry(() => import('./pages/products/units/page'), 'ProductsUnitsPage');
const ToolsPage = lazyWithRetry(() => import('./pages/tools/page'), 'ToolsPage');
const SlayCamPage = lazyWithRetry(() => import('./pages/slay-cam/page'), 'SlayCamPage');
const GiftCardPage = lazyWithRetry(() => import('./pages/tools/gift-card/page'), 'GiftCardPage');
const SlayTicketsPage = lazyWithRetry(() => import('./pages/tools/slay-tickets/page'), 'SlayTicketsPage');
const SlayCardDebugPage = lazyWithRetry(() => import('./pages/tools/slay-card-debug/page'), 'SlayCardDebugPage');
const EmailTemplatesDebugPage = lazyWithRetry(() => import('./pages/tools/email-templates/page'), 'EmailTemplatesDebugPage');
const LiveTryOnPage = lazyWithRetry(() => import('./pages/tools/live-try-on/page'), 'LiveTryOnPage');
const HairstyleAnalysisDemoPage = lazyWithRetry(
  () => import('./pages/HairstyleAnalysisDemo'),
  'HairstyleAnalysisDemoPage'
);
const AdminBrandCopyEditor = lazyWithRetry(() => import('./pages/admin/brand/copy-editor/page'), 'AdminBrandCopyEditor');
const OrderFormPage = lazyWithRetry(() => import('./pages/shop/order-form/page'), 'OrderFormPage');
const ShopTextureCategoryProductPage = lazyWithRetry(
  () => import('./pages/shop/texture-category-product/page'),
  'ShopTextureCategoryProductPage'
);
const BookingConsultationPage = lazyWithRetry(() => import('./pages/booking/consultation/page'), 'BookingConsultationPage');
const BookingAppointmentPage = lazyWithRetry(() => import('./pages/booking/appointment/page'), 'BookingAppointmentPage');
const BrandPage = lazyWithRetry(() => import('./pages/brand/page'), 'BrandPage');
const BrandCareersPage = lazyWithRetry(() => import('./pages/brand/careers/page'), 'BrandCareersPage');
const DesktopPenthousePage = lazyWithRetry(() => import('./pages/desktop/penthouse/page'), 'DesktopPenthousePage');
const DesktopLobbyFloorPage = lazyWithRetry(() => import('./pages/desktop/lobby/page'), 'DesktopLobbyFloorPage');
const DesktopLoungeRedirectPage = lazyWithRetry(() => import('./pages/desktop/lounge/page'), 'DesktopLoungeRedirectPage');
const DesktopGalleryPage = lazyWithRetry(() => import('./pages/desktop/gallery/page'), 'DesktopGalleryPage');
const DesktopConciergePage = lazyWithRetry(() => import('./pages/desktop/concierge/page'), 'DesktopConciergePage');
const DesktopSlayCamRedirectPage = lazyWithRetry(() => import('./pages/desktop/slay-cam/page'), 'DesktopSlayCamRedirectPage');
const DesktopAccountPage = lazyWithRetry(() => import('./pages/desktop/account/page'), 'DesktopAccountPage');
const DesktopShoppingBagPage = lazyWithRetry(() => import('./pages/desktop/shopping-bag/page'), 'DesktopShoppingBagPage');
const DesktopAcquisitionPage = lazyWithRetry(() => import('./pages/desktop/acquisition/page'), 'DesktopAcquisitionPage');
const DesktopBookingSuitePage = lazyWithRetry(() => import('./pages/desktop/booking-suite/page'), 'DesktopBookingSuitePage');
const DesktopAlertsPage = lazyWithRetry(() => import('./pages/desktop/alerts/page'), 'DesktopAlertsPage');
const DesktopPreviewPage = lazyWithRetry(() => import('./pages/desktop-preview/page'), 'DesktopPreviewPage');

function DesktopRoutesLayout() {
  return (
    <MansionDebugProvider>
    <PerspectivePanelDebugProvider>
      <PerspectivePanelFounderBootstrap />
      <DesktopRoomTitlePlacementEditorProvider>
        <DesktopLoungeTvFrameEditorProvider>
          <DesktopPsaSuiteFrameEditorProvider>
            <DesktopRouteShell>
              <Outlet />
            </DesktopRouteShell>
            <VisionEngineDebugGate>
              <DesktopRoomTitlePlacementEditorPanel />
              <DesktopLoungeTvFrameEditorPanel />
              <DesktopPsaSuiteFrameEditorPanel />
              <PerspectivePanelDebugToolbar />
            </VisionEngineDebugGate>
          </DesktopPsaSuiteFrameEditorProvider>
        </DesktopLoungeTvFrameEditorProvider>
      </DesktopRoomTitlePlacementEditorProvider>
    </PerspectivePanelDebugProvider>
    <VisionEngineDebugGate>
      <MansionDebugControlPanel />
    </VisionEngineDebugGate>
    </MansionDebugProvider>
  );
}

// Error Boundary to catch component errors with auto-recovery
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    if (isDynamicImportChunkFailure(error)) {
      reloadForStaleChunks();
    }
  }

  handleRetry = () => {
    if (this.state.error && isDynamicImportChunkFailure(this.state.error)) {
      forceReloadForStaleChunks();
      return;
    }
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(name => caches.delete(name)));
      }).catch(() => {});
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error ? isDynamicImportChunkFailure(this.state.error) : false;
      const isQuotaError = this.state.error ? isQuotaExceededError(this.state.error) : false;
      
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          color: '#eb1c24',
          padding: '20px',
          fontSize: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          textTransform: 'uppercase',
        }}>
          <h1 style={{ fontSize: '18px', textAlign: 'center', margin: 0, fontWeight: 600, letterSpacing: '0.12em' }}>
            {isChunkError ? 'UPDATING THE APP' : 'COMPONENT FAILED TO LOAD'}
          </h1>
          <p
            style={{
              fontSize: '14px',
              textAlign: 'center',
              maxWidth: '320px',
              lineHeight: 1.4,
              margin: 0,
              letterSpacing: '0.06em',
              ...(isChunkError
                ? {
                    fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                    color: '#1A1A1A',
                  }
                : { color: '#555', textTransform: 'none' }),
            }}
          >
            {isChunkError
              ? 'A new version was deployed while this tab was open. Tap reload to refresh — your data on this device is kept.'
              : isQuotaError
                ? 'This device\'s browser storage is full. Studio OS could not save workspace data locally. Your account data in the cloud is safe.'
                : this.state.error?.message}
          </p>
          {isChunkError ? (
            <button
              type="button"
              onClick={() => forceReloadForStaleChunks()}
              style={{
                marginTop: '8px',
                padding: 0,
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: '#808080',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                textTransform: 'uppercase',
              }}
            >
              RELOAD PAGE
            </button>
          ) : isQuotaError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  resetLocalStudioCache();
                  this.setState({ hasError: false, error: null });
                }}
                style={{
                  marginTop: '8px',
                  padding: '10px 16px',
                  fontSize: '11px',
                  backgroundColor: '#fff',
                  color: '#eb1c24',
                  border: '1px solid #0a0a0a',
                  cursor: 'pointer',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Reset local Studio cache
              </button>
              <button
                type="button"
                onClick={this.handleRetry}
                style={{
                  padding: 0,
                  fontSize: '11px',
                  backgroundColor: 'transparent',
                  color: '#808080',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textTransform: 'uppercase',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                marginTop: '8px',
                padding: 0,
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: '#eb1c24',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
              }}
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Redirect /admin/clients/account?email=... to /admin/clients/overview?email=... (details now toggle on main card)
const ClientsAccountRedirect = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/admin/clients/overview', search: location.search }} replace />;
};

/** Legacy `/build-a-wig` hub — redirect to view mode (guest) or NOIR product hub (signed-in). */
const BuildAWigLegacyHubRedirect = () => {
  const target = isSignedIn() ? '/build-a-wig/noir' : BAW_TUTORIAL_ROUTE;
  return <Navigate to={target} replace />;
};

/** Legacy `/build-a-wig/try/…` URLs → `/build-a-wig/view/…`. */
const BuildAWigTryLegacyRedirect = () => {
  const location = useLocation();
  const target = normalizeBawViewPathname(location.pathname);
  return (
    <Navigate to={{ pathname: target, search: location.search, hash: location.hash }} replace />
  );
};

function App() {
  const location = useLocation();
  const isDesktopPreviewShell = isDesktopPreviewWrapperPath(location.pathname);
  const hidePreviewChrome = isDesktopPreviewShell;

  // Clear test data for signed-in accounts that aren't the founder-privileged admin with admin tag (once per email)
  useEffect(() => {
    clearTestDataForNonAdminUserIfNeeded();
    if (!isSignedIn()) seedShoppingBagMockCartIfEmpty();
  }, []);

  // Client activity: cart/wishlist debounced snapshots + bawTrackActivity bridge (admin Activity tab)
  useEffect(() => {
    registerGlobalClientActivityListeners();
    // Defer live-presence heartbeat so it never competes with first paint / critical path
    const t = window.setTimeout(() => {
      startLivePresenceHeartbeat();
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Auth persistence: restore from backup on every load (survives browser close), then re-persist backup and notify listeners.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (isCreativePreviewMode()) {
        seedCreativePreviewDemoSession();
        return;
      }
      ensureAuthRestoredFromBackup();
      persistAuthBackup();
      const signedIn = localStorage.getItem('isSignedIn') === 'true';
      const currentUser = localStorage.getItem('currentUser');
      if (signedIn && currentUser) {
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      }
    } catch (_) {}
  }, []);

  // Keep auth backup updated while signed in so it survives browser close even when beforeunload doesn't fire
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      if (isSignedIn()) persistAuthBackup();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Persist backup on every navigation when signed in (e.g. product page, lobby, account) so backup is always fresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isSignedIn()) persistAuthBackup();
  }, [location.pathname]);

  // When signed in with Supabase, periodically push local cart/wishlist to cloud (debounced per navigation)
  useEffect(() => {
    schedulePushCartWishlistToCloud();
  }, [location.pathname]);

  // Same push when cart/wishlist change without a route change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => schedulePushCartWishlistToCloud();
    window.addEventListener('cartUpdated', run);
    window.addEventListener('wishlistUpdated', run);
    window.addEventListener('ordersUpdated', run);
    return () => {
      window.removeEventListener('cartUpdated', run);
      window.removeEventListener('wishlistUpdated', run);
      window.removeEventListener('ordersUpdated', run);
    };
  }, []);

  // Keep queued profile edits (photo/name/settings fields) synced to backend.
  useEffect(() => {
    void flushQueuedProfilePatch();
  }, [location.pathname]);

  // Drop BCF bundle-deal cart/saved lines when the user no longer qualifies (premium / BLACK tier gate).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => {
      void import('./utils/premiumMemberAccess').then((m) => m.applyStripIneligibleBcfBundleDealsToAllStoredCarts());
    };
    run();
    window.addEventListener('signInStateChanged', run);
    window.addEventListener('focus', run);
    return () => {
      window.removeEventListener('signInStateChanged', run);
      window.removeEventListener('focus', run);
    };
  }, []);

  // When the app loads while already signed in (localStorage + Supabase session), pull server state automatically.
  // bootstrap in main.tsx skips API sync when isSignedIn was already true — this effect covers that gap so users
  // do not need to sign out/in or use admin "Sync my account" to refresh profile from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === 'undefined') return;
      if (isCreativePreviewMode()) return;
      if (!isSignedIn()) return;
      const { isSupabaseConfigured, getSupabase, signOutIfSessionEmailUnconfirmed } = await import('./utils/supabase');
      if (!isSupabaseConfigured()) return;
      const supabase = getSupabase();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (await signOutIfSessionEmailUnconfirmed(supabase, session)) return;
      if (!session?.access_token || cancelled) return;
      const { syncAllFromApi } = await import('./utils/syncFromApi');
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => {
      void flushQueuedProfilePatch();
    };
    window.addEventListener('signInStateChanged', run);
    window.addEventListener('focus', run);
    return () => {
      window.removeEventListener('signInStateChanged', run);
      window.removeEventListener('focus', run);
    };
  }, []);

  return (
    <ErrorBoundary>
      <DesktopTowerNavProvider>
      <VisionEngineProvider>
      <TutorialOsProvider>
      {!hidePreviewChrome ? <CreativePreviewBanner /> : null}
      {!hidePreviewChrome ? <MembershipRouteSync /> : null}
      {!hidePreviewChrome ? <AccountCommerceSync /> : null}
      {!hidePreviewChrome ? <ProductInventorySync /> : null}
      {!hidePreviewChrome ? <PsaChatCopyBootstrap /> : null}
      {!hidePreviewChrome ? <TutorialOsPsaGate /> : null}
      {!hidePreviewChrome ? <BuildWigCustomizeEditAccessGate /> : null}
      <DebugModeShell>
        <Route index element={<HomeLandingRedirect />} />
        <Route path="/" element={<HomeLandingRedirect />} />
        <Route path="/desktop-preview/*" element={
          <Suspense fallback={<LoadingScreen />}>
            <DesktopPreviewPage />
          </Suspense>
        } />
        <Route element={<DesktopRoutesLayout />}>
          <Route path="/desktop/penthouse" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopPenthousePage />
            </Suspense>
          } />
          <Route path="/desktop/lobby" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopLobbyFloorPage />
            </Suspense>
          } />
          <Route path="/desktop/lounge" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopLoungeRedirectPage />
            </Suspense>
          } />
          <Route path="/desktop/gallery" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopGalleryPage />
            </Suspense>
          } />
          <Route path="/desktop/concierge" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopConciergePage />
            </Suspense>
          } />
          <Route path="/desktop/slay-cam" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopSlayCamRedirectPage />
            </Suspense>
          } />
          <Route path="/desktop/account" element={
            <Suspense fallback={<LoadingScreen />}>
              <AccountRouteGuard>
                <DesktopAccountPage />
              </AccountRouteGuard>
            </Suspense>
          } />
          <Route path="/desktop/shopping-bag" element={
            <CommerceRouteGuard>
              <Suspense fallback={<LoadingScreen />}>
                <DesktopShoppingBagPage />
              </Suspense>
            </CommerceRouteGuard>
          } />
          <Route path="/desktop/booking-suite" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopBookingSuitePage />
            </Suspense>
          } />
          <Route path="/desktop/alerts" element={
            <Suspense fallback={<LoadingScreen />}>
              <DesktopAlertsPage />
            </Suspense>
          } />
          <Route path="/desktop/notifications" element={<Navigate to="/desktop/alerts" replace />} />
          <Route path="/desktop/acquisition" element={
            <CommerceRouteGuard>
              <Suspense fallback={<LoadingScreen />}>
                <DesktopAcquisitionPage />
              </Suspense>
            </CommerceRouteGuard>
          } />
          <Route path="/desktop/acquisition/bookings" element={
            <CommerceRouteGuard>
              <Suspense fallback={<LoadingScreen />}>
                <DesktopAcquisitionPage />
              </Suspense>
            </CommerceRouteGuard>
          } />
          <Route path="/desktop/acquisition/gift-card" element={
            <CommerceRouteGuard>
              <Suspense fallback={<LoadingScreen />}>
                <DesktopAcquisitionPage />
              </Suspense>
            </CommerceRouteGuard>
          } />
          <Route path="/desktop/acquisition/slay-tickets" element={
            <CommerceRouteGuard>
              <Suspense fallback={<LoadingScreen />}>
                <DesktopAcquisitionPage />
              </Suspense>
            </CommerceRouteGuard>
          } />
        </Route>
        {MobileMansionRoutes()}
        <Route path="/lobby/lounge" element={<LobbyPage />} />
        <Route path="/lounge" element={<Navigate to="/lobby/lounge" replace />} />
        <Route path="/lobby" element={<LobbyPage />} />
        {/* Admin routes - protected by AdminGuard (sign-in required, admin role only) */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="brand" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminBrand />
            </Suspense>
          } />
          <Route path="brand/edit/:copyKind" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminBrandCopyEditor />
            </Suspense>
          } />
          <Route path="clients/account" element={<ClientsAccountRedirect />} />
          <Route path="clients/deleted" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminDeletedAccounts />
            </Suspense>
          } />
          <Route path="clients/overview" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminClients />
            </Suspense>
          } />
          <Route path="clients" element={<Navigate to="/admin/clients/overview" replace />} />
          <Route path="meetings/schedule" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMeetingsSchedule />
            </Suspense>
          } />
          <Route path="meetings" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMeetings />
            </Suspense>
          } />
          <Route path="pending" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminPending />
            </Suspense>
          } />
          <Route path="messages" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMessages />
            </Suspense>
          } />
          <Route path="alerts" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAlerts />
            </Suspense>
          } />
          <Route path="revenue/accounting-report" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAccountingReport />
            </Suspense>
          } />
          <Route path="revenue/fulfilled-orders" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminFulfilledOrders />
            </Suspense>
          } />
          <Route path="revenue/fraud-analysis" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminFraudAnalysis />
            </Suspense>
          } />
          <Route path="revenue/edit-inventory" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminEditInventory />
            </Suspense>
          } />
          <Route path="revenue/view-waitlist" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminViewWaitlist />
            </Suspense>
          } />
          <Route path="revenue" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminRevenue />
            </Suspense>
          } />
          <Route path="reviews" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminReviews />
            </Suspense>
          } />
          <Route path="referrals" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminReferrals />
            </Suspense>
          } />
          <Route path="marketing/offers" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminSpecialOffer />
            </Suspense>
          } />
          <Route path="marketing" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminMarketing />
            </Suspense>
          } />
          <Route path="workers" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminWorkers />
            </Suspense>
          } />
          <Route path="backend" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminBackend />
            </Suspense>
          } />
          <Route element={<AdminStudioWorkspaceGuard />}>
          <Route element={<StudioAdministrationGuard />}>
          <Route element={<StudioWorkspaceGuard />}>
          <Route path="headquarters" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminHeadquartersEntry />
            </Suspense>
          } />
          <Route path="studio-os/command-center" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCommandCenter />
            </Suspense>
          } />
          <Route path="studio-os/administration" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAdministration />
            </Suspense>
          } />
          <Route path="studio-os/licensing" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/marketplace" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/system-health" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/global-ai" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/cross-org-intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/plugins" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/developer-center" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/portfolio-analytics" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/portfolio-revenue" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/studio-settings" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/studio-updates" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/studio-intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPlatformModuleHost />
            </Suspense>
          } />
          <Route path="studio-os/workspace/:workspaceId/settings" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsWorkspaceSettings />
            </Suspense>
          } />
          <Route path="studio-os/workspace/:workspaceId/studio/*" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsWorkspaceStudioModule />
            </Suspense>
          } />
          <Route path="studio-os/workspace/:workspaceId/dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsWorkspaceDashboard />
            </Suspense>
          } />
          <Route path="studio-os/workspace/:workspaceId/newsroom" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsWorkspaceNewsroom />
            </Suspense>
          } />
          <Route path="studio-os/workspace/:workspaceId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsWorkspaceShell />
            </Suspense>
          } />
          <Route path="studio-os/promotion-center" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsPromotionCenter />
            </Suspense>
          } />
          <Route path="studio-os/blueprints" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsBlueprints />
            </Suspense>
          } />
          <Route path="studio-os/create" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOsCreate />
            </Suspense>
          } />
          <Route path="studio-os" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOs />
            </Suspense>
          } />
          <Route path="studio/shows/:showId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioShowDetail />
            </Suspense>
          } />
          <Route path="studio/shows" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioShows />
            </Suspense>
          } />
          <Route path="studio/content-packs/:packId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioContentPackDetail />
            </Suspense>
          } />
          <Route path="studio/content-packs" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioContentPacks />
            </Suspense>
          } />
          <Route path="studio/ai-studio" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAiStudio />
            </Suspense>
          } />
          <Route path="studio/prompt-library" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPromptLibrary />
            </Suspense>
          } />
          <Route path="studio/asset-library" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetLibrary />
            </Suspense>
          } />
          <Route path="studio/publishing-queue" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPublishingQueue />
            </Suspense>
          } />
          <Route path="studio/analytics" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAnalytics />
            </Suspense>
          } />
          <Route path="studio/content-brain/:sectionId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioContentBrainSection />
            </Suspense>
          } />
          <Route path="studio/content-brain" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioContentBrain />
            </Suspense>
          } />
          <Route path="studio/creative-director" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCreativeDirector />
            </Suspense>
          } />
          <Route path="studio/intelligence-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioIntelligenceEngine />
            </Suspense>
          } />
          <Route path="studio/ai-orchestrator" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAiOrchestrator />
            </Suspense>
          } />
          <Route path="studio/show-bible/:showId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioShowBibleDetail />
            </Suspense>
          } />
          <Route path="studio/show-bible" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioShowBible />
            </Suspense>
          } />
          <Route path="studio/studio-lot/:studioId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLotDetail />
            </Suspense>
          } />
          <Route path="studio/studio-lot" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLot />
            </Suspense>
          } />
          <Route path="studio/talent-agency/:talentId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioTalentAgencyDetail />
            </Suspense>
          } />
          <Route path="studio/talent-agency" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioTalentAgency />
            </Suspense>
          } />
          <Route path="studio/casting/talent/:talentId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCastingTalent />
            </Suspense>
          } />
          <Route path="studio/casting/:castingId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCastingProduction />
            </Suspense>
          } />
          <Route path="studio/casting" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCasting />
            </Suspense>
          } />
          <Route path="studio/production/:packId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioProductionDetail />
            </Suspense>
          } />
          <Route path="studio/production" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioProduction />
            </Suspense>
          } />
          <Route path="studio/ai-production-engine/:runId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAiProductionEngineDetail />
            </Suspense>
          } />
          <Route path="studio/ai-production-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAiProductionEngine />
            </Suspense>
          } />
          <Route path="studio/distribution-network/channel/:channelId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDistributionNetworkChannel />
            </Suspense>
          } />
          <Route path="studio/distribution-network/:distributionId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDistributionNetworkDetail />
            </Suspense>
          } />
          <Route path="studio/distribution-network" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDistributionNetwork />
            </Suspense>
          } />
          <Route path="studio/audience-brain/intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAudienceBrainIntelligence />
            </Suspense>
          } />
          <Route path="studio/audience-brain" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAudienceBrain />
            </Suspense>
          } />
          <Route path="studio/growth-network" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioGrowthNetwork />
            </Suspense>
          } />
          <Route path="studio/labs" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLabs />
            </Suspense>
          } />
          <Route path="studio/ai-media-network" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAiMediaNetwork />
            </Suspense>
          } />
          <Route path="studio/ndxbook/mission-control" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioNdxbookMissionControl />
            </Suspense>
          } />
          <Route path="studio/ndxbook" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioNdxbook />
            </Suspense>
          } />
          <Route path="studio/talent-network" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioTalentNetwork />
            </Suspense>
          } />
          <Route path="studio/marketplace" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioMarketplace />
            </Suspense>
          } />
          <Route path="studio/business-model-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBusinessModelEngine />
            </Suspense>
          } />
          <Route path="studio/ecosystem" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioEcosystem />
            </Suspense>
          } />
          <Route path="studio/expansion-center" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExpansionCenter />
            </Suspense>
          } />
          <Route path="studio/business-discovery-blueprint" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBusinessDiscoveryBlueprint />
            </Suspense>
          } />
          <Route path="studio/organization-inauguration" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationInauguration />
            </Suspense>
          } />
          <Route path="studio/profession-brain" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioProfessionBrain />
            </Suspense>
          } />
          <Route path="studio/expert-marketplace" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExpertMarketplace />
            </Suspense>
          } />
          <Route path="studio/knowledge-commerce" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioKnowledgeCommerce />
            </Suspense>
          } />
          <Route path="studio/professional-trust-framework" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioProfessionalTrustFramework />
            </Suspense>
          } />
          <Route path="studio/organization-genome" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationGenome />
            </Suspense>
          } />
          <Route path="studio/memory-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioMemoryEngine />
            </Suspense>
          } />
          <Route path="studio/company-health-index" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCompanyHealthIndex />
            </Suspense>
          } />
          <Route path="studio/organization-pulse" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationPulse />
            </Suspense>
          } />
          <Route path="studio/wisdom-capture" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioWisdomCapture />
            </Suspense>
          } />
          <Route path="studio/shadow-mode" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioShadowMode />
            </Suspense>
          } />
          <Route path="studio/organization-digital-twin" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationDigitalTwin />
            </Suspense>
          } />
          <Route path="studio/business-simulation-lab" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBusinessSimulationLab />
            </Suspense>
          } />
          <Route path="studio/knowledge-confidence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioKnowledgeConfidence />
            </Suspense>
          } />
          <Route path="studio/legacy-vault" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLegacyVault />
            </Suspense>
          } />
          <Route path="studio/ambient-awareness" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAmbientAwareness />
            </Suspense>
          } />
          <Route path="studio/anticipation-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAnticipationEngine />
            </Suspense>
          } />
          <Route path="studio/founder-cognitive-load" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioFounderCognitiveLoad />
            </Suspense>
          } />
          <Route path="studio/presence-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPresenceEngine />
            </Suspense>
          } />
          <Route path="studio/cross-organization-intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCrossOrgIntelligence />
            </Suspense>
          } />
          <Route path="studio/relationship-memory" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioRelationshipMemory />
            </Suspense>
          } />
          <Route path="studio/predictive-organization" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPredictiveOrganization />
            </Suspense>
          } />
          <Route path="studio/autonomous-preparation" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAutonomousPreparation />
            </Suspense>
          } />
          <Route path="studio/organizational-consciousness" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalConsciousness />
            </Suspense>
          } />
          <Route path="studio/world-knowledge-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioWorldKnowledgeEngine />
            </Suspense>
          } />
          <Route path="studio/founder-operating-system" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioFounderOperatingSystem />
            </Suspense>
          } />
          <Route path="studio/innovation-lab" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioInnovationLab />
            </Suspense>
          } />
          <Route path="studio/organization-operating-manual" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationOperatingManual />
            </Suspense>
          } />
          <Route path="studio/legacy-network" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLegacyNetwork />
            </Suspense>
          } />
          <Route path="studio/studio-intelligence-architecture" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioStudioIntelligenceArchitecture />
            </Suspense>
          } />
          <Route path="studio/model-orchestrator" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioModelOrchestrator />
            </Suspense>
          } />
          <Route path="studio/studio-foundation-models" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioStudioFoundationModels />
            </Suspense>
          } />
          <Route path="studio/documentation-registry" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDocumentationRegistry />
            </Suspense>
          } />
          <Route path="studio/documentation-governance" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDocumentationGovernance />
            </Suspense>
          } />
          <Route path="studio/system-registry" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioSystemRegistry />
            </Suspense>
          } />
          <Route path="studio/component-registry" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioComponentRegistry />
            </Suspense>
          } />
          <Route path="studio/design-token-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDesignTokenEngine />
            </Suspense>
          } />
          <Route path="studio/interaction-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioInteractionEngine />
            </Suspense>
          } />
          <Route path="studio/event-bus" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioEventBus />
            </Suspense>
          } />
          <Route path="studio/automation-registry" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAutomationRegistry />
            </Suspense>
          } />
          <Route path="studio/prompt-registry" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPromptRegistry />
            </Suspense>
          } />
          <Route path="studio/policy-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPolicyEngine />
            </Suspense>
          } />
          <Route path="studio/permission-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPermissionEngine />
            </Suspense>
          } />
          <Route path="studio/workspace-runtime" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioWorkspaceRuntime />
            </Suspense>
          } />
          <Route path="studio/plugin-sdk" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPluginSdk />
            </Suspense>
          } />
          <Route path="studio/workflow-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioWorkflowEngine />
            </Suspense>
          } />
          <Route path="studio/state-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioStateEngine />
            </Suspense>
          } />
          <Route path="studio/asset-registry" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetRegistry />
            </Suspense>
          } />
          <Route path="studio/experience-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExperienceEngine />
            </Suspense>
          } />
          <Route path="studio/qa-headquarters" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioQaHeadquarters />
            </Suspense>
          } />
          <Route path="studio/qa-inspector" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioQaInspector />
            </Suspense>
          } />
          <Route path="studio/qa-simulation-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioQaSimulationEngine />
            </Suspense>
          } />
          <Route path="studio/ai-red-team" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAiRedTeam />
            </Suspense>
          } />
          <Route path="studio/executive-trust-dashboard" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveTrustDashboard />
            </Suspense>
          } />
          <Route path="studio/time-machine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioTimeMachine />
            </Suspense>
          } />
          <Route path="studio/predictive-qa" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPredictiveQa />
            </Suspense>
          } />
          <Route path="studio/succession-mode" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioSuccessionMode />
            </Suspense>
          } />
          <Route path="studio/governance" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioGovernance />
            </Suspense>
          } />
          <Route path="studio/studio-intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioIntelligence />
            </Suspense>
          } />
          <Route path="studio/simulation-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioSimulationEngine />
            </Suspense>
          } />
          <Route path="studio/vision-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioVisionEngine />
            </Suspense>
          } />
          <Route path="studio/social-accounts" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioSocialAccounts />
            </Suspense>
          } />
          <Route path="studio/legacy-system/museum" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLegacySystemMuseum />
            </Suspense>
          } />
          <Route path="studio/legacy-system" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLegacySystem />
            </Suspense>
          } />
          <Route path="studio/executive-ai-director" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveAiDirector />
            </Suspense>
          } />
          <Route path="studio/campaign-orchestrator" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCampaignOrchestrator />
            </Suspense>
          } />
          <Route path="studio/director-mode" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDirectorMode />
            </Suspense>
          } />
          <Route path="studio/production-builder" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioProductionBuilder />
            </Suspense>
          } />
          <Route path="studio/asset-factory" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetFactory />
            </Suspense>
          } />
          <Route path="studio/blueprint-manager/:blueprintId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBlueprintDetail />
            </Suspense>
          } />
          <Route path="studio/blueprint-manager" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBlueprintManager />
            </Suspense>
          } />
          <Route path="studio/asset-director/studios/:studioId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetDirectorStudioDetail />
            </Suspense>
          } />
          <Route path="studio/asset-director/studios" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetDirectorStudios />
            </Suspense>
          } />
          <Route path="studio/asset-director/talent/:talentId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetDirectorTalentDetail />
            </Suspense>
          } />
          <Route path="studio/asset-director/talent" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetDirectorTalent />
            </Suspense>
          } />
          <Route path="studio/asset-director/section/:sectionId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetDirectorSection />
            </Suspense>
          } />
          <Route path="studio/asset-director" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioAssetDirector />
            </Suspense>
          } />
          <Route path="studio/mission-control" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioMissionControl />
            </Suspense>
          } />
          <Route path="studio/chief-of-staff" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioChiefOfStaff />
            </Suspense>
          } />
          <Route path="studio/executive-organization" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveOrganization />
            </Suspense>
          } />
          <Route path="studio/organizational-inheritance" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalInheritance />
            </Suspense>
          } />
          <Route path="studio/strategy-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioStrategyEngine />
            </Suspense>
          } />
          <Route path="studio/campaign-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCampaignEngine />
            </Suspense>
          } />
          <Route path="studio/work-orchestration" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioWorkOrchestration />
            </Suspense>
          } />
          <Route path="studio/distribution-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDistributionEngine />
            </Suspense>
          } />
          <Route path="studio/reader-graph" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioReaderGraph />
            </Suspense>
          } />
          <Route path="studio/relationship-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioRelationshipEngine />
            </Suspense>
          } />
          <Route path="studio/creator-marketplace" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCreatorMarketplace />
            </Suspense>
          } />
          <Route path="studio/ecosystem-marketplace" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioEcosystemMarketplace />
            </Suspense>
          } />
          <Route path="studio/knowledge-asset-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioKnowledgeAssetEngine />
            </Suspense>
          } />
          <Route path="studio/company-maturity-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCompanyMaturityEngine />
            </Suspense>
          } />
          <Route path="studio/brand-architect" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBrandArchitect />
            </Suspense>
          } />
          <Route path="studio/experience-architect" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExperienceArchitect />
            </Suspense>
          } />
          <Route path="studio/digital-architect" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDigitalArchitect />
            </Suspense>
          } />
          <Route path="studio/growth-architect" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioGrowthArchitect />
            </Suspense>
          } />
          <Route path="studio/company-genome" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCompanyGenome />
            </Suspense>
          } />
          <Route path="studio/architect-studio" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioArchitectStudio />
            </Suspense>
          } />
          <Route path="studio/campus-evolution-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCampusEvolutionEngine />
            </Suspense>
          } />
          <Route path="studio/founder-walk" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioFounderWalk />
            </Suspense>
          } />
          <Route path="studio/remembrance-garden" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioRemembranceGarden />
            </Suspense>
          } />
          <Route path="studio/founders-promise" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioFoundersPromise />
            </Suspense>
          } />
          <Route path="studio/executive-framework" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveFramework />
            </Suspense>
          } />
          <Route path="studio/leadership-manifesto-framework" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLeadershipManifestoFramework />
            </Suspense>
          } />
          <Route path="studio/chief-brand-officer" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioChiefBrandOfficer />
            </Suspense>
          } />
          <Route path="studio/chief-experience-officer" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioChiefExperienceOfficer />
            </Suspense>
          } />
          <Route path="studio/chief-digital-officer" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioChiefDigitalOfficer />
            </Suspense>
          } />
          <Route path="studio/chief-technology-officer" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioChiefTechnologyOfficer />
            </Suspense>
          } />
          <Route path="studio/chief-growth-officer" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioChiefGrowthOfficer />
            </Suspense>
          } />
          <Route path="studio/executive-council" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveCouncil />
            </Suspense>
          } />
          <Route path="studio/organizational-intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalIntelligence />
            </Suspense>
          } />
          <Route path="studio/organizational-autonomy-framework" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalAutonomyFramework />
            </Suspense>
          } />
          <Route path="studio/organizational-delegation-engine" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalDelegationEngine />
            </Suspense>
          } />
          <Route path="studio/organizational-workflow-orchestration" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalWorkflowOrchestration />
            </Suspense>
          } />
          <Route path="studio/organizational-self-improvement" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalSelfImprovement />
            </Suspense>
          } />
          <Route path="studio/organizational-governance-safeguards" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalGovernanceSafeguards />
            </Suspense>
          } />
          <Route path="studio/organizational-maturity-model" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalMaturityModel />
            </Suspense>
          } />
          <Route path="studio/leadership-modes" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLeadershipModes />
            </Suspense>
          } />
          <Route path="studio/company-onboarding-intelligence" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioCompanyOnboardingIntelligence />
            </Suspense>
          } />
          <Route path="studio/arrival-experience" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioArrivalExperience />
            </Suspense>
          } />
          <Route path="studio/executive-apprenticeship-founder-calibration" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveApprenticeshipFounderCalibration />
            </Suspense>
          } />
          <Route path="studio/studio-institute" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioStudioInstitute />
            </Suspense>
          } />
          <Route path="studio/organizational-apprenticeship" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOrganizationalApprenticeship />
            </Suspense>
          } />
          <Route path="studio/concierge-layer" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioConciergeLayer />
            </Suspense>
          } />
          <Route path="studio/production-studio" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioProductionStudio />
            </Suspense>
          } />
          <Route path="studio/render-queue" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioRenderQueue />
            </Suspense>
          } />
          <Route path="studio/screening-room" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioScreeningRoom />
            </Suspense>
          } />
          <Route path="studio/concierge-approval-flow" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioConciergeApprovalFlow />
            </Suspense>
          } />
          <Route path="studio/design-dna-canon" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDesignDnaCanon />
            </Suspense>
          } />
          <Route path="studio/design-genome" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioDesignGenome />
            </Suspense>
          } />
          <Route path="studio/executive-timeline" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveTimeline />
            </Suspense>
          } />
          <Route path="studio/leadership-dna" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioLeadershipDna />
            </Suspense>
          } />
          <Route path="studio/knowledge-hub/profile/:profileId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioKnowledgeHubProfile />
            </Suspense>
          } />
          <Route path="studio/knowledge-hub/workflow/:workflowId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioKnowledgeHubWorkflow />
            </Suspense>
          } />
          <Route path="studio/knowledge-hub" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioKnowledgeHub />
            </Suspense>
          } />
          <Route path="studio/memory-bible" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioMemoryBible />
            </Suspense>
          } />
          <Route path="studio/tutorial-os" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioTutorialOs />
            </Suspense>
          } />
          <Route path="studio/brand-assets/photography-bible" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioPhotographyBible />
            </Suspense>
          } />
          <Route path="studio/brand-assets/asset-factory" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBrandAssetsAssetFactory />
            </Suspense>
          } />
          <Route path="studio/brand-assets" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioBrandAssets />
            </Suspense>
          } />
          <Route path="studio/executive-command-center" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioExecutiveCommandCenter />
            </Suspense>
          } />
          <Route path="studio/overview" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioOverview />
            </Suspense>
          } />
          <Route path="studio/hub" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudio />
            </Suspense>
          } />
          <Route path="studio/:sectionId" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminStudioSection />
            </Suspense>
          } />
          <Route path="studio" element={<Navigate to="/admin/studio/mission-control" replace />} />
          </Route>
          </Route>
          </Route>
          <Route path="analytics" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAnalytics />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminUsers />
            </Suspense>
          } />
          <Route path="notifications" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminNotifications />
            </Suspense>
          } />
          <Route path="audit" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminAudit />
            </Suspense>
          } />
        </Route>
        {/* Unit page routes - placed early to ensure proper matching */}
        <Route path="/curly/soft-curl" element={
          <Suspense fallback={<LoadingScreen />}>
            <SoftCurlUnitPage />
          </Suspense>
        } />
        <Route path="/wavy/soft-wave" element={
          <Suspense fallback={<LoadingScreen />}>
            <SoftWaveUnitPage />
          </Suspense>
        } />
        <Route path="/wavy/beach-wave" element={
          <Suspense fallback={<LoadingScreen />}>
            <BeachWaveUnitPage />
          </Suspense>
        } />
        <Route path="/curly/ocean-curl" element={
          <Suspense fallback={<LoadingScreen />}>
            <OceanCurlUnitPage />
          </Suspense>
        } />
        <Route path="/straight/noir" element={
          <Suspense fallback={<LoadingScreen />}>
            <NoirUnitPage />
          </Suspense>
        } />
        <Route path="/straight/blanco" element={
          <Suspense fallback={<LoadingScreen />}>
            <BlancoUnitPage />
          </Suspense>
        } />
        <Route path="/straight/bundles" element={<Navigate to="/shop/bundles" replace />} />
        <Route path="/straight/closures" element={<Navigate to="/shop/closures" replace />} />
        <Route path="/straight/frontals" element={<Navigate to="/shop/frontals" replace />} />
        <Route path="/wavy/bundles" element={<Navigate to="/shop/bundles" replace />} />
        <Route path="/wavy/closures" element={<Navigate to="/shop/closures" replace />} />
        <Route path="/wavy/frontals" element={<Navigate to="/shop/frontals" replace />} />
        <Route path="/curly/bundles" element={<Navigate to="/shop/bundles" replace />} />
        <Route path="/curly/closures" element={<Navigate to="/shop/closures" replace />} />
        <Route path="/curly/frontals" element={<Navigate to="/shop/frontals" replace />} />
        {/* Build-a-wig routes - specific routes must come before general /build-a-wig route */}
        {/* Guest view flow — hub + option sub-pages stay on /build-a-wig/view/… */}
        <Route path="/build-a-wig/view/:unitSlug/color" element={<ColorPage />} />
        <Route path="/build-a-wig/view/:unitSlug/length" element={<LengthPage />} />
        <Route path="/build-a-wig/view/:unitSlug/density" element={<DensityPage />} />
        <Route path="/build-a-wig/view/:unitSlug/lace" element={<LacePage />} />
        <Route path="/build-a-wig/view/:unitSlug/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/view/:unitSlug/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/view/:unitSlug/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/view/:unitSlug/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/view/:unitSlug/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/view/:unitSlug" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/view" element={<BuildAWigPage />} />
        {/* Legacy try URLs → view */}
        <Route path="/build-a-wig/try/:unitSlug/*" element={<BuildAWigTryLegacyRedirect />} />
        <Route path="/build-a-wig/try/:unitSlug" element={<BuildAWigTryLegacyRedirect />} />
        <Route path="/build-a-wig/try" element={<BuildAWigTryLegacyRedirect />} />

        {/* Noir routes */}
        <Route path="/build-a-wig/noir/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/noir/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/noir/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/noir/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/noir/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/noir/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/noir/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/noir/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/noir/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/noir/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/noir/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/noir/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/noir/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/noir/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/noir/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/noir/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/noir/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/noir/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/noir/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/noir/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/noir" element={<BuildAWigPage />} />
        
        {/* Blanco routes */}
        <Route path="/build-a-wig/blanco/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/blanco/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/blanco/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/blanco/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/blanco/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/blanco/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/blanco/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/blanco/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/blanco/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/blanco/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/blanco/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/blanco/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/blanco/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/blanco/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/blanco/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/blanco/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/blanco/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/blanco/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/blanco/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/blanco/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/blanco" element={<BuildAWigPage />} />
        
        {/* Soft Wave routes */}
        <Route path="/build-a-wig/soft-wave/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-wave/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-wave/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-wave/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-wave/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-wave/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-wave/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-wave/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-wave/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-wave/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-wave/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-wave/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-wave/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-wave/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-wave/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-wave/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-wave/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-wave/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-wave/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-wave/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-wave" element={<BuildAWigPage />} />
        
        {/* Beach Wave routes */}
        <Route path="/build-a-wig/beach-wave/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/beach-wave/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/beach-wave/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/beach-wave/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/beach-wave/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/beach-wave/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/beach-wave/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/beach-wave/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/beach-wave/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/beach-wave/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/beach-wave/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/beach-wave/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/beach-wave/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/beach-wave/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/beach-wave/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/beach-wave/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/beach-wave/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/beach-wave/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/beach-wave/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/beach-wave/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/beach-wave" element={<BuildAWigPage />} />
        
        {/* Soft Curl routes */}
        <Route path="/build-a-wig/soft-curl/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-curl/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-curl/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-curl/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-curl/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-curl/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-curl/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-curl/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-curl/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-curl/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-curl/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/soft-curl/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/soft-curl/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/soft-curl/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/soft-curl/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/soft-curl/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/soft-curl/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/soft-curl/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/soft-curl/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/soft-curl/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/soft-curl" element={<BuildAWigPage />} />
        
        {/* Ocean Curl routes */}
        <Route path="/build-a-wig/ocean-curl/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/ocean-curl/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/ocean-curl/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/ocean-curl/edit" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/color" element={<ColorPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/length" element={<LengthPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/density" element={<DensityPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/lace" element={<LacePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/ocean-curl/customize/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/ocean-curl/customize/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/ocean-curl/customize" element={<BuildAWigPage />} />
        <Route path="/build-a-wig/ocean-curl" element={<BuildAWigPage />} />
        
        {/* Legacy edit routes (for backward compatibility) */}
        <Route path="/build-a-wig/edit/color" element={<ColorPage />} />
        <Route path="/build-a-wig/edit/length" element={<LengthPage />} />
        <Route path="/build-a-wig/edit/density" element={<DensityPage />} />
        <Route path="/build-a-wig/edit/lace" element={<LacePage />} />
        <Route path="/build-a-wig/edit/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/edit/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/edit/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/edit/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/edit/addons" element={<AddOnsPage />} />
        <Route path="/build-a-wig/edit" element={<BuildAWigPage />} />
        
        {/* Main build-a-wig routes */}
        <Route path="/build-a-wig/length" element={<LengthPage />} />
        <Route path="/build-a-wig" element={<BuildAWigLegacyHubRedirect />} />
        <Route path="/build-a-wig/color" element={<ColorPage />} />
        <Route path="/build-a-wig/density" element={<DensityPage />} />
        <Route path="/build-a-wig/lace" element={<LacePage />} />
        <Route path="/build-a-wig/texture" element={<TexturePage />} />
        <Route path="/build-a-wig/hairline" element={<HairlinePage />} />
        <Route path="/build-a-wig/cap" element={<CapSizePage />} />
        <Route path="/build-a-wig/styling" element={<StylingPage />} />
        <Route path="/build-a-wig/addons" element={<AddOnsPage />} />
        <Route path="/units/straight" element={
          <Suspense fallback={<LoadingScreen />}>
            <StraightUnitsPage />
          </Suspense>
        } />
        <Route path="/units/wavy" element={
          <Suspense fallback={<LoadingScreen />}>
            <WavyUnitsPage />
          </Suspense>
        } />
        <Route path="/units/curly" element={
          <Suspense fallback={<LoadingScreen />}>
            <CurlyUnitsPage />
          </Suspense>
        } />
        <Route path="/shop/units" element={
          <Suspense fallback={<LoadingScreen />}>
            <ProductsUnitsPage />
          </Suspense>
        } />
        <Route path="/tools/order-form" element={
          <Suspense fallback={<LoadingScreen />}>
            <OrderFormPage />
          </Suspense>
        } />
        <Route path="/shop/order-form" element={<Navigate to="/tools/order-form" replace />} />
        <Route path="/booking/consultation" element={
          <Suspense fallback={<LoadingScreen />}>
            <BookingConsultationPage />
          </Suspense>
        } />
        <Route path="/booking/appointment" element={
          <Suspense fallback={<LoadingScreen />}>
            <BookingAppointmentPage />
          </Suspense>
        } />
        <Route path="/booking/premium/consultation" element={
          <Suspense fallback={<LoadingScreen />}>
            <BookingConsultationPage />
          </Suspense>
        } />
        <Route path="/booking/premium/consult" element={
          <Suspense fallback={<LoadingScreen />}>
            <BookingConsultationPage />
          </Suspense>
        } />
        <Route path="/booking/premium/appointment" element={
          <Suspense fallback={<LoadingScreen />}>
            <BookingAppointmentPage />
          </Suspense>
        } />
        <Route path="/shop/bundles" element={
          <Suspense fallback={<LoadingScreen />}>
            <ShopTextureCategoryProductPage />
          </Suspense>
        } />
        <Route path="/shop/closures" element={
          <Suspense fallback={<LoadingScreen />}>
            <ShopTextureCategoryProductPage />
          </Suspense>
        } />
        <Route path="/shop/frontals" element={
          <Suspense fallback={<LoadingScreen />}>
            <ShopTextureCategoryProductPage />
          </Suspense>
        } />
        <Route path="/home/shop" element={
          <Suspense fallback={<LoadingScreen />}>
            <ProductsPage />
          </Suspense>
        } />
        <Route path="/tools" element={
          <Suspense fallback={<LoadingScreen />}>
            <ToolsPage />
          </Suspense>
        } />
        <Route path="/home/tools" element={
          <Suspense fallback={<LoadingScreen />}>
            <ToolsPage />
          </Suspense>
        } />
        <Route path="/slay-cam" element={
          <Suspense fallback={<LoadingScreen />}>
            <SlayCamPage />
          </Suspense>
        } />
        <Route path="/tools/gift-card" element={
          <Suspense fallback={<LoadingScreen />}>
            <GiftCardPage />
          </Suspense>
        } />
        <Route path="/tools/slay-tickets" element={
          <Suspense fallback={<LoadingScreen />}>
            <SlayTicketsPage />
          </Suspense>
        } />
        <Route path="/tools/slay-card-debug" element={
          <Suspense fallback={<LoadingScreen />}>
            <SlayCardDebugPage />
          </Suspense>
        } />
        <Route path="/tools/email-templates" element={
          <Suspense fallback={<LoadingScreen />}>
            <EmailTemplatesDebugPage />
          </Suspense>
        } />
        <Route path="/tools/live-try-on" element={
          <Suspense fallback={<LoadingScreen />}>
            <LiveTryOnPage />
          </Suspense>
        } />
        <Route path="/tools/hairstyle-analysis" element={
          <Suspense fallback={<LoadingScreen />}>
            <HairstyleAnalysisDemoPage />
          </Suspense>
        } />
        {/* Brand pages: /brand/about … /brand/reviews, /brand/careers, /brand/terms */}
        <Route path="/brand/jobs" element={<Navigate to="/brand/careers" replace />} />
        <Route path="/brand/care" element={<Navigate to="/brand/about" replace />} />
        <Route path="/brand/payment" element={<Navigate to="/brand/about" replace />} />
        <Route path="/brand/about" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/contact" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/member" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/faq" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/reviews" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/brand/careers" element={<Suspense fallback={<LoadingScreen />}><BrandCareersPage /></Suspense>} />
        <Route path="/brand/terms" element={<Suspense fallback={<LoadingScreen />}><BrandPage /></Suspense>} />
        <Route path="/wishlist" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <WishlistPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/wishlist/lists/:listId" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ViewListsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/wishlist/lists" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ViewListsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/wishlist/shared/:token" element={
          <Suspense fallback={<LoadingScreen />}>
            <SharedWishlistListPage />
          </Suspense>
        } />
        <Route path="/account" element={
          <AccountRouteGuard>
            <AccountHubRedirect>
              <Suspense fallback={<LoadingScreen />}>
                <AccountPage />
              </Suspense>
            </AccountHubRedirect>
          </AccountRouteGuard>
        } />
        <Route path="/account/concierge" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ConciergePage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/rewards" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <RewardsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/referrals" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ReferralsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/affiliate" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <AffiliatePage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/alerts" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <NotificationsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/consult-offer" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ConsultOfferPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/orders/:orderId/review" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <LeaveReviewOrderPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/reviews" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ReviewsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/shipping" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ShippingPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/payment" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <PaymentPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/settings" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <SettingsPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/orders" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <OrdersPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/account/load-card" element={
          <AccountRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <LoadCardPage />
            </Suspense>
          </AccountRouteGuard>
        } />
        <Route path="/sign-in" element={
          <Suspense fallback={<LoadingScreen />}>
            <SignInPage />
          </Suspense>
        } />
        <Route path="/bag" element={
          <CommerceRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <ShoppingBagPage />
            </Suspense>
          </CommerceRouteGuard>
        } />
        <Route path="/checkout/upgrade" element={
          <Suspense fallback={<LoadingScreen />}>
            <CheckoutPage />
          </Suspense>
        } />
        <Route path="/checkout/bookings" element={
          <CommerceRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <CheckoutPage />
            </Suspense>
          </CommerceRouteGuard>
        } />
        <Route path="/checkout/gift-card" element={
          <CommerceRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <CheckoutPage />
            </Suspense>
          </CommerceRouteGuard>
        } />
        <Route path="/checkout/slay-tickets" element={
          <CommerceRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <CheckoutPage />
            </Suspense>
          </CommerceRouteGuard>
        } />
        <Route path="/checkout" element={
          <CommerceRouteGuard>
            <Suspense fallback={<LoadingScreen />}>
              <CheckoutPage />
            </Suspense>
          </CommerceRouteGuard>
        } />
        <Route path="/vision/:slug" element={
          <Suspense fallback={<LoadingScreen />}>
            <VisionSharePage />
          </Suspense>
        } />
        <Route path="/checkout/summary" element={
          <Suspense fallback={<LoadingScreen />}>
            <CheckoutConfirmPage />
          </Suspense>
        } />
      </DebugModeShell>
      </TutorialOsProvider>
      </VisionEngineProvider>
      </DesktopTowerNavProvider>
    </ErrorBoundary>
  );
}

export default App;


