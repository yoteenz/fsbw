import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DocumentationGovernanceWorkspace } from '../../../../components/admin/studio/documentation-governance/DocumentationGovernanceWorkspace';

const SUBTITLE =
  'Documentation Governance™ — continuously monitor, validate, audit, and improve every piece of documentation across Studio OS.';

export default function AdminStudioDocumentationGovernancePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DOCUMENTATION GOVERNANCE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/knowledge-registry')}
      navGroupId="intelligence"
    >
      <DocumentationGovernanceWorkspace />
      <AdminStudioDisclaimerFooter>
        DOCUMENTATION GOVERNANCE™ V1.0 · M126.5 · LIVING ORGANIZATIONAL KNOWLEDGE · CONTINUOUS AUDITS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
