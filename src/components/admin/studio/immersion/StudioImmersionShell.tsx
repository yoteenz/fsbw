import { StudioAmbientLayer } from './StudioAmbientLayer';
import { StudioChiefConciergeBrief } from './StudioChiefConciergeBrief';
import { StudioImmersionStyles } from './StudioImmersionStyles';
import { StudioOrganizationalPresenceStrip } from './StudioOrganizationalPresenceStrip';
import { useStudioImmersion } from '../../../../hooks/useStudioImmersion';

type Props = {
  /** Hide brief on dense cinema/production inner workspaces that have their own ambient shells. */
  hideBrief?: boolean;
  hidePresence?: boolean;
};

/**
 * Layout-level organizational immersion — ambient environment + Chief Concierge + presence.
 * Does not alter workspace layouts; wraps existing content contextually.
 */
export function StudioImmersionShell({ hideBrief = false, hidePresence = false }: Props) {
  const { roomVariant, chiefBrief, primaryPresence, presenceFeed, screenMoment, pathname } = useStudioImmersion();

  const isInnerImmersiveRoom =
    pathname.includes('/screening-room') ||
    pathname.includes('/render-queue') ||
    pathname.includes('/production-studio');

  return (
    <>
      <StudioImmersionStyles />
      <StudioAmbientLayer variant={roomVariant} />
      {!hideBrief && !isInnerImmersiveRoom ? <StudioChiefConciergeBrief brief={chiefBrief} compact /> : null}
      {!hidePresence ? (
        <StudioOrganizationalPresenceStrip
          primary={primaryPresence}
          feed={presenceFeed}
          screenMoment={screenMoment}
        />
      ) : null}
    </>
  );
}

export { StudioLivingIndicator } from './StudioLivingIndicator';
