import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioSocialAccounts } from '../../../../hooks/useAdminStudioSocialAccounts';
import { AdminStudioSocialAccountCard } from '../AdminStudioSocialAccountCard';
import { SocialOAuthSetupPanel } from '../SocialOAuthSetupPanel';
import { PLATFORM_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import { syncNdxbookSocialAccountsFromPublishing } from '../../../../studio-os-core/ndxbook/store';
import { recordFounderMilestone } from '../../../../studio-os-core/founder-pilot-mode';
import { NDXBOOK_WORKSPACE_ID } from '../../../../studio-os-core/ndxbook/constants';
import type { NdxbookSocialAccount } from '../../../../studio-os-core/ndxbook/types';
import type { PublicSocialAccount } from '../../../../utils/adminStudioSocialPublishing';
import { allOAuthPlatformsUnconfigured } from '../../../../utils/socialOAuthSetupGuide';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { adminStudioNdxbookDistributionPath, adminStudioNdxbookSocialAccountsPath } from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function oauthAccountsSignature(accounts: PublicSocialAccount[]): string {
  return accounts.map((a) => `${a.platform}:${a.status}:${a.accountLabel ?? ''}`).join('|');
}

type NdxbookSocialsPanelProps = {
  socialAccounts: NdxbookSocialAccount[];
  onRegistryUpdated: () => void;
};

/** OAuth connectors load only when the SOCIALS tab is open — avoids blocking the brand setup page. */
export function NdxbookSocialsPanel({ socialAccounts, onRegistryUpdated }: NdxbookSocialsPanelProps) {
  const navigate = useNavigate();
  const syncedSignatureRef = useRef<string | null>(null);
  const setupPanelRef = useRef<HTMLDivElement>(null);
  const [setupPanelOpen, setSetupPanelOpen] = useState(false);

  const {
    accounts: oauthAccounts,
    loading: oauthLoading,
    error: oauthError,
    busyPlatform,
    refresh: refreshOAuth,
    connect,
    disconnect,
    togglePosting,
  } = useAdminStudioSocialAccounts();

  useEffect(() => {
    if (oauthLoading || oauthAccounts.length === 0) return;

    const signature = oauthAccountsSignature(oauthAccounts);
    if (syncedSignatureRef.current === signature) return;

    syncedSignatureRef.current = signature;
    syncNdxbookSocialAccountsFromPublishing(oauthAccounts);
    const ig = oauthAccounts.find((a) => a.platform === 'instagram');
    if (ig && (ig.status === 'connected' || ig.status === 'token_expiring')) {
      recordFounderMilestone(NDXBOOK_WORKSPACE_ID, 'instagram-connected', {
        description: 'Instagram OAuth connected — first publishing destination active.',
      });
    }
    onRegistryUpdated();
  }, [oauthAccounts, oauthLoading, onRegistryUpdated]);

  useEffect(() => {
    if (oauthLoading) return;
    if (allOAuthPlatformsUnconfigured(oauthAccounts)) {
      setSetupPanelOpen(true);
    }
  }, [oauthLoading, oauthAccounts]);

  const scrollToSetup = () => {
    setSetupPanelOpen(true);
    requestAnimationFrame(() => {
      setupPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
        Connect official OAuth channels for ndxbook publishing. Tokens stay encrypted server-side — same connectors as Distribution → Social Accounts.
      </p>

      {!oauthLoading && allOAuthPlatformsUnconfigured(oauthAccounts) ? (
        <p className="text-[6px] font-futura uppercase p-2 border" style={{ fontWeight: 515, color: '#CA8A04', borderColor: '#CA8A04', background: 'rgba(202,138,4,0.06)' }}>
          TAP SETUP REQUIRED ON ANY PLATFORM BELOW — CONNECT UNLOCKS AFTER VERCEL OAUTH ENV VARS ARE SET
        </p>
      ) : null}

      <div ref={setupPanelRef}>
        {!oauthLoading ? (
          <SocialOAuthSetupPanel
            id="ndxbook-social-oauth-setup"
            accounts={oauthAccounts}
            open={setupPanelOpen}
            onOpenChange={setSetupPanelOpen}
            defaultOpen={allOAuthPlatformsUnconfigured(oauthAccounts)}
          />
        ) : null}
      </div>

      {oauthError ? (
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {oauthError}
        </p>
      ) : null}

      <SectionLabel>OAUTH CONNECTORS</SectionLabel>
      {oauthLoading ? (
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          LOADING CONNECTORS…
        </p>
      ) : (
        <div className="space-y-2">
          {oauthAccounts.map((account) => (
            <AdminStudioSocialAccountCard
              key={account.platform}
              account={account}
              busy={busyPlatform === account.platform}
              onConnect={() => void connect(account.platform)}
              onDisconnect={() => void disconnect(account.platform)}
              onTogglePosting={(disabled) => void togglePosting(account.platform, disabled)}
              onSetupRequired={scrollToSetup}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="text-[6px] underline"
          style={{ color: '#6366F1' }}
          onClick={() => navigate(adminStudioNdxbookDistributionPath())}
        >
          REVIEW & POST CONTENT →
        </button>
        <button
          type="button"
          className="text-[6px] underline"
          style={{ color: '#6366F1' }}
          onClick={() => navigate(adminStudioNdxbookSocialAccountsPath())}
        >
          OPEN FULL SOCIAL ACCOUNTS PAGE
        </button>
      </div>

      <SectionLabel>NDXBOOK BRAND REGISTRY (ALL PLATFORMS)</SectionLabel>
      {socialAccounts.map((acct) => (
        <div key={acct.id} className="p-2 border flex flex-col gap-0.5" style={panelStyle}>
          <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
            {PLATFORM_LABELS[acct.platform]}
          </p>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            STATUS · {acct.status === 'locked' ? 'LOCKED' : acct.status.replace('-', ' ').toUpperCase()}
          </p>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            HANDLE · {acct.handle}
          </p>
          <p className="text-[5px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {acct.notes}
          </p>
        </div>
      ))}

      <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => void refreshOAuth()}>
        REFRESH CONNECTION STATUS
      </button>
    </div>
  );
}
