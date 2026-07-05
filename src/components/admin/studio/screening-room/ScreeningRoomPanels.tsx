import { Link } from 'react-router-dom';
import { COMPARISON_FIELDS, SCREENING_ROOM_CONNECTED_SYSTEMS } from '../../../../studio-os-core/screening-room/constants';
import type {
  ComparisonFieldId,
  ConciergeReview,
  ScreeningProduction,
  ScreeningReviewAction,
  ScreeningRoomStore,
  ScreeningVersion,
} from '../../../../studio-os-core/screening-room/types';
import {
  adminStudioProductionStudioPath,
  adminStudioPublishingQueuePath,
  adminStudioRenderQueuePath,
  adminStudioScreeningRoomPath,
} from '../../../../utils/adminStudioRoutes';
import {
  SR_CINEMA_CSS,
  SR_VISUAL,
  formatRuntime,
  srGlassPanel,
  srGrace,
  srLabel,
  srValue,
} from './screeningRoomTheme';

type ActionHandler = (action: ScreeningReviewAction, note: string) => void;

function getCompareValue(version: ScreeningVersion, field: ComparisonFieldId): string {
  switch (field) {
    case 'thumbnail':
      return version.thumbnailNote;
    case 'voice':
      return version.voiceNote;
    case 'hook':
      return version.hook;
    case 'caption':
      return version.caption;
    case 'title':
      return version.title;
  }
}

export function ScreeningRoomAnimationStyles() {
  return <style>{SR_CINEMA_CSS}</style>;
}

export function ScreeningRoomTheaterShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="screening-room-theater relative overflow-hidden rounded-sm"
      style={{
        background: SR_VISUAL.bg,
        minHeight: 'min(85vh, 780px)',
        color: SR_VISUAL.text,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none sr-ambient"
        style={{ background: SR_VISUAL.ambient }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: SR_VISUAL.vignette }}
      />
      <div className="relative z-10 p-3">{children}</div>
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none sr-seating"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function ScreeningRoomTitleBar({ store }: { store: ScreeningRoomStore }) {
  return (
    <header className="mb-4 text-center">
      <p style={{ ...srLabel, color: SR_VISUAL.textDim }}>SCREENING ROOM · PRIVATE CINEMA · V1.0</p>
      <p style={{ ...srGrace, fontSize: '22px', marginTop: 4 }}>{store.companyName}</p>
      <p style={{ ...srValue, color: SR_VISUAL.textMuted, fontSize: '7px', marginTop: 6, maxWidth: 420, marginInline: 'auto' }}>
        {store.philosophy[0]}
      </p>
    </header>
  );
}

export function ScreeningProductionSelector({
  productions,
  selectedId,
  onSelect,
}: {
  productions: ScreeningProduction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-3 justify-center">
      {productions.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="whitespace-nowrap px-3 py-1.5 transition-all duration-300"
            style={{
              ...srGlassPanel,
              background: active ? SR_VISUAL.champagneSoft : SR_VISUAL.glass,
              borderColor: active ? 'rgba(201,169,98,0.35)' : 'rgba(255,255,255,0.1)',
              color: active ? SR_VISUAL.champagne : SR_VISUAL.textMuted,
              fontFamily: '"Futura PT Medium"',
              fontSize: '6px',
              letterSpacing: '0.06em',
            }}
          >
            {p.title}
          </button>
        );
      })}
    </div>
  );
}

