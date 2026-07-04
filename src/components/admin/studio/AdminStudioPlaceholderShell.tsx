import { useNavigate } from 'react-router-dom';
import { AdminStudioLayout } from './AdminStudioLayout';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import type { AdminStudioHubCard as StudioCard } from '../../../utils/adminStudioDemo';
import { resolveStudioModuleFromPath, STUDIO_OVERVIEW_PATH } from '../../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioPlaceholderShellProps = {
  section: StudioCard;
};

/** Empty Studio section — polished shell awaiting future CMS / AI tooling. */
export function AdminStudioPlaceholderShell({ section }: AdminStudioPlaceholderShellProps) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const resolved = resolveStudioModuleFromPath(`/admin/studio/${section.id}`);

  return (
    <AdminStudioLayout
      title={section.title}
      subtitle={resolved?.purpose ?? section.description}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate(STUDIO_OVERVIEW_PATH)}
      pageHeading={section.title}
    >
      <div
        className="border border-black/20 p-4"
        style={{ borderWidth: '1.3px', background: ADMIN_STUDIO_THEME.panelBg }}
      >
        <p className="text-[10px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          COMING SOON
        </p>
        <p
          className="text-[9px] font-futura uppercase"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
        >
          THIS MODULE IS PART OF THE STUDIO CREATIVE OPERATING SYSTEM. FUNCTIONALITY WILL SHIP IN A FUTURE RELEASE —
          ROUTING AND LAYOUT ARE LIVE FOR QA.
        </p>
      </div>

      <p className="mt-6 text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
        DEMO METRIC: {section.metric}
      </p>
    </AdminStudioLayout>
  );
}
