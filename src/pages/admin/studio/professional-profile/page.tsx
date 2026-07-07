import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ProfessionalProfileWorkspace } from '../../../../components/admin/studio/professional-profile/ProfessionalProfileWorkspace';

const SUBTITLE =
  'Professional Profile™ — living career identities that evolve alongside each person. Experience, skills, Profession Brains™, timeline, and portfolio — dynamic, never frozen.';

export default function AdminStudioProfessionalProfilePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PROFESSIONAL PROFILE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/identity-graph')}
      navGroupId="intelligence"
    >
      <ProfessionalProfileWorkspace />
      <AdminStudioDisclaimerFooter>
        PROFESSIONAL PROFILE™ V1.0 · M164 · CAREERS EVOLVE · RESUMES DO NOT FREEZE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
