import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../../../pages/admin/components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { StudioKnowledgeProvider } from '../../../contexts/StudioKnowledgeContext';
import { StudioManualBridge } from './StudioManualBridge';
import { AdminStudioBreadcrumbTrail } from './AdminStudioBreadcrumbTrail';
import { AdminStudioNavTabs } from './AdminStudioNavTabs';
import { KnowledgeHubButton } from './knowledge-hub/KnowledgeHubButton';
import { KnowledgeGraphEntryPanel } from './knowledge-hub/KnowledgeGraphEntryPanel';
import { KnowledgeContextualHint } from './knowledge-hub/KnowledgeContextualHint';
import {
  buildStudioBreadcrumbs,
  getStudioNavGroup,
  resolveStudioModuleFromPath,
  type StudioNavGroupId,
} from '../../../utils/adminStudioNavigation';
import { STUDIO_OS_UPPERCASE_CLASS } from '../../../utils/adminStudioTheme';
import { StudioImmersionShell } from './immersion/StudioImmersionShell';
import { canSwitchOrganizations } from '../../../studio-os-core/application/portfolio-access';
import { ORGANIZATION_ROUTES, STUDIO_ADMINISTRATION_ROUTES } from '../../../studio-os-core/application/routes';
import { WorkspaceSwitcher } from '../studio-os/WorkspaceSwitcher';
import { CommandDock, shouldShowCommandDock } from './command-dock/CommandDock';
import { AdminStudioSearchResultsPanel } from './AdminStudioSearchResultsPanel';
import { searchStudioModules } from '../../../utils/adminStudioSearch';

type AdminStudioLayoutProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  breadcrumbParentLabel?: string;
  breadcrumbParentPath?: string;
  children: ReactNode;
  navGroupId?: StudioNavGroupId;
  hideNavTabs?: boolean;
  hideOverviewLink?: boolean;
  breadcrumbPageTitle?: string;
  pageHeading?: string;
  /** Optional summary strip (stats cards) above tabs — same slot as Clients / Meetings. */
  summarySlot?: ReactNode;
  /** Primary actions below the main card (PAGE_LAYOUT.md). */
  belowCardActions?: ReactNode;
};

/**
 * Studio layout aligned with Admin Clients / Meetings hub structure.
 * Card content only; primary actions render below the card.
 */
