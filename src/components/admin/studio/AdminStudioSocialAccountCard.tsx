import type { PublicSocialAccount } from '../../../utils/adminStudioSocialPublishing';
import {
  SOCIAL_ACCOUNT_STATUS_COLORS,
  SOCIAL_ACCOUNT_STATUS_LABELS,
} from '../../../utils/adminStudioSocialPublishing';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioSocialAccountCardProps = {
  account: PublicSocialAccount;
  onConnect: () => void;
  onDisconnect: () => void;
  onTogglePosting: (disabled: boolean) => void;
  onSetupRequired?: () => void;
  busy?: boolean;
};

export function AdminStudioSocialAccountCard({
  account,
  onConnect,
  onDisconnect,
  onTogglePosting,
  onSetupRequired,
  busy,
}: AdminStudioSocialAccountCardProps) {
  const statusColor = SOCIAL_ACCOUNT_STATUS_COLORS[account.status];
  const connected = account.status === 'connected' || account.status === 'token_expiring';

  return (
    <div
      className="p-3 border"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderTop: `2px solid ${statusColor}`,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          {account.label}
        </p>
        <span className="text-[5px] font-futura uppercase px-1.5 py-0.5 border flex-shrink-0" style={{ fontWeight: 515, color: statusColor, borderColor: statusColor }}>
          {SOCIAL_ACCOUNT_STATUS_LABELS[account.status]}
        </span>
      </div>
      {account.accountLabel ? (
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {account.accountLabel}
        </p>
      ) : null}
      {!account.oauthConfigured ? (
        <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#CA8A04' }}>
          OAUTH NOT CONFIGURED ON SERVER
        </p>
      ) : null}
      {account.lastError ? (
        <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {account.lastError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1 mt-2">
        {!connected ? (
          <button
            type="button"
            disabled={busy || account.status === 'unavailable'}
            onClick={() => {
              if (!account.oauthConfigured) {
                onSetupRequired?.();
                return;
              }
              onConnect();
            }}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: account.oauthConfigured ? '#FFF' : '#CA8A04',
              background: account.oauthConfigured ? ADMIN_STUDIO_THEME.accent : 'white',
              borderColor: account.oauthConfigured ? ADMIN_STUDIO_THEME.panelBorder : '#CA8A04',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {account.oauthConfigured ? 'CONNECT' : 'SETUP REQUIRED'}
          </button>
        ) : (
          <>
            <button type="button" disabled={busy} onClick={onConnect} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              REAUTHORIZE
            </button>
            <button type="button" disabled={busy} onClick={onDisconnect} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              DISCONNECT
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onTogglePosting(!account.postingDisabled)}
              className="px-2 py-1 text-[6px] font-futura uppercase border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              {account.postingDisabled ? 'ENABLE POSTING' : 'DISABLE POSTING'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
