import { Navigate, useNavigate } from 'react-router-dom';
import { AdminStudioLayout } from '../../../components/admin/studio/AdminStudioLayout';
import { AdminStudioHubCard } from '../../../components/admin/studio/AdminStudioHubCard';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { useWorkspace } from '../../../studio-os/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../studio-os/workspace/routes';
import { getWorkspaceStudioHubFooter, getWorkspaceStudioHubSubtitle } from '../../../studio-os/workspace/loader';
import { STUDIO_OVERVIEW_PATH } from '../../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

/** Legacy Studio hub — original card grid; preserved at /admin/studio/hub. */
export default function AdminStudioPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { workspace, dataAdapter } = useWorkspace();

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspace.id)} replace />;
  }

  const hubSubtitle = getWorkspaceStudioHubSubtitle(workspace);
  const hubFooter = getWorkspaceStudioHubFooter(workspace);
  const hubCards = dataAdapter.studioHub.cards;
  const dashboardItems = dataAdapter.studioHub.dashboardItems;
  const dashboardMetric = dataAdapter.studioHub.dashboardMetric;

  return (
    <AdminStudioLayout
      title="THE STUDIO"
      subtitle={hubSubtitle}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/dashboard')}
      hideOverviewLink
      pageHeading="THE STUDIO"
      navGroupId="overview"
    >
      <button
        type="button"
        onClick={() => navigate(STUDIO_OVERVIEW_PATH)}
        className="mb-4 w-full py-2 text-[8px] font-futura uppercase border"
        style={{
          fontWeight: 515,
          color: ADMIN_STUDIO_THEME.textOnAccent,
          background: ADMIN_STUDIO_THEME.accent,
          borderColor: ADMIN_STUDIO_THEME.panelBorder,
        }}
      >
        OPEN STUDIO OVERVIEW (GROUPED NAV)
      </button>

      <div
        className="border p-4 mb-4"
        style={{ borderWidth: '1.3px', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
            PULSE
          </span>
          <span
            className="text-black font-bold text-lg uppercase"
            style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
          >
            {dashboardMetric}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {dashboardItems.map((item) => (
            <div key={item.label} className="text-[9px] text-left">
              <span className="text-black font-medium font-futura uppercase" style={{ fontWeight: 500 }}>
                {item.label}:{' '}
                <span
                  className="font-futura uppercase"
                  style={{
                    fontWeight: 515,
                    color: item.color === 'text-red-500' ? '#EB1C24' : '#808080',
                  }}
                >
                  {item.value}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="pt-2 mt-2 border-t border-gray-200">
          <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: '#EB1C24' }}>
            {hubFooter}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        {hubCards.map((card) => (
          <AdminStudioHubCard key={card.id} card={card} onClick={() => navigate(card.route)} />
        ))}
      </div>
    </AdminStudioLayout>
  );
}
