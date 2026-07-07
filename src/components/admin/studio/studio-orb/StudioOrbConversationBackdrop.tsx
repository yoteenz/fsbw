import { useStudioOrb } from './StudioOrbProvider';

/** Conversation Mode™ — soft blur · tap outside to close any Orb surface. */
export function StudioOrbConversationBackdrop() {
  const { activeSurface, closeSurface } = useStudioOrb();
  const active =
    activeSurface === 'command-dock' ||
    activeSurface === 'page-guide' ||
    activeSurface === 'life-culture';
  if (!active) return null;

  return (
    <button
      type="button"
      className="studio-conversation-backdrop"
      aria-label="Close Studio Intelligence"
      onClick={closeSurface}
    />
  );
}
