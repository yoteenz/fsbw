import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioLayout } from '../../../../components/admin/studio/AdminStudioLayout';
import { AdminStudioModuleCard } from '../../../../components/admin/studio/AdminStudioModuleCard';
import { AdminStudioNavTabs } from '../../../../components/admin/studio/AdminStudioNavTabs';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import {
  getModulesForGroup,
  getStudioNavGroup,
  STUDIO_NAV_GROUPS,
  type StudioNavGroupId,
} from '../../../../utils/adminStudioNavigation';
import {
  ADMIN_STUDIO_DASHBOARD_FOOTER,
  ADMIN_STUDIO_DASHBOARD_METRIC,
} from '../../../../utils/adminStudioDemo';
import { getWorkspaceStudioHubFooter, getWorkspaceStudioHubSubtitle } from '../../../../studio-os-core/workspace/loader';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

const DEFAULT_GROUP: StudioNavGroupId = 'overview';

function isStudioNavGroupId(value: string | null): value is StudioNavGroupId {
  return STUDIO_NAV_GROUPS.some((g) => g.id === value);
}

/** Studio Overview — structured like Admin Clients / Meetings hub pages. */
export default function AdminStudioOverviewPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspace } = useWorkspace();

  const groupParam = searchParams.get('group');
  const activeGroupId: StudioNavGroupId = isStudioNavGroupId(groupParam) ? groupParam : DEFAULT_GROUP;

  const hubSubtitle = getWorkspaceStudioHubSubtitle(workspace);
  const hubFooter = getWorkspaceStudioHubFooter(workspace) || ADMIN_STUDIO_DASHBOARD_FOOTER;
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

  const summarySlot = (
    <div className="grid grid-cols-2 gap-4 mb-4" style={{ marginTop: '12px' }}>
      <div
        className="text-center py-3"
        style={{
          backgroundColor: 'rgba(0,0,0,0.04)',
          borderRadius: '4px',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: '10px',
        }}
      >
        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>
          {dashboardMetric}
        </p>
        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
          STUDIO PULSE
        </p>
      </div>
      <div
        className="text-center py-3"
        style={{
          backgroundColor: 'rgba(0,0,0,0.04)',
          borderRadius: '4px',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: '10px',
        }}
      >
        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>
          {STUDIO_NAV_GROUPS.length}
        </p>
        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
          DEPARTMENTS
        </p>
      </div>
    </div>
  );

  return (
    <AdminStudioLayout
      title="OVERVIEW"
      subtitle={hubSubtitle}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/dashboard')}
      hideOverviewLink
      pageHeading="STUDIO OVERVIEW"
      navGroupId={activeGroupId}
      hideNavTabs
      summarySlot={summarySlot}
    >
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

      {/* Column headers — same pattern as Clients list */}
      <div
        className="grid gap-2 py-2 font-medium text-black items-center min-w-0"
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '11px',
          gridTemplateColumns: '1fr 4.5rem 4.5rem',
          marginTop: '4px',
          marginLeft: '-4px',
        }}
      >
        <div style={{ paddingLeft: '10px', marginLeft: '6px' }}>MODULE</div>
        <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>
          STATUS
        </div>
        <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>
          METRIC
        </div>
      </div>

      <div
        className="overflow-y-auto overflow-x-hidden min-w-0 admin-hub-tab-scroll"
        style={{ maxHeight: '420px', paddingTop: '2px', boxSizing: 'border-box' }}
      >
        {visibleGroups.map((group) => {
          const modules = getModulesForGroup(group.id, { overviewOnly: true });
          const groupMeta = getStudioNavGroup(group.id);
          let rowIndex = 0;
          return (
            <section key={group.id} id={`studio-group-${group.id}`} className="mb-4">
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '11px',
                  color: '#000000',
                  marginBottom: '8px',
                  marginTop: group.id === visibleGroups[0]?.id ? 0 : '12px',
                }}
              >
                {group.label}
                {groupMeta ? ` — ${groupMeta.description}` : ''}
              </p>
              {modules.map((mod) => {
                rowIndex += 1;
                return <AdminStudioModuleCard key={mod.id} module={mod} index={rowIndex} />;
              })}
            </section>
          );
        })}
      </div>

      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '11px',
          color: '#EB1C24',
          marginTop: '12px',
          marginBottom: 0,
        }}
      >
        {hubFooter}
      </p>
    </AdminStudioLayout>
  );
}
