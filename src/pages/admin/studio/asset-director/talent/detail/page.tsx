import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorTalentDetailView } from '../../../../../../components/admin/studio/asset-director/AssetDirectorTalentDetailView';
import {
  AssetDirectorActionNotice,
  AssetDirectorQuickPreviewModal,
} from '../../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { getTalentVisualBundle } from '../../../../../../utils/adminStudioAssetDirectorVisual';
import { useAdminStudioAssetDirectorGeneration } from '../../../../../../hooks/useAdminStudioAssetDirectorGeneration';

export default function AdminStudioAssetDirectorTalentDetailPage() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const [quickPreview, setQuickPreview] = useState<{ name: string; previewSrc: string } | null>(null);
  const { notice, dismissNotice, runGenerate, runReplace, fileInputRef, onReplaceFile } =
    useAdminStudioAssetDirectorGeneration();

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          void onReplaceFile(file);
          e.target.value = '';
        }}
      />

      <AssetDirectorTalentDetailView
        bundle={bundle}
        onQuickPreview={setQuickPreview}
        onGenerate={(item) => {
          void runGenerate({
            studioId: talentId,
            variantId: item.name,
            variantName: item.name,
            previewSrc: undefined,
          });
        }}
        onReplace={(item) => {
          runReplace({
            studioId: talentId,
            variantId: item.name,
            variantName: item.name,
          });
        }}
      />

      <AssetDirectorQuickPreviewModal item={quickPreview} onClose={() => setQuickPreview(null)} />
      <AssetDirectorActionNotice message={notice} onDismiss={dismissNotice} livePipeline />
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
