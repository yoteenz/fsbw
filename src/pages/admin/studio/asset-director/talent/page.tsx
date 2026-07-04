import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAssetDirectorCard } from '../../../../../components/admin/studio/AdminStudioAssetDirectorCard';
import { ASSET_DIRECTOR_TALENT } from '../../../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioAssetDirectorTalentPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="TALENT"
      subtitle="ASSET DIRECTOR · ON-CAMERA VISUAL PERSONALITIES"
      breadcrumbParentLabel="ASSET DIRECTOR"
      breadcrumbParentPath="/admin/studio/asset-director"
      onBack={() => navigate('/admin/studio/asset-director')}
    >
      <AdminStudioSectionHeading>TALENT ROSTER</AdminStudioSectionHeading>
      <p className="text-[7px] font-futura uppercase mb-3 -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {ASSET_DIRECTOR_TALENT.length} PERSONALITIES · PORTRAITS · WARDROBE · EXPRESSIONS · POSES
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ASSET_DIRECTOR_TALENT.map((talent) => (
          <AdminStudioAssetDirectorCard
            key={talent.id}
            asset={talent}
            onClick={() => navigate(`/admin/studio/asset-director/talent/${talent.id}`)}
          />
        ))}
      </div>
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
