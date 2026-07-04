import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioLayout } from '../../../../components/admin/studio/AdminStudioLayout';
import { AdminStudioModuleCard } from '../../../../components/admin/studio/AdminStudioModuleCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioNavTabs } from '../../../../components/admin/studio/AdminStudioNavTabs';
import { useWorkspace } from '../../../../studio-os/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os/workspace/routes';
import {
  getModulesForGroup,
  getStudioNavGroup,
  STUDIO_NAV_GROUPS,
  type StudioNavGroupId,
} from '../../../../utils/adminStudioNavigation';
import {
  ADMIN_STUDIO_DASHBOARD_FOOTER,
  ADMIN_STUDIO_DASHBOARD_ITEMS,
  ADMIN_STUDIO_DASHBOARD_METRIC,
} from '../../../../utils/adminStudioDemo';
import { getWorkspaceStudioHubFooter, getWorkspaceStudioHubSubtitle } from '../../../../studio-os/workspace/loader';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

const DEFAULT_GROUP: StudioNavGroupId = 'overview';

function isStudioNavGroupId(value: string | null): value is StudioNavGroupId {
  return STUDIO_NAV_GROUPS.some((g) => g.id === value);
}

/** Studio Overview — grouped module directory aligned with admin design system. */
export default function AdminStudioOverviewPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspace } = useWorkspace();

  const groupParam = searchParams.get('group');
  const activeGroupId: StudioNavGroupId = isStudioNavGroupId(groupParam) ? groupParam : DEFAULT_GROUP;

  const hubSubtitle = getWorkspaceStudioHubSubtitle(workspace);
  const hubFooter = getWorkspaceStudioHubFooter(workspace) || ADMIN_STUDIO_DASHBOARD_FOOTER;
  const dashboardItems = workspace.id === 'frontal-slayer' ? ADMIN_STUDIO_DASHBOARD_ITEMS : [];
  const dashboardMetric = workspace.id === 'frontal-slayer' ? ADMIN_STUDIO_DASHBOARD_METRIC : 0;

  const visibleGroups = useMemo(() => {
    if (groupParam && isStudioNavGroupId(groupParam)) {
      return STUDIO_NAV_GROUPS.filter((g) => g.id === groupParam);
    }
    return STUDIO_NAV_GROUPS;
  }, [groupParam]);

  useEffect(() => {
    if (groupParam && isStudioNavGroupId(groupParam)) {
      const el = document.getElementById(`studio-group-${groupParam}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [groupParam]);

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  return (
    <AdminStudioLayout
      title="STUDIO OVERVIEW"
      subtitle={hubSubtitle}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/dashboard')}
      hideOverviewLink
      pageHeading="STUDIO OVERVIEW"
      navGroupId={activeGroupId}
      hideNavTabs
    >
      <div
        className="p-3 mb-4 border"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
          borderColor: ADMIN_STUDIO_THEME.panelBorder,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-black font-bold text-lg uppercase"
            style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
          >
            PULSE
          </span>
          <span
            className="text-black font-bold text-lg uppercase"
            style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
          >
            {dashboardMetric}
          </span>
        </div>
        {dashboardItems.length > 0 ? (
          <div className="mt-2 space-y-1">
            {dashboardItems.slice(0, 6).map((item) => (
              <div key={item.label} className="text-[8px] text-left">
                <span className="text-black font-medium font-futura uppercase" style={{ fontWeight: 500 }}>
                  {item.label}:{' '}
                  <span
                    className="font-futura uppercase"
                    style={{
                      fontWeight: 515,
                      color: item.color === 'text-red-500' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                    }}
                  >
                    {item.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {hubFooter}
        </p>
      </div>

      <AdminStudioNavTabs
        activeGroupId={activeGroupId}
        linkToOverview={false}
        onGroupChange={(id) => {
          if (id === activeGroupId && groupParam) {
            setSearchParams({});
            return;
          }
          setSearchParams({ group: id });
        }}
      />

      <div className="space-y-6">
        {visibleGroups.map((group) => {
          const modules = getModulesForGroup(group.id, { overviewOnly: true });
          const groupMeta = getStudioNavGroup(group.id);
          return (
            <section key={group.id} id={`studio-group-${group.id}`}>
              <AdminStudioSectionHeading>{group.label}</AdminStudioSectionHeading>
              {groupMeta?.description ? (
                <p
                  className="text-[7px] font-futura uppercase -mt-2 mb-3"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
                >
                  {groupMeta.description}
                </p>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {modules.map((mod) => (
                  <AdminStudioModuleCard key={mod.id} module={mod} compact />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AdminStudioLayout>
  );
}
