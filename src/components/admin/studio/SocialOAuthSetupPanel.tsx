import { useState } from 'react';
import type { PublicSocialAccount } from '../../../utils/adminStudioSocialPublishing';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import {
  SOCIAL_OAUTH_GLOBAL_ENV,
  buildPlatformSetupStatus,
  oauthCallbackUrlForDisplay,
} from '../../../utils/socialOAuthSetupGuide';

type SocialOAuthSetupPanelProps = {
  accounts: PublicSocialAccount[];
  defaultOpen?: boolean;
  open?: boolean;
  id?: string;
};

export function SocialOAuthSetupPanel({ accounts, defaultOpen = false, open: controlledOpen, id }: SocialOAuthSetupPanelProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const toggleOpen = () => {
    if (controlledOpen === undefined) setInternalOpen((v) => !v);
  };
  const platforms = buildPlatformSetupStatus(accounts);
  const unconfigured = platforms.filter((p) => !p.configured);
  const callbackUrl = oauthCallbackUrlForDisplay();

  if (unconfigured.length === 0) return null;

  return (
    <div
      id={id}
      className="mb-3 border"
      style={{
        background: 'rgba(202,138,4,0.08)',
        borderColor: '#CA8A04',
        borderTopWidth: 3,
      }}
    >
      <button
        type="button"
        className="w-full text-left p-3"
        onClick={toggleOpen}
      >
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: '#CA8A04' }}>
          CONNECT BLOCKED · OAUTH NOT CONFIGURED ON SERVER ({unconfigured.length} PLATFORM{unconfigured.length === 1 ? '' : 'S'})
        </p>
        <p className="text-[6px] font-futura normal-case mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.5 }}>
          Connect buttons stay inactive until Vercel environment variables are set. This is server-side setup — not a bug in the app.
        </p>
        <p className="text-[6px] font-futura uppercase mt-1 underline" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {open ? 'HIDE SETUP STEPS' : 'SHOW SETUP STEPS'}
        </p>
      </button>

      {open ? (
        <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: 'rgba(202,138,4,0.35)' }}>
          <div>
            <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              1 · SUPABASE MIGRATION
            </p>
            <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              Run <span style={{ fontFamily: 'monospace' }}>supabase/migrations/20260704120000_studio_social_publishing.sql</span> in the Supabase SQL Editor (creates studio_social_accounts tables).
            </p>
          </div>

          <div>
            <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              2 · VERCEL ENV VARS (Project → Settings → Environment Variables)
            </p>
            {SOCIAL_OAUTH_GLOBAL_ENV.map((env) => (
              <p key={env.key} className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                · <span style={{ fontFamily: 'monospace' }}>{env.key}</span> — {env.description}
              </p>
            ))}
            {platforms.map((p) => (
              <div key={p.platform} className="mt-2 p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: p.configured ? 'rgba(22,163,74,0.06)' : 'white' }}>
                <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: p.configured ? '#16A34A' : '#CA8A04' }}>
                  {p.label} · {p.configured ? 'CONFIGURED' : 'MISSING'}
                </p>
                <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {p.envVars.map((v) => v).join(' · ')}
                </p>
                {p.notes ? (
                  <p className="text-[5px] font-futura normal-case mt-0.5" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {p.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div>
            <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              3 · OAUTH REDIRECT URL (paste into Meta / TikTok / Pinterest / X app settings)
            </p>
            <p
              className="text-[6px] font-futura normal-case p-2 border break-all select-all"
              style={{ fontWeight: 515, fontFamily: 'monospace', color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              {callbackUrl}
            </p>
          </div>

          <div>
            <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
              4 · REDEPLOY VERCEL
            </p>
            <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              After saving env vars, trigger a new production deploy. Then return here — Connect will activate and open the official OAuth screen for each platform.
            </p>
          </div>

          <p className="text-[5px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Full guide: docs/STUDIO_SOCIAL_PUBLISHING.md in the repo.
          </p>
        </div>
      ) : null}
    </div>
  );
}
