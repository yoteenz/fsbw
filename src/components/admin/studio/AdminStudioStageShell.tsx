import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminStudioLayout } from './AdminStudioLayout';
import { useWorkspace } from '../../../studio-os/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../studio-os/workspace/routes';
import type { StudioNavGroupId } from '../../../utils/adminStudioNavigation';

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
  breadcrumbParentLabel = 'ADMIN',
  breadcrumbParentPath = '/admin/dashboard',
  children,
  accentHex: _accentHex,
  navGroupId,
  hideNavTabs,
  breadcrumbPageTitle,
  pageHeading,
}: AdminStudioStageShellProps) {
  void _accentHex;
  const { workspace } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <AdminStudioLayout
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      onBack={onBack}
      breadcrumbParentLabel={breadcrumbParentLabel}
      breadcrumbParentPath={breadcrumbParentPath}
      navGroupId={navGroupId}
      hideNavTabs={hideNavTabs}
      breadcrumbPageTitle={breadcrumbPageTitle}
      pageHeading={pageHeading}
    >
      {children}
    </AdminStudioLayout>
  );
}
