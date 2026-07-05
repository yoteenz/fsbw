import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioNdxbookState } from '../../../../hooks/useAdminStudioNdxbookState';
import { useAdminStudioSocialAccounts } from '../../../../hooks/useAdminStudioSocialAccounts';
import { AdminStudioSocialAccountCard } from '../AdminStudioSocialAccountCard';
import { NDXBOOK_TABS, type NdxbookTabId } from '../../../../utils/adminStudioNdxbookDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  PLATFORM_LABELS,
  VOLUME_LABELS,
  PROGRAMMING_SLOT_FIELDS,
  LABS_TRACKING_FIELDS,
} from '../../../../studio-os-core/ndxbook/constants';
import { syncNdxbookSocialAccountsFromPublishing } from '../../../../studio-os-core/ndxbook/store';
import {
  adminStudioLabsPath,
  adminStudioMemoryBiblePath,
  adminStudioSocialAccountsPath,
  adminStudioTalentNetworkPath,
} from '../../../../utils/adminStudioRoutes';

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

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function NdxbookWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as NdxbookTabId | null) ?? 'overview';
  const [tab, setTab] = useState<NdxbookTabId>(
    NDXBOOK_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    brand,
    taxonomy,
    volumes,
    programming,
    pages,
    talentHosts,
    socialAccounts,
    voiceRules,
    creativeDna,
    launchChecklist,
    dashboard,
    nextPageNumber,
    labsTrackingFields,
    refresh,
  } = useAdminStudioNdxbookState();

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
    syncNdxbookSocialAccountsFromPublishing(oauthAccounts);
    refresh();
  }, [oauthAccounts, oauthLoading, refresh]);

  const selectTab = (id: NdxbookTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (!brand) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        NDXBOOK LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.accent }}>
                {brand.publicName.toUpperCase()}
              </p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {brand.positioning}
              </p>
              <p className="text-[6px] font-futura mt-1 uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                {brand.promise}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="BRAND" value={dashboard.brand} accent />
              <MetricCard label="LAUNCH VOLUMES" value={`${dashboard.launchVolumes}`} accent />
              <MetricCard label="PAGES CREATED" value={`${dashboard.pagesCreated}`} />
              <MetricCard label="PAGES SCHEDULED" value={`${dashboard.pagesScheduled}`} />
              <MetricCard label="SOCIALS CONNECTED" value={`${dashboard.socialsConnected}`} />
              <MetricCard label="LABS EXPERIMENTS" value={`${dashboard.labsExperiments}`} />
            </div>
            <div className="p-2 border" style={{ ...panelStyle, borderColor: ADMIN_STUDIO_THEME.accent }}>
              <SectionLabel>NEXT ACTION</SectionLabel>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {dashboard.nextAction}
              </p>
              {dashboard.socialsConnected === 0 ? (
                <button
                  type="button"
                  className="text-[6px] underline mt-2"
                  style={{ color: '#6366F1' }}
                  onClick={() => selectTab('socials')}
                >
                  CONNECT SOCIAL ACCOUNTS
                </button>
              ) : null}
            </div>
            <SectionLabel>BRAND ARCHITECTURE</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {brand.architecture.internalWorkspace} (internal) → {brand.architecture.publicBrand} (public) · {brand.architecture.experimentationLayer} (experiments)
            </p>
          </div>
        );

      case 'brand':
        return (
          <div className="space-y-2">
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>PUBLIC NAME</p>
              <p className="text-[8px] font-futura mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
                {brand.publicName}
              </p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>DESCRIPTION</p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {brand.description}
              </p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>POSITIONING</p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {brand.positioning}
              </p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>PROMISE</p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {brand.promise}
              </p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>INTERNAL MEANING</p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {brand.internalMeaning} — keep public explanation minimal.
              </p>
            </div>
            <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate(adminStudioMemoryBiblePath())}>
              OPEN MEMORY BIBLE
            </button>
          </div>
        );

      case 'taxonomy':
        return taxonomy ? (
          <div className="space-y-2">
            {[
              ['VIDEOS', taxonomy.videoTerm],
              ['CONTENT PILLARS', taxonomy.pillarTerm],
              ['TOPIC CATEGORIES', taxonomy.categoryTerm],
              ['SERIES', taxonomy.seriesTerm],
              ['AUDIENCE', taxonomy.audienceTerm],
            ].map(([label, term]) => (
              <div key={label} className="p-2 border flex justify-between" style={panelStyle}>
                <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{label}</span>
                <span className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{term}</span>
              </div>
            ))}
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {taxonomy.internalNote}
              </p>
            </div>
            <SectionLabel>EXAMPLES</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              volume 001 — money · chapter — credit · page 001 — why your credit score drops after paying off debt
            </p>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              volume 003 — mind · chapter — habits · page 014 — why your brain avoids hard tasks
            </p>
          </div>
        ) : null;

      case 'volumes':
        return (
          <div className="space-y-2">
            {volumes.map((vol) => (
              <div key={vol.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {vol.displayLabel}
                </p>
                <p className="text-[6px] font-futura mt-1 uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  CHAPTERS · {vol.chapters.length}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vol.chapters.map((ch) => (
                    <span key={ch} className="text-[5px] font-futura px-1 border uppercase" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'programming':
        return (
          <div className="space-y-3">
            {programming.map((day) => (
              <div key={day.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {day.seriesTitle.toUpperCase()} · {day.weekday.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {day.description}
                </p>
                <p className="text-[6px] font-futura mt-1 uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  VOLUME · {VOLUME_LABELS[day.primaryVolumeId]}
                  {day.secondaryVolumeIds.length > 0
                    ? ` / ${day.secondaryVolumeIds.map((id) => VOLUME_LABELS[id]).join(' / ')}`
                    : ''}
                </p>
              </div>
            ))}
            <SectionLabel>EACH SLOT SUPPORTS</SectionLabel>
            {PROGRAMMING_SLOT_FIELDS.map((field) => (
              <p key={field} className="text-[6px] font-futura px-2 py-0.5 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {field}
              </p>
            ))}
          </div>
        );

      case 'pages':
        return (
          <div className="space-y-2">
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                GLOBAL PAGE NUMBERING
              </p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                Next available · page {String(nextPageNumber).padStart(3, '0')} · numbers do not reset per volume.
              </p>
            </div>
            {pages.length === 0 ? (
              <p className="text-[6px] font-futura uppercase px-2 py-2 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                NO PAGES YET · CREATE FIRST PAGE FROM LAUNCH CHECKLIST
              </p>
            ) : (
              pages.map((page) => (
                <div key={page.id} className="p-2 border normal-case" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                    {page.pageLabel} · {VOLUME_LABELS[page.volumeId]} · {page.chapter}
                  </p>
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {page.title}
                  </p>
                  <p className="text-[5px] font-futura mt-1 uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    STATUS · {page.status} · PLATFORMS · {page.platforms.map((p) => PLATFORM_LABELS[p]).join(', ') || '—'}
                  </p>
                </div>
              ))
            )}
          </div>
        );

      case 'voice':
        return voiceRules ? (
          <div className="space-y-2">
            <SectionLabel>VOICE</SectionLabel>
            {voiceRules.voice.map((v) => (
              <p key={v} className="text-[6px] font-futura px-2 py-1 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>· {v}</p>
            ))}
            <SectionLabel>NEVER</SectionLabel>
            {voiceRules.avoid.map((v) => (
              <p key={v} className="text-[6px] font-futura px-2 py-1 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>· {v}</p>
            ))}
            <SectionLabel>COPY STYLE</SectionLabel>
            {voiceRules.copyStyle.map((v) => (
              <p key={v} className="text-[6px] font-futura px-2 py-1 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>· {v}</p>
            ))}
            <SectionLabel>EACH PAGE ANSWERS</SectionLabel>
            {voiceRules.pageQuestions.map((q) => (
              <p key={q} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>· {q}</p>
            ))}
          </div>
        ) : null;

      case 'visual':
        return creativeDna ? (
          <div className="space-y-2">
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                CREATIVE DNA · {creativeDna.status.toUpperCase()}
              </p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {creativeDna.notes}
              </p>
            </div>
            <SectionLabel>STYLE DIRECTION</SectionLabel>
            {creativeDna.styleDirection.map((s) => (
              <p key={s} className="text-[6px] font-futura px-2 py-1 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>· {s}</p>
            ))}
            <SectionLabel>VISUAL SYSTEM</SectionLabel>
            {creativeDna.visualSystem.map((s) => (
              <p key={s} className="text-[6px] font-futura px-2 py-1 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>· {s}</p>
            ))}
          </div>
        ) : null;

      case 'talent':
        return (
          <div className="space-y-2">
            <p className="text-[6px] font-futura normal-case mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              Placeholder hosts — not Frontal Slayer PSA. Connect to Talent Network when profiles are ready.
            </p>
            {talentHosts.map((host) => (
              <div key={host.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {host.role.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {host.displayName} · {VOLUME_LABELS[host.volumeId]}
                </p>
                <p className="text-[5px] font-futura mt-1 normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {host.notes}
                </p>
              </div>
            ))}
            <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate(adminStudioTalentNetworkPath())}>
              OPEN TALENT NETWORK
            </button>
          </div>
        );

      case 'socials':
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

      case 'labs':
        return (
          <div className="space-y-2">
            <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              Every ndxbook page automatically becomes a Studio OS Labs experiment when published.
            </p>
            <SectionLabel>TRACKED FIELDS</SectionLabel>
            {(labsTrackingFields.length ? labsTrackingFields : LABS_TRACKING_FIELDS).map((field) => (
              <p key={field} className="text-[6px] font-futura px-2 py-0.5 border uppercase" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {field}
              </p>
            ))}
            <button type="button" className="text-[6px] underline mt-2" style={{ color: '#6366F1' }} onClick={() => navigate(adminStudioLabsPath())}>
              OPEN STUDIO OS LABS
            </button>
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-1">
            <p className="text-[6px] font-futura normal-case mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              Launch checklist — items are not auto-completed.
            </p>
            {launchChecklist.map((item) => (
              <div key={item.id} className="p-2 border flex items-center gap-2" style={panelStyle}>
                <span
                  className="w-3 h-3 border flex-shrink-0 flex items-center justify-center text-[6px]"
                  style={{
                    borderColor: item.completed ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
                    color: item.completed ? ADMIN_STUDIO_THEME.accent : 'transparent',
                  }}
                >
                  {item.completed ? '✓' : ''}
                </span>
                <span
                  className="text-[6px] font-futura uppercase flex-1"
                  style={{
                    fontWeight: 515,
                    color: item.completed ? ADMIN_STUDIO_THEME.textSecondary : ADMIN_STUDIO_THEME.textPrimary,
                    textDecoration: item.completed ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {NDXBOOK_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
