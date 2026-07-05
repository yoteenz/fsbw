import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { KnowledgeAssetEngineWorkspace } from '../../../../components/admin/studio/knowledge-asset-engine/KnowledgeAssetEngineWorkspace';

const KNOWLEDGE_ASSET_ENGINE_SUBTITLE =
  'Foundational object model for Studio OS — every piece of content is a living knowledge asset with lineage, maturity, and compounding value.';

export default function AdminStudioKnowledgeAssetEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="KNOWLEDGE ASSET ENGINE"
      subtitle={KNOWLEDGE_ASSET_ENGINE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/ecosystem-marketplace')}
      navGroupId="intelligence"
    >
      <KnowledgeAssetEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        KNOWLEDGE ASSET ENGINE V1.0 · SSOT · EVOLUTION · LINEAGE · INSTITUTIONAL MEMORY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
