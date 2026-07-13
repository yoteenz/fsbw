import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  label: string;
  summary: string;
  side: 'left' | 'right';
  slot: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

/** Floating mounted inspector panel — not a dashboard card. */
export function ExperienceLabFloatingInspector({ label, summary, side, slot, active, compact, onClick, children }: Props) {
  return (
    <button
      type="button"
      className={`elab-float elab-float--${side} elab-float--${slot}${active ? ' elab-float--active' : ''}${compact ? ' elab-float--compact' : ''}`}
      {...{ [ELAB_V2_COMPOSITION.floatingInspector]: side }}
      data-float-slot={slot}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="elab-float__label">{label}</span>
      {children ?? <span className="elab-float__summary">{summary}</span>}
    </button>
  );
}
