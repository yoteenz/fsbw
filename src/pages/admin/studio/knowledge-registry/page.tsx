import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { KnowledgeRegistryWorkspace } from '../../../../components/admin/studio/knowledge-registry/KnowledgeRegistryWorkspace';

const SUBTITLE =
  'Studio OS Knowledge Registry™ — architectural brain of the platform. Constitution, Volumes, milestones, systems, and implementation status from one Master Specification.';

export default function AdminStudioKnowledgeRegistryPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO OS KNOWLEDGE REGISTRY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/knowledge-hub')}
      navGroupId="intelligence"
    >
      <KnowledgeRegistryWorkspace />
      <AdminStudioDisclaimerFooter>
        KNOWLEDGE REGISTRY™ V2.0 · M126 · MASTER SPEC SINGLE SOURCE OF TRUTH · MANIFEST AUTHORING™ · MANIFEST RECONCILIATION™
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
