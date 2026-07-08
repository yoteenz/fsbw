import type { CSSProperties } from 'react';

type Props = {
  greeting: string;
  guidance: string;
  insight: string;
  reviewSpeech?: string | null;
  pipelineActive?: boolean;
  pipelineLayerLabel?: string | null;
  pipelineProgress?: number;
};

/** Studio Orb™ — room host; speech as holographic projection, not floating web panel. */
export function StudioOrbHost({
  greeting,
  guidance,
  insight,
  reviewSpeech,
  pipelineActive,
  pipelineLayerLabel,
  pipelineProgress = 0,
}: Props) {
  const speech = reviewSpeech ?? greeting;

  return (
    <div className="cds-orb-host" aria-live="polite">
      <div className="cds-orb-host__orbit-ring" aria-hidden />
      <div className="cds-orb-host__sphere" aria-hidden title="Studio Orb™">
        <div className="cds-orb-host__core-glow" />
        {pipelineActive ? (
          <div
            className="cds-orb-host__progress-ring"
            style={{ '--orb-progress': `${Math.max(8, pipelineProgress)}%` } as CSSProperties}
            aria-hidden
          />
        ) : null}
      </div>
      <div className="cds-orb-host__hologram">
        <p className="cds-orb-host__speech">{speech}</p>
        {!reviewSpeech ? (
          <>
            <p className="cds-orb-host__guidance">{guidance}</p>
            <p className="cds-orb-host__insight">{insight}</p>
          </>
        ) : null}
        {pipelineActive && pipelineLayerLabel ? (
          <p className="cds-orb-host__pipeline">Assembling {pipelineLayerLabel}…</p>
        ) : null}
      </div>
      <div className="cds-orb-host__glance-beam" aria-hidden />
    </div>
  );
}
