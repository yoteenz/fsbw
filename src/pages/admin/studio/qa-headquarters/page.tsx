import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { QaHeadquartersWorkspace } from '../../../../components/admin/studio/qa-headquarters/QaHeadquartersWorkspace';

const SUBTITLE =
  'QA Headquarters™ — permanent Quality Assurance & Trust Infrastructure. Trust Scores™, continuous validation, and organizational integrity monitoring. Studio OS quietly protects every organization.';

export default function AdminStudioQaHeadquartersPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="QA HEADQUARTERS™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/experience-engine')}
      navGroupId="intelligence"
    >
      <QaHeadquartersWorkspace />
      <AdminStudioDisclaimerFooter>
        QA HEADQUARTERS™ V1.0 · M142 · TRUST SCORES™ · CONTINUOUS VALIDATION · STUDIO OS EARNS TRUST
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
