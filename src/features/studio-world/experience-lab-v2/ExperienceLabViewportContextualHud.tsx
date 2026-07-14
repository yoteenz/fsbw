import type { StudioViewportMode } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION, VIEWPORT_MODE_LABELS } from './experience-lab-v2-composition';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { VIEWPORT_MODE_ICON } from './experience-lab-v2-icon-bindings';
import { FOUNDER_REVIEW_ICONS } from './experience-lab-v2-icon-bindings';

type Props = {
  modes: StudioViewportMode[];
  activeMode: StudioViewportMode;
  onModeChange: (mode: StudioViewportMode) => void;
  showPlayback?: boolean;
};

/** Contextual viewport controls — visible only during focus, workbench tool, or drawer expansion. */
export function ExperienceLabViewportContextualHud({ modes, activeMode, onModeChange, showPlayback }: Props) {
  if (modes.length === 0 && !showPlayback) return null;

  return (
    <div className="elab-viewport__contextual-hud" {...{ [ELAB_V2_COMPOSITION.contextualHud]: '' }} aria-label="Contextual viewport controls">
      {showPlayback ? (
        <div className="elab-viewport__contextual-playback" aria-label="Review playback">
          <button type="button" className="elab-viewport__contextual-btn" aria-label="Previous">
            <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.previous} size="xs" decorative />
          </button>
          <button type="button" className="elab-viewport__contextual-btn" aria-label="Play">
            <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.playback} size="xs" decorative />
          </button>
          <button type="button" className="elab-viewport__contextual-btn" aria-label="Pause">
            <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.pause} size="xs" decorative />
          </button>
          <button type="button" className="elab-viewport__contextual-btn" aria-label="Next">
            <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.next} size="xs" decorative />
          </button>
          <button type="button" className="elab-viewport__contextual-btn" aria-label="Capture">
            <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.capture} size="xs" decorative />
          </button>
        </div>
      ) : null}

      {modes.length > 0 ? (
        <nav className="elab-viewport__contextual-modes" aria-label="Tool viewport modes">
          {modes.map((m) => {
            const iconName = VIEWPORT_MODE_ICON[m];
            return (
              <button
                key={m}
                type="button"
                className="elab-viewport__mode-seg"
                aria-pressed={activeMode === m}
                onClick={() => onModeChange(m)}
              >
                {iconName ? <ExperienceLabIcon name={iconName} size="xs" decorative active={activeMode === m} /> : null}
                {VIEWPORT_MODE_LABELS[m] ?? m}
              </button>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
