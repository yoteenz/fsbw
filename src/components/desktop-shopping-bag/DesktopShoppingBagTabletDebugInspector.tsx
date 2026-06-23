import { useState } from 'react';
import { roundPanelDebugPercent } from '../../utils/desktopPanelDebugMode';
import { useDesktopShoppingBagTabletDebugRequired } from './DesktopShoppingBagTabletDebugProvider';
import './DesktopShoppingBagTabletDebug.css';

const btnClass = 'desktop-shopping-bag-tablet-debug-inspector__btn';

export function DesktopShoppingBagTabletDebugInspector() {
  const editor = useDesktopShoppingBagTabletDebugRequired();
  const [expanded, setExpanded] = useState(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [showExportText, setShowExportText] = useState(false);

  if (!editor.debugEnabled) return null;

  const patchField = (field: 'x' | 'y' | 'width' | 'height', raw: string) => {
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return;
    editor.patchRect({ [field]: roundPanelDebugPercent(value) });
  };

  const onSave = () => {
    const ok = editor.saveLayout();
    setExportStatus(
      ok
        ? 'Saved on this device — remove ?shoppingBagDebug=1 to preview'
        : 'Save failed — copy the export snippet below into desktopShoppingBag.ts',
    );
    window.setTimeout(() => setExportStatus(null), 5000);
  };

  const onExport = async () => {
    setShowExportText(true);
    const copied = await editor.exportRect();
    setExportStatus(copied ? 'Copied to clipboard' : 'Select snippet below and copy manually');
    window.setTimeout(() => setExportStatus(null), 4000);
  };

  if (!expanded) {
    return (
      <div className="desktop-shopping-bag-tablet-debug-inspector">
        <div className="desktop-shopping-bag-tablet-debug-inspector__header">
          <span>SHOPPING BAG TABLET DEBUG</span>
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
      aria-label="Shopping bag tablet debug inspector"
    >
      <div className="desktop-shopping-bag-tablet-debug-inspector__header">
        <span>SHOPPING BAG TABLET DEBUG</span>
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
          TABLET RECT: {editor.overlayVisible ? 'ON' : 'OFF'}
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
          Export Tablet Rect
        </button>
        <button type="button" className={btnClass} onClick={editor.resetRect}>
          Reset
        </button>
        <button type="button" className={btnClass} onClick={() => setExpanded(false)}>
          Collapse
        </button>
      </div>

      <div className="desktop-shopping-bag-tablet-debug-inspector__body">
        <p className="desktop-shopping-bag-tablet-debug-inspector__hint">
          Drag the yellow boundary or edit values. Tap <strong>Save Layout</strong> — your alignment
          persists on this browser even without <code>?shoppingBagDebug=1</code>.
          {editor.hasCustomLayout ? ' Custom layout active.' : ''}
        </p>

        {exportStatus ? (
          <p className="desktop-shopping-bag-tablet-debug-inspector__status">{exportStatus}</p>
        ) : null}

        <div className="desktop-shopping-bag-tablet-debug-inspector__row">
          {(['x', 'y', 'width', 'height'] as const).map((field) => (
            <label key={field} className="desktop-shopping-bag-tablet-debug-inspector__field">
              {field}
              <input
                type="number"
                step="0.1"
                value={editor.percentRect[field]}
                onChange={(e) => patchField(field, e.target.value)}
              />
            </label>
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
