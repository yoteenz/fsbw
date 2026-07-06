import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DesignDnaCanonWorkspace } from '../../../../components/admin/studio/design-dna-canon/DesignDnaCanonWorkspace';

const SUBTITLE =
  'Permanent Design DNA for Frontal Slayer — canon pages are architectural references · future pages inherit naturally · never copy pixels · preserve masterpieces · evolve unfinished spaces.';

export default function AdminStudioDesignDnaCanonPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="DESIGN DNA & CANON SYSTEM"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/experience-architect')}
      navGroupId="create"
    >
      <DesignDnaCanonWorkspace />
      <AdminStudioDisclaimerFooter>
        DESIGN DNA & CANON SYSTEM V1.0 · CANON PAGES PROTECTED · HEADQUARTERS REVIEW · DEMO PLACEHOLDER
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
