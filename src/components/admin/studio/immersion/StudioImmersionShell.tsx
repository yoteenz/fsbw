import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';
import { useLivingHeadquartersPresence } from '../../../../hooks/useLivingHeadquartersPresence';
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
  const { roomVariant, chiefBrief, primaryPresence, presenceFeed, screenMoment, pathname } =
    useStudioImmersion();
  const { organizationalMoments, presence, ambientTimeClass, dismissMoment, morningArrival } =
    useLivingHeadquartersPresence();

  const isInnerImmersiveRoom =
    pathname.includes('/screening-room') ||
    pathname.includes('/render-queue') ||
    pathname.includes('/production-studio');

  return (
    <>
      <StudioImmersionStyles />
      <StudioAmbientLayer variant={roomVariant} timeClass={ambientTimeClass} />
      {!hideBrief && !isInnerImmersiveRoom ? <StudioChiefConciergeBrief brief={chiefBrief} compact /> : null}
      {!hidePresence ? (
        <StudioOrganizationalPresenceStrip
          primary={primaryPresence}
          feed={presenceFeed}
          screenMoment={screenMoment}
          organizationalMoments={organizationalMoments}
          livingStatus={presence.livingStatus}
          morningArrival={morningArrival}
          onDismissMoment={dismissMoment}
        />
      ) : null}
    </>
  );
}

export { StudioLivingIndicator } from './StudioLivingIndicator';
