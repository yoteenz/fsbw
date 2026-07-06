import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioSocialAccountCard } from '../../../../components/admin/studio/AdminStudioSocialAccountCard';
import { SocialOAuthSetupPanel } from '../../../../components/admin/studio/SocialOAuthSetupPanel';
import { useAdminStudioSocialAccounts } from '../../../../hooks/useAdminStudioSocialAccounts';
import { useEnsureNdxbookWorkspaceFromBrandParam } from '../../../../hooks/useEnsureNdxbookWorkspace';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { NDXBOOK_WORKSPACE_ID } from '../../../../studio-os-core/ndxbook/constants';
import {
  adminStudioNdxbookDistributionPath,
} from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { allOAuthPlatformsUnconfigured } from '../../../../utils/socialOAuthSetupGuide';

export default function AdminStudioSocialAccountsPage() {
  useEnsureNdxbookWorkspaceFromBrandParam();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspaceId } = useWorkspace();
  const isNdxbook = workspaceId === NDXBOOK_WORKSPACE_ID || searchParams.get('brand') === 'ndxbook';
  const { accounts, loading, error, busyPlatform, refresh, connect, disconnect, togglePosting } = useAdminStudioSocialAccounts();

  const connected = searchParams.get('connected');
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (connected || oauthError) {
      void refresh();
      setSearchParams({}, { replace: true });
    }
  }, [connected, oauthError, refresh, setSearchParams]);

  return (
    <AdminStudioStageShell
      title="SOCIAL ACCOUNTS"
      subtitle={isNdxbook ? 'NDXBOOK · OFFICIAL OAUTH CONNECTORS — TOKENS ENCRYPTED SERVER-SIDE ONLY' : 'OFFICIAL OAUTH CONNECTORS — TOKENS ENCRYPTED SERVER-SIDE ONLY'}
      breadcrumbParentLabel={isNdxbook ? 'NDXBOOK DISTRIBUTION' : 'DISTRIBUTION NETWORK'}
      breadcrumbParentPath={isNdxbook ? adminStudioNdxbookDistributionPath() : '/admin/studio/distribution-network'}
      onBack={() => navigate(isNdxbook ? adminStudioNdxbookDistributionPath() : '/admin/studio/distribution-network')}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${ADMIN_STUDIO_THEME.accent}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          META GRAPH · TIKTOK CONTENT POSTING · PINTEREST · X API — NO PASSWORDS OR SCRAPING
        </p>
      </div>

      {oauthError ? (
        <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          OAUTH ERROR: {decodeURIComponent(oauthError)}
        </p>
      ) : null}
      {connected ? (
        <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: '#16A34A' }}>
          CONNECTED: {connected.toUpperCase()}
        </p>
      ) : null}
      {error ? (
        <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{error}</p>
      ) : null}

      {!loading ? (
        <SocialOAuthSetupPanel id="social-oauth-setup-panel" accounts={accounts} defaultOpen={allOAuthPlatformsUnconfigured(accounts)} />
      ) : null}

      <AdminStudioSectionHeading>CHANNEL STATUS</AdminStudioSectionHeading>
      {loading ? (
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>LOADING…</p>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <AdminStudioSocialAccountCard
              key={account.platform}
              account={account}
              busy={busyPlatform === account.platform}
              onConnect={() => void connect(account.platform)}
              onDisconnect={() => void disconnect(account.platform)}
              onTogglePosting={(disabled) => void togglePosting(account.platform, disabled)}
              onSetupRequired={() => {
                document.getElementById('social-oauth-setup-panel')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      )}

      <AdminStudioDisclaimerFooter>TOKENS NEVER EXPOSED TO FRONTEND · ADMIN APPROVAL REQUIRED FOR ALL POSTS</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
