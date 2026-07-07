import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from './AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from './AdminStudioDisclaimerFooter';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { getStudioModuleById, type StudioNavGroupId } from '../../../utils/adminStudioNavigation';
import { adminStudioMissionControlPath } from '../../../utils/adminStudioRoutes';

type AdminStudioModulePageShellProps = {
  moduleId: string;
  children: ReactNode;
  disclaimer?: string;
  onBack?: () => void;
  navGroupId?: StudioNavGroupId;
  hideNavTabs?: boolean;
};

/** Wraps a Studio workspace in the shared scrollable AdminStudioLayout shell. */
export function AdminStudioModulePageShell({
  moduleId,
  children,
  disclaimer,
  onBack,
  navGroupId,
  hideNavTabs,
}: AdminStudioModulePageShellProps) {
  const navigate = useNavigate();
  const { getModuleSubtitle } = useWorkspace();
  const mod = getStudioModuleById(moduleId);

  if (!mod) {
    return <>{children}</>;
  }

  const subtitle =
    (mod.moduleKey ? getModuleSubtitle(mod.moduleKey as Parameters<typeof getModuleSubtitle>[0]) : undefined) ??
    mod.purpose;
  const footer =
    disclaimer ??
    `${mod.title} · ${mod.metric} · ${mod.status === 'live' ? 'LIVE' : 'DEMO PLACEHOLDER'} · CONNECTORS NOT CONNECTED`;

  return (
    <AdminStudioStageShell
      title={mod.title}
      subtitle={subtitle}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={onBack ?? (() => navigate(adminStudioMissionControlPath()))}
      navGroupId={navGroupId ?? mod.groupId}
      hideNavTabs={hideNavTabs}
    >
      {children}
      <AdminStudioDisclaimerFooter>{footer}</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
