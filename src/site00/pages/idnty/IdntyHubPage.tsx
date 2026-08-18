import { Link, useLocation } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { BracketHeading, HubActionCard, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { SITE00_IDNTY_HUB_MODULES } from '../../config/seed/site00-page-seed';
import { IDNTY_BENEFITS_SEED, IDNTY_VALUE_PROPS_SEED } from '../../config/seed/site00-ecosystem-seed';
import { SITE00_ROUTES } from '../../config/routes';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import {
  Site00BellIcon,
  Site00KeyIcon,
  Site00LockIcon,
  Site00MonitorIcon,
  Site00ShieldIcon,
  Site00TokenIcon,
  Site00TrashIcon,
  Site00UserIcon,
} from '../../icons/Site00HubIcons';

const ICONS: Record<string, typeof Site00LockIcon> = {
  security: Site00LockIcon,
  profile: Site00UserIcon,
  'api-keys': Site00KeyIcon,
  sessions: Site00MonitorIcon,
  notifications: Site00BellIcon,
  privacy: Site00ShieldIcon,
  tokens: Site00TokenIcon,
  delete: Site00TrashIcon,
};

function IdntySignedOutGateway() {
  const location = useLocation();
  const signInHref = site00SignInHrefWithReturnTo(location);
  const createHref = `/sign-in?returnTo=${encodeURIComponent(SITE00_ROUTES.control)}`;

  return (
    <Site00PublicShell mobileActiveNav="origin">
      <div className="site00-page site00-page--idnty-gateway">
        <div className="site00-idnty-gateway__hero">
          <PageIntro
            title={<BracketHeading>IDNTY</BracketHeading>}
            subtitle="YOUR ACCESS STARTS HERE."
            body="A SITE 00 identity connects you to your projects, builds, files, decisions, and account access across the ecosystem."
          />
          <div className="site00-idnty-gateway__crosshair" aria-hidden="true" />
        </div>

        <div className="site00-idnty-gateway__actions">
          <HubActionCard
            title="SIGN IN"
            description="I already have a SITE 00 identity."
            cta="→"
            href={signInHref}
            icon={<Site00UserIcon size={24} />}
          />
          <HubActionCard
            title="CREATE IDENTITY"
            description="I'm new to SITE 00."
            cta="→"
            href={createHref}
            icon={<Site00KeyIcon size={24} />}
          />
        </div>

        <section className="site00-idnty-gateway__benefits" aria-labelledby="idnty-benefits-heading">
          <h2 id="idnty-benefits-heading" className="site00-idnty-gateway__section-title">
            WHY CREATE AN IDNTY?
          </h2>
          <div className="site00-idnty-benefits-grid">
            {IDNTY_BENEFITS_SEED.map((benefit) => (
              <article key={benefit.id} className="site00-idnty-benefit">
                <div className="site00-idnty-benefit__icon" aria-hidden="true">
                  ◈
                </div>
                <h3 className="site00-idnty-benefit__label">{benefit.label}</h3>
                <p className="site00-idnty-benefit__desc">{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="site00-idnty-gateway__values" aria-labelledby="idnty-values-heading">
          <h2 id="idnty-values-heading" className="site00-idnty-gateway__section-title">
            WHAT YOU GET
          </h2>
          <ul className="site00-idnty-values-list">
            {IDNTY_VALUE_PROPS_SEED.map((prop) => (
              <li key={prop.id}>{prop.label}</li>
            ))}
          </ul>
          <p className="site00-idnty-gateway__cta-line">
            NEW TO SITE 00?{' '}
            <Link to={createHref} className="site00-link-red">
              CREATE IDENTITY →
            </Link>
          </p>
          <p className="site00-idnty-gateway__enter">ENTER YOUR UNIVERSE.</p>
        </section>
      </div>
    </Site00PublicShell>
  );
}

function IdntySignedInProfile() {
  return (
    <EcosystemShell title="IDNTY" subtitle="YOUR IDENTITY, ACCESS, AND SECURITY.">
      <div className="site00-page site00-page--idnty-hub">
        <p className="site00-page-intro__body site00-idnty-hub__lead">
          Manage your profile, authentication, sessions, and account-level settings. Project monitoring lives in CTRL ROOM
          and PROJECTS.
        </p>
        <div className="site00-hub-grid site00-hub-grid--2x4">
          {SITE00_IDNTY_HUB_MODULES.map((mod) => {
            const Icon = ICONS[mod.id] ?? Site00LockIcon;
            return (
              <HubActionCard
                key={mod.id}
                title={mod.title}
                href={mod.href}
                cta="MANAGE →"
                icon={<Icon size={22} />}
                destructive={'destructive' in mod && mod.destructive}
              />
            );
          })}
        </div>
      </div>
    </EcosystemShell>
  );
}

export default function IdntyHubPage() {
  const [isSignedIn] = useSignedInFromStorage();
  if (isSignedIn) return <IdntySignedInProfile />;
  return <IdntySignedOutGateway />;
}
