import type { PanelDockZone, PanelPresentationState } from './experience-lab-v2-panel-orchestrator';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { INSPECTOR_ACTION_ICONS } from './experience-lab-v2-icon-bindings';

type Props = {
  label: string;
  statusLine: string;
  dockZone: PanelDockZone;
  state: PanelPresentationState;
  active?: boolean;
  onMinimizeClick?: () => void;
  onExpandClick?: () => void;
  onDockClick?: () => void;
};

const DOCK_CLASS: Record<PanelDockZone, string> = {
  'top-left': 'elab-float--dock-tl',
  'top-right': 'elab-float--dock-tr',
  'bottom-left': 'elab-float--dock-bl',
  'bottom-right': 'elab-float--dock-br',
  'left-rail': 'elab-float--dock-lrail',
  'right-rail': 'elab-float--dock-rrail',
};

/** Minimized contextual inspector — compact edge dock, never center safe zone. */
export function ExperienceLabFloatingInspector({
  label,
  statusLine,
  dockZone,
  state,
  active,
  onMinimizeClick,
  onExpandClick,
  onDockClick,
}: Props) {
  if (state === 'HIDDEN' || state === 'EXPANDED') return null;

  return (
    <div
      className={`elab-float ${DOCK_CLASS[dockZone]}${active ? ' elab-float--active' : ''} elab-float--minimized`}
      {...{ [ELAB_V2_COMPOSITION.floatingInspector]: dockZone }}
      data-panel-state={state}
    >
      <button type="button" className="elab-float__body" onClick={onExpandClick} aria-label={`Expand ${label} inspector`}>
        <ExperienceLabIcon name={INSPECTOR_ACTION_ICONS.settings} size="xs" decorative />
        <span className="elab-float__label">{label}</span>
        <span className="elab-float__status">{statusLine}</span>
        <span className="elab-float__expand" aria-hidden>⌄</span>
      </button>
      {onDockClick ? (
        <button type="button" className="elab-float__dock" onClick={onDockClick} aria-label={`Move ${label} dock`}>
          ⠿
        </button>
      ) : null}
      {onMinimizeClick ? (
        <button type="button" className="elab-float__dismiss" onClick={onMinimizeClick} aria-label={`Dismiss ${label}`}>
          ✕
        </button>
      ) : null}
    </div>
  );
}
