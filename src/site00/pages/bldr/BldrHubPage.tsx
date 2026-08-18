import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, HubActionCard, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { SITE00_BLDR_HUB_ACTIONS } from '../../config/seed/site00-page-seed';
import { Site00CubeIcon, Site00DeployIcon, Site00LayersIcon } from '../../icons/Site00HubIcons';
import { SITE00_ROUTES } from '../../config/routes';

const ICONS = {
  start: Site00CubeIcon,
  templates: Site00LayersIcon,
  components: Site00CubeIcon,
  deploy: Site00DeployIcon,
};

export default function BldrHubPage() {
  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-page--bldr-hub">
        <PageIntro
          title={<BracketHeading>BLDR / START BUILD</BracketHeading>}
          subtitle="TOOLS, TEMPLATES, AND INFRASTRUCTURE TO BUILD WITHOUT LIMITS."
          body="START FROM SCRATCH OR USE OUR INTELLIGENT BUILDER TO LAUNCH YOUR NEXT PROJECT FASTER."
        />
        <div className="site00-hub-grid site00-hub-grid--2x2">
          {SITE00_BLDR_HUB_ACTIONS.map((action) => {
            const Icon = ICONS[action.id as keyof typeof ICONS] ?? Site00CubeIcon;
            return (
              <HubActionCard
                key={action.id}
                title={action.title}
                description={action.description}
                cta={action.cta}
                href={action.href}
                icon={<Icon size={28} />}
              />
            );
          })}
        </div>
        <section className="site00-page-banner">
          <p className="site00-label-red">NEED HELP GETTING STARTED?</p>
          <div className="site00-page-banner__links">
            <Link to={SITE00_ROUTES.support} className="site00-link-red">
              VIEW DOCUMENTATION →
            </Link>
            <Link to={SITE00_ROUTES.support} className="site00-link-red">
              CONTACT SUPPORT →
            </Link>
          </div>
        </section>
      </div>
    </Site00PublicShell>
  );
}
