import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ProductionOrchestratorWorkspace } from '../../../../components/admin/studio/production-orchestrator/ProductionOrchestratorWorkspace';

const SUBTITLE =
  'Studio Production Orchestrator™ — Founder Intent to GPT architecture, Composer implementation, OpenArt/FAL assets, Kling motion, review, Knowledge Core, and ADR updates.';

export default function AdminStudioProductionOrchestratorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="STUDIO PRODUCTION ORCHESTRATOR™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/production-studio')}
      navGroupId="production"
    >
      <ProductionOrchestratorWorkspace />
      <AdminStudioDisclaimerFooter>
        STUDIO PRODUCTION ORCHESTRATOR™ V1.0 · PRODUCTION BOARD™ · MODEL HANDOFFS · COMPOSER GATED BY ARCHITECTURE, DEPENDENCIES, AND APPROVAL
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
