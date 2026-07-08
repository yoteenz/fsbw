import type { HolographicViewState } from '../../../../studio-os-core/mission-control';

type Props = {
  view: HolographicViewState;
  scaleLabel: string;
};

export function MissionControlViewLens({ view, scaleLabel }: Props) {
  return (
    <div className={`mc-view-lens ${view.tableClass}`} aria-live="polite">
      <p className="mc-view-lens__eyebrow">CONTINUOUS SCALE™</p>
      <p className="mc-view-lens__label">{view.label}</p>
      <p className="mc-view-lens__scale">{scaleLabel}</p>
      <p className="mc-view-lens__narrative">{view.narrative}</p>
    </div>
  );
}
