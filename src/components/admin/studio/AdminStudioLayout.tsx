import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../../../pages/admin/components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { useWorkspace } from '../../../studio-os/context/WorkspaceProvider';
import { AdminStudioBreadcrumbTrail } from './AdminStudioBreadcrumbTrail';
import { AdminStudioNavTabs } from './AdminStudioNavTabs';
import {
  buildStudioBreadcrumbs,
  resolveStudioModuleFromPath,
  STUDIO_OVERVIEW_PATH,
  type StudioNavGroupId,
} from '../../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLayoutProps = {
  /** Header title (shown in AdminHeader after parent crumb). */
  title: string;
  /** Short helper under module title — plain English. */
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  breadcrumbParentLabel?: string;
  breadcrumbParentPath?: string;
  children: ReactNode;
  /** Override auto-detected nav group. */
  navGroupId?: StudioNavGroupId;
  /** Hide grouped nav tabs (e.g. nested detail with own tabs). */
  hideNavTabs?: boolean;
  /** Hide back-to-overview link (overview page itself). */
  hideOverviewLink?: boolean;
  /** Extra breadcrumb leaf (detail page name). */
  breadcrumbPageTitle?: string;
  /** Handwritten accent heading inside card (defaults to title). */
  pageHeading?: string;
};

/**
 * Shared Studio layout — marble, luxury card, grouped nav, breadcrumbs.
 * Matches admin dashboard visual language.
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
}: AdminStudioLayoutProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { workspace, getModuleSubtitle } = useWorkspace();

  const resolvedModule = resolveStudioModuleFromPath(pathname);
  const activeGroupId: StudioNavGroupId = navGroupId ?? resolvedModule?.groupId ?? 'overview';
  const breadcrumbs = buildStudioBreadcrumbs(pathname, breadcrumbPageTitle ?? title);

  const helperText =
    subtitle ??
    (resolvedModule?.moduleKey
      ? getModuleSubtitle(resolvedModule.moduleKey as Parameters<typeof getModuleSubtitle>[0])
      : undefined) ??
    resolvedModule?.purpose;

  const handleBack = onBack ?? (() => navigate(hideOverviewLink ? breadcrumbParentPath : STUDIO_OVERVIEW_PATH));

  const displayHeading = pageHeading ?? resolvedModule?.title ?? title;

  return (
    <div className="min-h-screen relative">
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
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={title}
          showBack={showBack}
          onBack={handleBack}
          breadcrumbParentLabel={breadcrumbParentLabel}
          breadcrumbParentPath={breadcrumbParentPath}
        />

        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto">
            <div
              className={`bg-white/60 backdrop-blur-sm border border-black p-4 ${ADMIN_STUDIO_THEME.cardShadow}`}
              style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 200px)' }}
            >
              <AdminStudioBreadcrumbTrail segments={breadcrumbs} />

              {!hideNavTabs && workspace.studioEnabled ? (
                <AdminStudioNavTabs activeGroupId={activeGroupId} />
              ) : null}

              {!hideOverviewLink ? (
                <button
                  type="button"
                  onClick={() => navigate(STUDIO_OVERVIEW_PATH)}
                  className="mb-3 text-[7px] font-futura uppercase hover:underline"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}
                >
                  ← BACK TO STUDIO OVERVIEW
                </button>
              ) : null}

              <div className="flex items-center justify-between -mt-1 mb-1">
                <span
                  className="text-red-500 font-bold text-xl tracking-wider uppercase"
                  style={{
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    color: ADMIN_STUDIO_THEME.accent,
                  }}
                >
                  {displayHeading}
                </span>
                {resolvedModule?.metric ? (
                  <span
                    className="text-black font-bold text-xl flex-shrink-0 ml-2 uppercase"
                    style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
                  >
                    {resolvedModule.metric}
                  </span>
                ) : null}
              </div>

              {helperText ? (
                <p
                  className="text-[9px] font-futura uppercase mb-4 tracking-widest"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
                >
                  {helperText}
                </p>
              ) : null}

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
