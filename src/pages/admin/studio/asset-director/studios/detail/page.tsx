import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorStudioDetailView } from '../../../../../../components/admin/studio/asset-director/AssetDirectorStudioDetailView';
import {
  AssetDirectorActionNotice,
  AssetDirectorQuickPreviewModal,
} from '../../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { getStudioVisualBundle } from '../../../../../../utils/adminStudioAssetDirectorVisual';

export default function AdminStudioAssetDirectorStudioDetailPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const [quickPreview, setQuickPreview] = useState<{
    name: string;
    previewSrc: string;
    resolution?: string;
    version?: string;
  } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const bundle = useMemo(() => (studioId ? getStudioVisualBundle(studioId) : undefined), [studioId]);

  const dismissNotice = useCallback(() => setActionNotice(null), []);

  const notifyAction = useCallback((verb: string, target: string) => {
    setActionNotice(`${verb} · ${target}`);
  }, []);

  const handleHeaderAction = useCallback(
    (action: string) => {
      if (!bundle) return;
      notifyAction(action, bundle.studio.name);
    },
    [bundle, notifyAction]
  );

  if (!studioId || !bundle) {
    return <Navigate to="/admin/studio/asset-director/studios" replace />;
  }

  return (
    <AdminStudioStageShell
      title={bundle.studio.name}
      subtitle={bundle.studio.masterEnvironment}
      breadcrumbParentLabel="STUDIOS"
      breadcrumbParentPath="/admin/studio/asset-director/studios"
      onBack={() => navigate('/admin/studio/asset-director/studios')}
      navGroupId="visuals"
      hideNavTabs
    >
      <AssetDirectorStudioDetailView
        bundle={bundle}
        onQuickPreview={setQuickPreview}
        onGenerate={(item) => notifyAction('GENERATE', item.name)}
        onReplace={(item) => notifyAction('REPLACE', item.name)}
        onHeaderAction={handleHeaderAction}
      />
      <AssetDirectorQuickPreviewModal item={quickPreview} onClose={() => setQuickPreview(null)} />
      <AssetDirectorActionNotice message={actionNotice} onDismiss={dismissNotice} />
      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
