import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioExecutiveCard } from '../../../../components/admin/studio/AdminStudioExecutiveCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { BRAND_ASSETS_HUB_SUBTITLE } from '../../../../utils/adminStudioProductPhotographyBibleDemo';
import { adminStudioPhotographyBiblePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

const BRAND_ASSETS_CARDS = [
  {
    id: 'photography-bible',
    title: 'PHOTOGRAPHY BIBLE',
    metric: 'V1.0',
    description: 'OFFICIAL PRODUCT PHOTOGRAPHY SOURCE OF TRUTH · SIGNATURE COLLECTION · MEDIA KITS.',
    route: adminStudioPhotographyBiblePath(),
  },
] as const;

export default function AdminStudioBrandAssetsPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="BRAND ASSETS"
      subtitle={BRAND_ASSETS_HUB_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio/mission-control')}
      navGroupId="visuals"
    >
      <AdminStudioSectionHeading>VISUAL STANDARDS</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-4"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        BRAND ASSETS COMMAND · PHOTOGRAPHY BIBLE · MEDIA KIT ARCHITECTURE · NO GENERATION IN THIS MILESTONE.
      </p>

      <div className="space-y-2">
        {BRAND_ASSETS_CARDS.map((card) => (
          <AdminStudioExecutiveCard
            key={card.id}
            title={card.title}
            metric={card.metric}
            description={card.description}
            accentHex={ADMIN_STUDIO_THEME.accent}
            onClick={() => navigate(card.route)}
          />
        ))}
      </div>

      <AdminStudioDisclaimerFooter>
        MILESTONE 20.5 · INFRASTRUCTURE ONLY · DOCS AT docs/frontal-slayer/product-photography-bible/
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
