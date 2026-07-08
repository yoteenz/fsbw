import type { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AdminStudioLayout } from './AdminStudioLayout';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { useStudioModuleNav } from '../../../studio-os-core/organization-context';
import { STUDIO_OS_ROUTES } from '../../../studio-os-core/workspace/routes';
import { isLegacyFrontalSlayerStudioPath } from '../../../studio-os-core/workspace/headquarters-module-resolver';
import type { WorkspaceSchema } from '../../../studio-os-core/workspace/types';
import type { StudioNavGroupId } from '../../../utils/adminStudioNavigation';

/** Platform modules (ndxbook, labs, etc.) must work from the AI Media reference pilot workspace. */
function canAccessStudioStageShell(workspace: WorkspaceSchema): boolean {
  if (workspace.studioEnabled) return true;
  if (workspace.id === 'ai-media' || workspace.slug === 'ai-media') return true;
  const tags = workspace.metadata?.tags;
  if (Array.isArray(tags) && tags.some((tag) => tag === 'reference' || tag === 'pilot')) {
    return true;
  }
  return false;
}

type AdminStudioStageShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  breadcrumbParentLabel?: string;
  breadcrumbParentPath?: string;
  children: ReactNode;
  accentHex?: string;
  navGroupId?: StudioNavGroupId;
  hideNavTabs?: boolean;
  breadcrumbPageTitle?: string;
  pageHeading?: string;
};

/** Studio page shell — delegates to AdminStudioLayout (shared nav, breadcrumbs, spacing). */
export function AdminStudioStageShell({
  title,
  subtitle,
  showBack = true,
  onBack,
  breadcrumbParentLabel,
  breadcrumbParentPath,
  children,
  accentHex: _accentHex,
  navGroupId,
  hideNavTabs,
  breadcrumbPageTitle,
  pageHeading,
}: AdminStudioStageShellProps) {
  void _accentHex;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  const { studioEntry, organizationName } = useStudioModuleNav();

  if (!canAccessStudioStageShell(workspace) && !isLegacyFrontalSlayerStudioPath(pathname)) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <AdminStudioLayout
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      onBack={onBack ?? (() => navigate(studioEntry))}
      breadcrumbParentLabel={breadcrumbParentLabel ?? organizationName}
      breadcrumbParentPath={breadcrumbParentPath ?? studioEntry}
      navGroupId={navGroupId}
      hideNavTabs={hideNavTabs}
      breadcrumbPageTitle={breadcrumbPageTitle}
      pageHeading={pageHeading}
    >
      {children}
    </AdminStudioLayout>
  );
}
