import type { ReactNode } from 'react';
import type { SmartIntakeLayoutMode } from '../../intake/smartIntakeLayoutMode';
import { smartIntakeShellClass } from '../../intake/smartIntakeLayoutMode';
import { SmartIntakeJourneyRail, SmartIntakeMobileHeader, type JourneyStepItem } from './SmartIntakeJourneyRail';

type Props = {
  layoutMode?: SmartIntakeLayoutMode;
  journeySteps: JourneyStepItem[];
  journeyOpen: boolean;
  onCloseJourney: () => void;
  onOpenJourney: () => void;
  workspaceHeader: ReactNode;
  children: ReactNode;
  navigation: ReactNode;
  mainRef?: React.RefObject<HTMLDivElement>;
};

export function SmartIntakeShell({
  layoutMode = 'responsive',
  journeySteps,
  journeyOpen,
  onCloseJourney,
  onOpenJourney,
  workspaceHeader,
  children,
  navigation,
  mainRef,
}: Props) {
  return (
    <div className={smartIntakeShellClass(layoutMode)}>
      <div className="si-shell__frame">
        <SmartIntakeJourneyRail steps={journeySteps} />

        {journeyOpen && (
          <button type="button" className="si-journey-backdrop" onClick={onCloseJourney} aria-label="Close journey menu" />
        )}
        <div className={`si-journey-drawer ${journeyOpen ? 'si-journey-drawer--open' : ''}`} aria-hidden={!journeyOpen}>
          <SmartIntakeJourneyRail steps={journeySteps} />
        </div>

        <div className="si-workspace">
          <SmartIntakeMobileHeader onOpenJourney={onOpenJourney} />
          <div className="si-workspace__scroll" ref={mainRef} tabIndex={-1}>
            {workspaceHeader}
            <div className="si-workspace__content">{children}</div>
          </div>
          {navigation}
        </div>
      </div>
    </div>
  );
}
