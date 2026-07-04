import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioVisionEngineState } from '../../../../hooks/useAdminStudioVisionEngineState';
import {
  DEMO_VISION_ANALYTICS,
  VISION_ENGINE_TABS,
  visionShareUrl,
  type VisionEngineTabId,
} from '../../../../utils/adminStudioVisionEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { launchVisionPresentation } from '../../../../studio-os-core/vision-engine/launch';
import { VISION_MODE_LABELS } from '../../../../studio-os-core/vision-engine/constants';
import type { VisionModeDefinition } from '../../../../studio-os-core/vision-engine/types';

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

export function VisionEngineWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as VisionEngineTabId | null) ?? 'overview';
  const [tab, setTab] = useState<VisionEngineTabId>(
    VISION_ENGINE_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );
  const [selectedModeId, setSelectedModeId] = useState<string>('');
  const [shareSlug, setShareSlug] = useState('creative');
  const [shareLabel, setShareLabel] = useState('Creative Partner Vision Link');

  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState('');

  const {
    workspaceId,
    manifest,
    modes,
    shareLinks,
    shareLoading,
    shareMigrationRequired,
    recorderJobs,
    saveCustomMode,
    createShareLink,
    removeShareLink,
    queueRecorder,
  } = useAdminStudioVisionEngineState();

  const activeModeId = selectedModeId || modes[0]?.id || '';

  const selectTab = (id: VisionEngineTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  const launchMode = (modeId: string, opts?: { record?: boolean }) => {
    const mode = modes.find((m) => m.id === modeId);
    if (!mode) return;
    const ok = launchVisionPresentation({
      modeId,
      workspaceId,
      presenterMode: mode.presenterModeDefault,
      recordMode: opts?.record ?? false,
      luxuryAudio: true,
    });
    if (!ok) return;
    const firstRoute = mode.stops.find((s) => s.route)?.route ?? '/home/shop';
    navigate(firstRoute);
  };

  const duplicateMode = () => {
    const base = modes.find((m) => m.id === activeModeId);
    if (!base) return;
    const copy: VisionModeDefinition = {
      ...base,
      id: `${base.id}-custom-${Date.now()}`,
      name: `${base.name} (Custom)`,
      aiGenerated: false,
    };
    saveCustomMode(copy);
  };

  const createShare = async () => {
    if (!activeModeId) return;
    setShareBusy(true);
    setShareError('');
    try {
      await createShareLink({
        slug: shareSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        modeId: activeModeId,
        workspaceId,
        label: shareLabel,
        autoplay: true,
        presenterMode: false,
        selfGuided: true,
      });
    } catch (e) {
      setShareError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setShareBusy(false);
    }
  };

  const modeSummary = useMemo(
    () =>
      modes.map((m) => ({
        id: m.id,
        label: m.name,
        stops: m.stops.length,
        chapters: m.chapters.length,
        kind: VISION_MODE_LABELS[m.kind],
      })),
    [modes]
  );

  if (!manifest) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        VISION MANIFEST LOADING — REGISTER WORKSPACE ADAPTER
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="VISION MODES" value={`${modes.length}`} accent />
              <MetricCard label="WORKSPACE" value={manifest.brandName.toUpperCase()} />
              <MetricCard label="SHARE LINKS" value={`${shareLinks.length}`} />
              <MetricCard label="RECORDER JOBS" value={`${recorderJobs.length}`} />
            </div>
            <SectionLabel>CANONICAL VISION MODES — REUSABLE PRESENTATION TEMPLATES</SectionLabel>
            <div className="space-y-1">
              {modeSummary.map((m) => (
                <div key={m.id} className="p-2 border flex justify-between items-center" style={panelStyle}>
                  <div>
                    <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                      {m.label}
                    </p>
                    <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                      {m.stops} STOPS · {m.chapters} CHAPTERS
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-2 py-1 text-[6px] font-futura uppercase border"
                    style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.accent }}
                    onClick={() => launchMode(m.id)}
                  >
                    Launch
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              INTERNAL ONLY — NOT EXPOSED IN CUSTOMER NAV · FRONTAL SLAYER IS FIRST WORKSPACE CONSUMER
            </p>
          </div>
        );

      case 'builder':
        return (
          <div className="space-y-3">
            <SectionLabel>VISION ENGINE BUILDER™ — NO-CODE PRESENTATION BUILDER</SectionLabel>
            <select
              className="w-full p-2 text-[7px] font-futura uppercase border"
              style={panelStyle}
              value={activeModeId}
              onChange={(e) => setSelectedModeId(e.target.value)}
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {modes
              .filter((m) => m.id === activeModeId)
              .map((mode) => (
                <div key={mode.id} className="space-y-2">
                  <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {mode.description}
                  </p>
                  <SectionLabel>CHAPTERS · DRAG ORDER (DEMO — LOCAL STORAGE)</SectionLabel>
                  {mode.chapters.map((ch, idx) => (
                    <div key={ch.id} className="p-2 border flex gap-2 items-center" style={panelStyle}>
                      <span className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515 }}>
                          {ch.title}
                        </p>
                        <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                          {ch.stopIds.length} STOPS
                        </p>
                      </div>
                      <span className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                        ⋮⋮
                      </span>
                    </div>
                  ))}
                  <SectionLabel>ROUTE STOPS · NARRATION · HOTSPOTS · TRANSITIONS</SectionLabel>
                  <div className="max-h-48 overflow-auto space-y-1 border p-1" style={panelStyle}>
                    {mode.stops.map((stop, i) => (
                      <div key={stop.id} className="p-1 border-b text-[6px] font-futura uppercase" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                        {i + 1}. {stop.title} · {stop.durationMs / 1000}s · {stop.transition}
                        {stop.route ? ` · ${stop.route}` : ''}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full py-2 text-[7px] font-futura uppercase border"
                    style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
                    onClick={duplicateMode}
                  >
                    Duplicate as Custom Vision Mode
                  </button>
                </div>
              ))}
          </div>
        );

      case 'recorder':
        return (
          <div className="space-y-3">
            <SectionLabel>VISION RECORDER™ — AI CINEMATOGRAPHER (NOT A SCREEN RECORDER)</SectionLabel>
            <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              QUEUES CINEMATIC DIRECTING · MP4 · SOCIAL REEL · PRESENTATION LINK · FUTURE: 21:9 · 16:9 · 9:16 · 4:5 · 1:1
            </p>
            <select
              className="w-full p-2 text-[7px] font-futura uppercase border"
              style={panelStyle}
              value={activeModeId}
              onChange={(e) => setSelectedModeId(e.target.value)}
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="w-full py-2 text-[7px] font-futura uppercase border"
              style={{ borderColor: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.accent }}
              onClick={() => {
                queueRecorder(activeModeId);
                launchMode(activeModeId, { record: true });
              }}
            >
              Queue AI Cinematography + Launch Record Mode
            </button>
            <SectionLabel>RECORDER QUEUE</SectionLabel>
            {recorderJobs.length === 0 ? (
              <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                NO JOBS YET
              </p>
            ) : (
              recorderJobs.map((job) => (
                <div key={job.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase">{job.status.toUpperCase()}</p>
                  <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {job.note}
                  </p>
                </div>
              ))
            )}
          </div>
        );

      case 'share':
        return (
          <div className="space-y-3">
            <SectionLabel>VISION SHARE™ — SERVER-PERSISTED · WORKS ON ANY DEVICE</SectionLabel>
            <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              PRODUCTION: https://fsbw.vercel.app/vision/creative · /vision/investor · /vision/agency (seeded in Supabase)
            </p>
            {shareMigrationRequired ? (
              <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                RUN MIGRATION 20260704220000_vision_share_links ON SUPABASE
              </p>
            ) : null}
            {shareError ? (
              <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                {shareError}
              </p>
            ) : null}
            <input
              className="w-full p-2 text-[7px] font-futura uppercase border"
              style={panelStyle}
              value={shareLabel}
              onChange={(e) => setShareLabel(e.target.value)}
              placeholder="Link label"
            />
            <input
              className="w-full p-2 text-[7px] font-futura uppercase border"
              style={panelStyle}
              value={shareSlug}
              onChange={(e) => setShareSlug(e.target.value)}
              placeholder="Slug (e.g. creative)"
            />
            <select
              className="w-full p-2 text-[7px] font-futura uppercase border"
              style={panelStyle}
              value={activeModeId}
              onChange={(e) => setSelectedModeId(e.target.value)}
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="w-full py-2 text-[7px] font-futura uppercase border"
              style={{ borderColor: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.accent }}
              disabled={shareBusy}
              onClick={() => void createShare()}
            >
              {shareBusy ? 'Saving…' : 'Create Vision Link'}
            </button>
            <SectionLabel>ACTIVE LINKS {shareLoading ? '· LOADING…' : ''}</SectionLabel>
            {shareLinks.length === 0 && !shareLoading ? (
              <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                NO LINKS YET — USE DEFAULT /vision/creative AFTER MIGRATION
              </p>
            ) : null}
            {shareLinks.map((link) => (
              <div key={link.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase">{link.label}</p>
                <p className="text-[6px] font-futura break-all" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {visionShareUrl(link.slug)}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {link.views} VIEWS · AUTOPLAY {link.autoplay ? 'ON' : 'OFF'}
                </p>
                <button
                  type="button"
                  className="mt-2 text-[6px] font-futura uppercase underline"
                  style={{ color: ADMIN_STUDIO_THEME.textSecondary }}
                  onClick={() => void removeShareLink(link.slug)}
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-3">
            <SectionLabel>VISION ANALYTICS™ — PRESENTATION INTELLIGENCE</SectionLabel>
            {DEMO_VISION_ANALYTICS.map((row) => (
              <div key={row.shareId} className="p-2 border space-y-2" style={panelStyle}>
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515 }}>
                  {row.modeLabel}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <MetricCard label="VIEWS" value={`${row.totalViews}`} />
                  <MetricCard label="COMPLETION" value={`${Math.round(row.completionRate * 100)}%`} accent />
                  <MetricCard label="AVG WATCH" value={`${Math.round(row.avgWatchMs / 60000)}M`} />
                  <MetricCard label="HOTSPOTS" value={`${row.hotspotClicks}`} />
                </div>
                <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  REPLAYED: {row.replayedSections.join(' · ')}
                </p>
                <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  SKIPPED: {row.skippedSections.join(' · ')}
                </p>
                <p className="text-[7px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {row.engagementTimeline}
                </p>
              </div>
            ))}
          </div>
        );

      case 'launch':
        return (
          <div className="space-y-3">
            <SectionLabel>LAUNCH VISION MODE — ADMIN / INTERNAL ROLES ONLY</SectionLabel>
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                className="w-full py-2 text-[7px] font-futura uppercase border text-left px-3"
                style={{ ...panelStyle, color: ADMIN_STUDIO_THEME.textPrimary }}
                onClick={() => launchMode(m.id)}
              >
                {m.name} → {m.stops.length} stops
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {VISION_ENGINE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'transparent',
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
