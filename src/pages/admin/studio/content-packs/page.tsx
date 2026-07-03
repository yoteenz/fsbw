import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioContentPackCard } from '../../../../components/admin/studio/AdminStudioContentPackCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { listAdminStudioContentPacks } from '../../../../hooks/useAdminStudioEditableState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioContentPacksPage() {
  const navigate = useNavigate();
  const packs = listAdminStudioContentPacks();

  return (
    <AdminStudioStageShell
      title="CONTENT PACKS"
      subtitle="WEEKLY VIDEO + ARTICLE + MULTI-CHANNEL BUNDLES"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioSectionHeading>RELEASE VAULT</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-5 -mt-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {packs.length} PACKS IN DEMO · TAP TO EDIT ALL CHANNEL TABS
      </p>

      <div className="space-y-3">
        {packs.map((pack) => (
          <AdminStudioContentPackCard
            key={pack.id}
            pack={pack}
            onClick={() => navigate(`/admin/studio/content-packs/${pack.id}`)}
          />
        ))}
      </div>
    </AdminStudioStageShell>
  );
}
