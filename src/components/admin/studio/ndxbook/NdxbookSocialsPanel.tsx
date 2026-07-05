import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioSocialAccounts } from '../../../../hooks/useAdminStudioSocialAccounts';
import { AdminStudioSocialAccountCard } from '../AdminStudioSocialAccountCard';
import { PLATFORM_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import { syncNdxbookSocialAccountsFromPublishing } from '../../../../studio-os-core/ndxbook/store';
import type { NdxbookSocialAccount } from '../../../../studio-os-core/ndxbook/types';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { adminStudioSocialAccountsPath } from '../../../../utils/adminStudioRoutes';

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

import type { PublicSocialAccount } from '../../../../utils/adminStudioSocialPublishing';

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
    onRegistryUpdated();
  }, [oauthAccounts, oauthLoading, onRegistryUpdated]);

  return (
    <div className="space-y-3">
      <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
        Connect official OAuth channels for ndxbook publishing. Tokens stay encrypted server-side — same connectors as Distribution → Social Accounts.
      </p>

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
            />
          ))}
        </div>
      )}

      <button
        type="button"
        className="text-[6px] underline"
        style={{ color: '#6366F1' }}
        onClick={() => navigate(adminStudioSocialAccountsPath())}
      >
        OPEN FULL SOCIAL ACCOUNTS PAGE
      </button>

      <SectionLabel>NDXBOOK BRAND REGISTRY (ALL PLATFORMS)</SectionLabel>
      {socialAccounts.map((acct) => (
        <div key={acct.id} className="p-2 border flex flex-col gap-0.5" style={panelStyle}>
          <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
            {PLATFORM_LABELS[acct.platform]}
          </p>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            STATUS · {acct.status.replace('-', ' ')}
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
