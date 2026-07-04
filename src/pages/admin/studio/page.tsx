import { Navigate, useNavigate } from 'react-router-dom';
import { AdminStudioLayout } from '../../../components/admin/studio/AdminStudioLayout';
import { AdminStudioHubCard } from '../../../components/admin/studio/AdminStudioHubCard';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../studio-os-core/workspace/routes';
import { getWorkspaceStudioHubFooter, getWorkspaceStudioHubSubtitle } from '../../../studio-os-core/workspace/loader';
import { STUDIO_OVERVIEW_PATH } from '../../../utils/adminStudioNavigation';
import type { AdminStudioHubCard as AdminStudioHubCardData } from '../../../utils/adminStudioDemo';

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
          {hubCards.length}
        </p>
        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
          HUB MODULES
        </p>
      </div>
    </div>
  );

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
      summarySlot={summarySlot}
      belowCardActions={
        <button
          type="button"
          onClick={() => navigate(STUDIO_OVERVIEW_PATH)}
          className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
          style={pageActionButtonStyle}
        >
          OPEN STUDIO OVERVIEW (GROUPED NAV)
        </button>
      }
    >
      <div className="space-y-2 mb-3">
        {dashboardItems.map((item) => (
          <div key={item.label} className="text-[11px] text-left" style={{ fontFamily: '"Futura PT Book"' }}>
            <span className="text-black font-futura uppercase" style={{ fontWeight: 500 }}>
              {item.label}:{' '}
              <span style={{ color: item.color === 'text-red-500' ? '#EB1C24' : '#808080', fontWeight: 515 }}>
                {item.value}
              </span>
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', marginBottom: '12px' }}>
        {hubFooter}
      </p>

      <div className="grid grid-cols-2 gap-4 items-start">
        {hubCards.map((card) => (
          <AdminStudioHubCard key={card.id} card={card as AdminStudioHubCardData} onClick={() => navigate(card.route)} />
        ))}
      </div>
    </AdminStudioLayout>
  );
}
