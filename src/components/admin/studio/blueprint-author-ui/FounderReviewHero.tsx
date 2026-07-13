import { useCallback, useState, type CSSProperties } from 'react';
import type { FounderRenderJobView } from '../../../../studio-os-core/founder-render';

const heroShell: CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: 'min(72vh, 640px)',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)',
  background: '#0f172a',
};

type Props = {
  job: FounderRenderJobView;
  onImageLoaded?: () => void;
  onImageError?: () => void;
  onRegenerate?: () => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
};

/** Founder Render™ — photoreal full-room preview only. No procedural shapes. */
export function FounderReviewHero({
  job,
  onImageLoaded,
  onImageError,
  onRegenerate,
  onGenerate,
  isGenerating,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const toggleFullscreen = useCallback(() => setFullscreen((v) => !v), []);

  const statusLabel = statusCopy(job.status, isGenerating);

  return (
    <div data-founder-review-hero data-founder-render-status={job.status} style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={heroShell}>
        {job.status === 'ready' || job.status === 'approved' ? (
          job.previewArtifactUrl ? (
            <img
              src={job.previewArtifactUrl}
              alt={`${job.roomDisplayName} founder render`}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 'min(72vh, 640px)',
                objectFit: 'cover',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
              }}
              onLoad={onImageLoaded}
              onError={onImageError}
            />
          ) : (
            <FailedPanel message="Preview URL missing after generation." />
          )
        ) : job.status === 'failed' ? (
          <FailedPanel message={job.failureReason ?? 'Founder Preview Failed'} onRetry={onRegenerate} />
        ) : job.status === 'stale' ? (
          <StalePanel
            job={job}
            onRegenerate={onRegenerate}
            previewUrl={job.previewArtifactUrl}
            onImageLoaded={onImageLoaded}
          />
        ) : job.status === 'no_preview' ? (
          <NoPreviewPanel onGenerate={onGenerate} isGenerating={isGenerating} />
        ) : (
          <GeneratingPanel status={statusLabel} />
        )}

        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
              Founder Render™ · {statusLabel}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
              {job.roomDisplayName}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
              Blueprint rev {job.currentBlueprintRevision}
              {job.providerModel ? ` · ${job.providerModel}` : ''}
            </p>
          </div>
        </div>

        {(job.status === 'ready' || job.status === 'approved') && job.previewArtifactUrl ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 8,
              zIndex: 3,
            }}
          >
            <HeroBtn onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))} label="Zoom +" />
            <HeroBtn onClick={() => setZoom((z) => Math.max(1, z - 0.25))} label="Zoom −" />
            <HeroBtn onClick={toggleFullscreen} label="Full screen" />
          </div>
        ) : null}
      </div>

      {fullscreen && job.previewArtifactUrl ? (
        <div
          role="dialog"
          aria-modal
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setFullscreen(false)}
        >
          <img
            src={job.previewArtifactUrl}
            alt={`${job.roomDisplayName} full screen`}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}

function HeroBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 10px',
        fontSize: '9px',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 6,
        background: 'rgba(0,0,0,0.45)',
        color: '#fff',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
      }}
    >
      {label}
    </button>
  );
}

function statusCopy(status: FounderRenderJobView['status'], isGenerating?: boolean): string {
  if (status === 'failed') return 'Failed';
  if (status === 'stale') return 'Stale';
  if (isGenerating) return 'Generating';
  switch (status) {
    case 'no_preview':
      return 'No Preview';
    case 'queued':
      return 'Queued';
    case 'generating':
      return 'Generating';
    case 'ready':
      return 'Ready';
    case 'approved':
      return 'Approved';
    default:
      return status;
  }
}

function NoPreviewPanel({ onGenerate, isGenerating }: { onGenerate?: () => void; isGenerating?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'min(72vh, 640px)',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Construction Plan ready</p>
      <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#94a3b8', maxWidth: 360 }}>
        Generate a photoreal full-room Founder Render from your approved Construction Plan. No procedural placeholder will be shown.
      </p>
      {onGenerate ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          style={{
            marginTop: 20,
            padding: '12px 20px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: 10,
            cursor: isGenerating ? 'wait' : 'pointer',
            background: '#eb1c24',
            color: '#fff',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Submitting…' : 'Generate Founder Preview'}
        </button>
      ) : null}
    </div>
  );
}

function GeneratingPanel({ status }: { status: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'min(72vh, 640px)',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{status}</p>
      <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#94a3b8' }}>
        Photoreal full-room render in progress. No fake placeholder room will appear.
      </p>
    </div>
  );
}

function FailedPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'min(72vh, 640px)',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f87171' }}>Founder Preview Failed</p>
      <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#fca5a5', maxWidth: 420 }}>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} style={{ marginTop: 16, padding: '10px 16px', borderRadius: 8, border: '1px solid #f87171', background: 'transparent', color: '#fecaca', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
          Regenerate Preview
        </button>
      ) : null}
    </div>
  );
}

function StalePanel({
  job,
  onRegenerate,
  previewUrl,
  onImageLoaded,
}: {
  job: FounderRenderJobView;
  onRegenerate?: () => void;
  previewUrl: string | null;
  onImageLoaded?: () => void;
}) {
  return (
    <div style={{ position: 'relative', minHeight: 'min(72vh, 640px)' }}>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Stale founder render"
          style={{ width: '100%', height: '100%', minHeight: 'min(72vh, 640px)', objectFit: 'cover', opacity: 0.45 }}
          onLoad={onImageLoaded}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          background: 'rgba(15,23,42,0.55)',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>Preview is stale</p>
        <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#fde68a', maxWidth: 400 }}>
          This preview represents Blueprint Revision {job.blueprintRevision}. Current revision is {job.currentBlueprintRevision}.
          Regenerate before approval.
        </p>
        {onRegenerate ? (
          <button type="button" onClick={onRegenerate} style={{ marginTop: 16, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#eb1c24', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
            Regenerate Preview
          </button>
        ) : null}
      </div>
    </div>
  );
}
