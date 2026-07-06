import { useMemo } from 'react';
import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';
import { useLivingHeadquartersPresence } from '../../../../hooks/useLivingHeadquartersPresence';
import { enrichPresenceActivity } from '../../../../studio-os-core/living-headquarters-presence/engine';
import { StudioAmbientLayer } from './StudioAmbientLayer';
import { StudioChiefConciergeBrief } from './StudioChiefConciergeBrief';
import { StudioImmersionStyles } from './StudioImmersionStyles';
import { StudioOrganizationalPresenceStrip } from './StudioOrganizationalPresenceStrip';

type Props = {
  /** Hide brief on dense cinema/production inner workspaces that have their own ambient shells. */
  hideBrief?: boolean;
  hidePresence?: boolean;
};

/**
 * Layout-level organizational immersion — ambient environment + Chief Concierge + presence.
 * M82.5: living headquarters presence — quietly alive, never frozen.
 */
export function StudioImmersionShell({ hideBrief = false, hidePresence = false }: Props) {
  const {
    roomVariant,
    chiefBrief,
    primaryPresence,
    presenceFeed,
    screenMoment,
    pathname,
    presencePaused,
    togglePresencePause,
  } = useStudioImmersion();
  const { organizationalMoments, ambientTimeClass, dismissMoment, morningArrival } =
    useLivingHeadquartersPresence();

  const livingStatus = useMemo(
    () => enrichPresenceActivity(primaryPresence).livingStatus,
    [primaryPresence]
  );

  const isInnerImmersiveRoom =
    pathname.includes('/screening-room') ||
    pathname.includes('/render-queue') ||
    pathname.includes('/production-studio');

  const isMissionControl =
    pathname.includes('/mission-control') || pathname.endsWith('/studio');

  return (
    <>
      <StudioImmersionStyles />
      <StudioAmbientLayer variant={roomVariant} timeClass={ambientTimeClass} />
      {!hideBrief && !isInnerImmersiveRoom && !isMissionControl ? (
        <StudioChiefConciergeBrief brief={chiefBrief} compact />
      ) : null}
      {!hidePresence ? (
        <StudioOrganizationalPresenceStrip
          primary={primaryPresence}
          feed={presenceFeed}
          screenMoment={screenMoment}
          organizationalMoments={organizationalMoments}
          livingStatus={livingStatus}
          morningArrival={morningArrival}
          onDismissMoment={dismissMoment}
          presencePaused={presencePaused}
          onTogglePresencePause={togglePresencePause}
        />
      ) : null}
    </>
  );
}

export { StudioLivingIndicator } from './StudioLivingIndicator';
