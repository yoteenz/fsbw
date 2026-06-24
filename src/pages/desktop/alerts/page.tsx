import { useRef } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopNotificationsDebugProvider } from '../../../components/desktop-notifications/DesktopNotificationsDebugProvider';
import { DesktopNotificationsDebugToolbar } from '../../../components/desktop-notifications/DesktopNotificationsDebugToolbar';
import { DesktopNotificationsScene } from '../../../components/desktop-notifications/DesktopNotificationsScene';
import { useDesktopNotificationsDebugRequired } from '../../../components/desktop-notifications/DesktopNotificationsDebugProvider';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import '../../../components/desktop-notifications/DesktopNotifications.css';

function DesktopAlertsDebugEntry() {
  const editor = useDesktopNotificationsDebugRequired();
  if (editor.debugEnabled) return null;
  return (
    <button type="button" className="dn-debug-entry" onClick={editor.toggleDebug}>
      Alerts Debug (Ctrl+Shift+D)
    </button>
  );
}

export default function DesktopAlertsPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const artboard = isDesktopArtboardLayoutActive();

  return (
    <DesktopNotificationsDebugProvider>
      <div className={`dn-page${artboard ? ' dn-page--artboard' : ''}`}>
        <NavBar />
        <section ref={viewportRef} className="dn-page__viewport">
          <DesktopNotificationsScene measureRef={viewportRef} />
        </section>
        <DesktopNotificationsDebugToolbar />
        <DesktopAlertsDebugEntry />
      </div>
    </DesktopNotificationsDebugProvider>
  );
}