export function AdminStudioLayout({
  title,
  subtitle,
  showBack = true,
  onBack,
  breadcrumbParentLabel = 'ADMIN',
  breadcrumbParentPath = '/admin/dashboard',
  children,
  navGroupId,
  hideNavTabs = false,
  hideOverviewLink = false,
  breadcrumbPageTitle,
  pageHeading,
  summarySlot,
  belowCardActions,
}: AdminStudioLayoutProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { workspace, getModuleSubtitle } = useWorkspace();

  const globalSearchQuery = (searchParams.get('q') || '').trim();
  const [studioSearchQuery, setStudioSearchQuery] = useState(globalSearchQuery);

  useEffect(() => {
    setStudioSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  const studioSearchResults = useMemo(
    () => searchStudioModules(studioSearchQuery),
    [studioSearchQuery]
  );

  const clearStudioSearch = () => {
    setStudioSearchQuery('');
    if (searchParams.has('q')) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      const qs = next.toString();
      navigate(qs ? `${pathname}?${qs}` : pathname, { replace: true });
    }
  };

  /** Routes that self-seed via module hooks — never block paint with full platform bootstrap. */
  const skipHeavyPlatformBootstrap =
    pathname.includes('/studio/ndxbook') || pathname.includes('/studio/chief-of-staff');

  useEffect(() => {
    if (skipHeavyPlatformBootstrap) return;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('studioOsPlatformBootstrapped_v1') === '1') {
      return;
    }

    const runBootstrap = () => {
      void import('../../../workspaces').then(({ bootstrapWorkspacesPlatform }) => {
        bootstrapWorkspacesPlatform();
        sessionStorage.setItem('studioOsPlatformBootstrapped_v1', '1');
      });
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(runBootstrap, { timeout: 2500 });
    } else {
      setTimeout(runBootstrap, 0);
    }
  }, [skipHeavyPlatformBootstrap]);

  const resolvedModule = resolveStudioModuleFromPath(pathname);
  const activeGroupId: StudioNavGroupId = navGroupId ?? resolvedModule?.groupId ?? 'overview';
  const breadcrumbs = buildStudioBreadcrumbs(pathname, breadcrumbPageTitle ?? title);
  const groupMeta = getStudioNavGroup(activeGroupId);

  const helperText =
    subtitle ??
    (resolvedModule?.moduleKey
      ? getModuleSubtitle(resolvedModule.moduleKey as Parameters<typeof getModuleSubtitle>[0])
      : undefined) ??
    resolvedModule?.purpose;

  const portfolioMode = canSwitchOrganizations();
  const headquartersOverviewPath = ORGANIZATION_ROUTES.studioOverview;
  const platformHomePath = STUDIO_ADMINISTRATION_ROUTES.commandCenter;

  const handleBack = onBack ?? (() => navigate(hideOverviewLink ? breadcrumbParentPath : headquartersOverviewPath));

  const displayHeading = pageHeading ?? resolvedModule?.title ?? title;
  const headerCrumbLabel = hideOverviewLink ? breadcrumbParentLabel : portfolioMode ? 'STUDIO ADMINISTRATION' : 'HEADQUARTERS';
  const headerCrumbPath = hideOverviewLink ? breadcrumbParentPath : portfolioMode ? platformHomePath : headquartersOverviewPath;

  return (
    <StudioKnowledgeProvider>
    <StudioManualBridge>
    <div className={`min-h-screen ${STUDIO_OS_UPPERCASE_CLASS}`} style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10">
        <AdminHeader
          title={title}
          showBack={showBack}
          onBack={handleBack}
          breadcrumbParentLabel={headerCrumbLabel}
          breadcrumbParentPath={headerCrumbPath}
          externalSearchValue={studioSearchQuery}
          onExternalSearchChange={setStudioSearchQuery}
          externalSearchPlaceholder="SEARCH STUDIO MODULES..."
          globalSearchTargetPath={pathname}
        />

        <div className="pb-6 px-4" style={{ paddingBottom: shouldShowCommandDock(pathname) ? '100px' : undefined }}>
          <div className="max-w-md mx-auto">
            {studioSearchQuery.trim() ? (
              <AdminStudioSearchResultsPanel
                query={studioSearchQuery}
                results={studioSearchResults}
                onClear={clearStudioSearch}
              />
            ) : null}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden min-h-0"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 160px)' }}
            >
              <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }}>
                {summarySlot}

                <AdminStudioBreadcrumbTrail segments={breadcrumbs} />

                <div
                  className="flex items-center justify-between"
                  style={{ minWidth: 0 }}
                  data-studio-manual="module-header"
                >
                  <h2
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#000000',
                      fontSize: '12px',
                      fontWeight: 500,
                      margin: 0,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayHeading}
                  </h2>
                  {resolvedModule?.metric ? (
                    <span
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        fontSize: '20px',
                        color: '#EB1C24',
                        flexShrink: 0,
                        marginLeft: '8px',
                      }}
                    >
                      {resolvedModule.metric}
                    </span>
                  ) : null}
                  {workspace.studioEnabled ? <KnowledgeHubButton compact /> : null}
                </div>

                {helperText ? (
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
                      color: '#808080',
                      marginTop: '6px',
                      marginBottom: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {helperText}
                  </p>
                ) : null}

                {groupMeta && !hideNavTabs ? (
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '10px',
                      color: '#000000',
                      marginTop: '6px',
                      marginBottom: 0,
                    }}
                  >
                    {groupMeta.label} · {groupMeta.description}
                  </p>
                ) : null}

                <div style={{ borderBottom: '1px solid #e5e7eb', marginTop: '10px' }} />
              </div>

                {!hideNavTabs && workspace.studioEnabled ? (
                <div data-studio-manual="nav-tabs">
                  <AdminStudioNavTabs activeGroupId={activeGroupId} />
                </div>
              ) : null}

              <WorkspaceSwitcher />

              <div
                className="flex-1 min-h-0"
                data-studio-manual="workspace-content"
                style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}
              >
                <StudioImmersionShell />
                <KnowledgeContextualHint />
                <div style={{ paddingTop: '8px', boxSizing: 'border-box' }}>{children}</div>
              </div>
            </div>

            {!hideOverviewLink ? (
              <PageActionsBelowCard adminHub>
                <button
                  type="button"
                  onClick={() => navigate(portfolioMode ? platformHomePath : headquartersOverviewPath)}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  {portfolioMode ? 'BACK TO STUDIO COMMAND CENTER' : 'BACK TO HEADQUARTERS OVERVIEW'}
                </button>
              </PageActionsBelowCard>
            ) : null}

            {belowCardActions ? <PageActionsBelowCard adminHub>{belowCardActions}</PageActionsBelowCard> : null}
          </div>
        </div>
      </div>
      <KnowledgeGraphEntryPanel />
      {workspace.studioEnabled && shouldShowCommandDock(pathname) ? <CommandDock bottomOffset={20} /> : null}
    </div>
    </StudioManualBridge>
    </StudioKnowledgeProvider>
  );
}
