import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, HubActionCard, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { SITE00_IDNTY_HUB_MODULES } from '../../config/seed/site00-page-seed';
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

export default function IdntyHubPage() {
  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--idnty-hub">
        <PageIntro
          title={<BracketHeading>IDNTY</BracketHeading>}
          subtitle="CONTROL YOUR ACCESS. PROTECT WHAT MATTERS."
          body="SECURE ACCESS TO SITE 00 AND MANAGE YOUR AUTHENTICATION, SESSIONS, AND CONNECTED ACCOUNTS."
        />
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
    </Site00PublicShell>
  );
}
