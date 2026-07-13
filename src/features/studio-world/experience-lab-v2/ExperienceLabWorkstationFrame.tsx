import type { ReactNode } from 'react';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  registry?: ReactNode;
  governance?: ReactNode;
  viewport: ReactNode;
  lowerDeck: ReactNode;
};

/** Continuous application workstation — viewport room + attached lower deck. */
export function ExperienceLabWorkstationFrame({ registry, governance, viewport, lowerDeck }: Props) {
  return (
    <main
      className="elab-app-shell__workstation"
      {...{ [ELAB_V2_COMPOSITION.workstationFrame]: '' }}
      aria-label="Experience Lab workstation"
    >
      {registry ? <div className="elab-app-shell__rail elab-app-shell__rail--left">{registry}</div> : null}
      <div className="elab-app-shell__center-column">
        <div className="elab-app-shell__viewport-room">{viewport}</div>
        <div className="elab-app-shell__lower-deck">{lowerDeck}</div>
      </div>
      {governance ? <div className="elab-app-shell__rail elab-app-shell__rail--right">{governance}</div> : null}
    </main>
  );
}
