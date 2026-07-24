import type { ReactNode } from 'react';
import { TransitionLayer } from '../../motion';
import { FSCS_STORY_RHYTHM, resolveCampaignBeat } from '../story/campaignStructure';
import { useCinematicTimeline } from '../timeline/useCinematicTimeline';
import { CinematicOverlay, LowerThird } from '../overlays';
import { CinematicTitle } from '../titles';
import { cn } from '../utilities/resolve';
import type { FscsCampaignBeatId, FscsTimelineId } from '../utilities/types';

export type CinematicSequenceProps = {
  timeline?: FscsTimelineId | string;
  beat?: FscsCampaignBeatId;
  title?: string;
  lowerThird?: { primary: string; secondary?: string };
  progress?: number;
  className?: string;
  children?: ReactNode;
};

/** Campaign beat orchestrator — connects timeline, story rhythm, FSMS transitions */
export function CinematicSequence({
  timeline = 'commercial-60',
  beat = 'opening-atmosphere',
  title,
  lowerThird,
  progress = 0,
  className,
  children,
}: CinematicSequenceProps) {
  const { preset, beatDurations } = useCinematicTimeline({ preset: timeline });
  const beatSpec = resolveCampaignBeat(beat);
  const transition = beatSpec.recommendedTransition;

  return (
    <div
      className={cn('fscs-root', className)}
      data-fscs-timeline={preset.id}
      data-fscs-beat={beat}
      style={{ ['--fscs-progress' as string]: progress }}
    >
      <div className="fscs-timeline-bar" aria-hidden>
        <div className="fscs-timeline-bar__progress" />
      </div>
      <TransitionLayer visible={progress > 0 && progress < 1} preset="elegant-dissolve" duration={800} />
      <CinematicOverlay />
      {title ? (
        <CinematicTitle
          text={title}
          kind="scene"
          duration={beatDurations[beat] ?? beatSpec.suggestedDurationMs}
          delay={beatSpec.silenceBeforeMs + FSCS_STORY_RHYTHM.silenceBeforeRevealMs}
        />
      ) : null}
      {lowerThird ? (
        <LowerThird
          primary={lowerThird.primary}
          secondary={lowerThird.secondary}
          delayMs={beatSpec.silenceBeforeMs}
        />
      ) : null}
      {children}
      <span hidden data-fscs-transition={transition} />
    </div>
  );
}
