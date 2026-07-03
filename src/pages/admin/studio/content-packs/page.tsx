import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioContentPackCard } from '../../../../components/admin/studio/AdminStudioContentPackCard';
import { listAdminStudioContentPacks } from '../../../../hooks/useAdminStudioEditableState';

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
      <p
        className="text-lg mb-4"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#EB1C24',
        }}
      >
        RELEASE VAULT
      </p>
      <p
        className="text-[8px] font-futura uppercase mb-5"
        style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.5 }}
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
