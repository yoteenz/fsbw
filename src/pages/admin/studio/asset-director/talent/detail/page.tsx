import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorTalentDetailView } from '../../../../../../components/admin/studio/asset-director/AssetDirectorTalentDetailView';
import {
  AssetDirectorActionNotice,
  AssetDirectorQuickPreviewModal,
} from '../../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { getTalentVisualBundle } from '../../../../../../utils/adminStudioAssetDirectorVisual';

export default function AdminStudioAssetDirectorTalentDetailPage() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const [quickPreview, setQuickPreview] = useState<{ name: string; previewSrc: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const bundle = useMemo(() => (talentId ? getTalentVisualBundle(talentId) : undefined), [talentId]);

  const dismissNotice = useCallback(() => setActionNotice(null), []);

  const notifyAction = useCallback((verb: string, target: string) => {
    setActionNotice(`${verb} · ${target}`);
  }, []);

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
      <AssetDirectorTalentDetailView
        bundle={bundle}
        onQuickPreview={setQuickPreview}
        onGenerate={(item) => notifyAction('GENERATE', item.name)}
        onReplace={(item) => notifyAction('REPLACE', item.name)}
      />
      <AssetDirectorQuickPreviewModal item={quickPreview} onClose={() => setQuickPreview(null)} />
      <AssetDirectorActionNotice message={actionNotice} onDismiss={dismissNotice} />
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
