import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAssetDirectorCard } from '../../../../../components/admin/studio/AdminStudioAssetDirectorCard';
import { ASSET_DIRECTOR_STUDIOS } from '../../../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioAssetDirectorStudiosPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIOS"
      subtitle="ASSET DIRECTOR · EVERY VIRTUAL STUDIO ENVIRONMENT"
      breadcrumbParentLabel="ASSET DIRECTOR"
      breadcrumbParentPath="/admin/studio/asset-director"
      onBack={() => navigate('/admin/studio/asset-director')}
    >
      <AdminStudioSectionHeading>VIRTUAL STUDIOS</AdminStudioSectionHeading>
      <p className="text-[7px] font-futura uppercase mb-3 -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {ASSET_DIRECTOR_STUDIOS.length} ENVIRONMENTS · MASTER · DAY · NIGHT · SEASONAL
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ASSET_DIRECTOR_STUDIOS.map((studio) => (
          <AdminStudioAssetDirectorCard
            key={studio.id}
            asset={studio}
            onClick={() => navigate(`/admin/studio/asset-director/studios/${studio.id}`)}
          />
        ))}
      </div>
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
