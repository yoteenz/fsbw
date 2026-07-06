import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AssetRegistryWorkspace } from '../../../../components/admin/studio/asset-registry/AssetRegistryWorkspace';

const SUBTITLE =
  'Asset Registry™ — permanent home for every organizational asset. Discoverable, reusable, versioned, intelligently connected. Media transformed into organizational knowledge.';

export default function AdminStudioAssetRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ASSET REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/state-engine')}
      navGroupId="intelligence"
    >
      <AssetRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        ASSET REGISTRY™ V1.0 · M140 · MANAGED PLATFORM RESOURCES · NEVER OVERWRITE · FULLY SEARCHABLE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
