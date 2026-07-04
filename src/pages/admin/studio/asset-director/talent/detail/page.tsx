import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorTalentDetailView } from '../../../../../../components/admin/studio/asset-director/AssetDirectorTalentDetailView';
import { AssetDirectorQuickPreviewModal } from '../../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { getTalentVisualBundle } from '../../../../../../utils/adminStudioAssetDirectorVisual';

export default function AdminStudioAssetDirectorTalentDetailPage() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const [quickPreview, setQuickPreview] = useState<{ name: string; previewSrc: string } | null>(null);

  const bundle = useMemo(() => (talentId ? getTalentVisualBundle(talentId) : undefined), [talentId]);

  if (!talentId || !bundle) {
    return <Navigate to="/admin/studio/asset-director/talent" replace />;
  }

  return (
    <AdminStudioStageShell
      title={bundle.talent.name}
      subtitle="TALENT VISUAL PROFILE"
      breadcrumbParentLabel="TALENT"
      breadcrumbParentPath="/admin/studio/asset-director/talent"
      onBack={() => navigate('/admin/studio/asset-director/talent')}
      navGroupId="visuals"
      hideNavTabs
    >
      <AssetDirectorTalentDetailView bundle={bundle} onQuickPreview={setQuickPreview} />
      <AssetDirectorQuickPreviewModal item={quickPreview} onClose={() => setQuickPreview(null)} />
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
