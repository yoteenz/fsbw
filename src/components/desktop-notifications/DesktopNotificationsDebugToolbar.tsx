import { useState } from 'react';
import { useDesktopNotificationsDebugRequired } from './DesktopNotificationsDebugProvider';
import './DesktopNotifications.css';

export function DesktopNotificationsDebugToolbar() {
  const editor = useDesktopNotificationsDebugRequired();
  const [copied, setCopied] = useState(false);

  if (!editor.debugEnabled) return null;

  return (
    <div className="dn-debug-toolbar" role="region" aria-label="Notifications debug">
      <p className="dn-debug-toolbar__title">NOTIFICATIONS DEBUG</p>
      <p className="dn-debug-toolbar__hint">CTRL + SHIFT + D toggles overlays</p>

      <div className="dn-debug-toolbar__actions">
        <button type="button" onClick={() => editor.setOverlaysVisible(!editor.overlaysVisible)}>
          {editor.overlaysVisible ? 'Hide overlays' : 'Show overlays'}
        </button>
        <button
          type="button"
          onClick={async () => {
            const ok = await editor.exportLayout();
            setCopied(ok);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? 'Copied' : 'Export layout'}
        </button>
        <button type="button" onClick={editor.resetLayout}>
          Reset
        </button>
        <button type="button" onClick={editor.toggleDebug}>
          Exit debug
        </button>
      </div>

      <div className="dn-debug-toolbar__panels">
        {editor.rectPanels.map((panel) => (
          <button
            key={panel.id}
            type="button"
            className={editor.selectedRectId === panel.id ? 'is-active' : ''}
            onClick={() => editor.selectRect(panel.id)}
          >
            {panel.label}
          </button>
        ))}
      </div>
    </div>
  );
}
