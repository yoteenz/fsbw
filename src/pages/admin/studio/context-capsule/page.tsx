import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ContextCapsuleWorkspace } from '../../../../components/admin/studio/context-capsule';
import { adminStudioKnowledgeRegistryPath } from '../../../../utils/adminStudioRoutes';

export default function AdminStudioContextCapsulePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="AI CONTEXT CAPSULE™"
      subtitle="Export and download institutional memory — one package for external AI onboarding."
      breadcrumbParentLabel="KNOWLEDGE"
      breadcrumbParentPath={adminStudioKnowledgeRegistryPath()}
      onBack={() => navigate(adminStudioKnowledgeRegistryPath())}
      navGroupId="intelligence"
    >
      <ContextCapsuleWorkspace />
      <AdminStudioDisclaimerFooter>
        AI CONTEXT CAPSULE EXPORT SYSTEM™ · PACKAGING ONLY · SOURCE DOCS UNCHANGED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
