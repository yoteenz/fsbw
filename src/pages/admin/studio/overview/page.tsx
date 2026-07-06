import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AdminStudioLayout } from '../../../../components/admin/studio/AdminStudioLayout';
import { AdminStudioModuleCard } from '../../../../components/admin/studio/AdminStudioModuleCard';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import {
  countModulesForGroup,
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
import {
  ExecutiveDepartmentCard,
  ExecutiveDepartmentCards,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutiveModuleSummary,
  ExecutivePageShell,
  ExecutiveWorkspaceZone,
  EXECUTIVE_DEPARTMENT_ICONS,
  EXECUTIVE_DEPARTMENT_WINGS,
  useExecutiveDepartment,
} from '../../../../components/admin/studio/executive-ia';

/** Studio Overview — M83 Executive IA: module summarization, not exposed module walls. */
export default function AdminStudioOverviewPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { activeDepartment, selectDepartment } = useExecutiveDepartment<StudioNavGroupId>('overview');

  const hubSubtitle = getWorkspaceStudioHubSubtitle(workspace);
  const hubFooter = getWorkspaceStudioHubFooter(workspace) || ADMIN_STUDIO_DASHBOARD_FOOTER;
  const dashboardMetric = workspace.id === 'frontal-slayer' ? ADMIN_STUDIO_DASHBOARD_METRIC : 0;
  const totalModules = useMemo(
    () => STUDIO_NAV_GROUPS.reduce((sum, g) => sum + countModulesForGroup(g.id), 0),
    []
  );

  const activeGroup = getStudioNavGroup(activeDepartment);
  const activeModules = getModulesForGroup(activeDepartment, { overviewOnly: true });

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  const summarySlot = (
    <ExecutiveHeroCard
      eyebrow="ORGANIZATION PULSE · STUDIO OVERVIEW"
      title={workspace.displayName.toUpperCase()}
      subtitle={hubSubtitle}
      stats={[
        { label: 'STUDIO PULSE', value: String(dashboardMetric) },
        { label: 'DEPARTMENTS', value: String(STUDIO_NAV_GROUPS.length) },
        { label: 'MODULES', value: String(totalModules) },
        { label: 'ACTIVE WING', value: activeGroup?.label ?? 'OVERVIEW' },
      ]}
    />
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
      navGroupId={activeDepartment}
      hideNavTabs
      summarySlot={summarySlot}
    >
      <ExecutivePageShell>
        <ExecutiveDepartmentCards label="HEADQUARTERS WINGS">
          {STUDIO_NAV_GROUPS.map((group) => {
            const moduleCount = countModulesForGroup(group.id);
            const liveCount = getModulesForGroup(group.id).filter((m) => m.status === 'live').length;
            return (
              <ExecutiveDepartmentCard
                key={group.id}
                id={group.id}
                icon={EXECUTIVE_DEPARTMENT_ICONS[group.id]}
                name={group.label}
                description={EXECUTIVE_DEPARTMENT_WINGS[group.id]}
                statusLabel={`${moduleCount} MODULES · ${liveCount} LIVE`}
                healthPct={Math.min(98, 72 + moduleCount)}
                status={moduleCount > 15 ? 'active' : 'idle'}
                selected={activeDepartment === group.id}
                onSelect={() => selectDepartment(group.id)}
                onEnter={() => {
                  const first = getModulesForGroup(group.id, { overviewOnly: true })[0];
                  if (first) navigate(first.route);
                }}
                enterLabel={`OPEN ${group.label} →`}
              />
            );
          })}
        </ExecutiveDepartmentCards>

        <ExecutiveWorkspaceZone departmentId={activeDepartment}>
          <ExecutiveFocusPanel
            title={`${activeGroup?.label ?? 'OVERVIEW'} · PRIMARY DECISION`}
            subtitle={activeGroup?.description}
            highlight={
              activeDepartment === 'overview'
                ? 'WHAT SHOULD THE FOUNDER REVIEW FIRST TODAY?'
                : `OPEN ${activeGroup?.label ?? 'DEPARTMENT'} TO EXECUTE`
            }
          >
            {activeModules.slice(0, 3).map((mod) => (
              <AdminStudioModuleCard key={mod.id} module={mod} index={1} />
            ))}
          </ExecutiveFocusPanel>
        </ExecutiveWorkspaceZone>

        <section style={{ marginTop: 8 }}>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              color: '#808080',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            INSTALLED MODULES · SUMMARIZED
          </p>
          {STUDIO_NAV_GROUPS.map((group) => {
            const moduleCount = countModulesForGroup(group.id);
            const modules = getModulesForGroup(group.id, { overviewOnly: true });
            return (
              <ExecutiveModuleSummary
                key={group.id}
                icon={EXECUTIVE_DEPARTMENT_ICONS[group.id]}
                title={group.label}
                moduleCount={moduleCount}
                statusLabel={group.description}
                healthPct={Math.min(98, 70 + moduleCount)}
                onOpen={() => selectDepartment(group.id)}
                openLabel={`FOCUS ${group.label} →`}
              >
                {modules.map((mod, idx) => (
                  <AdminStudioModuleCard key={mod.id} module={mod} index={idx + 1} />
                ))}
              </ExecutiveModuleSummary>
            );
          })}
        </section>

        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '11px',
            color: '#EB1C24',
            marginTop: '4px',
            marginBottom: 0,
          }}
        >
          {hubFooter}
        </p>
      </ExecutivePageShell>
    </AdminStudioLayout>
  );
}
