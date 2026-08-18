import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SITE00_ENTER_COPY,
  YOUR_SPACE_SIGNED_IN_ROWS,
  YOUR_SPACE_SIGNED_OUT_ROWS,
  resolveYourSpaceRowHref,
} from '../../config/directory';
import { getFastTravelActions } from '../../config/fast-travel-actions';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { useEcosystemData } from '../../hooks/useEcosystemData';
import { useBldrAssessment } from '../../hooks/useBldrAssessment';
import { useEvolveAssessment } from '../../hooks/useEvolveAssessment';
import { useSite00DesktopArtboardPreview } from '../shell/Site00DesktopArtboardContext';
import { Site00SummaryStripText } from '../shell/Site00SummaryStripText';
import { ArchitecturalPanel } from '../panels/ArchitecturalPanel';
import { SectionRule } from '../panels/SectionRule';
import { DirectoryRow } from '../workflow/WorkflowCards';
import { EnterFastTravelGrid } from './EnterFastTravelGrid';

export function DirectoryPanel() {
  const { pathname } = useLocation();
  const [isSignedIn] = useSignedInFromStorage();
  const isDesktopArtboard = useSite00DesktopArtboardPreview();
  const ecosystem = useEcosystemData();
  const bldr = useBldrAssessment();
  const evolve = useEvolveAssessment();

  const yourSpaceRows = isSignedIn ? YOUR_SPACE_SIGNED_IN_ROWS : YOUR_SPACE_SIGNED_OUT_ROWS;

  const fastTravelActions = useMemo(
    () =>
      getFastTravelActions({
        authState: { isSignedIn },
        currentRoute: pathname,
        projects: isSignedIn ? ecosystem.projects : [],
        sites: isSignedIn ? ecosystem.sites : [],
        blockers: isSignedIn ? ecosystem.attention : [],
        approvals: isSignedIn ? ecosystem.attention.filter((item) => /approval/i.test(item.label)) : [],
        now: isSignedIn ? ecosystem.now : [],
        upNext: isSignedIn ? ecosystem.upNext : [],
        activeBuilds: isSignedIn ? ecosystem.activeBuilds : [],
        onboardingState: {
          bldrResume: { hasResume: bldr.hasResume, href: bldr.resumeTarget },
          evolveResume: { hasResume: evolve.hasResume, href: evolve.resumeTarget },
        },
      }),
    [
      isSignedIn,
      pathname,
      ecosystem.projects,
      ecosystem.sites,
      ecosystem.attention,
      ecosystem.now,
      ecosystem.upNext,
      ecosystem.activeBuilds,
      bldr.hasResume,
      bldr.resumeTarget,
      evolve.hasResume,
      evolve.resumeTarget,
    ],
  );

  return (
    <div className="site00-enter-layout">
      <div className="site00-enter-welcome">
        <span className="site00-label-red">{SITE00_ENTER_COPY.welcomeNumber}</span>
        <h1 className="site00-heading-lg site00-enter-welcome__title">{SITE00_ENTER_COPY.welcomeTitle}</h1>
        <div className="site00-enter-welcome__rule">
          <SectionRule />
        </div>
        <p className="site00-tagline site00-enter-welcome__subtitle">{SITE00_ENTER_COPY.welcomeSubtitle}</p>
        <p className="site00-body site00-enter-welcome__body">{SITE00_ENTER_COPY.welcomeBody}</p>
      </div>

      <ArchitecturalPanel className="site00-enter-menu">
        <div className="site00-enter-menu__scroll">
          <div className="site00-enter-menu__section site00-enter-menu__section--your-space">
            <p className="site00-label-red site00-enter-menu__heading">{SITE00_ENTER_COPY.yourSpaceHeading}</p>
            <nav aria-label={SITE00_ENTER_COPY.yourSpaceHeading}>
              {yourSpaceRows.map((row) => {
                const locked = Boolean(row.requiresAuth && !isSignedIn);
                return (
                  <DirectoryRow
                    key={row.id}
                    title={row.title}
                    description={row.description}
                    href={resolveYourSpaceRowHref(row, isSignedIn, pathname)}
                    enabled={row.enabled}
                    enterIcon={row.enterIcon}
                    locked={locked}
                  />
                );
              })}
            </nav>
          </div>

          {isDesktopArtboard ? (
            <div className="site00-enter-menu__section site00-enter-menu__section--fast-travel">
              <div className="site00-enter-menu__divider">
                <SectionRule />
              </div>
              <p className="site00-label-red site00-enter-menu__heading site00-enter-menu__heading--secondary">
                {SITE00_ENTER_COPY.fastTravelHeading}
              </p>
              <EnterFastTravelGrid actions={fastTravelActions} />
            </div>
          ) : null}
        </div>
      </ArchitecturalPanel>
    </div>
  );
}

export function EnterStatusStrip() {
  return (
    <footer className="site00-summary-strip-panel site00-enter-status-strip">
      <Site00SummaryStripText text={SITE00_ENTER_COPY.statusStrip} />
    </footer>
  );
}
