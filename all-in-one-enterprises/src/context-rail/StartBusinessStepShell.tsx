import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AioContextRail } from '../components/context-rail';
import { AioDesktopContextShell } from '../components/context-rail';
import { buildStartBusinessRail, resolvePortalModuleRail } from './configs';
import { useStartBusinessJourney } from '../journeys/useStartBusinessJourney';
import type { JourneyStepId } from '../journeys/journeyTypes';

/** Desktop context rail for Start Your Business milestone sub-pages. */
export function StartBusinessStepShell({ children, stepId }: { children: ReactNode; stepId: JourneyStepId }) {
  const { t } = useTranslation('contextRail');
  const view = useStartBusinessJourney(stepId);
  const rail = buildStartBusinessRail(t, { ...view, selectedStepId: stepId });

  return (
    <div className="aio-ps-shell aio-ps-shell--dark">
      <AioDesktopContextShell config={rail}>{children}</AioDesktopContextShell>
    </div>
  );
}

/** Portal module context rail — desktop only, complements global portal nav. */
export function PortalModuleContextRail() {
  const { t } = useTranslation('contextRail');
  const { pathname } = useLocation();
  const config = resolvePortalModuleRail(t, pathname);
  if (!config) return null;

  return (
    <aside className="acr-portal-module" aria-hidden={false}>
      <AioContextRail config={config} />
    </aside>
  );
}
