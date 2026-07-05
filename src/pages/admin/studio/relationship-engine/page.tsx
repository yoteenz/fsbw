import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { RelationshipEngineWorkspace } from '../../../../components/admin/studio/relationship-engine/RelationshipEngineWorkspace';

const RELATIONSHIP_ENGINE_SUBTITLE =
  'Active relationship operating system — nurture trust, deepen community, and create long-term value. Not a CRM.';

export default function AdminStudioRelationshipEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="RELATIONSHIP ENGINE"
      subtitle={RELATIONSHIP_ENGINE_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/reader-graph')}
      navGroupId="intelligence"
    >
      <RelationshipEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        RELATIONSHIP ENGINE V1.0 · ACTIVE NURTURING · TRUST · ADVOCACY · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
