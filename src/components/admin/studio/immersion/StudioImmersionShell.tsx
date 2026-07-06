import { useMemo } from 'react';
import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';
import { useLivingHeadquartersPresence } from '../../../../hooks/useLivingHeadquartersPresence';
import { enrichPresenceActivity } from '../../../../studio-os-core/living-headquarters-presence/engine';
import { StudioAmbientLayer } from './StudioAmbientLayer';
import { StudioImmersionStyles } from './StudioImmersionStyles';
import { StudioOrganizationalPresenceStrip } from './StudioOrganizationalPresenceStrip';

type Props = {
  /** Hide brief on dense cinema/production inner workspaces that have their own ambient shells. */
  hideBrief?: boolean;
  hidePresence?: boolean;
};

/**
 * Layout-level organizational immersion — ambient environment only.
 * Greetings and Command Dock live inside Studio Orb™ Conversation Mode.
 */
export function StudioImmersionShell({ hidePresence = false }: Props) {
  const {
    roomVariant,
    primaryPresence,
    presenceFeed,
    screenMoment,
    pathname,
    presencePaused,
    togglePresencePause,
  } = useStudioImmersion();
  const { organizationalMoments, ambientTimeClass, dismissMoment } = useLivingHeadquartersPresence();

  const livingStatus = useMemo(
    () => enrichPresenceActivity(primaryPresence).livingStatus,
    [primaryPresence]
  );

  const isInnerImmersiveRoom =
    pathname.includes('/screening-room') ||
    pathname.includes('/render-queue') ||
    pathname.includes('/production-studio');

  return (
    <>
      <StudioImmersionStyles />
      <StudioAmbientLayer variant={roomVariant} timeClass={ambientTimeClass} />
      {!hidePresence && !isInnerImmersiveRoom ? (
        <StudioOrganizationalPresenceStrip
          primary={primaryPresence}
          feed={presenceFeed}
          screenMoment={screenMoment}
          organizationalMoments={organizationalMoments}
          livingStatus={livingStatus}
          onDismissMoment={dismissMoment}
          presencePaused={presencePaused}
          onTogglePresencePause={togglePresencePause}
          hideGreetingPanels
        />
      ) : null}
    </>
  );
}

export { StudioLivingIndicator } from './StudioLivingIndicator';
