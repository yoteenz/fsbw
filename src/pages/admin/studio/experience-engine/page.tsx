import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExperienceEngineWorkspace } from '../../../../components/admin/studio/experience-engine/ExperienceEngineWorkspace';

const SUBTITLE =
  'Experience Engine™ — the emotional and environmental layer of Studio OS. Adapts atmosphere to match your organization\'s moment — tasteful, professional, alive without overwhelming.';

export default function AdminStudioExperienceEnginePage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXPERIENCE ENGINE™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/asset-registry')}
      navGroupId="intelligence"
    >
      <ExperienceEngineWorkspace />
      <AdminStudioDisclaimerFooter>
        EXPERIENCE ENGINE™ V1.0 · M141 · INFRASTRUCTURE CHAPTER COMPLETE · TECHNOLOGY ADAPTS TO PEOPLE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
