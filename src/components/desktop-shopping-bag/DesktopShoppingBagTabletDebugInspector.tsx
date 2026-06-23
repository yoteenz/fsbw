import { useState } from 'react';
import { roundQuadCoord } from '../../utils/quadPerspectiveTransform';
import { useDesktopShoppingBagTabletDebugRequired } from './DesktopShoppingBagTabletDebugProvider';
import type { QuadCornerId } from '../../utils/quadPerspectiveTransform';
import './DesktopShoppingBagTabletDebug.css';

const btnClass = 'desktop-shopping-bag-tablet-debug-inspector__btn';

const CORNERS: { id: QuadCornerId; label: string }[] = [
  { id: 'tl', label: 'Top left' },
  { id: 'tr', label: 'Top right' },
  { id: 'br', label: 'Bottom right' },
  { id: 'bl', label: 'Bottom left' },
];

export function DesktopShoppingBagTabletDebugInspector() {
  const editor = useDesktopShoppingBagTabletDebugRequired();
  const [expanded, setExpanded] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [showExportText, setShowExportText] = useState(false);

  if (!editor.debugEnabled) return null;

  const patchCornerAxis = (cornerId: QuadCornerId, axis: 'x' | 'y', raw: string) => {
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return;
    const current = editor.quad[cornerId];
    editor.patchCorner(cornerId, {
      ...current,
      [axis]: roundQuadCoord(value / 100),
    });
  };

  const onSave = () => {
    const ok = editor.saveLayout();
    setStatus(
      ok
        ? 'Saved on this device — remove ?shoppingBagDebug=1 to preview'
        : 'Save failed — copy the export snippet below into desktopShoppingBag.ts',
    );
    window.setTimeout(() => setStatus(null), 5000);
  };

  const onExport = async () => {
    setShowExportText(true);
    const copied = await editor.exportLayout();
    setStatus(copied ? 'Copied to clipboard' : 'Select snippet below and copy manually');
    window.setTimeout(() => setStatus(null), 4000);
  };

  if (!expanded) {
    return (
      <div className="desktop-shopping-bag-tablet-debug-inspector">
        <div className="desktop-shopping-bag-tablet-debug-inspector__header">
          <span>TABLET PERSPECTIVE DEBUG</span>
          <button type="button" className={btnClass} onClick={() => setExpanded(true)}>
            Expand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="desktop-shopping-bag-tablet-debug-inspector"
      role="region"
      aria-label="Shopping bag tablet perspective debug inspector"
    >
      <div className="desktop-shopping-bag-tablet-debug-inspector__header">
        <span>TABLET PERSPECTIVE DEBUG</span>
        <button
          type="button"
          className={[
            btnClass,
            'desktop-shopping-bag-tablet-debug-inspector__toggle',
            editor.overlayVisible
              ? 'desktop-shopping-bag-tablet-debug-inspector__toggle--on'
              : 'desktop-shopping-bag-tablet-debug-inspector__toggle--off',
          ].join(' ')}
          onClick={() => editor.setOverlayVisible(!editor.overlayVisible)}
        >
          POLYGON: {editor.overlayVisible ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          className={`${btnClass} desktop-shopping-bag-tablet-debug-inspector__btn--save`}
          onClick={onSave}
        >
          Save Layout
        </button>
        <button
          type="button"
          className={`${btnClass} desktop-shopping-bag-tablet-debug-inspector__btn--primary`}
          onClick={() => void onExport()}
        >
          Export Quad
        </button>
        <button type="button" className={btnClass} onClick={editor.resetLayout}>
          Reset
        </button>
        <button type="button" className={btnClass} onClick={() => setExpanded(false)}>
          Collapse
        </button>
      </div>

      <div className="desktop-shopping-bag-tablet-debug-inspector__body">
        <p className="desktop-shopping-bag-tablet-debug-inspector__hint">
          Drag each corner handle independently. Tap <strong>Save Layout</strong> — perspective
          polygon persists on this browser even without <code>?shoppingBagDebug=1</code>.
          {editor.hasCustomLayout ? ' Custom layout active.' : ''}
        </p>

        {status ? <p className="desktop-shopping-bag-tablet-debug-inspector__status">{status}</p> : null}

        <div className="desktop-shopping-bag-tablet-debug-inspector__corners">
          {CORNERS.map(({ id, label }) => (
            <div key={id} className="desktop-shopping-bag-tablet-debug-inspector__corner-group">
              <span className="desktop-shopping-bag-tablet-debug-inspector__corner-label">{label}</span>
              <label className="desktop-shopping-bag-tablet-debug-inspector__field">
                x %
                <input
                  type="number"
                  step="0.1"
                  value={roundQuadCoord(editor.quad[id].x * 100)}
                  onChange={(e) => patchCornerAxis(id, 'x', e.target.value)}
                />
              </label>
              <label className="desktop-shopping-bag-tablet-debug-inspector__field">
                y %
                <input
                  type="number"
                  step="0.1"
                  value={roundQuadCoord(editor.quad[id].y * 100)}
                  onChange={(e) => patchCornerAxis(id, 'y', e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>

        {showExportText ? (
          <label className="desktop-shopping-bag-tablet-debug-inspector__export">
            Paste into <code>desktopShoppingBag.ts</code>
            <textarea
              className="desktop-shopping-bag-tablet-debug-inspector__export-text"
              readOnly
              value={editor.exportSnippet}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>
        ) : (
          <button
            type="button"
            className={`${btnClass} desktop-shopping-bag-tablet-debug-inspector__show-export`}
            onClick={() => setShowExportText(true)}
          >
            Show export snippet
          </button>
        )}
      </div>
    </div>
  );
}
