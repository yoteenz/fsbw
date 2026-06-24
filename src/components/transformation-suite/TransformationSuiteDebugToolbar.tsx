import { useState } from 'react';
import { useTransformationSuiteDebugRequired } from './TransformationSuiteDebugProvider';
import './TransformationSuite.css';

export function TransformationSuiteDebugToolbar() {
  const editor = useTransformationSuiteDebugRequired();
  const [copied, setCopied] = useState(false);

  if (!editor.debugEnabled) return null;

  return (
    <div className="ts-debug-toolbar" role="region" aria-label="Transformation Suite debug">
      <p className="ts-debug-toolbar__title">SUITE DEBUG</p>
      <p className="ts-debug-toolbar__hint">CTRL + SHIFT + D toggles overlays</p>

      <div className="ts-debug-toolbar__actions">
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

      <div className="ts-debug-toolbar__panels">
        <p className="ts-debug-toolbar__section">Rects</p>
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
        <p className="ts-debug-toolbar__section">Circle</p>
        {editor.circlePanels.map((panel) => (
          <button
            key={panel.id}
            type="button"
            className={editor.selectedCircleId === panel.id ? 'is-active' : ''}
            onClick={() => editor.selectCircle(panel.id)}
          >
            {panel.label}
          </button>
        ))}
      </div>
    </div>
  );
}