export function ScreeningCinematicPlayer({
  version,
  playing,
  onTogglePlay,
}: {
  version: ScreeningVersion | null;
  playing: boolean;
  onTogglePlay: (v: boolean) => void;
}) {
  if (!version) return null;
  return (
    <div className="relative mb-3">
      <div
        className="sr-screen-glow relative aspect-video w-full max-w-3xl mx-auto overflow-hidden"
        style={{
          background: SR_VISUAL.bgSoft,
          boxShadow: '0 0 80px rgba(201,169,98,0.08), 0 24px 48px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
          style={{ background: SR_VISUAL.screenGlow }}
        >
          <p style={{ ...srLabel, color: SR_VISUAL.champagne, marginBottom: 8 }}>{version.label}</p>
          <p style={{ ...srGrace, fontSize: '20px', textAlign: 'center', maxWidth: '90%' }}>{version.hook}</p>
          <p style={{ ...srValue, color: SR_VISUAL.textMuted, marginTop: 12, textAlign: 'center', fontSize: '8px' }}>
            {version.thumbnailNote}
          </p>
          <p style={{ ...srLabel, marginTop: 16, color: SR_VISUAL.textDim }}>
            {formatRuntime(version.runtimeSec)} · PREVIEW · DEMO PLACEHOLDER
          </p>
        </div>
        <button
          type="button"
          onClick={() => onTogglePlay(!playing)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 transition-opacity hover:opacity-90"
          style={{
            ...srGlassPanel,
            fontFamily: '"Futura PT Medium"',
            fontSize: '7px',
            color: SR_VISUAL.champagne,
            letterSpacing: '0.12em',
          }}
        >
          {playing ? '❚❚ PAUSE' : '▶ EXPERIENCE'}
        </button>
      </div>
    </div>
  );
}

export function ScreeningVersionStrip({
  production,
  currentVersionId,
  compareMode,
  compareIds,
  onSelectVersion,
  onToggleCompare,
}: {
  production: ScreeningProduction;
  currentVersionId: string | null;
  compareMode: boolean;
  compareIds: string[];
  onSelectVersion: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  return (
    <div className="mb-3 p-2 max-w-3xl mx-auto" style={srGlassPanel}>
      <p style={{ ...srLabel, marginBottom: 8 }}>VERSIONS · CURRENT & ALTERNATES</p>
      <div className="flex flex-wrap gap-2">
        {production.versions.map((v) => {
          const active = v.id === currentVersionId;
          const inCompare = compareIds.includes(v.id);
          return (
            <div key={v.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectVersion(v.id)}
                className="px-2 py-1 transition-all"
                style={{
                  ...srGlassPanel,
                  background: active ? SR_VISUAL.champagneSoft : 'transparent',
                  borderColor: active ? 'rgba(201,169,98,0.4)' : 'rgba(255,255,255,0.08)',
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '6px',
                  color: active ? SR_VISUAL.champagne : SR_VISUAL.textMuted,
                }}
              >
                {v.label}
                {v.isCurrent && ' · CURRENT'}
              </button>
              {compareMode && (
                <button
                  type="button"
                  onClick={() => onToggleCompare(v.id)}
                  style={{
                    fontSize: '8px',
                    color: inCompare ? SR_VISUAL.success : SR_VISUAL.textDim,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label={`Compare ${v.label}`}
                >
                  {inCompare ? '◉' : '○'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScreeningComparePanel({
  versions,
  compareField,
  onSetField,
}: {
  versions: ScreeningVersion[];
  compareField: ComparisonFieldId;
  onSetField: (f: ComparisonFieldId) => void;
}) {
  if (versions.length < 2) return null;
  return (
    <div className="mb-3 p-3 max-w-3xl mx-auto" style={srGlassPanel}>
      <p style={{ ...srLabel, marginBottom: 8 }}>COMPARE VERSIONS · SIMULTANEOUS</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {COMPARISON_FIELDS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSetField(f.id)}
            style={{
              ...srGlassPanel,
              padding: '3px 6px',
              fontFamily: '"Futura PT Medium"',
              fontSize: '5px',
              color: compareField === f.id ? SR_VISUAL.champagne : SR_VISUAL.textDim,
              borderColor: compareField === f.id ? 'rgba(201,169,98,0.35)' : 'rgba(255,255,255,0.08)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(versions.length, 4)}, minmax(0, 1fr))` }}
      >
        {versions.map((v) => (
          <div key={v.id} className="p-2" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ ...srLabel, color: SR_VISUAL.champagne, fontSize: '5px' }}>{v.label}</p>
            <p style={{ ...srValue, fontSize: '6px', marginTop: 6 }}>{getCompareValue(v, compareField)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScreeningMetadataPanel({ version }: { version: ScreeningVersion | null }) {
  if (!version) return null;
  return (
    <div className="mb-3 p-3 max-w-3xl mx-auto grid grid-cols-2 gap-2 sm:grid-cols-3" style={srGlassPanel}>
      <div>
        <p style={srLabel}>DESCRIPTION</p>
        <p style={{ ...srValue, marginTop: 4, fontSize: '6px' }}>{version.description}</p>
      </div>
      <div>
        <p style={srLabel}>PERFORMANCE PREDICTION</p>
        <p style={{ ...srGrace, fontSize: '14px', marginTop: 4 }}>{version.performancePrediction}</p>
      </div>
      <div>
        <p style={srLabel}>CONFIDENCE</p>
        <p style={{ ...srGrace, fontSize: '18px', marginTop: 4 }}>{version.confidencePct}%</p>
      </div>
    </div>
  );
}

export function ScreeningConciergeColumn({ reviews }: { reviews: ConciergeReview[] }) {
  return (
    <aside className="space-y-2 overflow-y-auto max-h-[min(72vh,520px)]">
      <p style={{ ...srLabel, marginBottom: 8, color: SR_VISUAL.textDim }}>CONCIERGE REVIEW</p>
      {reviews.map((r) => (
        <div
          key={r.id}
          className="p-3 transition-opacity duration-500"
          style={{
            ...srGlassPanel,
            borderLeft: `2px solid ${r.accent}`,
          }}
        >
          <p style={{ ...srLabel, color: r.accent }}>{r.title}</p>
          <p style={{ ...srValue, fontSize: '6px', marginTop: 6, color: SR_VISUAL.textMuted }}>{r.notes}</p>
          <p style={{ ...srValue, fontSize: '6px', marginTop: 6, fontStyle: 'italic', color: SR_VISUAL.textDim }}>
            {r.analysis}
          </p>
        </div>
      ))}
    </aside>
  );
}

export function ScreeningActionBar({ onAction, lastAction }: { onAction: ActionHandler; lastAction?: ScreeningRoomStore['lastAction'] }) {
  const btn = (label: string, action: ScreeningReviewAction, note: string) => (
    <button
      key={action}
      type="button"
      onClick={() => onAction(action, note)}
      className="px-3 py-2 transition-all hover:brightness-110"
      style={{
        ...srGlassPanel,
        fontFamily: '"Futura PT Medium"',
        fontSize: '6px',
        letterSpacing: '0.08em',
        color: action === 'approve' ? SR_VISUAL.success : SR_VISUAL.champagne,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
        {btn('APPROVE', 'approve', 'Production approved for publication')}
        {btn('REQUEST CHANGES', 'request-changes', 'Changes requested — returned to production')}
        {btn('REGENERATE', 'regenerate', 'Sent back for regeneration')}
        {btn('COMPARE VERSIONS', 'compare', 'Compare mode toggled')}
        {btn('RUN EXPERIMENT', 'experiment', 'Experiment queued')}
        {btn('PUBLISH LATER', 'publish-later', 'Scheduled for later publication')}
        {btn('SEND TO RENDER AGAIN', 'send-to-render', 'Returned to render queue')}
      </div>
      {lastAction && (
        <p style={{ ...srLabel, textAlign: 'center', marginTop: 12, color: SR_VISUAL.textDim }}>
          LAST · {lastAction.action.replace(/-/g, ' ').toUpperCase()} · {lastAction.note}
        </p>
      )}
    </div>
  );
}

export function ScreeningRoomConnectedSystems() {
  return (
    <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {SCREENING_ROOM_CONNECTED_SYSTEMS.map((s) => (
          <span key={s} className="text-[5px] font-futura px-1 py-0.5" style={{ color: SR_VISUAL.textDim, border: SR_VISUAL.glassBorder }}>
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to={adminStudioRenderQueuePath()} style={{ ...srLabel, fontSize: '6px', color: SR_VISUAL.textMuted }}>→ RENDER QUEUE</Link>
        <Link to={adminStudioProductionStudioPath()} style={{ ...srLabel, fontSize: '6px', color: SR_VISUAL.champagne }}>→ PRODUCTION STUDIO</Link>
        <Link to={adminStudioPublishingQueuePath()} style={{ ...srLabel, fontSize: '6px', color: '#EB1C24' }}>→ PUBLISHING</Link>
        <Link to={adminStudioScreeningRoomPath()} style={{ ...srLabel, fontSize: '6px' }}>→ SCREENING ROOM</Link>
      </div>
    </div>
  );
}
