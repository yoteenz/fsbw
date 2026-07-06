import { useStudioOrb } from './StudioOrbProvider';

/** Conversation Mode™ — soft blur · dashboard remains visible context. */
export function StudioOrbConversationBackdrop() {
  const { conversationMode, activeSurface, closeSurface } = useStudioOrb();
  const active = conversationMode || activeSurface === 'page-guide';
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
