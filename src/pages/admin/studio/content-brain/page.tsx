import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioBrainHubCard } from '../../../../components/admin/studio/AdminStudioBrainHubCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import {
  ADMIN_STUDIO_CONTENT_BRAIN_HUB_SUBTITLE,
  ADMIN_STUDIO_CONTENT_BRAIN_SECTIONS,
} from '../../../../utils/adminStudioContentBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioContentBrainHubPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CONTENT BRAIN"
      subtitle={ADMIN_STUDIO_CONTENT_BRAIN_HUB_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioSectionHeading>INTELLIGENCE LAYERS</AdminStudioSectionHeading>

      <p
        className="text-[8px] font-futura uppercase mb-4"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        SINGLE SOURCE OF TRUTH FOR ALL AI GENERATION — BRAND, SHOW, EDITORIAL & PRODUCT KNOWLEDGE.
        NO API CONNECTIONS · DEMO EDITABLE STATE.
      </p>

      <div className="space-y-2">
        {ADMIN_STUDIO_CONTENT_BRAIN_SECTIONS.map((card) => (
          <AdminStudioBrainHubCard
            key={card.id}
            card={card}
            onClick={() => navigate(card.route)}
          />
        ))}
      </div>

      <AdminStudioDisclaimerFooter>
        CONTENT BRAIN POWERS FUTURE OPENAI, FAL, RESEND & PSA MEMORY — READ-ONLY EXPORT VIA STUDIO SERVICE STUB.
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
