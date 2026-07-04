import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetDirectorStudioDetailView } from '../../../../../../components/admin/studio/asset-director/AssetDirectorStudioDetailView';
import {
  AssetDirectorActionNotice,
  AssetDirectorQuickPreviewModal,
} from '../../../../../../components/admin/studio/asset-director/AssetDirectorVisualPrimitives';
import { getStudioVisualBundle } from '../../../../../../utils/adminStudioAssetDirectorVisual';
import { mergeStudioBundleWithGeneratedVersions } from '../../../../../../hooks/useAdminStudioAssetDirectorState';
import { useAdminStudioAssetDirectorGeneration } from '../../../../../../hooks/useAdminStudioAssetDirectorGeneration';

export default function AdminStudioAssetDirectorStudioDetailPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const [quickPreview, setQuickPreview] = useState<{
    name: string;
    previewSrc: string;
    resolution?: string;
    version?: string;
  } | null>(null);

  const {
    notice,
    dismissNotice,
    busyKey,
    refreshKey,
    runGenerate,
    runReplace,
    fileInputRef,
    onReplaceFile,
  } = useAdminStudioAssetDirectorGeneration();

  const bundle = useMemo(() => {
    void refreshKey;
    if (!studioId) return undefined;
    const base = getStudioVisualBundle(studioId);
    return base ? mergeStudioBundleWithGeneratedVersions(base, studioId) : undefined;
  }, [studioId, refreshKey]);

  if (!studioId || !bundle) {
    return <Navigate to="/admin/studio/asset-director/studios" replace />;
  }

  const variantTarget = (item: { name: string }) => {
    const variant = bundle.versions.find((v) => v.name === item.name);
    if (!variant) return null;
    return {
      studioId,
      variantId: variant.id,
      variantName: variant.name,
      previewSrc: variant.previewSrc,
    };
  };

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

      <AssetDirectorStudioDetailView
        bundle={bundle}
        busyVariantKey={busyKey}
        onQuickPreview={setQuickPreview}
        onGenerate={(item) => {
          const target = variantTarget(item);
          if (!target) return;
          void runGenerate(target, { navigateToFactory: true });
        }}
        onReplace={(item) => {
          const target = variantTarget(item);
          if (!target) return;
          runReplace(target);
        }}
        onHeaderAction={(action) => {
          if (action === 'GENERATE' && bundle.versions[0]) {
            const v = bundle.versions[0];
            void runGenerate({
              studioId,
              variantId: v.id,
              variantName: v.name,
              previewSrc: v.previewSrc,
            });
          }
        }}
      />

      <AssetDirectorQuickPreviewModal item={quickPreview} onClose={() => setQuickPreview(null)} />
      <AssetDirectorActionNotice message={notice} onDismiss={dismissNotice} livePipeline />
      <AdminStudioDisclaimerFooter>
        LIVE PIPELINE · GENERATE → ASSET FACTORY → FAL → ASSET DIRECTOR
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
